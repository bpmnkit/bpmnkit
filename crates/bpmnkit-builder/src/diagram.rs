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
    BpmnCollaboration, BpmnDefinitions, BpmnError, BpmnFlowElement, BpmnMessage, BpmnMessageFlow,
    BpmnParticipant, BpmnProcess,
};
use bpmnkit_xml::{Attrs, XmlElement};
use indexmap::{IndexMap, IndexSet};

use crate::elements::{hoist_message_subscriptions, merge_root_definitions, EXPORTER_VERSION};
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

    fn failed(&self) -> bool {
        self.error.is_some()
    }

    /// TS's `executionPlatformVersion()`.
    pub fn execution_platform_version(&mut self, version: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.execution_platform_version = version.to_owned();
        self
    }

    /// TS's `process()`: build one process and add it.
    pub fn process(&mut self, id: &str, callback: impl FnOnce(&mut ProcessBuilder)) -> &mut Self {
        if self.failed() {
            return self;
        }
        let mut builder = ProcessBuilder::new(id);
        callback(&mut builder);
        let defs = match builder.build(None) {
            Ok(defs) => defs,
            Err(e) => {
                self.error = Some(e);
                return self;
            }
        };
        self.processes.extend(defs.processes);
        // Two pools declaring the same message or error code produce one definition.
        merge_root_definitions(&mut self.errors, &defs.errors, |d| d.id.as_str());
        merge_root_definitions(&mut self.messages, &defs.messages, |d| d.id.as_str());
        self
    }

    /// TS's `collaborationId()`.
    pub fn collaboration_id(&mut self, id: &str) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.collaboration_id = id.to_owned();
        self
    }

    /// TS's `participant()`.
    pub fn participant(&mut self, id: &str, options: Option<ParticipantOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let options = options.unwrap_or_default();
        self.participants.push(BpmnParticipant {
            id: id.to_owned(),
            name: options.name,
            process_ref: options.process_id,
            ..Default::default()
        });
        self
    }

    /// TS's `message()`.
    pub fn message(&mut self, id: &str, options: Option<DiagramMessageOptions>) -> &mut Self {
        if self.failed() {
            return self;
        }
        let options = options.unwrap_or_default();
        let mut message = BpmnMessage {
            id: id.to_owned(),
            name: options.name,
            ..Default::default()
        };
        // An empty key still yields the element here (TS tests `subscription`, not the key).
        if let Some(key) = options.correlation_key {
            let mut ext = XmlElement::new("zeebe:subscription");
            ext.attributes.insert("correlationKey".to_owned(), key);
            message.extension_elements = Some(vec![ext]);
        }
        self.messages.push(message);
        self
    }

    /// TS's `messageFlow()`.
    pub fn message_flow(&mut self, id: &str, options: MessageFlowOptions) -> &mut Self {
        if self.failed() {
            return self;
        }
        self.message_flows.push(BpmnMessageFlow {
            id: id.to_owned(),
            source_ref: options.source,
            target_ref: options.target,
            name: options.name,
            message_ref: options.message_ref,
            ..Default::default()
        });
        self
    }

    /// TS's private `collaborationProblems`.
    fn collaboration_problems(&self) -> Vec<String> {
        let mut problems: Vec<String> = vec![];

        let mut seen: IndexSet<&str> = IndexSet::new();
        let ids = self
            .participants
            .iter()
            .map(|p| p.id.as_str())
            .chain(self.message_flows.iter().map(|f| f.id.as_str()));
        for id in ids {
            if seen.contains(id) {
                problems.push(format!("Duplicate element ID \"{id}\""));
            }
            seen.insert(id);
        }

        let process_ids: IndexSet<&str> = self.processes.iter().map(|p| p.id.as_str()).collect();
        let mut claimed: IndexMap<&str, &str> = IndexMap::new();
        for participant in &self.participants {
            let Some(process_id) = participant.process_ref.as_deref() else {
                continue;
            };
            if !process_ids.contains(process_id) {
                problems.push(format!(
                    "Participant \"{}\" references process \"{process_id}\", which this diagram does not contain",
                    participant.id
                ));
                continue;
            }
            if let Some(owner) = claimed.get(process_id) {
                problems.push(format!(
                    "Participants \"{owner}\" and \"{}\" both reference process \"{process_id}\"; a process belongs to one pool",
                    participant.id
                ));
            }
            claimed.insert(process_id, participant.id.as_str());
        }

        let owning = self.participant_index();
        let message_ids: IndexSet<&str> = self.messages.iter().map(|m| m.id.as_str()).collect();
        for flow in &self.message_flows {
            for (role, r) in [("source", &flow.source_ref), ("target", &flow.target_ref)] {
                if !owning.contains_key(r.as_str()) {
                    problems.push(format!(
                        "Message flow \"{}\" names {role} \"{r}\", which is not a participant or a flow node in one",
                        flow.id
                    ));
                }
            }

            let from = owning.get(flow.source_ref.as_str());
            let to = owning.get(flow.target_ref.as_str());
            if let Some(from) = from {
                if Some(from) == to {
                    problems.push(format!(
                        "Message flow \"{}\" starts and ends in participant \"{from}\"; a message flow crosses pools, a sequence flow stays inside one",
                        flow.id
                    ));
                }
            }

            if let Some(message_ref) = flow.message_ref.as_deref() {
                if !message_ids.contains(message_ref) {
                    problems.push(format!(
                        "Message flow \"{}\" references message \"{message_ref}\", which this diagram does not declare",
                        flow.id
                    ));
                }
            }
        }

        problems
    }

    /// TS's private `participantIndex`: element or participant id → owning participant.
    fn participant_index(&self) -> IndexMap<String, String> {
        let mut index: IndexMap<String, String> = IndexMap::new();
        let mut by_process: IndexMap<&str, &str> = IndexMap::new();
        for participant in &self.participants {
            index.insert(participant.id.clone(), participant.id.clone());
            if let Some(process_ref) = participant.process_ref.as_deref() {
                by_process.insert(process_ref, participant.id.as_str());
            }
        }

        fn walk(index: &mut IndexMap<String, String>, elements: &[BpmnFlowElement], owner: &str) {
            for element in elements {
                index.insert(element.base().id.clone(), owner.to_owned());
                if let Some(contents) = element.contents() {
                    walk(index, &contents.flow_elements, owner);
                }
            }
        }

        for process in &self.processes {
            if let Some(owner) = by_process.get(process.id.as_str()) {
                walk(&mut index, &process.contents.flow_elements, owner);
            }
        }
        index
    }

    /// TS's `build()`.
    pub fn build(&mut self) -> Result<BpmnDefinitions, BuildError> {
        if let Some(e) = &self.error {
            return Err(e.clone());
        }
        let collaborations = self.build_collaborations()?;
        let namespaces: Attrs = [
            ("bpmn", "http://www.omg.org/spec/BPMN/20100524/MODEL"),
            ("bpmndi", "http://www.omg.org/spec/BPMN/20100524/DI"),
            ("dc", "http://www.omg.org/spec/DD/20100524/DC"),
            ("di", "http://www.omg.org/spec/DD/20100524/DI"),
            ("zeebe", "http://camunda.org/schema/zeebe/1.0"),
            ("modeler", "http://camunda.org/schema/modeler/1.0"),
            ("xsi", "http://www.w3.org/2001/XMLSchema-instance"),
        ]
        .into_iter()
        .map(|(k, v)| (k.to_owned(), v.to_owned()))
        .collect();
        let mut unknown_attributes = Attrs::new();
        unknown_attributes.insert(
            "modeler:executionPlatform".to_owned(),
            "Camunda Cloud".to_owned(),
        );
        unknown_attributes.insert(
            "modeler:executionPlatformVersion".to_owned(),
            self.execution_platform_version.clone(),
        );
        Ok(hoist_message_subscriptions(BpmnDefinitions {
            id: self.id.clone(),
            target_namespace: "http://bpmn.io/schema/bpmn".to_owned(),
            exporter: Some("@bpmnkit/core".to_owned()),
            exporter_version: Some(EXPORTER_VERSION.to_owned()),
            namespaces,
            unknown_attributes,
            errors: self.errors.clone(),
            escalations: vec![],
            messages: self.messages.clone(),
            signals: vec![],
            collaborations,
            processes: self.processes.clone(),
            diagrams: vec![],
            ..Default::default()
        }))
    }

    /// A document with no participants has no collaboration: an empty one would make every
    /// process a pool-less participant in a modeler.
    fn build_collaborations(&self) -> Result<Vec<BpmnCollaboration>, BuildError> {
        if self.participants.is_empty() && self.message_flows.is_empty() {
            return Ok(vec![]);
        }
        let problems = self.collaboration_problems();
        if !problems.is_empty() {
            return Err(BuildError {
                message: format!("Invalid collaboration:\n  {}", problems.join("\n  ")),
            });
        }
        Ok(vec![BpmnCollaboration {
            id: self.collaboration_id.clone(),
            participants: self.participants.clone(),
            message_flows: self.message_flows.clone(),
            ..Default::default()
        }])
    }
}
