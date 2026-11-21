//! A small OpenAPI 3.0 schema checker over the vendored 8.8 `rest-api.yaml`: enough of the
//! keywords the job schemas use (`$ref`, `allOf`, `oneOf` + `discriminator`, `type`, `nullable`,
//! `enum`, `required`, `properties`, `additionalProperties: false`, `items`, int32/int64 ranges,
//! string lengths) to catch a misspelled, missing, extra or mistyped field.
#![allow(dead_code)]

use std::sync::OnceLock;

use serde_json::Value;

pub fn spec() -> &'static Value {
    static SPEC: OnceLock<Value> = OnceLock::new();
    SPEC.get_or_init(|| {
        let text = include_str!("../../spec/8.8/rest-api.yaml");
        serde_yaml::from_str(text).expect("rest-api.yaml parses")
    })
}

/// The JSON request schema of `method` on `path` (`/jobs/{jobKey}/completion`).
pub fn request_schema(path: &str, method: &str) -> &'static Value {
    let op = &spec()["paths"][path][method];
    assert!(op.is_object(), "{method} {path} is not in the 8.8 spec");
    &op["requestBody"]["content"]["application/json"]["schema"]
}

pub fn schema(name: &str) -> &'static Value {
    let s = &spec()["components"]["schemas"][name];
    assert!(s.is_object(), "schema {name} is not in the 8.8 spec");
    s
}

/// Panics with every violation of `instance` against `schema`.
pub fn assert_valid(schema: &Value, instance: &Value) {
    let mut errors = Vec::new();
    check(schema, instance, "$", &mut errors);
    assert!(
        errors.is_empty(),
        "body violates the 8.8 spec:\n  {}\nbody: {instance}",
        errors.join("\n  ")
    );
}

pub fn violations(schema: &Value, instance: &Value) -> Vec<String> {
    let mut errors = Vec::new();
    check(schema, instance, "$", &mut errors);
    errors
}

fn resolve(schema: &Value) -> &Value {
    match schema.get("$ref").and_then(Value::as_str) {
        Some(r) => {
            let name = r.strip_prefix("#/components/schemas/").expect("local $ref");
            resolve(&spec()["components"]["schemas"][name])
        }
        None => schema,
    }
}

fn check(schema: &Value, v: &Value, at: &str, errors: &mut Vec<String>) {
    let s = resolve(schema);
    if v.is_null() {
        if s.get("nullable") == Some(&Value::Bool(true)) {
            return;
        }
        // A null allOf member defers to its parts (`allOf: [$ref]` + `nullable` patterns).
        if s.get("allOf")
            .and_then(Value::as_array)
            .is_some_and(|parts| {
                parts
                    .iter()
                    .any(|p| resolve(p).get("nullable") == Some(&Value::Bool(true)))
            })
        {
            return;
        }
    }
    if let Some(parts) = s.get("allOf").and_then(Value::as_array) {
        for p in parts {
            check(p, v, at, errors);
        }
    }
    if let Some(options) = s.get("oneOf").and_then(Value::as_array) {
        let by_discriminator = s
            .get("discriminator")
            .and_then(|d| Some((d["propertyName"].as_str()?, d.get("mapping")?)))
            .and_then(|(prop, mapping)| mapping.get(v.get(prop)?.as_str()?));
        match by_discriminator {
            Some(target) => check(&serde_json::json!({ "$ref": target }), v, at, errors),
            None => {
                let ok = options
                    .iter()
                    .filter(|o| violations_at(o, v, at).is_empty())
                    .count();
                if ok != 1 {
                    errors.push(format!("{at}: matches {ok} oneOf branches, expected 1"));
                }
            }
        }
    }
    if let Some(allowed) = s.get("enum").and_then(Value::as_array) {
        if !allowed.contains(v) {
            errors.push(format!("{at}: {v} not in {allowed:?}"));
        }
    }
    match s.get("type").and_then(Value::as_str) {
        Some("object") if !v.is_object() => {
            return errors.push(format!("{at}: expected object, got {v}"))
        }
        Some("array") if !v.is_array() => {
            return errors.push(format!("{at}: expected array, got {v}"))
        }
        Some("string") if !v.is_string() => {
            return errors.push(format!("{at}: expected string, got {v}"))
        }
        Some("boolean") if !v.is_boolean() => {
            return errors.push(format!("{at}: expected boolean, got {v}"))
        }
        Some("integer") if !(v.is_i64() || v.is_u64()) => {
            return errors.push(format!("{at}: expected integer, got {v}"))
        }
        Some("number") if !v.is_number() => {
            return errors.push(format!("{at}: expected number, got {v}"))
        }
        _ => {}
    }
    if let Some(n) = v.as_i64() {
        let (lo, hi) = match s.get("format").and_then(Value::as_str) {
            Some("int32") => (i32::MIN as i64, i32::MAX as i64),
            _ => (i64::MIN, i64::MAX),
        };
        if n < lo || n > hi {
            errors.push(format!("{at}: {n} outside {lo}..={hi}"));
        }
        if let Some(min) = s.get("minimum").and_then(Value::as_i64) {
            if n < min {
                errors.push(format!("{at}: {n} < minimum {min}"));
            }
        }
    }
    if let Some(text) = v.as_str() {
        let len = text.chars().count() as u64;
        if s.get("minLength")
            .and_then(Value::as_u64)
            .is_some_and(|m| len < m)
        {
            errors.push(format!("{at}: shorter than minLength"));
        }
        if s.get("maxLength")
            .and_then(Value::as_u64)
            .is_some_and(|m| len > m)
        {
            errors.push(format!("{at}: longer than maxLength"));
        }
    }
    if let Some(obj) = v.as_object() {
        if let Some(req) = s.get("required").and_then(Value::as_array) {
            for r in req.iter().filter_map(Value::as_str) {
                if !obj.contains_key(r) {
                    errors.push(format!("{at}: missing required {r}"));
                }
            }
        }
        let props = s.get("properties").and_then(Value::as_object);
        for (k, val) in obj {
            match props.and_then(|p| p.get(k)) {
                Some(ps) => check(ps, val, &format!("{at}.{k}"), errors),
                None if s.get("additionalProperties") == Some(&Value::Bool(false)) => {
                    errors.push(format!("{at}: unknown property {k}"))
                }
                None => {}
            }
        }
    }
    if let (Some(items), Some(arr)) = (s.get("items"), v.as_array()) {
        for (i, item) in arr.iter().enumerate() {
            check(items, item, &format!("{at}[{i}]"), errors);
        }
    }
}

fn violations_at(schema: &Value, v: &Value, at: &str) -> Vec<String> {
    let mut e = Vec::new();
    check(schema, v, at, &mut e);
    e
}
