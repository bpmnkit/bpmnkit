//! Best-effort Camunda 8 to Camunda 7 / Operaton export (`export.ts`).
//!
//! Maps job types, I/O mappings, assignment, form keys, call activities and version tags to
//! `camunda:` equivalents and removes every `zeebe:` and `modeler:` construct and namespace.
//! FEEL is not translated to JUEL: it is kept raw with a `manual` finding. Connectors and
//! Zeebe-only features are dropped with an `unsupported` finding.
//!
//! The TS walks the model as untyped objects, visiting keys in the order its parser created
//! them; `walk_*` below visit the typed model in that same order, which is the order of the
//! findings.

use super::juel::is_js_space;
use super::migrate::{Camunda7Finding, Camunda7Severity, CAMUNDA7_NS, MODELER_NS, ZEEBE_NS};
use bpmnkit_bpmn::{
    Attrs, BpmnDataAssociation, BpmnDefinitions, BpmnEventDefinition, BpmnFlowElement,
    BpmnFlowNodeBase, BpmnLaneSet, BpmnMultiInstanceLoopCharacteristics, BpmnProcess,
    BpmnProcessContents, XmlElement,
};
use Camunda7Severity::{Manual, Unsupported};

/// What [`convert_camunda8_to_7`] did and could not do, in the forward converter's finding shape.
pub type Camunda8ExportFinding = Camunda7Finding;

#[derive(Debug, Clone)]
pub struct Camunda8To7Conversion {
    pub definitions: BpmnDefinitions,
    pub findings: Vec<Camunda8ExportFinding>,
}

fn is_feel(value: &str) -> bool {
    value.trim_start_matches(is_js_space).starts_with('=')
}

/// `/^(zeebe|modeler)(:|$)/` after dropping a leading `xmlns:`.
fn is_foreign(name: &str) -> bool {
    let n = name.strip_prefix("xmlns:").unwrap_or(name);
    ["zeebe", "modeler"].iter().any(|p| {
        n.strip_prefix(p)
            .is_some_and(|r| r.is_empty() || r.starts_with(':'))
    })
}

fn strip_foreign_attrs(attrs: &mut Attrs) {
    attrs.retain(|k, _| !is_foreign(k));
}

fn filter_foreign(children: &mut Vec<XmlElement>) {
    children.retain(|c| !is_foreign(&c.name));
}

/// Best-effort Camunda 8 to Camunda 7 / Operaton export. The input is not modified.
pub fn convert_camunda8_to_7(definitions: &BpmnDefinitions) -> Camunda8To7Conversion {
    let mut draft = definitions.clone();
    let mut ex = Exporter {
        findings: vec![],
        process_id: String::new(),
        hint: None,
    };
    for message in &mut draft.messages {
        ex.process_id = String::new();
        ex.hint = Some("message");
        let ext = message.extension_elements.get_or_insert_with(Vec::new);
        ex.convert_owner(
            &message.id,
            None,
            ext,
            &mut message.unknown_attributes,
            None,
        );
        ex.hint = None;
    }
    for process in &mut draft.processes {
        ex.process_id = process.id.clone();
        ex.walk_process(process);
    }
    ex.process_id = String::new();
    let d = &mut draft;
    d.namespaces
        .retain(|prefix, uri| !(is_foreign(prefix) || uri == ZEEBE_NS || uri == MODELER_NS));
    strip_foreign_attrs(&mut d.unknown_attributes);
    filter_foreign(&mut d.unknown_children);
    d.namespaces
        .entry("camunda".into())
        .or_insert_with(|| CAMUNDA7_NS.into());
    Camunda8To7Conversion {
        definitions: draft,
        findings: ex.findings,
    }
}

struct Exporter {
    findings: Vec<Camunda8ExportFinding>,
    process_id: String,
    /// Type for owners the model does not tag, i.e. messages.
    hint: Option<&'static str>,
}

impl Exporter {
    // One finding is eight facts; a struct here would only move the list to every call site.
    #[allow(clippy::too_many_arguments)]
    fn add(
        &mut self,
        id: &str,
        ty: Option<&str>,
        construct: &str,
        severity: Camunda7Severity,
        message: String,
        suggestion: &str,
        applied: bool,
    ) {
        let element_type = ty.or(self.hint).unwrap_or(if id == self.process_id {
            "process"
        } else {
            "element"
        });
        self.findings.push(Camunda7Finding {
            element_id: id.to_string(),
            element_type: element_type.to_string(),
            process_id: self.process_id.clone(),
            construct: construct.to_string(),
            severity,
            message,
            suggestion: suggestion.to_string(),
            applied,
        });
    }

