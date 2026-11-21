//! JSON Schema subset → [`Schema`] (plan §4, P1 follow-up). Enough to type job variables:
//! `type`, `properties`, `required`, `items`, `enum` (strings), `nullable` unions (`["string","null"]`),
//! local `$ref` (`#/$defs/x`, `#/definitions/x`, `#/components/schemas/x`), `oneOf/anyOf/allOf`
//! and anything else → [`Schema::Any`]. Numbers stay integers or decimal strings in the IR (I4).

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;

/// The typed shape of one variable.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Schema {
    /// Unknown or unsupported: stays a free-form JSON value.
    Any,
    Bool,
    Integer,
    Number,
    String,
    /// String enum, values sorted and de-duplicated.
    Enum {
        values: Vec<String>,
    },
    Array {
        items: Box<Schema>,
    },
    Object {
        properties: BTreeMap<String, Schema>,
        /// Sorted.
        required: Vec<String>,
    },
    /// `null` is allowed besides the inner type.
    Nullable {
        inner: Box<Schema>,
    },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SchemaError {
    /// A `$ref` that is not local, or points nowhere.
    BadRef(String),
    /// `$ref` cycle (recursive types are not supported: the subset has no boxing).
    Recursive(String),
}

impl std::fmt::Display for SchemaError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SchemaError::BadRef(r) => write!(f, "unresolved $ref {r}"),
            SchemaError::Recursive(r) => write!(f, "recursive $ref {r} is not supported"),
        }
    }
}

impl std::error::Error for SchemaError {}

/// Extract the schema; `$ref`s resolve against `root`.
pub fn from_json(root: &Value) -> Result<Schema, SchemaError> {
    convert(root, root, &mut Vec::new())
}

fn convert(v: &Value, root: &Value, stack: &mut Vec<String>) -> Result<Schema, SchemaError> {
    let Value::Object(o) = v else {
        return Ok(Schema::Any);
    };
    if let Some(Value::String(r)) = o.get("$ref") {
        let target = r
            .strip_prefix('#')
            .and_then(|p| root.pointer(p))
            .ok_or_else(|| SchemaError::BadRef(r.clone()))?;
        if stack.contains(r) {
            return Err(SchemaError::Recursive(r.clone()));
        }
        stack.push(r.clone());
        let out = convert(target, root, stack);
        stack.pop();
        return out;
    }
    if o.get("allOf").is_some() || o.get("oneOf").is_some() || o.get("anyOf").is_some() {
        return Ok(Schema::Any);
    }
    let mut nullable = o.get("nullable") == Some(&Value::Bool(true));
    let ty = match o.get("type") {
        Some(Value::String(t)) => Some(t.as_str()),
        Some(Value::Array(ts)) => {
            let names: Vec<&str> = ts.iter().filter_map(Value::as_str).collect();
            nullable |= names.contains(&"null");
            let rest: Vec<&&str> = names.iter().filter(|t| **t != "null").collect();
            if rest.len() == 1 {
                Some(*rest[0])
            } else {
                return Ok(Schema::Any);
            }
        }
        _ => None,
    };
    let base = match ty {
        Some("boolean") => Schema::Bool,
        Some("integer") => Schema::Integer,
        Some("number") => Schema::Number,
        Some("string") => match o.get("enum") {
            Some(Value::Array(vs)) if vs.iter().all(Value::is_string) => {
                let mut values: Vec<String> = vs
                    .iter()
                    .filter_map(|v| v.as_str().map(str::to_owned))
                    .collect();
                values.sort();
                values.dedup();
                Schema::Enum { values }
            }
            _ => Schema::String,
        },
        Some("array") => Schema::Array {
            items: Box::new(match o.get("items") {
                Some(i) => convert(i, root, stack)?,
                None => Schema::Any,
            }),
        },
        Some("object") | None if o.contains_key("properties") || ty == Some("object") => {
            let mut properties = BTreeMap::new();
            if let Some(Value::Object(ps)) = o.get("properties") {
                for (k, p) in ps {
                    properties.insert(k.clone(), convert(p, root, stack)?);
                }
            }
            let mut required: Vec<String> = match o.get("required") {
                Some(Value::Array(rs)) => rs
                    .iter()
                    .filter_map(|r| r.as_str().map(str::to_owned))
                    .collect(),
                _ => Vec::new(),
            };
            required.sort();
            required.dedup();
            Schema::Object {
                properties,
                required,
            }
        }
        _ => Schema::Any,
    };
    Ok(if nullable && base != Schema::Any {
        Schema::Nullable {
            inner: Box::new(base),
        }
    } else {
        base
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn scalars_and_object() {
        let s = from_json(&json!({
            "type": "object",
            "required": ["id", "id", "a"],
            "properties": {
                "id": {"type": "integer"},
                "a": {"type": "string", "enum": ["x", "b", "x"]},
                "n": {"type": ["number", "null"]},
                "tags": {"type": "array", "items": {"type": "string"}},
                "ok": {"type": "boolean"},
                "free": {}
            }
        }))
        .unwrap();
        let Schema::Object {
            properties,
            required,
        } = s
        else {
            panic!()
        };
        assert_eq!(required, ["a", "id"]);
        assert_eq!(properties["id"], Schema::Integer);
        assert_eq!(
            properties["a"],
            Schema::Enum {
                values: vec!["b".into(), "x".into()]
            }
        );
        assert_eq!(
            properties["n"],
            Schema::Nullable {
                inner: Box::new(Schema::Number)
            }
        );
        assert_eq!(properties["free"], Schema::Any);
    }

    #[test]
    fn local_refs_resolve_and_cycles_fail() {
        let root = json!({
            "$ref": "#/$defs/p",
            "$defs": {"p": {"type": "object", "properties": {"x": {"$ref": "#/$defs/i"}}},
                      "i": {"type": "integer"}}
        });
        assert!(matches!(from_json(&root), Ok(Schema::Object { .. })));
        let cyc = json!({"$ref": "#/$defs/a", "$defs": {"a": {"$ref": "#/$defs/a"}}});
        assert!(matches!(from_json(&cyc), Err(SchemaError::Recursive(_))));
        assert!(matches!(
            from_json(&json!({"$ref": "http://x/y"})),
            Err(SchemaError::BadRef(_))
        ));
    }

    #[test]
    fn unsupported_is_any_and_key_order_is_irrelevant() {
        assert_eq!(from_json(&json!({"oneOf": [{}]})).unwrap(), Schema::Any);
        let a = from_json(
            &json!({"type":"object","properties":{"b":{"type":"string"},"a":{"type":"integer"}}}),
        )
        .unwrap();
        let b = from_json(
            &json!({"properties":{"a":{"type":"integer"},"b":{"type":"string"}},"type":"object"}),
        )
        .unwrap();
        assert_eq!(a, b);
    }
}
