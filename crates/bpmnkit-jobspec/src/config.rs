//! `bpmnkit.worker.toml`: per job type overrides (rule R1) and declared load (rule R10).
//!
//! ```toml
//! rest_max_rps = 50          # default
//! [jobs."charge-card"]
//! mode = "worker"            # connector | rest | worker
//! rps = 120                  # declared throughput, jobs/s
//! slo_ms = 20                # declared latency budget
//! ```

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// D3: the REST connector path is fine up to this many jobs/s per type.
pub const DEFAULT_REST_MAX_RPS: u32 = 50;

/// What a job type is turned into.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Mode {
    Connector,
    Rest,
    Worker,
}

impl Mode {
    pub fn parse(s: &str) -> Option<Self> {
        match s.trim().to_ascii_lowercase().as_str() {
            "connector" => Some(Self::Connector),
            "rest" => Some(Self::Rest),
            "worker" => Some(Self::Worker),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct JobConfig {
    pub mode: Option<Mode>,
    pub rps: Option<u32>,
    pub slo_ms: Option<u32>,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkerConfig {
    #[serde(default = "default_rps")]
    pub rest_max_rps: u32,
    #[serde(default)]
    pub jobs: BTreeMap<String, JobConfig>,
}

fn default_rps() -> u32 {
    DEFAULT_REST_MAX_RPS
}

impl Default for WorkerConfig {
    fn default() -> Self {
        Self {
            rest_max_rps: DEFAULT_REST_MAX_RPS,
            jobs: BTreeMap::new(),
        }
    }
}

impl WorkerConfig {
    pub fn from_toml(text: &str) -> Result<Self, toml::de::Error> {
        toml::from_str(text)
    }

    pub fn job(&self, job_type: &str) -> Option<&JobConfig> {
        self.jobs.get(job_type)
    }
}