    /// Writes `camunda:<name>`; a FEEL value is kept raw because Camunda 7 expects JUEL.
    fn set_attr(
        &mut self,
        id: &str,
        ty: Option<&str>,
        attrs: &mut Attrs,
        name: &str,
        value: &str,
        from: &str,
    ) {
        attrs.insert(format!("camunda:{name}"), value.to_string());
        if is_feel(value) {
            self.add(
                id,
                ty,
                from,
                Manual,
                format!("FEEL expression \"{value}\" kept as-is; Camunda 7 evaluates JUEL."),
                &format!("Rewrite camunda:{name} as a JUEL expression such as ${{...}}."),
                true,
            );
        }
    }

    fn convert_owner(
        &mut self,
        id: &str,
        ty: Option<&str>,
        ext: &mut Vec<XmlElement>,
        attrs: &mut Attrs,
        children: Option<&mut Vec<XmlElement>>,
    ) {
        let mut kept: Vec<XmlElement> = vec![];
        let mut input_output: Vec<XmlElement> = vec![];
        let mut camunda_ext: Vec<XmlElement> = vec![];
        let take = |name: &str| {
            let full = format!("zeebe:{name}");
            ext.iter().find(|e| e.name == full).cloned()
        };

        if let Some(task) = take("taskDefinition") {
            if let Some(job_type) = task.attr("type") {
                attrs.insert("camunda:type".into(), "external".into());
                self.set_attr(id, ty, attrs, "topic", job_type, "zeebe:taskDefinition");
                if job_type.starts_with("io.camunda:")
                    || attrs
                        .get("zeebe:modelerTemplate")
                        .is_some_and(|t| !t.is_empty())
                {
                    self.add(
                        id,
                        ty,
                        "connector",
                        Unsupported,
                        format!("Connector \"{job_type}\" has no Camunda 7 runtime; it becomes a plain external task."),
                        "Implement an external task worker for this topic.",
                        false,
                    );
                }
            }
            if task.attr("retries").is_some() {
                self.add(
                    id,
                    ty,
                    "zeebe:taskDefinition retries",
                    Manual,
                    "Job retries are not exported.".into(),
                    "Set camunda:failedJobRetryTimeCycle if needed.",
                    false,
                );
            }
        }

        if let Some(assignment) = take("assignmentDefinition") {
            for key in ["assignee", "candidateUsers", "candidateGroups"] {
                if let Some(value) = assignment.attr(key) {
                    self.set_attr(id, ty, attrs, key, value, "zeebe:assignmentDefinition");
                }
            }
        }

        if let Some(form) = take("formDefinition") {
            if let Some(form_key) = form.attr("formKey") {
                self.set_attr(id, ty, attrs, "formKey", form_key, "zeebe:formDefinition");
            } else {
                self.add(
                    id,
                    ty,
                    "zeebe:formDefinition",
                    Unsupported,
                    "Only formKey forms exist in Camunda 7; formId and external references are dropped.".into(),
                    "Link an embedded or generated form by camunda:formKey.",
                    false,
                );
            }
        }

        if let Some(value) = take("versionTag").as_ref().and_then(|t| t.attr("value")) {
            self.set_attr(id, ty, attrs, "versionTag", value, "zeebe:versionTag");
        }

        if let Some(called) = take("calledElement") {
            if let Some(target) = called.attr("processId") {
                attrs.insert("calledElement".into(), target.to_string());
                if is_feel(target) {
                    self.add(
                        id,
                        ty,
                        "zeebe:calledElement",
                        Manual,
                        format!(
                            "FEEL expression \"{target}\" kept as-is; Camunda 7 evaluates JUEL."
                        ),
                        "Rewrite calledElement as a JUEL expression.",
                        true,
                    );
                }
            }
            if let Some(binding) = called.attr("bindingType") {
                attrs.insert("camunda:calledElementBinding".into(), binding.to_string());
            }
            if let Some(tag) = called.attr("versionTag") {
                attrs.insert("camunda:calledElementVersionTag".into(), tag.to_string());
            }
            // Zeebe propagates both ways unless told not to.
            for (attr, element) in [
                ("propagateAllParentVariables", "camunda:in"),
                ("propagateAllChildVariables", "camunda:out"),
            ] {
                if called.attr(attr) != Some("false") {
                    camunda_ext.push(XmlElement {
                        name: element.into(),
                        attributes: Attrs::from_iter([(
                            "variables".to_string(),
                            "all".to_string(),
                        )]),
                        children: vec![],
                        text: None,
                    });
                }
            }
        }

        if let Some(io) = take("ioMapping") {
            for child in &io.children {
                let (Some(source), Some(target)) = (child.attr("source"), child.attr("target"))
                else {
                    continue;
                };
                let direction = if child.name == "zeebe:output" {
                    "outputParameter"
                } else {
                    "inputParameter"
                };
                input_output.push(XmlElement {
                    name: format!("camunda:{direction}"),
                    attributes: Attrs::from_iter([("name".to_string(), target.to_string())]),
                    children: vec![],
                    text: Some(source.to_string()),
                });
                if is_feel(source) {
                    // JS `slice(6)` on UTF-16 code units; the name is ASCII for `zeebe:` children.
                    let rest: String = child.name.chars().skip(6).collect();
                    self.add(
                        id,
                        ty,
                        &format!("zeebe:{rest}"),
                        Manual,
                        format!("FEEL expression \"{source}\" (to \"{target}\") kept as-is; Camunda 7 evaluates JUEL."),
                        "Rewrite the parameter as a JUEL expression.",
                        true,
                    );
                }
            }
        }

        if take("subscription").is_some() {
            self.add(
                id,
                ty,
                "zeebe:subscription",
                Manual,
                "Camunda 7 does not subscribe messages by correlationKey; the key is dropped."
                    .into(),
                "Correlate with a business key or correlation variables when sending the message.",
                false,
            );
        }

        for e in ext.iter() {
            if !e.name.starts_with("zeebe:") && !e.name.starts_with("modeler:") {
                kept.push(e.clone());
                continue;
            }
            let local = e.name.split_once(':').map_or(e.name.as_str(), |(_, l)| l);
            if [
                "taskDefinition",
                "assignmentDefinition",
                "formDefinition",
                "versionTag",
                "calledElement",
                "ioMapping",
                "subscription",
            ]
            .contains(&local)
            {
                continue;
            }
            self.add(
                id,
                ty,
                &e.name,
                Unsupported,
                format!("{} has no Camunda 7 equivalent and was dropped.", e.name),
                "Reimplement the behavior in Camunda 7 or accept the difference.",
                false,
            );
        }

        if !input_output.is_empty() {
            camunda_ext.push(XmlElement {
                name: "camunda:inputOutput".into(),
                attributes: Attrs::new(),
                children: input_output,
                text: None,
            });
        }
        kept.extend(camunda_ext);
        *ext = kept;
        strip_foreign_attrs(attrs);
        if let Some(children) = children {
            filter_foreign(children);
        }
    }

