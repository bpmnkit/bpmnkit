//! The element-template shape the binder reads: the subset of Camunda's element-template schema
//! (`template-types.ts`) that applying one touches. Unknown fields are ignored on read.

use serde::Deserialize;
use serde_json::Value;

/// `elementType`: the type to convert to, and for events the definition to give them.
#[derive(Debug, Clone, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ElementType {
    pub value: String,
    #[serde(default)]
    pub event_definition: Option<String>,
}

/// A binding as JSON writes it: `type` plus whichever of the other keys that type uses
/// (`name`, `source`, `key`, `property`, `linkName`). Flat, like the TS union read loosely.
#[derive(Debug, Clone, Default, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Binding {
    #[serde(rename = "type", default)]
    pub kind: String,
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub source: Option<String>,
    #[serde(default)]
    pub key: Option<String>,
    #[serde(default)]
    pub property: Option<String>,
    #[serde(default)]
    pub link_name: Option<String>,
}

/// A condition: a leaf (`equals` / `oneOf` / `isActive` / `isEmpty` on `property`) or `allMatch`.
#[derive(Debug, Clone, Default, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Condition {
    #[serde(default)]
    pub property: Option<String>,
    #[serde(default)]
    pub equals: Option<Value>,
    #[serde(default)]
    pub one_of: Option<Vec<String>>,
    #[serde(default)]
    pub is_active: Option<bool>,
    #[serde(default)]
    pub is_empty: Option<bool>,
    #[serde(default)]
    pub all_match: Option<Vec<Condition>>,
}

#[derive(Debug, Clone, Default, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Constraints {
    #[serde(default)]
    pub not_empty: Option<bool>,
}

/// One template property.
#[derive(Debug, Clone, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TemplateProperty {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub label: Option<String>,
    /// `String`, `Text`, `Hidden`, `Dropdown`, `Boolean`, `Number` or `Configuration`.
    #[serde(rename = "type", default)]
    pub kind: String,
    /// The default: a string, number or boolean.
    #[serde(default)]
    pub value: Option<Value>,
    #[serde(default)]
    pub generated_value: Option<Value>,
    #[serde(default)]
    pub feel: Option<String>,
    #[serde(default)]
    pub constraints: Option<Constraints>,
    pub binding: Binding,
    #[serde(default)]
    pub condition: Option<Condition>,
}

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub(crate) struct Icon {
    pub contents: String,
}

/// An element template, as bundled or generated.
#[derive(Debug, Clone, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ElementTemplate {
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub version: Option<Value>,
    #[serde(default)]
    pub applies_to: Vec<String>,
    #[serde(default)]
    pub element_type: Option<ElementType>,
    #[serde(default)]
    pub properties: Vec<TemplateProperty>,
    #[serde(default)]
    pub(crate) icon: Option<Icon>,
}

impl ElementTemplate {
    /// Reads a template from its JSON text.
    pub fn from_json(text: &str) -> Result<Self, crate::Error> {
        serde_json::from_str(text)
            .map_err(|e| crate::Error::Spec(format!("Invalid element template: {e}")))
    }

    /// Reads a template from a JSON value (e.g. one returned by [`crate::generate`]).
    pub fn from_value(value: &Value) -> Result<Self, crate::Error> {
        Self::deserialize(value)
            .map_err(|e| crate::Error::Spec(format!("Invalid element template: {e}")))
    }
}

/// `propertyKey`: the key values and conditions use for a property.
pub fn property_key(prop: &TemplateProperty) -> String {
    if let Some(id) = prop.id.as_deref().filter(|i| !i.is_empty()) {
        return id.to_owned();
    }
    let b = &prop.binding;
    let s = |o: &Option<String>| o.clone().unwrap_or_default();
    let property = || s(&b.property);
    match b.kind.as_str() {
        "zeebe:input" | "zeebe:property" | "property" => s(&b.name),
        "zeebe:output" => s(&b.source),
        "zeebe:taskHeader" => s(&b.key),
        "zeebe:taskDefinition" => format!("taskDef.{}", property()),
        "zeebe:taskDefinition:type" => "taskDef.type".into(),
        "zeebe:adHoc" => format!("adHoc.{}", property()),
        "zeebe:agentDefinition" => format!("agentDefinition.{}", property()),
        "zeebe:userTask" => "userTask".into(),
        "bpmn:Message#property" | "bpmn:Message#zeebe:subscription#property" => {
            format!("message.{}", s(&b.name))
        }
        "zeebe:linkedResource" => {
            format!("linkedResource.{}.{}", s(&b.link_name), property())
        }
        kind if b.property.is_some() && kind.starts_with("zeebe:") => {
            format!("{}.{}", &kind["zeebe:".len()..], property())
        }
        _ => String::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn key(binding: &str) -> String {
        let t = ElementTemplate::from_json(&format!(
            r#"{{"id":"t","appliesTo":[],"properties":[{{"type":"String","binding":{binding}}}]}}"#
        ))
        .unwrap();
        property_key(&t.properties[0])
    }

    #[test]
    fn keys_follow_the_binding() {
        assert_eq!(key(r#"{"type":"zeebe:input","name":"a"}"#), "a");
        assert_eq!(key(r#"{"type":"zeebe:output","source":"=r"}"#), "=r");
        assert_eq!(
            key(r#"{"type":"zeebe:taskDefinition","property":"type"}"#),
            "taskDef.type"
        );
        assert_eq!(
            key(r#"{"type":"zeebe:taskDefinition:type"}"#),
            "taskDef.type"
        );
        assert_eq!(
            key(r#"{"type":"zeebe:calledElement","property":"processId"}"#),
            "calledElement.processId"
        );
        assert_eq!(
            key(r#"{"type":"bpmn:Message#property","name":"name"}"#),
            "message.name"
        );
        assert_eq!(
            key(r#"{"type":"zeebe:linkedResource","property":"p","linkName":"L"}"#),
            "linkedResource.L.p"
        );
        assert_eq!(key(r#"{"type":"unknown"}"#), "");
    }

    #[test]
    fn an_id_wins_and_bad_json_is_refused() {
        let t = ElementTemplate::from_json(
            r#"{"id":"t","appliesTo":[],"properties":[{"id":"x","type":"String","binding":{"type":"zeebe:input","name":"a"}}]}"#,
        )
        .unwrap();
        assert_eq!(property_key(&t.properties[0]), "x");
        assert!(ElementTemplate::from_json("{}").is_err());
    }
}
