//! Port of `bpmn/bpmn-builder.ts` lines 3955–4220: `mergeRootDefinitions` (in
//! `elements.rs`) and `DiagramBuilder`, several processes with an optional collaboration.
//!
//! Porter notes:
//! - Errors (a failing process callback/build, collaboration problems) go to this
//!   builder's own `error` slot, first one kept; every later call is a no-op and `build()`
//!   returns it. Each process has its own `Shared` (TS: `new ProcessBuilder(id)`).
//! - `process()` builds the process at once (`builder.build()` with no options) and merges
//!   its errors and messages by id (signals/escalations are dropped, as in TS).
//! - Collaboration problems are collected in TS's order and joined as
//!   `Invalid collaboration:\n  <p1>\n  <p2>`. `participantIndex` walks nested
//!   containers; the last writer wins for a repeated id (JS `Map.set`).
//! - `build()` returns `hoist_message_subscriptions` of the literal; `escalations` and
//!   `signals` are always empty, `diagrams` empty, no auto-layout.

use bpmnkit_bpmn::{
    BpmnDefinitions, BpmnError, BpmnMessage, BpmnMessageFlow, BpmnParticipant, BpmnProcess,
};
use indexmap::IndexMap;

use crate::options::*;
use crate::process::ProcessBuilder;
use crate::shared::BuildError;

/// Builder for a document of several processes (TS's `DiagramBuilder`).
#[derive(Debug)]
pub struct DiagramBuilder {
    pub(crate) id: String,
    pub(crate) processes: Vec<BpmnProcess>,
    pub(crate) errors: Vec<BpmnError>,
    pub(crate) messages: Vec<BpmnMessage>,
    pub(crate) participants: Vec<BpmnParticipant>,
    pub(crate) message_flows: Vec<BpmnMessageFlow>,
    pub(crate) collaboration_id: String,
    pub(crate) execution_platform_version: String,
    pub(crate) error: Option<BuildError>,
}

impl DiagramBuilder {
    /// TS's `new DiagramBuilder(id)`.
    pub fn new(id: &str) -> Self {
        Self {
            id: id.to_owned(),
            processes: vec![],
            errors: vec![],
            messages: vec![],
            participants: vec![],
            message_flows: vec![],
            collaboration_id: "Collaboration_1".to_owned(),
            execution_platform_version: "8.9.0".to_owned(),
            error: None,
        }
    }

    /// TS's `executionPlatformVersion()`.
    pub fn execution_platform_version(&mut self, version: &str) -> &mut Self {
        todo!()
    }

    /// TS's `process()`: build one process and add it.
    pub fn process(&mut self, id: &str, callback: impl FnOnce(&mut ProcessBuilder)) -> &mut Self {
        todo!()
    }

    /// TS's `collaborationId()`.
    pub fn collaboration_id(&mut self, id: &str) -> &mut Self {
        todo!()
    }

    /// TS's `participant()`.
    pub fn participant(&mut self, id: &str, options: Option<ParticipantOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `message()`.
    pub fn message(&mut self, id: &str, options: Option<DiagramMessageOptions>) -> &mut Self {
        todo!()
    }

    /// TS's `messageFlow()`.
    pub fn message_flow(&mut self, id: &str, options: MessageFlowOptions) -> &mut Self {
        todo!()
    }

    /// TS's private `collaborationProblems`.
    fn collaboration_problems(&self) -> Vec<String> {
        todo!()
    }

    /// TS's private `participantIndex`: element or participant id → owning participant.
    fn participant_index(&self) -> IndexMap<String, String> {
        todo!()
    }

    /// TS's `build()`.
    pub fn build(&mut self) -> Result<BpmnDefinitions, BuildError> {
        todo!()
    }
}