    /// An object with an id and an `extensionElements` array is an owner; anything else with
    /// `unknownAttributes` only has its foreign attributes stripped.
    fn walk_owner(
        &mut self,
        id: Option<&str>,
        ty: Option<&str>,
        ext: Option<&mut Vec<XmlElement>>,
        attrs: Option<&mut Attrs>,
        children: Option<&mut Vec<XmlElement>>,
    ) {
        match (id, ext) {
            (Some(id), Some(ext)) => {
                let mut scratch = Attrs::new();
                self.convert_owner(id, ty, ext, attrs.unwrap_or(&mut scratch), children);
            }
            _ => {
                if let Some(a) = attrs {
                    strip_foreign_attrs(a);
                }
            }
        }
    }

    fn walk_process(&mut self, p: &mut BpmnProcess) {
        self.walk_owner(
            Some(&p.id),
            None,
            Some(&mut p.extension_elements),
            Some(&mut p.unknown_attributes),
            Some(&mut p.unknown_children),
        );
        if let Some(lane_set) = &mut p.lane_set {
            self.walk_lane_set(lane_set);
        }
        self.walk_contents(&mut p.contents);
    }

    fn walk_lane_set(&mut self, set: &mut BpmnLaneSet) {
        if let Some(a) = &mut set.unknown_attributes {
            strip_foreign_attrs(a);
        }
        for lane in &mut set.lanes {
            self.walk_owner(
                Some(&lane.id),
                None,
                lane.extension_elements.as_mut(),
                Some(&mut lane.unknown_attributes),
                None,
            );
            if let Some(child) = &mut lane.child_lane_set {
                self.walk_lane_set(child);
            }
        }
    }

