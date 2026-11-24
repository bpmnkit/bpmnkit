//! Side effects go through [`Executor`]: a local process for dev and tests, a sandbox in the
//! builder service (later). Nothing else in this crate spawns processes.

use std::fmt;
use std::io::Read;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Cmd {
    pub program: String,
    pub args: Vec<String>,
    pub cwd: PathBuf,
    pub env: Vec<(String, String)>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ExecLimits {
    pub wall_time: Duration,
    /// Stdout plus stderr, in bytes.
    pub max_output: usize,
}
impl Default for ExecLimits {
    fn default() -> Self {
        Self {
            wall_time: Duration::from_secs(300),
            max_output: 16 << 20,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct ExecOutput {
    /// `None` when the process was killed by a signal.
    pub code: Option<i32>,
    pub stdout: String,
    pub stderr: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ExecError {
    Spawn(String),
    WallTime(Duration),
    OutputTooLarge(usize),
}
impl fmt::Display for ExecError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Spawn(e) => write!(f, "cannot start process: {e}"),
            Self::WallTime(d) => write!(f, "killed after {} s wall time", d.as_secs()),
            Self::OutputTooLarge(n) => write!(f, "killed: more than {n} bytes of output"),
        }
    }
}
impl std::error::Error for ExecError {}

pub trait Executor {
    fn run(&self, cmd: &Cmd, limits: &ExecLimits) -> Result<ExecOutput, ExecError>;
}

/// A plain child process with wall-time and output caps. No isolation: use only for code you
/// trust or inside a sandbox.
#[derive(Debug, Default, Clone, Copy)]
pub struct LocalExecutor;

impl Executor for LocalExecutor {
    fn run(&self, cmd: &Cmd, limits: &ExecLimits) -> Result<ExecOutput, ExecError> {
        let mut child = Command::new(&cmd.program)
            .args(&cmd.args)
            .current_dir(&cmd.cwd)
            .envs(cmd.env.iter().map(|(k, v)| (k, v)))
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| ExecError::Spawn(format!("{}: {e}", cmd.program)))?;
        let total = Arc::new(AtomicUsize::new(0));
        let over = Arc::new(AtomicBool::new(false));
        let cap = limits.max_output;
        let reader = |mut r: Box<dyn Read + Send>| {
            let (total, over) = (Arc::clone(&total), Arc::clone(&over));
            std::thread::spawn(move || {
                let mut out = Vec::new();
                let mut buf = [0u8; 8192];
                while let Ok(n) = r.read(&mut buf) {
                    if n == 0 {
                        break;
                    }
                    if total.fetch_add(n, Ordering::SeqCst) + n > cap {
                        over.store(true, Ordering::SeqCst);
                        break;
                    }
                    out.extend_from_slice(&buf[..n]);
                }
                out
            })
        };
        let so = reader(Box::new(child.stdout.take().expect("piped")));
        let se = reader(Box::new(child.stderr.take().expect("piped")));
        let start = Instant::now();
        let status = loop {
            if over.load(Ordering::SeqCst) {
                let _ = child.kill();
                let _ = child.wait();
                return Err(ExecError::OutputTooLarge(cap));
            }
            match child.try_wait() {
                Ok(Some(s)) => break s,
                Ok(None) if start.elapsed() >= limits.wall_time => {
                    let _ = child.kill();
                    let _ = child.wait();
                    return Err(ExecError::WallTime(limits.wall_time));
                }
                Ok(None) => std::thread::sleep(Duration::from_millis(10)),
                Err(e) => return Err(ExecError::Spawn(e.to_string())),
            }
        };
        let text = |h: std::thread::JoinHandle<Vec<u8>>| {
            String::from_utf8_lossy(&h.join().unwrap_or_default()).into_owned()
        };
        let (stdout, stderr) = (text(so), text(se));
        if over.load(Ordering::SeqCst) {
            return Err(ExecError::OutputTooLarge(cap));
        }
        Ok(ExecOutput {
            code: status.code(),
            stdout,
            stderr,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sh(script: &str) -> Cmd {
        Cmd {
            program: "sh".into(),
            args: vec!["-c".into(), script.into()],
            cwd: std::env::temp_dir(),
            env: vec![("X".into(), "1".into())],
        }
    }

    #[test]
    fn captures_output_code_and_env() {
        let o = LocalExecutor
            .run(&sh("echo out$X; echo err >&2; exit 3"), &Default::default())
            .unwrap();
        assert_eq!(
            (o.code, o.stdout.as_str(), o.stderr.as_str()),
            (Some(3), "out1\n", "err\n")
        );
    }

    #[test]
    fn wall_time_kills() {
        let l = ExecLimits {
            wall_time: Duration::from_millis(100),
            ..Default::default()
        };
        assert_eq!(
            LocalExecutor.run(&sh("sleep 5"), &l),
            Err(ExecError::WallTime(l.wall_time))
        );
    }

    #[test]
    fn output_cap_kills() {
        let l = ExecLimits {
            max_output: 1000,
            ..Default::default()
        };
        assert_eq!(
            LocalExecutor.run(&sh("yes"), &l),
            Err(ExecError::OutputTooLarge(1000))
        );
    }

    #[test]
    fn missing_program_is_a_spawn_error() {
        let mut c = sh("");
        c.program = "definitely-not-a-program".into();
        assert!(matches!(
            LocalExecutor.run(&c, &Default::default()),
            Err(ExecError::Spawn(_))
        ));
    }
}
