//! Port of `dmn-serializer.ts`. Truthiness checks in TS (`if (x.name)`) become "present and not
//! empty" here, and a missing reference is written as the text JS prints for `undefined`.

use crate::model::*;
use crate::number::js_number_to_string;
use bpmnkit_xml::{serialize_xml, Attrs, XmlElement};

fn el(name: &str, attributes: Attrs, children: Vec<XmlElement>) -> XmlElement {
    XmlElement {
        name: name.to_owned(),
        attributes,
        children,
        text: None,
    }
}

fn attrs<const N: usize>(pairs: [(&str, &str); N]) -> Attrs {
    pairs
        .into_iter()
        .map(|(k, v)| (k.to_owned(), v.to_owned()))
        .collect()
}

fn text_element(text: &str) -> XmlElement {
    XmlElement {
        text: Some(text.to_owned()),
        ..XmlElement::new("text")
    }
}

/// The value if it is JS-truthy (present and not empty).
fn truthy(v: &Option<String>) -> Option<&str> {
    v.as_deref().filter(|s| !s.is_empty())
}

fn set_if(a: &mut Attrs, key: &str, v: &Option<String>) {
    if let Some(s) = truthy(v) {
        a.insert(key.to_owned(), s.to_owned());
    }
}

/// `#${v}` with `undefined` printed as JS does.
fn hash_ref(v: &Option<String>) -> String {
    format!("#{}", v.as_deref().unwrap_or("undefined"))
}

fn serialize_input(input: &DmnInput) -> XmlElement {
    let mut expr_attrs = attrs([("id", &input.input_expression.id)]);
    set_if(&mut expr_attrs, "typeRef", &input.input_expression.type_ref);
    let mut expr_children = vec![];
    if let Some(t) = truthy(&input.input_expression.text) {
        expr_children.push(text_element(t));
    }
    let mut input_attrs = attrs([("id", &input.id)]);
    set_if(&mut input_attrs, "label", &input.label);
    el(
        "input",
        input_attrs,
        vec![el("inputExpression", expr_attrs, expr_children)],
    )
}

fn serialize_output(output: &DmnOutput) -> XmlElement {
    let mut a = attrs([("id", &output.id)]);
    set_if(&mut a, "label", &output.label);
    set_if(&mut a, "name", &output.name);
    set_if(&mut a, "typeRef", &output.type_ref);
    el("output", a, vec![])
}

fn serialize_entry(name: &str, entry: &DmnEntry) -> XmlElement {
    el(
        name,
        attrs([("id", &entry.id)]),
        vec![text_element(&entry.text)],
    )
}

fn serialize_rule(rule: &DmnRule) -> XmlElement {
    let mut children = vec![];
    if let Some(d) = truthy(&rule.description) {
        children.push(XmlElement {
            text: Some(d.to_owned()),
            ..XmlElement::new("description")
        });
    }
    children.extend(
        rule.input_entries
            .iter()
            .map(|e| serialize_entry("inputEntry", e)),
    );
    children.extend(
        rule.output_entries
            .iter()
            .map(|e| serialize_entry("outputEntry", e)),
    );
    el("rule", attrs([("id", &rule.id)]), children)
}

fn serialize_decision_table(table: &DmnDecisionTable) -> XmlElement {
    let mut a = attrs([("id", &table.id)]);
    // Written even for the schema default UNIQUE: the parser reads it into the model, so
    // dropping it would break parse(serialize(m)) == m.
    set_if(&mut a, "hitPolicy", &table.hit_policy);
    set_if(&mut a, "aggregation", &table.aggregation);
    let mut children: Vec<XmlElement> = table.inputs.iter().map(serialize_input).collect();
    children.extend(table.outputs.iter().map(serialize_output));
    children.extend(table.rules.iter().map(serialize_rule));
    el("decisionTable", a, children)
}

fn href_child(name: &str, href: String) -> XmlElement {
    el(name, attrs([("href", &href)]), vec![])
}

fn serialize_information_requirements(decision: &DmnDecision) -> Vec<XmlElement> {
    decision
        .information_requirements
        .iter()
        .map(|req| {
            let child = if truthy(&req.required_decision).is_some() {
                href_child("requiredDecision", hash_ref(&req.required_decision))
            } else {
                href_child("requiredInput", hash_ref(&req.required_input))
            };
            el(
                "informationRequirement",
                attrs([("id", &req.id)]),
                vec![child],
            )
        })
        .collect()
}

fn serialize_knowledge_requirements(reqs: &[DmnKnowledgeRequirement]) -> Vec<XmlElement> {
    reqs.iter()
        .map(|req| {
            el(
                "knowledgeRequirement",
                attrs([("id", &req.id)]),
                vec![href_child(
                    "requiredKnowledge",
                    format!("#{}", req.required_knowledge),
                )],
            )
        })
        .collect()
}

