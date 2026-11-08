//! `ZeebeContext` from `zeebe-validate/context.ts`: scopes, node and flow
//! indexes, root-element lookups, version gating and the finding order.

use crate::finding::{Category, Finding, FindingData, Severity};
use bpmnkit_bpmn::{
    BpmnDefinitions, BpmnError, BpmnEscalation, BpmnFlowElement, BpmnMessage, BpmnProcessContents,
    BpmnSequenceFlow, BpmnSignal,
};
use bpmnkit_feel::{parse_partial, ParseOptions};
use bpmnkit_spec::compat::CamundaVersion;
use bpmnkit_spec::zeebe::{RuleSeverity, ZeebeRule, ZEEBE_LATEST_VERSION, ZEEBE_RULES};
use bpmnkit_xml::XmlElement;
use std::collections::{HashMap, HashSet};

pub const ZEEBE_NS: &str = "http://camunda.org/schema/zeebe/1.0";

/// `ZeebeResolver`: the other resources of the same deployment. Each method
/// answers for resources other than the BPMN being validated; `None` means unknown,
/// and the rule that needs it is skipped.
pub trait ZeebeResolver {
    fn has_process(&self, _id: &str) -> Option<bool> {
        None
    }
    fn has_decision(&self, _id: &str) -> Option<bool> {
        None
    }
    fn has_form(&self, _id: &str) -> Option<bool> {
        None
    }
    fn has_resource(&self, _id: &str) -> Option<bool> {
        None
    }
}

/// `ZeebeLimits`: Zeebe's configured length limits (32768 by default).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ZeebeLimits {
    pub max_id_length: usize,
    pub max_name_length: usize,
    pub max_worker_type_length: usize,
}

impl Default for ZeebeLimits {
    fn default() -> Self {
        Self {
            max_id_length: 32768,
            max_name_length: 32768,
            max_worker_type_length: 32768,
        }
    }
}

/// `ValidateDeployableOptions`.
#[derive(Default)]
pub struct ValidateOptions<'r> {
    /// The Camunda 8 version, e.g. `"8.6"`; defaults to the newest supported.
    pub camunda_version: Option<String>,
    pub resolver: Option<&'r dyn ZeebeResolver>,
    pub limits: ZeebeLimits,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ScopeKind {
    Process,
    SubProcess,
    EventSubProcess,
    AdHocSubProcess,
    Transaction,
}

#[derive(Debug, Clone, Copy)]
pub struct Scope<'a> {
    pub kind: ScopeKind,
    /// The process id, or the container's id.
    pub id: &'a str,
    pub process_id: &'a str,
    /// The container element; `None` for a process.
    pub container: Option<&'a BpmnFlowElement>,
    /// Index of the parent scope in `ZeebeContext::scopes`.
    pub parent: Option<usize>,
    pub contents: &'a BpmnProcessContents,
}

#[derive(Debug, Clone, Copy)]
pub struct NodeEntry<'a> {
    pub node: &'a BpmnFlowElement,
    /// Index into `ZeebeContext::scopes`.
    pub scope: usize,
}

#[derive(Debug, Clone, Copy)]
pub struct FlowEntry<'a> {
    pub flow: &'a BpmnSequenceFlow,
    pub scope: usize,
}

fn scope_kind(el: &BpmnFlowElement) -> ScopeKind {
    match el {
        BpmnFlowElement::EventSubProcess(_) => ScopeKind::EventSubProcess,
        BpmnFlowElement::SubProcess(s) if s.triggered_by_event == Some(true) => {
            ScopeKind::EventSubProcess
        }
        BpmnFlowElement::AdHocSubProcess(_) => ScopeKind::AdHocSubProcess,
        BpmnFlowElement::Transaction(_) => ScopeKind::Transaction,
        _ => ScopeKind::SubProcess,
    }
}

fn rule_meta(name: &str) -> Option<(usize, &'static ZeebeRule)> {
    ZEEBE_RULES.iter().enumerate().find(|(_, r)| r.name == name)
}

fn version_of(s: &str) -> CamundaVersion {
    CamundaVersion::parse(s).expect("spec versions are table versions")
}

/// Everything a check needs, built once per validation.
pub struct ZeebeContext<'a> {
    pub defs: &'a BpmnDefinitions,
    pub version: CamundaVersion,
    pub limits: ZeebeLimits,
    pub resolver: Option<&'a dyn ZeebeResolver>,
    pub scopes: Vec<Scope<'a>>,
    pub nodes: Vec<NodeEntry<'a>>,
    pub flows: Vec<FlowEntry<'a>>,
    node_index: HashMap<&'a str, usize>,
    flow_index: HashMap<&'a str, usize>,
    order: HashMap<String, usize>,
    findings: Vec<FindingData>,
}

