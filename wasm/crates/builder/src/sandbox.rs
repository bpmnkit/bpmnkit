//! Confinement for cargo and rustc, which run code derived from untrusted input.

use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use bpmnkit_wasm_build::{Cmd, ExecError, ExecLimits, ExecOutput, Executor, LocalExecutor};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Isolation {
    /// bubblewrap: no network (all namespaces unshared), read-only root, tmpfs `/tmp`; only `rw`
    /// (work dir, shared target dir, cargo home) is writable.
    Bwrap { bwrap: PathBuf, rw: Vec<PathBuf> },
    /// A plain process; resource caps through `prlimit` when installed.
    Caps {
        prlimit: Option<PathBuf>,
        caps: Caps,
    },
}

/// Per-process limits (`prlimit` applies them to cargo and each rustc it starts).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Caps {
    pub address_space: u64,
    pub cpu_secs: u64,
    pub file_size: u64,
}
impl Default for Caps {
    fn default() -> Self {
        Self {
            // rustc reserves far more address space than it touches.
            address_space: 8 << 30,
            cpu_secs: 600,
            file_size: 1 << 30,
        }
    }
}

#[derive(Debug, Clone)]
pub struct SandboxExecutor<E = LocalExecutor> {
    pub isolation: Isolation,
    inner: E,
}

impl<E: Executor> SandboxExecutor<E> {
    pub fn new(isolation: Isolation, inner: E) -> Self {
        Self { isolation, inner }
    }

    /// The command as it is handed to the inner executor.
    pub fn wrap(&self, cmd: &Cmd) -> Cmd {
        let mut args: Vec<String> = Vec::new();
        let program = match &self.isolation {
            Isolation::Bwrap { bwrap, rw } => {
                args.extend(
                    [
                        "--die-with-parent",
                        "--unshare-all",
                        "--new-session",
                        "--ro-bind",
                        "/",
                        "/",
                        "--dev",
                        "/dev",
                        "--proc",
                        "/proc",
                        // Before the binds: a bind under /tmp (the default work dir) stays visible.
                        "--tmpfs",
                        "/tmp",
                    ]
                    .map(String::from),
                );
                for p in rw {
                    let p = p.display().to_string();
                    args.extend(["--bind".into(), p.clone(), p]);
                }
                args.extend(["--chdir".into(), cmd.cwd.display().to_string()]);
                bwrap
            }
            Isolation::Caps {
                prlimit: Some(prlimit),
                caps,
            } => {
                args.extend([
                    format!("--as={}", caps.address_space),
                    format!("--cpu={}", caps.cpu_secs),
                    format!("--fsize={}", caps.file_size),
                ]);
                prlimit
            }
            Isolation::Caps { prlimit: None, .. } => return cmd.clone(),
        };
        args.push("--".into());
        args.push(cmd.program.clone());
        args.extend(cmd.args.iter().cloned());
        Cmd {
            program: program.display().to_string(),
            args,
            cwd: cmd.cwd.clone(),
            env: cmd.env.clone(),
        }
    }
}

impl<E: Executor> Executor for SandboxExecutor<E> {
    fn run(&self, cmd: &Cmd, limits: &ExecLimits) -> Result<ExecOutput, ExecError> {
        self.inner.run(&self.wrap(cmd), limits)
    }
}

fn which(prog: &str) -> Option<PathBuf> {
    std::env::split_paths(&std::env::var_os("PATH")?)
        .map(|d| d.join(prog))
        .find(|p| p.is_file())
}

/// bwrap when it can start a sandbox here (user namespaces can be disabled), else caps. The
/// `String` is the startup warning for the fallback.
pub fn detect(rw: Vec<PathBuf>, caps: Caps) -> (Isolation, Option<String>) {
    let mut why = "bubblewrap (bwrap) is not installed";
    if let Some(bwrap) = which("bwrap") {
        if probe(&bwrap) {
            return (Isolation::Bwrap { bwrap, rw }, None);
        }
        why = "bwrap cannot create a sandbox here (user namespaces off?)";
    }
    let prlimit = which("prlimit");
    let caps_note = if prlimit.is_some() {
        "with prlimit caps"
    } else {
        "without resource caps (prlimit not found)"
    };
    let warning = format!(
        "WARNING: {why}; builds run as plain processes {caps_note}, with network and the \
         service's file access. Serve only trusted callers."
    );
    (Isolation::Caps { prlimit, caps }, Some(warning))
}

