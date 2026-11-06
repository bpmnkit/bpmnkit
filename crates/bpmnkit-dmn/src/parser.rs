//! Port of `dmn-parser.ts`. Evaluation order follows the TS object literals, so a document with
//! several faults fails with the same message.

use crate::model::*;
use crate::number::js_number;
use bpmnkit_xml::{local_name, parse_xml, XmlElement};
use indexmap::IndexMap;
use std::fmt;

const DMN_NS: &str = "https://www.omg.org/spec/DMN/20191111/MODEL/";

/// A document that is not well-formed or lacks something the model requires. The message is
/// the one the TS parser throws.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseError(pub String);

impl fmt::Display for ParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for ParseError {}

type Res<T> = Result<T, ParseError>;

fn find_children<'a>(el: &'a XmlElement, local: &'a str) -> impl Iterator<Item = &'a XmlElement> {
    el.children.iter().filter(move |c| c.local_name() == local)
}

fn find_child<'a>(el: &'a XmlElement, local: &str) -> Option<&'a XmlElement> {
    el.children.iter().find(|c| c.local_name() == local)
}

/// The attribute `name`, else the first attribute (source order) whose local name is `name`.
fn attr<'a>(el: &'a XmlElement, name: &str) -> Option<&'a str> {
    if let Some(v) = el.attributes.get(name) {
        return Some(v);
    }
    el.attributes
        .iter()
        .find(|(k, _)| local_name(k) == name)
        .map(|(_, v)| v.as_str())
}

fn opt_attr(el: &XmlElement, name: &str) -> Option<String> {
    attr(el, name).map(str::to_owned)
}

fn required_attr(el: &XmlElement, name: &str) -> Res<String> {
    attr(el, name).map(str::to_owned).ok_or_else(|| {
        ParseError(format!(
            "Missing required attribute \"{name}\" on element <{}>",
            el.name
        ))
    })
}

/// `href` of an optional element with the leading `#` removed; empty counts as absent (JS
/// `!href`), a bare `#` is the empty string.
fn href(el: Option<&XmlElement>) -> Option<String> {
    let h = attr(el?, "href")?;
    if h.is_empty() {
        return None;
    }
    Some(h.strip_prefix('#').unwrap_or(h).to_owned())
}

/// `typeRef` and `hitPolicy`: empty is absent.
fn non_empty_attr(el: &XmlElement, name: &str) -> Option<String> {
    attr(el, name).filter(|v| !v.is_empty()).map(str::to_owned)
}

fn parse_input(el: &XmlElement) -> Res<DmnInput> {
    let Some(expr) = find_child(el, "inputExpression") else {
        // JS prints an absent id as "undefined".
        return Err(ParseError(format!(
            "Missing <inputExpression> in input \"{}\"",
            attr(el, "id").unwrap_or("undefined")
        )));
    };
    Ok(DmnInput {
        id: required_attr(el, "id")?,
        label: opt_attr(el, "label"),
        input_expression: DmnInputExpression {
            id: required_attr(expr, "id")?,
            type_ref: non_empty_attr(expr, "typeRef"),
            text: find_child(expr, "text").and_then(|t| t.text.clone()),
        },
    })
}

fn parse_output(el: &XmlElement) -> Res<DmnOutput> {
    Ok(DmnOutput {
        id: required_attr(el, "id")?,
        label: opt_attr(el, "label"),
        name: opt_attr(el, "name"),
        type_ref: non_empty_attr(el, "typeRef"),
    })
}

fn parse_entry(el: &XmlElement) -> Res<DmnEntry> {
    Ok(DmnEntry {
        id: required_attr(el, "id")?,
        text: find_child(el, "text")
            .and_then(|t| t.text.clone())
            .unwrap_or_default(),
    })
}

fn parse_rule(el: &XmlElement) -> Res<DmnRule> {
    Ok(DmnRule {
        id: required_attr(el, "id")?,
        description: find_child(el, "description").and_then(|d| d.text.clone()),
        input_entries: find_children(el, "inputEntry")
            .map(parse_entry)
            .collect::<Res<_>>()?,
        output_entries: find_children(el, "outputEntry")
            .map(parse_entry)
            .collect::<Res<_>>()?,
    })
}

