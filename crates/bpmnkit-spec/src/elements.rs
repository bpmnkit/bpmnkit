//! Element and extension definitions (`spec/elements/<family>.json`, schema
//! `spec/schema/elements.schema.json`). The types are generic over a family's trait enum so
//! each family's data is a plain `static`. The `form`, `bpmn`, `zeebe` and `dmn` families are
//! generated.

pub use crate::generated::bpmn_elements::BPMN_ELEMENTS;
pub use crate::generated::dmn_elements::DMN_ELEMENTS;
pub use crate::generated::form_elements::FORM_ELEMENTS;
pub use crate::generated::zeebe_elements::{ZEEBE_ALLOWED_IN, ZEEBE_ELEMENTS};

/// An XML namespace.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Namespace {
    pub prefix: &'static str,
    pub uri: &'static str,
}

/// An attribute's value type.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AttributeType {
    String,
    Boolean,
    Integer,
    Number,
    Expression,
    Id,
    Idref,
    Enum,
}

/// An attribute's default value.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum DefaultValue {
    Str(&'static str),
    Bool(bool),
    Num(f64),
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct AttributeDef {
    pub name: &'static str,
    pub ty: AttributeType,
    /// Allowed values; non-empty only for `AttributeType::Enum`.
    pub values: &'static [&'static str],
    pub default: Option<DefaultValue>,
    pub required: bool,
}

/// How often a child element occurs.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Multiplicity {
    /// `1`
    One,
    /// `0..1`
    Optional,
    /// `0..*`
    Many,
    /// `1..*`
    OneOrMore,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ChildDef {
    pub element: &'static str,
    pub multiplicity: Multiplicity,
}

/// One element; `T` is the family's trait enum.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ElementDef<T: 'static> {
    pub name: &'static str,
    pub extends: Option<&'static str>,
    pub is_abstract: bool,
    pub attributes: &'static [AttributeDef],
    pub children: &'static [ChildDef],
    /// Parent element names this one may sit directly in; empty means unconstrained.
    pub allowed_in: &'static [&'static str],
    pub traits: &'static [T],
}

/// A whole family, elements in the spec's order.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct ElementFamily<T: 'static> {
    pub family: &'static str,
    pub namespace: Option<Namespace>,
    pub source: &'static str,
    pub elements: &'static [ElementDef<T>],
}

impl<T: PartialEq + 'static> ElementFamily<T> {
    /// The element called `name`.
    pub fn element(&self, name: &str) -> Option<&'static ElementDef<T>> {
        self.elements.iter().find(|e| e.name == name)
    }

    /// Whether `name` is an element carrying `t`.
    pub fn has_trait(&self, name: &str, t: T) -> bool {
        self.element(name).is_some_and(|e| e.traits.contains(&t))
    }
}

/// form-js component traits (`traits` in `spec/elements/form.json`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FormTrait {
    /// Binds a value to a process variable through `key`.
    Keyed,
    /// Chooses from a list of options.
    Options,
    /// Container whose `path` opens a nested data scope.
    Scope,
}

/// BPMN element traits (`traits` in `spec/elements/bpmn.json`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BpmnTrait {
    /// Parsed as a flow element of a process or sub-process.
    FlowElement,
    /// Event that may carry event definitions.
    Event,
    /// Activity whose `multiInstanceLoopCharacteristics` child is read.
    Loop,
    /// Holds a flow of its own (sub-process kinds).
    Container,
    /// Event definition read under an event.
    EventDefinition,
    /// Gateway that models a `default` sequence flow.
    DefaultFlow,
}

/// Zeebe extension element traits (`traits` in `spec/elements/zeebe.json`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ZeebeTrait {
    /// Wrapper whose children are repeated entries of one kind.
    Collection,
}

/// DMN element traits (`traits` in `spec/elements/dmn.json`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DmnTrait {
    /// Top-level DRG element the parser reads into its own list.
    DrgElement,
    /// DRD edge held by its target element.
    Requirement,
    /// Top-level annotation of the graph.
    Artifact,
}

/// The DMN element called `name` (its XML local name).
pub fn dmn_element(name: &str) -> Option<&'static ElementDef<DmnTrait>> {
    DMN_ELEMENTS.element(name)
}

/// The allowed values of a DMN enum attribute (`element.attribute` in TS), empty if none.
pub fn dmn_attribute_values(element: &str, attribute: &str) -> &'static [&'static str] {
    dmn_element(element)
        .and_then(|e| e.attributes.iter().find(|a| a.name == attribute))
        .map_or(&[], |a| a.values)
}

