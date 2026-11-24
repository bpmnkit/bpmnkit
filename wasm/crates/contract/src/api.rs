//! Shared by the agent tool, the builder and the host, so the shapes cannot drift.

use std::collections::BTreeMap;
use std::fmt;

use serde::{Deserialize, Serialize};
use sha2::{Digest as _, Sha256};

use crate::manifest::{Manifest, ValidManifest};

/// Lower-case hex SHA-256.
#[derive(Debug, Clone, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(try_from = "String", into = "String")]
pub struct Digest(String);

impl Digest {
    pub fn of(bytes: &[u8]) -> Self {
        Self(
            Sha256::digest(bytes)
                .iter()
                .map(|b| format!("{b:02x}"))
                .collect(),
        )
    }
    pub fn as_hex(&self) -> &str {
        &self.0
    }
}
impl TryFrom<String> for Digest {
    type Error = String;
    fn try_from(s: String) -> Result<Self, String> {
        if s.len() == 64
            && s.bytes()
                .all(|c| c.is_ascii_digit() || (b'a'..=b'f').contains(&c))
        {
            Ok(Self(s))
        } else {
            Err(format!("`{s}` is not a sha256 hex digest"))
        }
    }
}
impl From<Digest> for String {
    fn from(d: Digest) -> String {
        d.0
    }
}
impl fmt::Display for Digest {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ArtifactMetadata {
    pub component_digest: Digest,
    pub source_digest: Digest,
    pub manifest: ValidManifest,
    pub contract_version: semver::Version,
    pub sdk_version: semver::Version,
    /// `rustc --version`.
    pub toolchain: String,
    /// Digest of the curated `Cargo.lock`.
    pub lock_digest: Digest,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Diagnostic {
    pub file: String,
    pub line: u32,
    pub col: u32,
    pub code: String,
    pub message: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub suggestion: Option<String>,
}

/// What the agent submits. The manifest is not yet validated: errors come back as diagnostics.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BuildRequest {
    pub manifest: Manifest,
    /// Contents of `src/lib.rs`.
    pub source: String,
    #[serde(default)]
    pub samples: Vec<SampleJob>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ExpectedOutcome {
    Complete,
    Fail,
    ThrowError,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SampleJob {
    pub name: String,
    pub job_type: String,
    #[serde(default)]
    pub variables: serde_json::Value,
    #[serde(default)]
    pub custom_headers: BTreeMap<String, String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expect: Option<ExpectedOutcome>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TestResult {
    pub name: String,
    pub passed: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StageTiming {
    pub stage: String,
    pub ms: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct BuildReport {
    pub ok: bool,
    pub diagnostics: Vec<Diagnostic>,
    pub tests: Vec<TestResult>,
    pub timings: Vec<StageTiming>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub artifact: Option<ArtifactMetadata>,
}
