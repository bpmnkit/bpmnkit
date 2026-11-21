//! Writing and `--check`, shared by all targets.

use std::io;
use std::path::{Path, PathBuf};

use crate::{GenFile, Kind};

/// What [`write`] did, paths sorted.
#[derive(Debug, Default, PartialEq, Eq)]
pub struct Written {
    pub created: Vec<String>,
    pub updated: Vec<String>,
    pub unchanged: Vec<String>,
    /// Once-only files that exist and were left alone.
    pub kept: Vec<String>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum Drift {
    /// A generated file differs from what the generator would write.
    Changed(String),
    /// A file (generated or once-only) is missing.
    Missing(String),
}

impl std::fmt::Display for Drift {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Drift::Changed(p) => write!(f, "changed: {p}"),
            Drift::Missing(p) => write!(f, "missing: {p}"),
        }
    }
}

fn target(dir: &Path, rel: &str) -> PathBuf {
    rel.split('/').fold(dir.to_path_buf(), |p, seg| p.join(seg))
}

/// Overwrite generated files, create once-only files only when missing.
pub fn write(dir: &Path, files: &[GenFile]) -> io::Result<Written> {
    let mut out = Written::default();
    for f in files {
        // Defence in depth: nothing an emitter returns may leave `dir`.
        if f.path.starts_with('/') || f.path.split('/').any(|s| s.is_empty() || s == "..") {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                format!("refusing to write outside the output directory: {}", f.path),
            ));
        }
        let path = target(dir, &f.path);
        let existing = std::fs::read(&path).ok();
        match (f.kind, existing) {
            (Kind::Once, Some(_)) => {
                out.kept.push(f.path.clone());
                continue;
            }
            (Kind::Generated, Some(old)) if old == f.content => {
                out.unchanged.push(f.path.clone());
                continue;
            }
            (_, Some(_)) => out.updated.push(f.path.clone()),
            (_, None) => out.created.push(f.path.clone()),
        }
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&path, &f.content)?;
        #[cfg(unix)]
        if f.executable {
            use std::os::unix::fs::PermissionsExt;
            std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o755))?;
        }
    }
    Ok(out)
}

/// Compare the directory with what the generator would write; writes nothing.
pub fn check(dir: &Path, files: &[GenFile]) -> Vec<Drift> {
    files
        .iter()
        .filter_map(|f| match (std::fs::read(target(dir, &f.path)), f.kind) {
            (Err(_), _) => Some(Drift::Missing(f.path.clone())),
            (Ok(old), Kind::Generated) if old != f.content => Some(Drift::Changed(f.path.clone())),
            _ => None,
        })
        .collect()
}
