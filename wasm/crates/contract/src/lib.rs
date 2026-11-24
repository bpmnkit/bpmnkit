//! The contract between agent, builder, guest and host for BPMN Kit Wasm job workers.
//! One set of types: the manifest the builder checks is the manifest the host enforces.

pub mod api;
pub mod bundle;
#[cfg(feature = "inspect")]
pub mod inspect;
pub mod manifest;

pub use api::*;
pub use bundle::{check_bundle, Bundle, BundleError, BundleReport};
#[cfg(feature = "inspect")]
pub use inspect::{inspect, verify, ComponentInfo, InspectError, Violation};
pub use manifest::*;

/// The WIT package (`bpmnkit:worker@0.1.0`), for tools that cannot read the crate directory.
pub const WIT: &str = include_str!("../wit/worker.wit");
/// Version of [`WIT`]; recorded in [`ArtifactMetadata`].
pub const CONTRACT_VERSION: &str = "0.1.0";