/// The BPMN element called `name` (its XML local name).
pub fn bpmn_element(name: &str) -> Option<&'static ElementDef<BpmnTrait>> {
    BPMN_ELEMENTS.element(name)
}

/// The Zeebe extension element called `name` (its XML local name).
pub fn zeebe_element(name: &str) -> Option<&'static ElementDef<ZeebeTrait>> {
    ZEEBE_ELEMENTS.element(name)
}

/// The parents a Zeebe element may sit in, keyed `zeebe:name`; empty if unconstrained.
pub fn zeebe_allowed_in(qualified: &str) -> &'static [&'static str] {
    ZEEBE_ALLOWED_IN
        .iter()
        .find(|(k, _)| *k == qualified)
        .map_or(&[], |(_, v)| v)
}

/// The form-js component called `name`.
pub fn form_element(name: &str) -> Option<&'static ElementDef<FormTrait>> {
    FORM_ELEMENTS.element(name)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_support::spec_json;

    fn trait_name(t: &FormTrait) -> String {
        format!("{t:?}").to_lowercase()
    }

    #[test]
    fn form_elements_match_spec_file() {
        let spec = spec_json("elements/form.json");
        assert_eq!(spec["family"], FORM_ELEMENTS.family);
        assert_eq!(spec["source"], FORM_ELEMENTS.source);
        assert!(FORM_ELEMENTS.namespace.is_none());
        let json = spec["elements"].as_array().expect("elements");
        assert_eq!(json.len(), FORM_ELEMENTS.elements.len());
        assert_eq!(json.len(), 22);
        for (j, e) in json.iter().zip(FORM_ELEMENTS.elements) {
            assert_eq!(j["name"], e.name);
            let traits: Vec<String> = j["traits"]
                .as_array()
                .map(|a| {
                    a.iter()
                        .map(|t| t.as_str().expect("trait").to_owned())
                        .collect()
                })
                .unwrap_or_default();
            assert_eq!(traits, e.traits.iter().map(trait_name).collect::<Vec<_>>());
        }
        let declared: Vec<&str> = spec["traits"]
            .as_array()
            .expect("traits")
            .iter()
            .map(|t| t["name"].as_str().expect("name"))
            .collect();
        assert_eq!(declared, ["keyed", "options", "scope"]);
    }

    fn names(v: &serde_json::Value) -> Vec<String> {
        v.as_array()
            .map(|a| {
                a.iter()
                    .map(|t| t.as_str().expect("string").to_owned())
                    .collect()
            })
            .unwrap_or_default()
    }

    /// `FlowElement` → `flowElement`, the spelling traits have in the JSON.
    fn camel(t: &impl std::fmt::Debug) -> String {
        let s = format!("{t:?}");
        let mut chars = s.chars();
        chars
            .next()
            .map(|c| c.to_ascii_lowercase().to_string() + chars.as_str())
            .unwrap_or_default()
    }

    /// Checks one family's generated table against its JSON file, element by element.
    fn check_family<T: PartialEq + std::fmt::Debug>(file: &str, family: &ElementFamily<T>) {
        let spec = spec_json(file);
        assert_eq!(spec["family"], family.family);
        assert_eq!(spec["source"], family.source);
        let ns = family.namespace.expect("namespace");
        assert_eq!(spec["namespace"]["prefix"], ns.prefix);
        assert_eq!(spec["namespace"]["uri"], ns.uri);
        let json = spec["elements"].as_array().expect("elements");
        assert_eq!(json.len(), family.elements.len());
        for (j, e) in json.iter().zip(family.elements) {
            assert_eq!(j["name"], e.name);
            assert_eq!(j["extends"].as_str(), e.extends, "{} extends", e.name);
            assert_eq!(j["abstract"].as_bool().unwrap_or(false), e.is_abstract);
            assert_eq!(
                j["attributes"].as_array().map_or(0, Vec::len),
                e.attributes.len(),
                "{} attributes",
                e.name
            );
            assert_eq!(
                j["children"].as_array().map_or(0, Vec::len),
                e.children.len(),
                "{} children",
                e.name
            );
            assert_eq!(names(&j["allowedIn"]), e.allowed_in, "{} allowedIn", e.name);
            assert_eq!(
                names(&j["traits"]),
                e.traits.iter().map(camel).collect::<Vec<_>>(),
                "{} traits",
                e.name
            );
        }
    }

    #[test]
    fn bpmn_elements_match_spec_file() {
        check_family("elements/bpmn.json", &BPMN_ELEMENTS);
        let declared: Vec<String> = spec_json("elements/bpmn.json")["traits"]
            .as_array()
            .expect("traits")
            .iter()
            .map(|t| t["name"].as_str().expect("name").to_owned())
            .collect();
        assert_eq!(
            declared,
            [
                "flowElement",
                "event",
                "loop",
                "container",
                "eventDefinition",
                "defaultFlow"
            ]
        );
    }

    #[test]
    fn dmn_elements_match_spec_file() {
        check_family("elements/dmn.json", &DMN_ELEMENTS);
        assert!(DMN_ELEMENTS.has_trait("decision", DmnTrait::DrgElement));
        assert!(DMN_ELEMENTS.has_trait("association", DmnTrait::Artifact));
        assert!(!DMN_ELEMENTS.has_trait("decisionTable", DmnTrait::DrgElement));
        assert_eq!(
            dmn_attribute_values("decisionTable", "aggregation"),
            ["SUM", "MIN", "MAX", "COUNT"]
        );
        assert!(dmn_attribute_values("decision", "nope").is_empty());
    }

    #[test]
    fn zeebe_elements_match_spec_file() {
        check_family("elements/zeebe.json", &ZEEBE_ELEMENTS);
        let spec = spec_json("elements/zeebe.json");
        let placed: Vec<(String, Vec<String>)> = spec["elements"]
            .as_array()
            .expect("elements")
            .iter()
            .filter(|e| e.get("allowedIn").is_some())
            .map(|e| {
                (
                    format!("zeebe:{}", e["name"].as_str().expect("name")),
                    names(&e["allowedIn"]),
                )
            })
            .collect();
        assert_eq!(placed.len(), ZEEBE_ALLOWED_IN.len());
        for ((key, owners), (k, v)) in placed.iter().zip(ZEEBE_ALLOWED_IN) {
            assert_eq!(key, k);
            assert_eq!(owners, v);
        }
    }

    #[test]
    fn bpmn_hierarchy_and_traits() {
        let timer = bpmn_element("timerEventDefinition").expect("timer");
        assert_eq!(timer.extends, Some("eventDefinition"));
        assert!(BPMN_ELEMENTS.has_trait("eventSubProcess", BpmnTrait::Container));
        assert!(BPMN_ELEMENTS.has_trait("eventSubProcess", BpmnTrait::FlowElement));
        assert!(!BPMN_ELEMENTS.has_trait("eventSubProcess", BpmnTrait::Loop));
        assert!(!BPMN_ELEMENTS.has_trait("sequenceFlow", BpmnTrait::FlowElement));
        assert!(BPMN_ELEMENTS.has_trait("complexGateway", BpmnTrait::DefaultFlow));
        assert!(bpmn_element("flowNode").is_some_and(|e| e.is_abstract));
        let boundary = bpmn_element("boundaryEvent").expect("boundaryEvent");
        let cancel = boundary
            .attributes
            .iter()
            .find(|a| a.name == "cancelActivity")
            .expect("cancelActivity");
        assert_eq!(cancel.default, Some(DefaultValue::Bool(true)));
        assert!(bpmn_element("nope").is_none());
    }

    #[test]
    fn zeebe_placement_and_children() {
        assert_eq!(
            zeebe_allowed_in("zeebe:calledDecision"),
            ["bpmn:businessRuleTask"]
        );
        assert!(zeebe_allowed_in("zeebe:subscription").is_empty());
        assert!(zeebe_allowed_in("zeebe:nope").is_empty());
        let io = zeebe_element("ioMapping").expect("ioMapping");
        let kids: Vec<&str> = io.children.iter().map(|c| c.element).collect();
        assert_eq!(kids, ["input", "output"]);
        assert!(ZEEBE_ELEMENTS.has_trait("taskHeaders", ZeebeTrait::Collection));
        let task = zeebe_element("taskDefinition").expect("taskDefinition");
        assert!(task
            .attributes
            .iter()
            .any(|a| a.name == "type" && a.required));
    }

    #[test]
    fn lookup_and_traits() {
        assert!(FORM_ELEMENTS.has_trait("textfield", FormTrait::Keyed));
        assert!(!FORM_ELEMENTS.has_trait("button", FormTrait::Keyed));
        assert!(FORM_ELEMENTS.has_trait("select", FormTrait::Options));
        assert!(FORM_ELEMENTS.has_trait("dynamiclist", FormTrait::Scope));
        assert!(form_element("documentPreview").is_some());
        assert!(form_element("nope").is_none());
    }
}
