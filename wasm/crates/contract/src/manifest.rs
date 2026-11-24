//! `worker.toml`: the part a human approves. [`validate`] is the only way to a [`ValidManifest`].

use std::fmt;

use serde::{Deserialize, Serialize};

pub const DEFAULT_MEMORY_MB: u32 = 64;
pub const DEFAULT_TIMEOUT_MS: u64 = 10_000;
pub const DEFAULT_MAX_CONCURRENT: u32 = 8;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Manifest {
    pub worker: WorkerSection,
    #[serde(default)]
    pub limits: Limits,
    #[serde(default)]
    pub network: Network,
    #[serde(default)]
    pub secrets: Secrets,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkerSection {
    pub name: String,
    pub version: String,
    pub job_types: Vec<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Limits {
    #[serde(default = "d_mem")]
    pub memory_mb: u32,
    #[serde(default = "d_timeout")]
    pub timeout_ms: u64,
    #[serde(default = "d_conc")]
    pub max_concurrent: u32,
}
fn d_mem() -> u32 {
    DEFAULT_MEMORY_MB
}
fn d_timeout() -> u64 {
    DEFAULT_TIMEOUT_MS
}
fn d_conc() -> u32 {
    DEFAULT_MAX_CONCURRENT
}
impl Default for Limits {
    fn default() -> Self {
        Self {
            memory_mb: DEFAULT_MEMORY_MB,
            timeout_ms: DEFAULT_TIMEOUT_MS,
            max_concurrent: DEFAULT_MAX_CONCURRENT,
        }
    }
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Network {
    /// Exact `host:port`; empty means world `worker` (no HTTP import).
    #[serde(default)]
    pub allow: Vec<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Secrets {
    #[serde(default)]
    pub names: Vec<String>,
}

/// What the platform allows; a manifest may ask for less, never more.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PlatformCeilings {
    pub memory_mb: u32,
    pub timeout_ms: u64,
    pub max_concurrent: u32,
    pub ports: Vec<u16>,
}
impl Default for PlatformCeilings {
    fn default() -> Self {
        Self {
            memory_mb: 256,
            timeout_ms: 60_000,
            max_concurrent: 64,
            ports: vec![443],
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ManifestError {
    BadName(String),
    NoJobTypes,
    BadJobType(String),
    DuplicateJobType(String),
    BadVersion(String),
    LimitZero(&'static str),
    LimitAboveCeiling {
        field: &'static str,
        value: u64,
        ceiling: u64,
    },
    BadNetworkEntry {
        entry: String,
        reason: &'static str,
    },
    DuplicateNetworkEntry(String),
    BadSecretName(String),
    DuplicateSecretName(String),
}

impl fmt::Display for ManifestError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::BadName(n) => write!(
                f,
                "worker name `{n}` must match ^[a-z0-9][a-z0-9-]{{0,62}}$"
            ),
            Self::NoJobTypes => f.write_str("job_types must not be empty"),
            Self::BadJobType(t) => write!(
                f,
                "job type `{t}` must match ^[a-z0-9][a-z0-9-]{{0,62}}$ (no wildcards)"
            ),
            Self::DuplicateJobType(t) => write!(f, "job type `{t}` listed twice"),
            Self::BadVersion(v) => write!(f, "version `{v}` is not semver"),
            Self::LimitZero(l) => write!(f, "limit {l} must be greater than 0"),
            Self::LimitAboveCeiling {
                field,
                value,
                ceiling,
            } => {
                write!(
                    f,
                    "limit {field} = {value} exceeds the platform ceiling {ceiling}"
                )
            }
            Self::BadNetworkEntry { entry, reason } => {
                write!(f, "network entry `{entry}`: {reason}")
            }
            Self::DuplicateNetworkEntry(e) => write!(f, "network entry `{e}` listed twice"),
            Self::BadSecretName(n) => {
                write!(f, "secret name `{n}` must match ^[A-Z][A-Z0-9_]{{0,63}}$")
            }
            Self::DuplicateSecretName(n) => write!(f, "secret name `{n}` listed twice"),
        }
    }
}
impl std::error::Error for ManifestError {}

/// A manifest that passed [`validate`]. The field is private so nothing else can build one.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(try_from = "Manifest")]
pub struct ValidManifest(Manifest);

impl TryFrom<Manifest> for ValidManifest {
    type Error = String;
    fn try_from(m: Manifest) -> Result<Self, String> {
        validate(m).map_err(|e| {
            e.iter()
                .map(ToString::to_string)
                .collect::<Vec<_>>()
                .join("; ")
        })
    }
}

impl std::ops::Deref for ValidManifest {
    type Target = Manifest;
    fn deref(&self) -> &Manifest {
        &self.0
    }
}
impl ValidManifest {
    pub fn into_inner(self) -> Manifest {
        self.0
    }
    /// Parses `worker.toml` and validates it against the default ceilings.
    pub fn from_toml(s: &str) -> Result<Self, Vec<ManifestError>> {
        let m: Manifest =
            toml::from_str(s).map_err(|e| vec![ManifestError::BadName(format!("toml: {e}"))])?;
        validate(m)
    }
    pub fn to_toml(&self) -> String {
        toml::to_string_pretty(&self.0).expect("manifest serialises")
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum World {
    Worker,
    WorkerHttp,
}

pub fn world_for(m: &ValidManifest) -> World {
    if m.network.allow.is_empty() {
        World::Worker
    } else {
        World::WorkerHttp
    }
}

/// `^[a-z0-9][a-z0-9-]{0,62}$`
fn is_slug(s: &str) -> bool {
    let b = s.as_bytes();
    !b.is_empty()
        && b.len() <= 63
        && (b[0].is_ascii_lowercase() || b[0].is_ascii_digit())
        && b.iter()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || *c == b'-')
}

/// `^[A-Z][A-Z0-9_]{0,63}$`
fn is_secret_name(s: &str) -> bool {
    let b = s.as_bytes();
    !b.is_empty()
        && b.len() <= 64
        && b[0].is_ascii_uppercase()
        && b.iter()
            .all(|c| c.is_ascii_uppercase() || c.is_ascii_digit() || *c == b'_')
}

fn check_network(entry: &str, ceil: &PlatformCeilings) -> Result<(), &'static str> {
    // `[v6]:443` forms and anything with a colon in the host fail the single-split below.
    let Some((host, port)) = entry.rsplit_once(':') else {
        return Err("must be host:port");
    };
    if host.contains(':') || host.starts_with('[') {
        return Err("IP literals are not allowed");
    }
    if host.contains('*') {
        return Err("wildcards are not allowed");
    }
    let Ok(port) = port.parse::<u16>() else {
        return Err("port is not a number");
    };
    if !ceil.ports.contains(&port) {
        return Err("port not allowed by the platform");
    }
    if host.is_empty()
        || host.len() > 253
        || !host
            .bytes()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'-' || c == b'.')
        || host.starts_with(['.', '-'])
        || host.ends_with(['.', '-'])
        || host.contains("..")
    {
        return Err("host must be a lowercase DNS name");
    }
    // A dotted-decimal address (or any all-numeric label set) is an IP literal in disguise.
    if host
        .split('.')
        .all(|l| !l.is_empty() && l.bytes().all(|c| c.is_ascii_digit()))
    {
        return Err("IP literals are not allowed");
    }
    if !host.contains('.') {
        return Err("host must be a fully qualified name");
    }
    for suffix in [
        ".local",
        ".localhost",
        ".internal",
        ".lan",
        ".home",
        ".corp",
        ".arpa",
    ] {
        if host.ends_with(suffix) {
            return Err("private names are not allowed");
        }
    }
    Ok(())
}

/// Validates against the default [`PlatformCeilings`].
pub fn validate(m: Manifest) -> Result<ValidManifest, Vec<ManifestError>> {
    validate_with(m, &PlatformCeilings::default())
}

pub fn validate_with(
    m: Manifest,
    ceil: &PlatformCeilings,
) -> Result<ValidManifest, Vec<ManifestError>> {
    use ManifestError as E;
    let mut errs = Vec::new();
    if !is_slug(&m.worker.name) {
        errs.push(E::BadName(m.worker.name.clone()));
    }
    if semver::Version::parse(&m.worker.version).is_err() {
        errs.push(E::BadVersion(m.worker.version.clone()));
    }
    if m.worker.job_types.is_empty() {
        errs.push(E::NoJobTypes);
    }
    for (i, t) in m.worker.job_types.iter().enumerate() {
        if !is_slug(t) {
            errs.push(E::BadJobType(t.clone()));
        } else if m.worker.job_types[..i].contains(t) {
            errs.push(E::DuplicateJobType(t.clone()));
        }
    }
    let l = m.limits;
    for (field, value, ceiling) in [
        (
            "memory_mb",
            u64::from(l.memory_mb),
            u64::from(ceil.memory_mb),
        ),
        ("timeout_ms", l.timeout_ms, ceil.timeout_ms),
        (
            "max_concurrent",
            u64::from(l.max_concurrent),
            u64::from(ceil.max_concurrent),
        ),
    ] {
        if value == 0 {
            errs.push(E::LimitZero(field));
        } else if value > ceiling {
            errs.push(E::LimitAboveCeiling {
                field,
                value,
                ceiling,
            });
        }
    }
    for (i, e) in m.network.allow.iter().enumerate() {
        if let Err(reason) = check_network(e, ceil) {
            errs.push(E::BadNetworkEntry {
                entry: e.clone(),
                reason,
            });
        } else if m.network.allow[..i].contains(e) {
            errs.push(E::DuplicateNetworkEntry(e.clone()));
        }
    }
    for (i, n) in m.secrets.names.iter().enumerate() {
        if !is_secret_name(n) {
            errs.push(E::BadSecretName(n.clone()));
        } else if m.secrets.names[..i].contains(n) {
            errs.push(E::DuplicateSecretName(n.clone()));
        }
    }
    if errs.is_empty() {
        Ok(ValidManifest(m))
    } else {
        Err(errs)
    }
}