    fn walk_contents(&mut self, c: &mut BpmnProcessContents) {
        for element in &mut c.flow_elements {
            self.walk_flow_element(element);
        }
        for flow in &mut c.sequence_flows {
            self.walk_owner(
                Some(&flow.id),
                None,
                Some(&mut flow.extension_elements),
                Some(&mut flow.unknown_attributes),
                Some(&mut flow.unknown_children),
            );
            if let Some(condition) = flow
                .condition_expression
                .as_ref()
                .filter(|c| is_feel(&c.text))
            {
                let message = format!(
                    "FEEL condition \"{}\" kept as-is; Camunda 7 evaluates JUEL.",
                    condition.text
                );
                self.add(
                    &flow.id,
                    None,
                    "conditionExpression",
                    Manual,
                    message,
                    "Rewrite the condition as a JUEL expression.",
                    true,
                );
            }
        }
        for t in &mut c.text_annotations {
            self.walk_owner(
                Some(&t.id),
                None,
                t.extension_elements.as_mut(),
                Some(&mut t.unknown_attributes),
                None,
            );
        }
        for a in &mut c.associations {
            self.walk_owner(
                Some(&a.id),
                None,
                a.extension_elements.as_mut(),
                Some(&mut a.unknown_attributes),
                None,
            );
        }
        for g in &mut c.groups {
            self.walk_owner(
                Some(&g.id),
                None,
                g.extension_elements.as_mut(),
                Some(&mut g.unknown_attributes),
                None,
            );
        }
    }

    fn walk_base(&mut self, ty: &str, base: &mut BpmnFlowNodeBase) {
        self.walk_owner(
            Some(&base.id),
            Some(ty),
            Some(&mut base.extension_elements),
            Some(&mut base.unknown_attributes),
            Some(&mut base.unknown_children),
        );
        for p in &mut base.properties {
            strip_foreign_attrs(&mut p.unknown_attributes);
        }
        for list in [
            &mut base.data_input_associations,
            &mut base.data_output_associations,
        ] {
            for a in list.iter_mut() {
                self.walk_data_association(a);
            }
        }
    }

    fn walk_data_association(&mut self, a: &mut BpmnDataAssociation) {
        self.walk_owner(
            a.id.as_deref(),
            None,
            a.extension_elements.as_mut(),
            Some(&mut a.unknown_attributes),
            None,
        );
    }

    fn walk_definitions(&mut self, defs: &mut [BpmnEventDefinition]) {
        for d in defs {
            if let BpmnEventDefinition::Conditional(c) = d {
                self.walk_owner(
                    c.id.as_deref(),
                    None,
                    c.extension_elements.as_mut(),
                    c.unknown_attributes.as_mut(),
                    None,
                );
            } else if let Some(a) = definition_attrs_mut(d) {
                strip_foreign_attrs(a);
            }
        }
    }

    fn walk_loop(&mut self, l: &mut Option<BpmnMultiInstanceLoopCharacteristics>) {
        if let Some(l) = l {
            self.walk_owner(
                l.id.as_deref(),
                None,
                Some(&mut l.extension_elements),
                l.unknown_attributes.as_mut(),
                None,
            );
        }
    }