fn parse_decision_table(el: &XmlElement) -> Res<DmnDecisionTable> {
    Ok(DmnDecisionTable {
        id: required_attr(el, "id")?,
        hit_policy: non_empty_attr(el, "hitPolicy"),
        // Cast only in TS: an empty value stays empty.
        aggregation: opt_attr(el, "aggregation"),
        inputs: find_children(el, "input")
            .map(parse_input)
            .collect::<Res<_>>()?,
        outputs: find_children(el, "output")
            .map(parse_output)
            .collect::<Res<_>>()?,
        rules: find_children(el, "rule")
            .map(parse_rule)
            .collect::<Res<_>>()?,
    })
}

fn parse_information_requirement(el: &XmlElement) -> Res<DmnInformationRequirement> {
    Ok(DmnInformationRequirement {
        id: required_attr(el, "id")?,
        required_decision: href(find_child(el, "requiredDecision")),
        required_input: href(find_child(el, "requiredInput")),
    })
}

fn parse_knowledge_requirement(el: &XmlElement) -> Res<DmnKnowledgeRequirement> {
    Ok(DmnKnowledgeRequirement {
        id: required_attr(el, "id")?,
        required_knowledge: href(find_child(el, "requiredKnowledge")).unwrap_or_default(),
    })
}

fn parse_authority_requirement(el: &XmlElement) -> Res<DmnAuthorityRequirement> {
    Ok(DmnAuthorityRequirement {
        id: required_attr(el, "id")?,
        required_decision: href(find_child(el, "requiredDecision")),
        required_input: href(find_child(el, "requiredInput")),
        required_authority: href(find_child(el, "requiredAuthority")),
    })
}

const KNOWN_DECISION_CHILDREN: &[&str] = &[
    "decisionTable",
    "extensionElements",
    "informationRequirement",
    "knowledgeRequirement",
    "authorityRequirement",
];

fn parse_decision(el: &XmlElement) -> Res<DmnDecision> {
    let table = find_child(el, "decisionTable");
    let extension = find_child(el, "extensionElements");
    // Content the model has no field for (literalExpression, variable, ...) rides along in
    // extensionElements, but only when the decision has no <extensionElements> of its own.
    let unknown: Vec<XmlElement> = el
        .children
        .iter()
        .filter(|c| !KNOWN_DECISION_CHILDREN.contains(&c.local_name()))
        .cloned()
        .collect();
    let id = required_attr(el, "id")?;
    let name = opt_attr(el, "name");
    let decision_table = table.map(parse_decision_table).transpose()?;
    let information_requirements = find_children(el, "informationRequirement")
        .map(parse_information_requirement)
        .collect::<Res<_>>()?;
    let knowledge_requirements = find_children(el, "knowledgeRequirement")
        .map(parse_knowledge_requirement)
        .collect::<Res<_>>()?;
    let authority_requirements = find_children(el, "authorityRequirement")
        .map(parse_authority_requirement)
        .collect::<Res<_>>()?;
    Ok(DmnDecision {
        id,
        name,
        decision_table,
        information_requirements,
        knowledge_requirements,
        authority_requirements,
        extension_elements: match extension {
            Some(e) => Some(e.children.clone()),
            None if !unknown.is_empty() => Some(unknown),
            None => None,
        },
    })
}

fn parse_input_data(el: &XmlElement) -> Res<DmnInputData> {
    Ok(DmnInputData {
        id: required_attr(el, "id")?,
        name: opt_attr(el, "name"),
    })
}

fn parse_knowledge_source(el: &XmlElement) -> Res<DmnKnowledgeSource> {
    Ok(DmnKnowledgeSource {
        id: required_attr(el, "id")?,
        name: opt_attr(el, "name"),
        authority_requirements: find_children(el, "authorityRequirement")
            .map(parse_authority_requirement)
            .collect::<Res<_>>()?,
    })
}

fn parse_business_knowledge_model(el: &XmlElement) -> Res<DmnBusinessKnowledgeModel> {
    Ok(DmnBusinessKnowledgeModel {
        id: required_attr(el, "id")?,
        name: opt_attr(el, "name"),
        knowledge_requirements: find_children(el, "knowledgeRequirement")
            .map(parse_knowledge_requirement)
            .collect::<Res<_>>()?,
        authority_requirements: find_children(el, "authorityRequirement")
            .map(parse_authority_requirement)
            .collect::<Res<_>>()?,
    })
}