impl<'a> ZeebeContext<'a> {
    pub fn new(defs: &'a BpmnDefinitions, options: &ValidateOptions<'a>) -> Self {
        let version = crate::compat::normalize_camunda_version(options.camunda_version.as_deref())
            .unwrap_or_else(|| version_of(ZEEBE_LATEST_VERSION));
        let mut ctx = Self {
            defs,
            version,
            limits: options.limits,
            resolver: options.resolver,
            scopes: vec![],
            nodes: vec![],
            flows: vec![],
            node_index: HashMap::new(),
            flow_index: HashMap::new(),
            order: HashMap::new(),
            findings: vec![],
        };
        for process in &defs.processes {
            ctx.mark(&process.id);
            ctx.walk(Scope {
                kind: ScopeKind::Process,
                id: &process.id,
                process_id: &process.id,
                container: None,
                parent: None,
                contents: &process.contents,
            });
        }
        let roots = defs
            .messages
            .iter()
            .map(|m| m.id.as_str())
            .chain(defs.errors.iter().map(|e| e.id.as_str()))
            .chain(defs.signals.iter().map(|s| s.id.as_str()))
            .chain(defs.escalations.iter().map(|e| e.id.as_str()));
        for id in roots.collect::<Vec<_>>() {
            ctx.mark(id);
        }
        ctx
    }

    fn mark(&mut self, id: &str) {
        let next = self.order.len();
        self.order.entry(id.to_string()).or_insert(next);
    }

    fn walk(&mut self, scope: Scope<'a>) {
        let index = self.scopes.len();
        self.scopes.push(scope);
        for node in &scope.contents.flow_elements {
            let entry = self.nodes.len();
            self.nodes.push(NodeEntry { node, scope: index });
            self.node_index
                .entry(node.base().id.as_str())
                .or_insert(entry);
            self.mark(&node.base().id);
            if let Some(contents) = node.contents() {
                self.walk(Scope {
                    kind: scope_kind(node),
                    id: &node.base().id,
                    process_id: scope.process_id,
                    container: Some(node),
                    parent: Some(index),
                    contents,
                });
            }
        }
        for flow in &scope.contents.sequence_flows {
            let entry = self.flows.len();
            self.flows.push(FlowEntry { flow, scope: index });
            self.flow_index.entry(flow.id.as_str()).or_insert(entry);
            self.mark(&flow.id);
        }
    }

    /// Whether the rule applies to the version being validated.
    pub fn applies(&self, rule: &str) -> bool {
        let Some((_, meta)) = rule_meta(rule) else {
            return false;
        };
        if self.version < version_of(meta.since) {
            return false;
        }
        meta.until.is_none_or(|u| self.version <= version_of(u))
    }