    fn walk_flow_element(&mut self, element: &mut BpmnFlowElement) {
        use BpmnFlowElement::*;
        let ty = element.type_name();
        match element {
            StartEvent(e) => {
                self.walk_base(ty, &mut e.base);
                self.walk_definitions(&mut e.event_definitions);
            }
            EndEvent(e) | IntermediateCatchEvent(e) | IntermediateThrowEvent(e) => {
                self.walk_base(ty, &mut e.base);
                self.walk_definitions(&mut e.event_definitions);
            }
            BoundaryEvent(e) => {
                self.walk_base(ty, &mut e.base);
                self.walk_definitions(&mut e.event_definitions);
            }
            Task(a) | ServiceTask(a) | ScriptTask(a) | UserTask(a) | BusinessRuleTask(a)
            | ManualTask(a) | CallActivity(a) => {
                self.walk_base(ty, &mut a.base);
                self.walk_loop(&mut a.loop_characteristics);
            }
            SendTask(t) | ReceiveTask(t) => {
                self.walk_base(ty, &mut t.base);
                self.walk_loop(&mut t.loop_characteristics);
            }
            SubProcess(s) => {
                self.walk_base(ty, &mut s.base);
                self.walk_loop(&mut s.loop_characteristics);
                self.walk_contents(&mut s.contents);
            }
            AdHocSubProcess(s) => {
                self.walk_base(ty, &mut s.base);
                self.walk_loop(&mut s.loop_characteristics);
                self.walk_contents(&mut s.contents);
            }
            EventSubProcess(s) => {
                self.walk_base(ty, &mut s.base);
                self.walk_contents(&mut s.contents);
            }
            Transaction(s) => {
                self.walk_base(ty, &mut s.base);
                self.walk_loop(&mut s.loop_characteristics);
                self.walk_contents(&mut s.contents);
            }
            ExclusiveGateway(g) | InclusiveGateway(g) | ComplexGateway(g) => {
                self.walk_base(ty, &mut g.base);
            }
            ParallelGateway(b) | EventBasedGateway(b) => self.walk_base(ty, b),
            DataObject(d) => self.walk_base(ty, &mut d.base),
            DataObjectReference(d) => self.walk_base(ty, &mut d.base),
            DataStoreReference(d) => self.walk_base(ty, &mut d.base),
        }
    }
}

