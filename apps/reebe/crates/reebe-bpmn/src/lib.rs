mod adapter;
pub mod model;
pub mod parser;
#[allow(clippy::module_inception)]
pub mod tests;
pub mod validator;

pub use model::*;
pub use parser::{parse_bpmn, BpmnParseError};
pub use validator::{validate_bpmn, ValidationError};

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

/// A parsed and validated BPMN deployment, ready for use by the engine.
#[derive(Debug, Clone)]
pub struct BpmnDeployment {
    pub processes: Vec<BpmnProcess>,
    pub resource_name: String,
    pub checksum: Vec<u8>,
}

impl BpmnDeployment {
    /// Parse and validate a BPMN XML resource.
    pub fn from_xml(xml: &str, resource_name: impl Into<String>) -> Result<Self, BpmnParseError> {
        let processes = parse_bpmn(xml)?;
        let resource_name = resource_name.into();
        // Compute a simple checksum of the source XML
        let mut hasher = DefaultHasher::new();
        xml.hash(&mut hasher);
        let checksum = hasher.finish().to_le_bytes().to_vec();
        Ok(Self {
            processes,
            resource_name,
            checksum,
        })
    }
}
