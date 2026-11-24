use bpmnkit_wasm_contract::{ArtifactMetadata, TestResult, CONTRACT_VERSION};

use crate::cargo::Built;

/// The component and its metadata; signing and OCI come later (the builder service).
#[derive(Debug, Clone)]
pub struct Artifact {
    pub component: Vec<u8>,
    pub metadata: ArtifactMetadata,
    pub tests: Vec<TestResult>,
}

pub fn package(b: Built, tests: Vec<TestResult>) -> Artifact {
    let metadata = ArtifactMetadata {
        component_digest: bpmnkit_wasm_contract::Digest::of(&b.wasm),
        source_digest: b.source_digest,
        manifest: b.manifest,
        contract_version: CONTRACT_VERSION.parse().expect("valid semver"),
        sdk_version: env!("CARGO_PKG_VERSION").parse().expect("valid semver"),
        toolchain: b.toolchain,
        lock_digest: b.lock_digest,
    };
    Artifact {
        component: b.wasm,
        metadata,
        tests,
    }
}