fn definition_attrs_mut(d: &mut BpmnEventDefinition) -> Option<&mut Attrs> {
    use BpmnEventDefinition::*;
    match d {
        Timer(x) => x.unknown_attributes.as_mut(),
        Error(x) => x.unknown_attributes.as_mut(),
        Escalation(x) => x.unknown_attributes.as_mut(),
        Message(x) => x.unknown_attributes.as_mut(),
        Signal(x) => x.unknown_attributes.as_mut(),
        Conditional(x) => x.unknown_attributes.as_mut(),
        Link(x) => x.unknown_attributes.as_mut(),
        Cancel(x) | Terminate(x) => x.unknown_attributes.as_mut(),
        Compensate(x) => x.unknown_attributes.as_mut(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::camunda7::migrate::{convert_camunda7, Camunda7ConvertOptions};
    use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};

    fn c8(body: &str, root: &str) -> String {
        format!(
            r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="d" targetNamespace="http://bpmn.io/schema/bpmn" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.8.0">
  {root}
  <bpmn:process id="p" isExecutable="true">{body}</bpmn:process>
</bpmn:definitions>"#
        )
    }

    fn run(xml: &str) -> (String, Vec<Camunda8ExportFinding>) {
        let r = convert_camunda8_to_7(&parse_bpmn(xml).expect("parses"));
        (serialize_bpmn(&r.definitions), r.findings)
    }

    fn no_zeebe(out: &str) {
        assert!(!out.contains("zeebe") && !out.contains("modeler"), "{out}");
    }

    #[test]
    fn job_type_becomes_an_external_topic() {
        let (out, _) = run(&c8(
            r#"<bpmn:serviceTask id="t"><bpmn:extensionElements><zeebe:taskDefinition type="charge" retries="3"/></bpmn:extensionElements></bpmn:serviceTask>"#,
            "",
        ));
        assert!(out.contains(r#"camunda:type="external""#));
        assert!(out.contains(r#"camunda:topic="charge""#));
        assert!(out.contains("xmlns:camunda="));
        no_zeebe(&out);
    }

    #[test]
    fn assignment_and_form_key() {
        let (out, _) = run(&c8(
            r#"<bpmn:userTask id="u"><bpmn:extensionElements><zeebe:assignmentDefinition assignee="bob" candidateGroups="ops" candidateUsers="a,b"/><zeebe:formDefinition formKey="k1"/></bpmn:extensionElements></bpmn:userTask>"#,
            "",
        ));
        for a in [
            r#"camunda:assignee="bob""#,
            r#"camunda:candidateGroups="ops""#,
            r#"camunda:candidateUsers="a,b""#,
            r#"camunda:formKey="k1""#,
        ] {
            assert!(out.contains(a), "{a}\n{out}");
        }
        no_zeebe(&out);
    }

    #[test]
    fn message_correlation_key_is_reported_and_dropped() {
        let (out, findings) = run(&c8(
            r#"<bpmn:intermediateCatchEvent id="e"><bpmn:messageEventDefinition messageRef="m"/></bpmn:intermediateCatchEvent>"#,
            r#"<bpmn:message id="m" name="go"><bpmn:extensionElements><zeebe:subscription correlationKey="=orderId"/></bpmn:extensionElements></bpmn:message>"#,
        ));
        let f = findings
            .iter()
            .find(|f| f.construct == "zeebe:subscription")
            .expect("finding");
        assert_eq!(
            (
                f.element_id.as_str(),
                f.element_type.as_str(),
                f.process_id.as_str()
            ),
            ("m", "message", "")
        );
        assert!(!out.contains("correlationKey"));
        no_zeebe(&out);
    }

    #[test]
    fn call_activity_and_variable_propagation() {
        let (out, _) = run(&c8(
            r#"<bpmn:callActivity id="c"><bpmn:extensionElements><zeebe:calledElement processId="child" propagateAllChildVariables="true" propagateAllParentVariables="false"/></bpmn:extensionElements></bpmn:callActivity>"#,
            "",
        ));
        assert!(out.contains(r#"calledElement="child""#));
        assert!(out.contains(r#"<camunda:out variables="all""#));
        assert!(!out.contains("camunda:in "));
        no_zeebe(&out);
    }

    #[test]
    fn io_mapping_keeps_feel_raw_with_a_finding() {
        let (out, findings) = run(&c8(
            r#"<bpmn:serviceTask id="t"><bpmn:extensionElements><zeebe:taskDefinition type="x"/><zeebe:ioMapping><zeebe:input source="=a" target="in1"/><zeebe:output source="=b" target="out1"/></zeebe:ioMapping></bpmn:extensionElements></bpmn:serviceTask>"#,
            "",
        ));
        assert!(
            out.contains(r#"<camunda:inputParameter name="in1">=a</camunda:inputParameter>"#),
            "{out}"
        );
        assert!(
            out.contains(r#"<camunda:outputParameter name="out1">=b</camunda:outputParameter>"#)
        );
        assert_eq!(
            findings
                .iter()
                .filter(|f| f.message.contains("FEEL"))
                .count(),
            2
        );
        assert_eq!(findings[0].construct, "zeebe:input");
    }

    #[test]
    fn connectors_and_zeebe_only_features_are_dropped() {
        let (out, findings) = run(&c8(
            r#"<bpmn:serviceTask id="t"><bpmn:extensionElements><zeebe:taskDefinition type="io.camunda:http-json:1"/><zeebe:taskHeaders><zeebe:header key="k" value="v"/></zeebe:taskHeaders></bpmn:extensionElements></bpmn:serviceTask>"#,
            "",
        ));
        assert!(findings
            .iter()
            .any(|f| f.construct == "connector" && f.severity == Unsupported));
        assert!(findings.iter().any(|f| f.construct == "zeebe:taskHeaders"));
        no_zeebe(&out);
    }

    #[test]
    fn the_input_is_not_modified() {
        let defs = parse_bpmn(&c8(
            r#"<bpmn:serviceTask id="t"><bpmn:extensionElements><zeebe:taskDefinition type="x"/></bpmn:extensionElements></bpmn:serviceTask>"#,
            "",
        ))
        .expect("parses");
        let before = defs.clone();
        convert_camunda8_to_7(&defs);
        assert_eq!(defs, before);
    }

    #[test]
    fn task_types_and_io_mapping_round_trip_through_the_forward_converter() {
        let defs = parse_bpmn(&c8(
            r#"<bpmn:serviceTask id="t"><bpmn:extensionElements><zeebe:taskDefinition type="charge"/><zeebe:ioMapping><zeebe:input source="=a" target="in1"/></zeebe:ioMapping></bpmn:extensionElements></bpmn:serviceTask>"#,
            "",
        ))
        .expect("parses");
        let c7_xml = serialize_bpmn(&convert_camunda8_to_7(&defs).definitions);
        let back = convert_camunda7(
            &parse_bpmn(&c7_xml).expect("parses"),
            &Camunda7ConvertOptions::default(),
        )
        .expect("converts");
        let out = serialize_bpmn(&back.definitions);
        assert!(
            out.contains(r#"type="charge""#) && out.contains(r#"target="in1""#),
            "{out}"
        );
    }
}
