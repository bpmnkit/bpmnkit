//! The contract between agent, builder, guest and host for BPMN Kit Wasm job workers.
//! One set of types: the manifest the builder checks is the manifest the host enforces.

pub mod api;
pub mod bundle;
#[cfg(feature = "inspect")]
pub mod inspect;
pub mod manifest;
#[cfg(feature = "registry")]
pub mod registry;
#[cfg(feature = "signing")]
pub mod signing;

pub use api::*;
pub use bundle::{check_bundle, Bundle, BundleError, BundleReport};
#[cfg(feature = "inspect")]
pub use inspect::{inspect, verify, ComponentInfo, InspectError, Violation};
pub use manifest::*;
#[cfg(feature = "registry")]
pub use registry::{DirRegistry, RegistryEntry, RegistryError, RegistryStore};
#[cfg(feature = "signing")]
pub use signing::{
    decode_hex, encode_hex, sign, signing_key_from_hex, signing_payload, verify_signature,
    verifying_key_from_hex, SignError, Signature, SigningKey, VerifyingKey,
};

/// The WIT package (`bpmnkit:worker@0.1.0`), for tools that cannot read the crate directory.
pub const WIT: &str = include_str!("../wit/worker.wit");
/// Version of [`WIT`]; recorded in [`ArtifactMetadata`].
pub const CONTRACT_VERSION: &str = "0.1.0";