fn parse_text_annotation(el: &XmlElement) -> Res<DmnTextAnnotation> {
    Ok(DmnTextAnnotation {
        id: required_attr(el, "id")?,
        text: find_child(el, "text").and_then(|t| t.text.clone()),
    })
}

fn deref_ref(value: Option<&str>) -> String {
    match value {
        Some(v) if !v.is_empty() => v.strip_prefix('#').unwrap_or(v).to_owned(),
        _ => String::new(),
    }
}

fn parse_association(el: &XmlElement) -> Res<DmnAssociation> {
    Ok(DmnAssociation {
        id: required_attr(el, "id")?,
        source_ref: deref_ref(attr(el, "sourceRef")),
        target_ref: deref_ref(attr(el, "targetRef")),
    })
}

fn num(el: &XmlElement, name: &str) -> f64 {
    js_number(attr(el, name).unwrap_or("0"))
}

fn parse_diagram(dmndi: &XmlElement) -> Res<DmnDiagram> {
    let mut shapes = vec![];
    let mut edges = vec![];
    if let Some(diagram) = find_child(dmndi, "DMNDiagram") {
        for shape in find_children(diagram, "DMNShape") {
            if let Some(b) = find_child(shape, "Bounds") {
                shapes.push(DmnDiagramShape {
                    dmn_element_ref: required_attr(shape, "dmnElementRef")?,
                    bounds: DmnBounds {
                        x: num(b, "x"),
                        y: num(b, "y"),
                        width: num(b, "width"),
                        height: num(b, "height"),
                    },
                });
            }
        }
        for edge in find_children(diagram, "DMNEdge") {
            // The waypoints cannot fail, so the order of the checks does not show.
            edges.push(DmnDiagramEdge {
                dmn_element_ref: required_attr(edge, "dmnElementRef")?,
                waypoints: find_children(edge, "waypoint")
                    .map(|wp| DmnWaypoint {
                        x: num(wp, "x"),
                        y: num(wp, "y"),
                    })
                    .collect(),
            });
        }
    }
    Ok(DmnDiagram { shapes, edges })
}

/// Parses a DMN XML string into a [`DmnDefinitions`].
pub fn parse_dmn(xml: &str) -> Result<DmnDefinitions, ParseError> {
    let root = parse_xml(xml).map_err(|e| ParseError(e.0))?;
    if root.local_name() != "definitions" {
        return Err(ParseError(format!(
            "Expected <definitions> root element, got <{}>",
            root.name
        )));
    }

    let mut namespaces = IndexMap::new();
    let mut modeler_attributes = IndexMap::new();
    for (key, value) in &root.attributes {
        if let Some(prefix) = key.strip_prefix("xmlns:") {
            namespaces.insert(prefix.to_owned(), value.clone());
        } else if key == "xmlns" {
            namespaces.insert(String::new(), value.clone());
        } else if let Some(k) = key.strip_prefix("modeler:") {
            modeler_attributes.insert(k.to_owned(), value.clone());
        }
    }

    let decisions = find_children(&root, "decision")
        .map(parse_decision)
        .collect::<Res<_>>()?;
    let input_data = find_children(&root, "inputData")
        .map(parse_input_data)
        .collect::<Res<_>>()?;
    let knowledge_sources = find_children(&root, "knowledgeSource")
        .map(parse_knowledge_source)
        .collect::<Res<_>>()?;
    let business_knowledge_models = find_children(&root, "businessKnowledgeModel")
        .map(parse_business_knowledge_model)
        .collect::<Res<_>>()?;
    let text_annotations = find_children(&root, "textAnnotation")
        .map(parse_text_annotation)
        .collect::<Res<_>>()?;
    let associations = find_children(&root, "association")
        .map(parse_association)
        .collect::<Res<_>>()?;
    let diagram = find_child(&root, "DMNDI").map(parse_diagram).transpose()?;

    Ok(DmnDefinitions {
        id: required_attr(&root, "id")?,
        name: required_attr(&root, "name")?,
        namespace: attr(&root, "namespace").unwrap_or(DMN_NS).to_owned(),
        exporter: opt_attr(&root, "exporter"),
        exporter_version: opt_attr(&root, "exporterVersion"),
        namespaces,
        modeler_attributes,
        decisions,
        input_data,
        knowledge_sources,
        business_knowledge_models,
        text_annotations,
        associations,
        diagram,
        extension_elements: None,
    })
}
