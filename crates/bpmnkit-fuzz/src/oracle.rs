//! The TypeScript side: one long-lived `node scripts/fuzz/oracle.mjs`, one JSON request per
//! line on its stdin, one JSON answer per line on its stdout.

use crate::Target;
use serde_json::Value as Json;
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};

/// `<repo>/scripts/fuzz/oracle.mjs`.
pub fn default_script() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../scripts/fuzz/oracle.mjs")
}

pub struct Oracle {
    child: Child,
    stdin: ChildStdin,
    stdout: BufReader<ChildStdout>,
}

impl Oracle {
    pub fn spawn(node: &str, script: &Path) -> std::io::Result<Oracle> {
        let mut child = Command::new(node)
            .arg(script)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()?;
        let stdin = child.stdin.take().expect("piped stdin");
        let stdout = BufReader::new(child.stdout.take().expect("piped stdout"));
        Ok(Oracle {
            child,
            stdin,
            stdout,
        })
    }

    /// Sends `req` (an object) tagged with the target and returns the oracle's answer.
    pub fn call(&mut self, target: Target, req: &Json) -> Result<Json, String> {
        let mut msg = req.clone();
        msg["target"] = Json::String(target.name().into());
        let line = serde_json::to_string(&msg).map_err(|e| e.to_string())?;
        writeln!(self.stdin, "{line}").map_err(|e| format!("oracle stdin: {e}"))?;
        self.stdin
            .flush()
            .map_err(|e| format!("oracle stdin: {e}"))?;
        let mut answer = String::new();
        match self.stdout.read_line(&mut answer) {
            Ok(0) => Err("oracle exited".into()),
            Ok(_) => serde_json::from_str(&answer).map_err(|e| format!("oracle answer: {e}")),
            Err(e) => Err(format!("oracle stdout: {e}")),
        }
    }
}

impl Drop for Oracle {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}
