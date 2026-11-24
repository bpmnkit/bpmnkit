//! Where secret values come from. Only names the manifest lists are ever looked up.

use std::collections::HashMap;
use std::path::PathBuf;

use bpmnkit_wasm_contract::ValidManifest;

pub trait SecretSource: Send + Sync {
    fn get(&self, name: &str) -> Option<String>;
}

/// `BPMNKIT_WASM_SECRET_<NAME>`.
#[derive(Debug, Default, Clone, Copy)]
pub struct EnvSecrets;
impl SecretSource for EnvSecrets {
    fn get(&self, name: &str) -> Option<String> {
        std::env::var(format!("BPMNKIT_WASM_SECRET_{name}")).ok()
    }
}

/// One file per secret, `<dir>/<NAME>`; a trailing newline is dropped.
#[derive(Debug, Clone)]
pub struct FileSecrets(pub PathBuf);
impl SecretSource for FileSecrets {
    fn get(&self, name: &str) -> Option<String> {
        // Manifest validation restricts names, but a path separator must never reach the fs.
        if name.is_empty() || name.contains(['/', '\\', '.']) {
            return None;
        }
        let v = std::fs::read_to_string(self.0.join(name)).ok()?;
        Some(v.strip_suffix('\n').unwrap_or(&v).to_owned())
    }
}

#[derive(Debug, Default, Clone)]
pub struct MapSecrets(pub HashMap<String, String>);
impl SecretSource for MapSecrets {
    fn get(&self, name: &str) -> Option<String> {
        self.0.get(name).cloned()
    }
}
impl<const N: usize> From<[(&str, &str); N]> for MapSecrets {
    fn from(a: [(&str, &str); N]) -> Self {
        Self(a.iter().map(|(k, v)| ((*k).into(), (*v).into())).collect())
    }
}

/// The values the guest may see: the manifest's names that `src` knows, nothing else.
pub(crate) fn scoped(m: &ValidManifest, src: &dyn SecretSource) -> HashMap<String, String> {
    m.secrets
        .names
        .iter()
        .filter_map(|n| src.get(n).map(|v| (n.clone(), v)))
        .collect()
}
