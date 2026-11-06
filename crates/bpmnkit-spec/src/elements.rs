//! Element and extension definitions (`spec/elements/<family>.json`, schema
//! `spec/schema/elements.schema.json`). The types are generic over a family's trait enum so
//! each family's data is a plain `static`. Only the `form` family is generated so far.

pub use crate::generated::form_elements::FORM_ELEMENTS;

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
