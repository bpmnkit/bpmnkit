//! Profile store location and the one-way `casen` → `bpmnkit` copy migration.
//!
//! Mirrors `packages/profiles/src/profile.ts` (`configDir`). Roots are injected through [`Roots`]
//! so every OS rule is testable on any host.

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use serde_json::{Map, Value};

pub const NEW_APP: &str = "bpmnkit";
pub const LEGACY_APP: &str = "casen";
const CONFIG_FILE: &str = "config.json";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Os {
    Linux,
    MacOs,
    Windows,
}

impl Os {
    pub fn current() -> Self {
        if cfg!(windows) {
            Self::Windows
        } else if cfg!(target_os = "macos") {
            Self::MacOs
        } else {
            Self::Linux
        }
    }
}

/// The inputs of the path rules; nothing else reads the environment.
#[derive(Clone, Debug)]
pub struct Roots {
    pub os: Os,
    pub home: PathBuf,
    pub xdg_config_home: Option<PathBuf>,
    pub appdata: Option<PathBuf>,
}

impl Roots {
    pub fn from_env() -> Self {
        let var = |k: &str| {
            std::env::var_os(k)
                .filter(|v| !v.is_empty())
                .map(PathBuf::from)
        };
        let home = var(if cfg!(windows) { "USERPROFILE" } else { "HOME" })
            .or_else(|| var("HOME"))
            .unwrap_or_default();
        Self {
            os: Os::current(),
            home,
            xdg_config_home: var("XDG_CONFIG_HOME"),
            appdata: var("APPDATA"),
        }
    }
}

/// Config directory of `app` under the OS rule (`$XDG_CONFIG_HOME`, `%APPDATA%`, Application Support).
pub fn config_dir(roots: &Roots, app: &str) -> PathBuf {
    match roots.os {
        Os::Windows => roots
            .appdata
            .clone()
            .unwrap_or_else(|| roots.home.clone())
            .join(app),
        Os::MacOs => roots
            .home
            .join("Library")
            .join("Application Support")
            .join(app),
        Os::Linux => roots
            .xdg_config_home
            .clone()
            .unwrap_or_else(|| roots.home.join(".config"))
            .join(app),
    }
}

pub fn new_dir(roots: &Roots) -> PathBuf {
    config_dir(roots, NEW_APP)
}

pub fn legacy_dir(roots: &Roots) -> PathBuf {
    config_dir(roots, LEGACY_APP)
}

#[derive(Debug, PartialEq, Eq)]
pub enum Migration {
    /// The new store exists, or there is no legacy store to copy.
    NotNeeded,
    /// The legacy store was copied (never moved) to the new directory.
    Migrated { from: PathBuf },
}

/// Copies the `casen` directory to the `bpmnkit` one when the latter has no `config.json` yet, and
/// records `migrated_from` in the copy. The legacy store is left untouched so `@bpmnkit/cli` 2.x
/// (legacy fallback) keeps working.
pub fn ensure_migrated(roots: &Roots) -> io::Result<Migration> {
    let (new, old) = (new_dir(roots), legacy_dir(roots));
    if new.join(CONFIG_FILE).exists() || !old.join(CONFIG_FILE).exists() {
        return Ok(Migration::NotNeeded);
    }
    copy_dir(&old, &new)?;
    stamp_migrated_from(&new.join(CONFIG_FILE), &old)?;
    Ok(Migration::Migrated { from: old })
}

/// The directory to use: migrates first, and falls back to the legacy directory if the copy fails
/// (for example a read-only home), so a failed migration never hides existing profiles.
pub fn resolve_dir(roots: &Roots) -> PathBuf {
    match ensure_migrated(roots) {
        Ok(_) => new_dir(roots),
        Err(_) => legacy_dir(roots),
    }
}

pub fn config_file(roots: &Roots) -> PathBuf {
    resolve_dir(roots).join(CONFIG_FILE)
}

fn copy_dir(from: &Path, to: &Path) -> io::Result<()> {
    create_private_dir(to)?;
    for entry in fs::read_dir(from)? {
        let entry = entry?;
        let kind = entry.file_type()?;
        let dest = to.join(entry.file_name());
        if kind.is_dir() {
            copy_dir(&entry.path(), &dest)?;
        } else if kind.is_file() {
            fs::copy(entry.path(), &dest)?;
            restrict(&dest, 0o600);
        }
    }
    Ok(())
}

fn create_private_dir(dir: &Path) -> io::Result<()> {
    fs::create_dir_all(dir)?;
    restrict(dir, 0o700);
    Ok(())
}

// The store holds client secrets and passwords: owner-only, like the TS writer.
#[cfg(unix)]
fn restrict(path: &Path, mode: u32) {
    use std::os::unix::fs::PermissionsExt;
    let _ = fs::set_permissions(path, fs::Permissions::from_mode(mode));
}
#[cfg(not(unix))]
fn restrict(_: &Path, _: u32) {}

fn stamp_migrated_from(file: &Path, from: &Path) -> io::Result<()> {
    let Ok(Value::Object(mut obj)) = serde_json::from_slice::<Value>(&fs::read(file)?) else {
        return Ok(()); // not a JSON object: leave the copy as is, the reader reports it
    };
    obj.insert(
        "migrated_from".into(),
        Value::String(from.to_string_lossy().into_owned()),
    );
    let json = serde_json::to_string_pretty(&obj).map_err(io::Error::other)?;
    fs::write(file, json)
}

