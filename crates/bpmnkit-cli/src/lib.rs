//! `bpmnkit` (alias `casen`): a few native commands, `bpmnkit-<name>` subprocess plugins, and a
//! fallback to the legacy Node CLI for everything not ported yet.

mod legacy;
mod plugin;
mod worker;

use std::ffi::OsString;
use std::io::Write;
use std::path::PathBuf;

use bpmnkit_profiles::{list as list_profiles, Roots};
use clap::{CommandFactory, FromArgMatches, Parser, Subcommand};
use clap_complete::Shell;

/// Commands implemented natively; anything else goes to a plugin, then to the legacy CLI.
const NATIVE: &[&str] = &["profile", "completion", "plugin", "self", "worker", "help"];

#[derive(Parser)]
#[command(
    name = "bpmnkit",
    version,
    about = "BPMN Kit command line",
    after_help = "Other commands run a `bpmnkit-<name>` plugin from PATH or <plugins dir>/bin, or fall\n\
back to the legacy Node CLI (disable with BPMNKIT_NO_LEGACY=1). `casen` is an alias."
)]
struct Cli {
    #[command(subcommand)]
    command: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    /// Show profiles (read-only; other profile commands run in the legacy CLI)
    Profile {
        #[command(subcommand)]
        action: ProfileCmd,
    },
    /// Print a shell completion script
    Completion {
        /// Target shell
        shell: Shell,
    },
    /// Inspect plugins
    Plugin {
        #[command(subcommand)]
        action: PluginCmd,
    },
    /// Classify job types and (later) generate job workers
    Worker {
        #[command(subcommand)]
        action: worker::WorkerCmd,
    },
    /// Manage this installation
    #[command(name = "self")]
    Installation {
        #[command(subcommand)]
        action: SelfAction,
    },
}

#[derive(Subcommand)]
enum ProfileCmd {
    /// List profiles; the active one is marked with `*`
    List,
    /// Print one profile (default: the active one) as JSON
    Show { name: Option<String> },
    /// Print the profile store path (copies a legacy `casen` store first)
    Path,
    // Clap needs the payload to accept unknown subcommands; the legacy CLI re-reads the raw args.
    #[command(external_subcommand)]
    Other(#[allow(dead_code)] Vec<OsString>),
}

#[derive(Subcommand)]
enum PluginCmd {
    /// List installed plugins
    List,
}

#[derive(Subcommand)]
enum SelfAction {
    /// Update this binary
    Update,
}

fn bin_name(argv0: &OsString) -> &'static str {
    let stem = PathBuf::from(argv0)
        .file_stem()
        .map(|s| s.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    if stem == "casen" {
        "casen"
    } else {
        "bpmnkit"
    }
}

/// Entry point. `args[0]` is argv0; returns the process exit code.
pub fn run(args: Vec<OsString>) -> i32 {
    let roots = Roots::from_env();
    let name = args.first().map_or("bpmnkit", bin_name);
    if name == "casen" {
        deprecation_note(&roots);
    }
    let rest = &args[1..];
    // The first non-flag argument names the command. Flags before it belong to the legacy CLI.
    let first = rest
        .iter()
        .position(|a| !a.to_string_lossy().starts_with('-'));
    let native = match first {
        None => true, // --help, --version, or nothing: clap answers
        Some(i) => NATIVE.contains(&&*rest[i].to_string_lossy()) && i == 0,
    };
    if !native {
        return match first {
            Some(0) => plugin::dispatch(&roots, rest).unwrap_or_else(|| legacy::run(rest)),
            _ => legacy::run(rest),
        };
    }
    let matches = Cli::command().bin_name(name).get_matches_from(&args);
    match Cli::from_arg_matches(&matches)
        .unwrap_or_else(|e| e.exit())
        .command
    {
        Cmd::Profile { action } => match action {
            ProfileCmd::Other(_) => legacy::run(rest),
            a => profile(&roots, a),
        },
        Cmd::Completion { shell } => {
            let mut cmd = Cli::command().bin_name(name);
            clap_complete::generate(shell, &mut cmd, name, &mut std::io::stdout());
            0
        }
        Cmd::Plugin {
            action: PluginCmd::List,
        } => {
            for (n, path) in plugin::list(&roots) {
                println!("{n}\t{}", path.display());
            }
            0
        }
        Cmd::Worker { action } => worker::run(action),
        Cmd::Installation {
            action: SelfAction::Update,
        } => {
            eprintln!("self update arrives with the cargo-dist release (plan P8); reinstall via npm or the release installer for now");
            1
        }
    }
}

fn profile(roots: &Roots, action: ProfileCmd) -> i32 {
    match action {
        ProfileCmd::List => match list_profiles(roots) {
            Ok((names, active)) => {
                for n in names {
                    let mark = if active.as_deref() == Some(n.as_str()) {
                        '*'
                    } else {
                        ' '
                    };
                    println!("{mark} {n}");
                }
                0
            }
            Err(e) => fail(&format!("cannot read the profile store: {e}")),
        },
        ProfileCmd::Show { name } => {
            let found = match name {
                Some(n) => bpmnkit_profiles::get(roots, &n).map_err(|e| e.to_string()),
                None => Ok(bpmnkit_profiles::active_profile(roots)),
            };
            match found {
                Ok(Some(p)) => {
                    println!("{}", serde_json::to_string_pretty(&p).unwrap_or_default());
                    0
                }
                Ok(None) => fail("profile not found"),
                Err(e) => fail(&format!("cannot read the profile store: {e}")),
            }
        }
        ProfileCmd::Path => {
            println!("{}", bpmnkit_profiles::config_file(roots).display());
            0
        }
        ProfileCmd::Other(_) => unreachable!("routed to the legacy CLI"),
    }
}

fn fail(msg: &str) -> i32 {
    eprintln!("bpmnkit: {msg}");
    1
}

/// One stderr note per day when invoked as `casen`; the stamp lives in the profiles dir.
fn deprecation_note(roots: &Roots) {
    let day = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_or(0, |d| d.as_secs() / 86_400)
        .to_string();
    let stamp = bpmnkit_profiles::resolve_dir(roots).join(".casen-deprecation");
    if std::fs::read_to_string(&stamp).is_ok_and(|s| s.trim() == day) {
        return;
    }
    eprintln!("note: `casen` is now `bpmnkit`; the `casen` alias keeps working but is deprecated.");
    if let Some(dir) = stamp.parent() {
        let _ = std::fs::create_dir_all(dir);
    }
    let _ = std::fs::File::create(&stamp).and_then(|mut f| f.write_all(day.as_bytes()));
}

/// Exit code of a finished child; 128+signal when it was killed (POSIX convention).
pub(crate) fn exit_code(status: std::process::ExitStatus) -> i32 {
    #[cfg(unix)]
    {
        use std::os::unix::process::ExitStatusExt;
        if let Some(sig) = status.signal() {
            return 128 + sig;
        }
    }
    status.code().unwrap_or(1)
}