    pub fn node(&self, id: Option<&str>) -> Option<NodeEntry<'a>> {
        id.and_then(|id| self.node_index.get(id))
            .map(|&i| self.nodes[i])
    }

    pub fn flow(&self, id: Option<&str>) -> Option<FlowEntry<'a>> {
        id.and_then(|id| self.flow_index.get(id))
            .map(|&i| self.flows[i])
    }

    /// Sequence flows whose `targetRef` is the node.
    pub fn incoming(&self, node_id: &str) -> Vec<FlowEntry<'a>> {
        self.flows
            .iter()
            .filter(|f| f.flow.target_ref == node_id)
            .copied()
            .collect()
    }

    /// Sequence flows whose `sourceRef` is the node.
    pub fn outgoing(&self, node_id: &str) -> Vec<FlowEntry<'a>> {
        self.flows
            .iter()
            .filter(|f| f.flow.source_ref == node_id)
            .copied()
            .collect()
    }

    /// Boundary events attached to the activity.
    pub fn boundaries(&self, activity_id: &str) -> Vec<NodeEntry<'a>> {
        self.nodes
            .iter()
            .filter(|n| {
                matches!(n.node, BpmnFlowElement::BoundaryEvent(b) if b.attached_to_ref == activity_id)
            })
            .copied()
            .collect()
    }

    pub fn message(&self, id: Option<&str>) -> Option<&'a BpmnMessage> {
        id.and_then(|id| self.defs.messages.iter().find(|m| m.id == id))
    }

    pub fn error(&self, id: Option<&str>) -> Option<&'a BpmnError> {
        id.and_then(|id| self.defs.errors.iter().find(|m| m.id == id))
    }

    pub fn signal(&self, id: Option<&str>) -> Option<&'a BpmnSignal> {
        id.and_then(|id| self.defs.signals.iter().find(|m| m.id == id))
    }

    pub fn escalation(&self, id: Option<&str>) -> Option<&'a BpmnEscalation> {
        id.and_then(|id| self.defs.escalations.iter().find(|m| m.id == id))
    }

    /// Whether an element name such as `zeebe:taskDefinition` is in the Zeebe namespace.
    pub fn is_zeebe(&self, name: &str, local: &str) -> bool {
        let Some((prefix, rest)) = name.split_once(':') else {
            return false;
        };
        if rest != local {
            return false;
        }
        match self.defs.namespaces.get(prefix) {
            Some(uri) => uri == ZEEBE_NS,
            None => prefix == "zeebe",
        }
    }

    /// The `zeebe:<local>` children of an `extensionElements` list.
    pub fn zeebe<'e>(
        &self,
        extension_elements: &'e [XmlElement],
        local: &str,
    ) -> Vec<&'e XmlElement> {
        extension_elements
            .iter()
            .filter(|x| self.is_zeebe(&x.name, local))
            .collect()
    }

    /// The `zeebe:<local>` children of an XML element.
    pub fn zeebe_children<'e>(
        &self,
        el: Option<&'e XmlElement>,
        local: &str,
    ) -> Vec<&'e XmlElement> {
        el.map(|el| self.zeebe(&el.children, local))
            .unwrap_or_default()
    }

    /// Reports a rule violation; dropped when the rule does not apply to the version.
    pub fn report(&mut self, rule: &str, element_id: &str, message: String, suggestion: &str) {
        let process_id = self.process_of(element_id);
        self.report_in(rule, element_id, message, suggestion, process_id);
    }

    /// `report` with an explicit process id.
    pub fn report_in(
        &mut self,
        rule: &str,
        element_id: &str,
        message: String,
        suggestion: &str,
        process_id: String,
    ) {
        let Some((_, meta)) = rule_meta(rule) else {
            return;
        };
        if !self.applies(rule) {
            return;
        }
        self.findings.push(FindingData {
            id: format!("zeebe/{rule}"),
            category: Category::Deploy,
            severity: match meta.severity {
                RuleSeverity::Error => Severity::Error,
                RuleSeverity::Warning => Severity::Warning,
                RuleSeverity::Info => Severity::Info,
            },
            message,
            suggestion: suggestion.to_string(),
            process_id,
            element_ids: vec![element_id.to_string()],
            produces: None,
            consumes: None,
            bpmnlint_rule: None,
        });
    }

    /// The process an element belongs to; root elements answer the first process.
    pub fn process_of(&self, element_id: &str) -> String {
        if let Some(&i) = self.node_index.get(element_id) {
            return self.scopes[self.nodes[i].scope].process_id.to_string();
        }
        if let Some(&i) = self.flow_index.get(element_id) {
            return self.scopes[self.flows[i].scope].process_id.to_string();
        }
        if self.defs.processes.iter().any(|p| p.id == element_id) {
            return element_id.to_string();
        }
        self.defs
            .processes
            .first()
            .map(|p| p.id.clone())
            .unwrap_or_default()
    }

    /// The findings, deduplicated and sorted by rule, then document order, then message.
    pub fn finish(self) -> Vec<Finding> {
        let mut seen = HashSet::new();
        let mut unique: Vec<FindingData> = self
            .findings
            .into_iter()
            .filter(|f| seen.insert((f.id.clone(), f.element_ids.join(","), f.message.clone())))
            .collect();
        let order = &self.order;
        let pos = |f: &FindingData| {
            f.element_ids
                .first()
                .and_then(|id| order.get(id))
                .copied()
                .unwrap_or(usize::MAX)
        };
        let rank = |f: &FindingData| rule_meta(&f.id["zeebe/".len()..]).map_or(0, |(i, _)| i);
        // TS compares messages by UTF-16 code unit; messages are ASCII in practice,
        // where that equals byte order.
        unique.sort_by(|a, b| {
            rank(a)
                .cmp(&rank(b))
                .then(pos(a).cmp(&pos(b)))
                .then(a.message.cmp(&b.message))
        });
        unique.into_iter().map(Finding::new).collect()
    }
}

/// `isExpression`: Zeebe matches the whole text against `=(.+)`.
pub fn is_expression(text: &str) -> bool {
    text.len() > 1 && text.starts_with('=')
}

/// `feelError`: the FEEL parse error of an expression attribute, or `None`.
pub fn feel_error(text: &str) -> Option<String> {
    if !is_expression(text) {
        return None;
    }
    parse_partial(&text[1..], &ParseOptions::default())
        .errors
        .first()
        .map(|e| e.message.clone())
}

/// `feelFailure`: Zeebe's FEEL parse failure message, up to the parser's detail.
pub fn feel_failure(text: &str) -> String {
    format!("failed to parse expression '{}'", &text[1..])
}

/// `staticValueMessage`.
pub fn static_value_message(text: &str) -> String {
    format!("Expected expression but found static value '{text}'. An expression must start with '=' (e.g. '={text}').")
}

/// `nonEmpty`: the value unless absent or blank. `trim` here is JS `String.prototype.trim`.
pub fn non_empty(value: Option<&str>) -> Option<&str> {
    value.filter(|v| !crate::compat::pattern::js_trim(v).is_empty())
}
