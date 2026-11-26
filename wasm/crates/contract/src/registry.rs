//! Registry of signed artifacts. `DirRegistry` layout:
//! `<root>/<name>/<digest>/{worker.wasm,worker.toml,metadata.json,worker.sig}` and
//! `<root>/<name>/CURRENT` (a digest, replaced by atomic rename).

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use crate::api::{ArtifactMetadata, Digest};
use crate::manifest::ValidManifest;
use crate::signing::{decode_hex, encode_hex, Signature};

#[derive(Debug)]
pub enum RegistryError {
    Io(io::Error),
    /// Name is not a safe single path segment.
    BadName(String),
    NotFound(String),
    /// Stored files do not parse or disagree with the digest.
    Corrupt(String),
}
impl std::fmt::Display for RegistryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Io(e) => write!(f, "registry io: {e}"),
            Self::BadName(n) => write!(f, "bad worker name `{n}`"),
            Self::NotFound(n) => write!(f, "not found: {n}"),
            Self::Corrupt(m) => write!(f, "corrupt registry entry: {m}"),
        }
    }
}
impl std::error::Error for RegistryError {}
impl From<io::Error> for RegistryError {
    fn from(e: io::Error) -> Self {
        Self::Io(e)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RegistryEntry {
    pub wasm: Vec<u8>,
    pub manifest: ValidManifest,
    pub metadata: ArtifactMetadata,
    pub signature: Signature,
}

/// A trait so an OCI registry can be a second implementation later.
pub trait RegistryStore {
    /// Store the entry and make it current. Idempotent for the same digest.
    fn publish(&self, entry: &RegistryEntry) -> Result<Digest, RegistryError>;
    fn current(&self, name: &str) -> Result<Option<Digest>, RegistryError>;
    fn list(&self, name: &str) -> Result<Vec<Digest>, RegistryError>;
    fn load(&self, name: &str, digest: &Digest) -> Result<RegistryEntry, RegistryError>;
}

pub struct DirRegistry {
    root: PathBuf,
}

fn safe(name: &str) -> Result<&str, RegistryError> {
    let ok = !name.is_empty()
        && !name.starts_with('.')
        && name
            .bytes()
            .all(|c| c.is_ascii_alphanumeric() || c == b'-' || c == b'_' || c == b'.');
    if ok {
        Ok(name)
    } else {
        Err(RegistryError::BadName(name.into()))
    }
}

fn corrupt(e: impl std::fmt::Display) -> RegistryError {
    RegistryError::Corrupt(e.to_string())
}

impl DirRegistry {
    pub fn new(root: impl Into<PathBuf>) -> Self {
        Self { root: root.into() }
    }
    pub fn root(&self) -> &Path {
        &self.root
    }
}

impl RegistryStore for DirRegistry {
    fn publish(&self, e: &RegistryEntry) -> Result<Digest, RegistryError> {
        let name = safe(&e.manifest.worker.name)?;
        let digest = Digest::of(&e.wasm);
        if digest != e.metadata.component_digest {
            return Err(corrupt("metadata digest does not match wasm"));
        }
        let wdir = self.root.join(name);
        let dir = wdir.join(digest.as_hex());
        fs::create_dir_all(&dir)?;
        fs::write(dir.join("worker.wasm"), &e.wasm)?;
        fs::write(dir.join("worker.toml"), e.manifest.to_toml())?;
        fs::write(
            dir.join("metadata.json"),
            serde_json::to_vec_pretty(&e.metadata).map_err(corrupt)?,
        )?;
        fs::write(dir.join("worker.sig"), encode_hex(&e.signature.to_bytes()))?;
        // Readers see the old or the new digest, never a partial file.
        let tmp = wdir.join("CURRENT.tmp");
        fs::write(&tmp, digest.as_hex())?;
        fs::rename(&tmp, wdir.join("CURRENT"))?;
        Ok(digest)
    }

    fn current(&self, name: &str) -> Result<Option<Digest>, RegistryError> {
        match fs::read_to_string(self.root.join(safe(name)?).join("CURRENT")) {
            Ok(s) => Digest::try_from(s.trim().to_string())
                .map(Some)
                .map_err(corrupt),
            Err(e) if e.kind() == io::ErrorKind::NotFound => Ok(None),
            Err(e) => Err(e.into()),
        }
    }

    fn list(&self, name: &str) -> Result<Vec<Digest>, RegistryError> {
        let rd = match fs::read_dir(self.root.join(safe(name)?)) {
            Ok(rd) => rd,
            Err(e) if e.kind() == io::ErrorKind::NotFound => return Ok(vec![]),
            Err(e) => return Err(e.into()),
        };
        let mut v = Vec::new();
        for ent in rd {
            let ent = ent?;
            if ent.file_type()?.is_dir() {
                if let Ok(d) = Digest::try_from(ent.file_name().to_string_lossy().into_owned()) {
                    v.push(d);
                }
            }
        }
        v.sort();
        Ok(v)
    }

    fn load(&self, name: &str, digest: &Digest) -> Result<RegistryEntry, RegistryError> {
        let dir = self.root.join(safe(name)?).join(digest.as_hex());
        let rd = |f: &str| {
            fs::read(dir.join(f)).map_err(|e| match e.kind() {
                io::ErrorKind::NotFound => RegistryError::NotFound(format!("{name}/{digest}/{f}")),
                _ => e.into(),
            })
        };
        let text = |f: &str| String::from_utf8(rd(f)?).map_err(corrupt);
        let sig = decode_hex(&text("worker.sig")?).map_err(corrupt)?;
        Ok(RegistryEntry {
            wasm: rd("worker.wasm")?,
            manifest: ValidManifest::from_toml(&text("worker.toml")?)
                .map_err(|e| corrupt(format!("{e:?}")))?,
            metadata: serde_json::from_slice(&rd("metadata.json")?).map_err(corrupt)?,
            signature: Signature::from_slice(&sig).map_err(corrupt)?,
        })
    }
}
