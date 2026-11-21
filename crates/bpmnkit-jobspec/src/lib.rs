//! Job worker IR for BPMN Kit (plan `doc/plans/c8-workers-and-rust-cli.md`, P1).
//!
//! BPMN → [`WorkerProject`] (one [`JobSpec`] per job type) → bind OpenAPI operations from
//! connector-gen's API index → classify each job: keep a catalog connector, bind one, bind the
//! REST connector, or generate a worker. WASM-safe: no I/O, no tokio, deterministic.
//!
//! ```
//! use bpmnkit_jobspec::{analyze, ApiIndex, Catalog, Inputs, WorkerConfig};
//!
//! let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
//! <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
//!     xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="t">
//!   <bpmn:process id="p" isExecutable="true">
//!     <bpmn:serviceTask id="t" name="Notify team on Slack">
//!       <bpmn:extensionElements><zeebe:taskDefinition type="notify"/></bpmn:extensionElements>
//!     </bpmn:serviceTask>
//!   </bpmn:process>
//! </bpmn:definitions>"#;
//! let defs = vec![bpmnkit_bpmn::parse_bpmn(xml).unwrap()];
//! let (catalog, apis, config) = (Catalog::builtin(), ApiIndex::default(), WorkerConfig::default());
//! let out = analyze(Inputs { name: "demo", definitions: &defs, apis: &apis, catalog: &catalog, config: &config });
//! let job = &out.project.jobs["notify"];
//! assert_eq!(job.classified.as_ref().unwrap().decision.label(), "connector");
//! ```

pub mod bpmn;
pub mod catalog;
pub mod config;
pub mod ir;
pub mod openapi;
pub mod rules;
pub mod schema;

pub use bpmn::{extract, Extracted};
pub use catalog::{Catalog, CatalogEntry};
pub use config::{JobConfig, Mode, WorkerConfig};
pub use ir::{canonical_json, ir_hash, BoundOperation, JobKind, JobSpec, WorkerProject};
pub use openapi::ApiIndex;
pub use rules::{classify, classify_project, Classified, Ctx, Decision, RuleId};
pub use schema::Schema;

use bpmnkit_bpmn::BpmnDefinitions;

pub struct Inputs<'a> {
    pub name: &'a str,
    pub definitions: &'a [BpmnDefinitions],
    pub apis: &'a ApiIndex,
    pub catalog: &'a Catalog,
    pub config: &'a WorkerConfig,
}

/// Extract, bind and classify in one go.
pub fn analyze(inputs: Inputs) -> Extracted {
    let mut out = extract(inputs.name, inputs.definitions);
    openapi::bind(&mut out.project, inputs.apis);
    classify_project(
        &mut out.project,
        &Ctx {
            catalog: inputs.catalog,
            config: inputs.config,
        },
    );
    out
}