fn probe(bwrap: &Path) -> bool {
    Command::new(bwrap)
        .args([
            "--die-with-parent",
            "--unshare-all",
            "--ro-bind",
            "/",
            "/",
            "true",
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|s| s.success())
}

#[cfg(test)]
mod tests {
    use std::sync::Mutex;

    use super::*;

    #[derive(Default)]
    struct Fake(Mutex<Vec<Cmd>>);
    impl Executor for &Fake {
        fn run(&self, cmd: &Cmd, _: &ExecLimits) -> Result<ExecOutput, ExecError> {
            self.0.lock().unwrap().push(cmd.clone());
            Ok(ExecOutput::default())
        }
    }

    fn cargo() -> Cmd {
        Cmd {
            program: "cargo".into(),
            args: vec!["build".into(), "--release".into()],
            cwd: "/tmp/work/p1".into(),
            env: vec![("CARGO_TARGET_DIR".into(), "/cache/t".into())],
        }
    }

    fn run(iso: Isolation) -> Cmd {
        let fake = Fake::default();
        SandboxExecutor::new(iso, &fake)
            .run(&cargo(), &ExecLimits::default())
            .unwrap();
        fake.0.into_inner().unwrap().remove(0)
    }

    #[test]
    fn bwrap_unshares_network_and_binds_only_rw_dirs() {
        let c = run(Isolation::Bwrap {
            bwrap: "/usr/bin/bwrap".into(),
            rw: vec!["/tmp/work".into(), "/cache/t".into()],
        });
        assert_eq!(c.program, "/usr/bin/bwrap");
        let a = c.args.join(" ");
        assert!(a.contains("--unshare-all"), "{a}");
        assert!(a.contains("--ro-bind / /"), "{a}");
        let tmpfs = a.find("--tmpfs /tmp").unwrap();
        let bind = a.find("--bind /tmp/work /tmp/work").unwrap();
        assert!(
            tmpfs < bind,
            "work dir bind must come after the /tmp tmpfs: {a}"
        );
        assert!(a.contains("--bind /cache/t /cache/t"), "{a}");
        assert!(
            a.ends_with("--chdir /tmp/work/p1 -- cargo build --release"),
            "{a}"
        );
        assert_eq!(c.env, cargo().env);
        assert_eq!(c.cwd, cargo().cwd);
    }

    #[test]
    fn prlimit_caps_wrap_the_command() {
        let c = run(Isolation::Caps {
            prlimit: Some("/usr/bin/prlimit".into()),
            caps: Caps {
                address_space: 100,
                cpu_secs: 7,
                file_size: 50,
            },
        });
        assert_eq!(c.program, "/usr/bin/prlimit");
        assert_eq!(
            c.args,
            [
                "--as=100",
                "--cpu=7",
                "--fsize=50",
                "--",
                "cargo",
                "build",
                "--release"
            ]
        );
    }

    #[test]
    fn no_prlimit_runs_the_command_as_is() {
        let c = run(Isolation::Caps {
            prlimit: None,
            caps: Caps::default(),
        });
        assert_eq!(c, cargo());
    }

    #[test]
    fn detect_falls_back_with_a_warning_or_finds_bwrap() {
        match detect(vec![], Caps::default()) {
            (Isolation::Bwrap { .. }, w) => assert!(w.is_none()),
            (Isolation::Caps { .. }, w) => assert!(w.unwrap().starts_with("WARNING")),
        }
    }

    #[test]
    fn real_prlimit_runs_a_capped_process() {
        let Some(prlimit) = which("prlimit") else {
            return;
        };
        let ex = SandboxExecutor::new(
            Isolation::Caps {
                prlimit: Some(prlimit),
                caps: Caps::default(),
            },
            LocalExecutor,
        );
        let o = ex
            .run(
                &Cmd {
                    program: "sh".into(),
                    args: vec!["-c".into(), "ulimit -t".into()],
                    cwd: std::env::temp_dir(),
                    env: vec![],
                },
                &ExecLimits::default(),
            )
            .unwrap();
        assert_eq!(o.stdout.trim(), "600");
    }
}