/// The active profile in the TS `Profile` shape (`name`, `apiType`, `config`), or `None`.
pub fn active_profile(roots: &Roots) -> Option<Value> {
    let store: Value = serde_json::from_slice(&fs::read(config_file(roots)).ok()?).ok()?;
    let name = store.get("active")?.as_str()?;
    profile_from(&store, name)
}

pub fn profile_from(store: &Value, name: &str) -> Option<Value> {
    let config = store.get("profiles")?.get(name)?.clone();
    let api_type = store
        .get("meta")
        .and_then(|m| m.get(name))
        .and_then(|m| m.get("apiType"))
        .and_then(Value::as_str)
        .unwrap_or("c8");
    let mut p = Map::new();
    p.insert("name".into(), name.into());
    p.insert("apiType".into(), api_type.into());
    p.insert("config".into(), config);
    Some(Value::Object(p))
}

/// Profile names in store order and the active one.
pub fn list(roots: &Roots) -> io::Result<(Vec<String>, Option<String>)> {
    let bytes = match fs::read(config_file(roots)) {
        Ok(b) => b,
        Err(e) if e.kind() == io::ErrorKind::NotFound => return Ok((vec![], None)),
        Err(e) => return Err(e),
    };
    let store: Value = serde_json::from_slice(&bytes).map_err(io::Error::other)?;
    let names = store
        .get("profiles")
        .and_then(Value::as_object)
        .map(|m| m.keys().cloned().collect())
        .unwrap_or_default();
    let active = store
        .get("active")
        .and_then(Value::as_str)
        .map(str::to_owned);
    Ok((names, active))
}

/// Reads one named profile (`None` when absent).
pub fn get(roots: &Roots, name: &str) -> io::Result<Option<Value>> {
    let store: Value =
        serde_json::from_slice(&fs::read(config_file(roots))?).map_err(io::Error::other)?;
    Ok(profile_from(&store, name))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn roots(os: Os, home: &Path) -> Roots {
        Roots {
            os,
            home: home.to_path_buf(),
            xdg_config_home: None,
            appdata: None,
        }
    }

    #[test]
    fn path_rules_per_os() {
        let h = Path::new("/h");
        assert_eq!(
            new_dir(&roots(Os::Linux, h)),
            Path::new("/h/.config/bpmnkit")
        );
        let mut r = roots(Os::Linux, h);
        r.xdg_config_home = Some("/x".into());
        assert_eq!(legacy_dir(&r), Path::new("/x/casen"));
        assert_eq!(
            new_dir(&roots(Os::MacOs, h)),
            Path::new("/h/Library/Application Support/bpmnkit")
        );
        let mut w = roots(Os::Windows, h);
        assert_eq!(new_dir(&w), Path::new("/h/bpmnkit"));
        w.appdata = Some("/a".into());
        assert_eq!(legacy_dir(&w), Path::new("/a/casen"));
    }

    fn seed(roots: &Roots) {
        let old = legacy_dir(roots);
        fs::create_dir_all(&old).unwrap();
        fs::write(
            old.join("config.json"),
            r#"{"profiles":{"dev":{"baseUrl":"http://x/v2"}},"active":"dev","meta":{}}"#,
        )
        .unwrap();
    }

    #[test]
    fn migration_copies_on_every_os_rule() {
        for os in [Os::Linux, Os::MacOs, Os::Windows] {
            let t = tempfile::tempdir().unwrap();
            let r = roots(os, t.path());
            seed(&r);
            let m = ensure_migrated(&r).unwrap();
            assert_eq!(
                m,
                Migration::Migrated {
                    from: legacy_dir(&r)
                }
            );
            let copied: Value =
                serde_json::from_slice(&fs::read(new_dir(&r).join("config.json")).unwrap())
                    .unwrap();
            assert_eq!(
                copied["migrated_from"],
                legacy_dir(&r).to_string_lossy().as_ref()
            );
            assert_eq!(copied["active"], "dev");
            // copy, never move
            assert!(legacy_dir(&r).join("config.json").exists());
            assert_eq!(ensure_migrated(&r).unwrap(), Migration::NotNeeded);
        }
    }

    #[test]
    fn existing_new_store_wins() {
        let t = tempfile::tempdir().unwrap();
        let r = roots(Os::Linux, t.path());
        seed(&r);
        fs::create_dir_all(new_dir(&r)).unwrap();
        fs::write(
            new_dir(&r).join("config.json"),
            r#"{"profiles":{},"active":null}"#,
        )
        .unwrap();
        assert_eq!(ensure_migrated(&r).unwrap(), Migration::NotNeeded);
        assert_eq!(list(&r).unwrap(), (vec![], None));
    }

    #[test]
    fn nothing_to_migrate_creates_nothing() {
        let t = tempfile::tempdir().unwrap();
        let r = roots(Os::Linux, t.path());
        assert_eq!(ensure_migrated(&r).unwrap(), Migration::NotNeeded);
        assert!(!new_dir(&r).exists());
        assert_eq!(list(&r).unwrap(), (vec![], None));
    }

    #[test]
    fn reads_active_profile_in_ts_shape() {
        let t = tempfile::tempdir().unwrap();
        let r = roots(Os::Linux, t.path());
        seed(&r);
        let p = active_profile(&r).unwrap();
        assert_eq!(p["name"], "dev");
        assert_eq!(p["apiType"], "c8");
        assert_eq!(p["config"]["baseUrl"], "http://x/v2");
        assert_eq!(list(&r).unwrap(), (vec!["dev".into()], Some("dev".into())));
    }
}
