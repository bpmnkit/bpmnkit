//! Port of `projectSemantics` / `semanticHash` (`semantic-hash.ts`): a canonical, presentation-free
//! view of a model, and a hash over it.

use crate::js::{cmp_utf16, sorted_entries, stringify};
use crate::sha256::sha256_hex;
use bpmnkit_bpmn::model::BpmnDefinitions;
use indexmap::IndexMap;
use serde_json::{Map, Value};

/// Top-level keys that describe the exporter or the diagram, not the model.
const EXCLUDED_DEFINITIONS_KEYS: [&str; 3] = ["diagrams", "exporter", "exporterVersion"];

fn is_excluded_attribute(name: &str) -> bool {
    name == "zeebe:modelerTemplateIcon" || name.starts_with("bioc:") || name.starts_with("color:")
}

/// A canonical view of a model, plus a per-element index for diffing.
#[derive(Debug, Clone, PartialEq)]
pub struct SemanticProjection {
    /// Canonical JSON of the whole model, presentation excluded.
    pub value: Value,
    /// One entry per element that carries an `id`, projected shallowly: descendants with their
    /// own id appear as that id, so a change is attributed to the element that changed.
    pub elements: IndexMap<String, Value>,
}

/// Drops empties, sorts object keys and sorts array entries by their canonical form.
fn canonicalise(value: &Value, excluded: &[&str]) -> Option<Value> {
    match value {
        Value::Null => None,
        Value::Bool(_) | Value::Number(_) | Value::String(_) => Some(value.clone()),
        Value::Array(items) => {
            let mut entries: Vec<(String, Value)> = items
                .iter()
                .filter_map(|e| canonicalise(e, &[]))
                .map(|e| (stringify(&e), e))
                .collect();
            entries.sort_by(|a, b| cmp_utf16(&a.0, &b.0));
            (!entries.is_empty()).then(|| Value::Array(entries.into_iter().map(|e| e.1).collect()))
        }
        Value::Object(map) => {
            let mut out = Map::new();
            for (key, entry) in sorted_entries(map) {
                if excluded.contains(&key.as_str()) || is_excluded_attribute(key) {
                    continue;
                }
                if let Some(v) = canonicalise(entry, &[]) {
                    out.insert(key.clone(), v);
                }
            }
            (!out.is_empty()).then_some(Value::Object(out))
        }
    }
}

fn id_of(v: &Value) -> Option<&str> {
    v.get("id").and_then(Value::as_str)
}

/// Replaces every descendant that carries its own `id` with that id.
fn shallow(value: &Value) -> Value {
    match value {
        Value::Array(items) => Value::Array(items.iter().map(shallow).collect()),
        Value::Object(map) => {
            let reduce = |v: &Value| match id_of(v) {
                Some(id) if v.is_object() => Value::String(id.to_string()),
                _ => shallow(v),
            };
            let mut out = Map::new();
            for (key, entry) in sorted_entries(map) {
                let v = match entry {
                    _ if key == "id" => entry.clone(),
                    Value::Array(items) => Value::Array(items.iter().map(reduce).collect()),
                    other => reduce(other),
                };
                out.insert(key.clone(), v);
            }
            Value::Object(out)
        }
        other => other.clone(),
    }
}

fn collect_elements(value: &Value, into: &mut IndexMap<String, Value>) {
    match value {
        Value::Array(items) => items.iter().for_each(|e| collect_elements(e, into)),
        Value::Object(map) => {
            if let Some(id) = id_of(value) {
                into.insert(id.to_string(), shallow(value));
            }
            for (_, entry) in sorted_entries(map) {
                collect_elements(entry, into);
            }
        }
        _ => {}
    }
}

/// Projects a model onto its canonical, presentation-free form.
pub fn project_semantics(defs: &BpmnDefinitions) -> SemanticProjection {
    // The model serialises to the same JSON the TypeScript parser produces (conformance/bpmn).
    let raw = serde_json::to_value(defs).unwrap_or(Value::Null);
    let value =
        canonicalise(&raw, &EXCLUDED_DEFINITIONS_KEYS).unwrap_or_else(|| Value::Object(Map::new()));
    let mut elements = IndexMap::new();
    collect_elements(&value, &mut elements);
    SemanticProjection { value, elements }
}

/// The SHA-256 of a projection's canonical JSON.
pub(crate) fn hash_projection(p: &SemanticProjection) -> String {
    sha256_hex(stringify(&p.value).as_bytes())
}

/// SHA-256 (lower-case hex) of a model's canonical projection: stable across formatting,
/// element order, attribute order and any change to the diagram.
pub fn semantic_hash(defs: &BpmnDefinitions) -> String {
    hash_projection(&project_semantics(defs))
}