fn serialize_authority_requirements(reqs: &[DmnAuthorityRequirement]) -> Vec<XmlElement> {
    reqs.iter()
        .map(|req| {
            let child = if truthy(&req.required_decision).is_some() {
                href_child("requiredDecision", hash_ref(&req.required_decision))
            } else if truthy(&req.required_input).is_some() {
                href_child("requiredInput", hash_ref(&req.required_input))
            } else {
                href_child(
                    "requiredAuthority",
                    format!("#{}", req.required_authority.as_deref().unwrap_or("")),
                )
            };
            el(
                "authorityRequirement",
                attrs([("id", &req.id)]),
                vec![child],
            )
        })
        .collect()
}

fn serialize_decision(decision: &DmnDecision) -> XmlElement {
    let mut children = vec![];
    if let Some(ext) = decision
        .extension_elements
        .as_ref()
        .filter(|e| !e.is_empty())
    {
        children.push(el("extensionElements", Attrs::new(), ext.clone()));
    }
    children.extend(serialize_information_requirements(decision));
    children.extend(serialize_knowledge_requirements(
        &decision.knowledge_requirements,
    ));
    children.extend(serialize_authority_requirements(
        &decision.authority_requirements,
    ));
    if let Some(t) = &decision.decision_table {
        children.push(serialize_decision_table(t));
    }
    let mut a = attrs([("id", &decision.id)]);
    set_if(&mut a, "name", &decision.name);
    el("decision", a, children)
}

fn id_name(id: &str, name: &Option<String>) -> Attrs {
    let mut a = attrs([("id", id)]);
    set_if(&mut a, "name", name);
    a
}

fn serialize_text_annotation(ann: &DmnTextAnnotation) -> XmlElement {
    let mut children = vec![];
    if let Some(t) = truthy(&ann.text) {
        children.push(text_element(t));
    }
    el("textAnnotation", attrs([("id", &ann.id)]), children)
}

fn serialize_association(assoc: &DmnAssociation) -> XmlElement {
    el(
        "association",
        attrs([
            ("id", &assoc.id),
            ("sourceRef", &format!("#{}", assoc.source_ref)),
            ("targetRef", &format!("#{}", assoc.target_ref)),
        ]),
        vec![],
    )
}

fn serialize_diagram(diagram: &DmnDiagram) -> XmlElement {
    let n = js_number_to_string;
    let mut children: Vec<XmlElement> = diagram
        .shapes
        .iter()
        .map(|s| {
            el(
                "dmndi:DMNShape",
                attrs([("dmnElementRef", &s.dmn_element_ref)]),
                vec![el(
                    "dc:Bounds",
                    attrs([
                        ("height", &n(s.bounds.height)),
                        ("width", &n(s.bounds.width)),
                        ("x", &n(s.bounds.x)),
                        ("y", &n(s.bounds.y)),
                    ]),
                    vec![],
                )],
            )
        })
        .collect();
    children.extend(diagram.edges.iter().map(|e| {
        el(
            "dmndi:DMNEdge",
            attrs([("dmnElementRef", &e.dmn_element_ref)]),
            e.waypoints
                .iter()
                .map(|wp| {
                    el(
                        "di:waypoint",
                        attrs([("x", &n(wp.x)), ("y", &n(wp.y))]),
                        vec![],
                    )
                })
                .collect(),
        )
    }));
    el(
        "dmndi:DMNDI",
        Attrs::new(),
        vec![el("dmndi:DMNDiagram", Attrs::new(), children)],
    )
}

/// Serializes a [`DmnDefinitions`] to DMN XML.
pub fn serialize_dmn(defs: &DmnDefinitions) -> String {
    let mut a = Attrs::new();
    for (prefix, uri) in &defs.namespaces {
        if prefix.is_empty() {
            a.insert("xmlns".to_owned(), uri.clone());
        } else {
            a.insert(format!("xmlns:{prefix}"), uri.clone());
        }
    }
    a.insert("id".to_owned(), defs.id.clone());
    a.insert("name".to_owned(), defs.name.clone());
    a.insert("namespace".to_owned(), defs.namespace.clone());
    set_if(&mut a, "exporter", &defs.exporter);
    set_if(&mut a, "exporterVersion", &defs.exporter_version);
    for (key, value) in &defs.modeler_attributes {
        a.insert(format!("modeler:{key}"), value.clone());
    }

    let mut children: Vec<XmlElement> = defs.decisions.iter().map(serialize_decision).collect();
    children.extend(
        defs.input_data
            .iter()
            .map(|d| el("inputData", id_name(&d.id, &d.name), vec![])),
    );
    children.extend(defs.knowledge_sources.iter().map(|ks| {
        el(
            "knowledgeSource",
            id_name(&ks.id, &ks.name),
            serialize_authority_requirements(&ks.authority_requirements),
        )
    }));
    children.extend(defs.business_knowledge_models.iter().map(|bkm| {
        let mut c = serialize_knowledge_requirements(&bkm.knowledge_requirements);
        c.extend(serialize_authority_requirements(
            &bkm.authority_requirements,
        ));
        el("businessKnowledgeModel", id_name(&bkm.id, &bkm.name), c)
    }));
    children.extend(defs.text_annotations.iter().map(serialize_text_annotation));
    children.extend(defs.associations.iter().map(serialize_association));
    if let Some(d) = &defs.diagram {
        children.push(serialize_diagram(d));
    }
    serialize_xml(&el("definitions", a, children))
}
