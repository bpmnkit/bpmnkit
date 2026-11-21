//! JS semantics over `serde_json::Value`: the spec text is plain JS data in the TS generator, so
//! truthiness, `String(x)`, `??` and `Object.entries` order are reproduced here.

use bpmnkit_bpmn::js::{is_array_index, js_number_to_string};
use serde_json::{Map, Number, Value};

/// JS truthiness of a present value.
pub fn truthy(v: &Value) -> bool {
    match v {
        Value::Null => false,
        Value::Bool(b) => *b,
        Value::Number(n) => n.as_f64().is_some_and(|f| f != 0.0 && !f.is_nan()),
        Value::String(s) => !s.is_empty(),
        Value::Array(_) | Value::Object(_) => true,
    }
}

pub fn truthy_opt(v: Option<&Value>) -> bool {
    v.is_some_and(truthy)
}

/// `String(x)` for a present value (`None` is `undefined`).
pub fn js_string(v: Option<&Value>) -> String {
    match v {
        None => "undefined".into(),
        Some(Value::Null) => "null".into(),
        Some(Value::Bool(b)) => b.to_string(),
        Some(Value::Number(n)) => n
            .as_f64()
            .map_or_else(|| n.to_string(), js_number_to_string),
        Some(Value::String(s)) => s.clone(),
        Some(Value::Array(a)) => a
            .iter()
            .map(|x| match x {
                Value::Null => String::new(),
                other => js_string(Some(other)),
            })
            .collect::<Vec<_>>()
            .join(","),
        Some(Value::Object(_)) => "[object Object]".into(),
    }
}

/// `a ?? b` over optional JSON values: when `a` is `null` or absent the result is `b` as it is
/// (even `null`).
pub fn nullish<'a>(a: Option<&'a Value>, b: Option<&'a Value>) -> Option<&'a Value> {
    match a {
        Some(Value::Null) | None => b,
        some => some,
    }
}

/// `obj.key` where `obj` may be anything; non-objects have no keys.
pub fn get<'a>(v: &'a Value, key: &str) -> Option<&'a Value> {
    v.as_object().and_then(|m| m.get(key))
}

pub fn get_opt<'a>(v: Option<&'a Value>, key: &str) -> Option<&'a Value> {
    v.and_then(|v| get(v, key))
}

/// `String.prototype.replace(pattern, replacement)` with a string pattern: the first
/// occurrence only, and `$$`, `$&`, `` $` ``, `$'` in the replacement are special.
pub fn replace_first(s: &str, pattern: &str, replacement: &str) -> String {
    let Some(at) = s.find(pattern) else {
        return s.to_owned();
    };
    let (before, after) = (&s[..at], &s[at + pattern.len()..]);
    let mut out = String::from(before);
    let mut chars = replacement.chars().peekable();
    while let Some(c) = chars.next() {
        if c != '$' {
            out.push(c);
            continue;
        }
        match chars.peek() {
            Some('$') => {
                chars.next();
                out.push('$');
            }
            Some('&') => {
                chars.next();
                out.push_str(pattern);
            }
            Some('`') => {
                chars.next();
                out.push_str(before);
            }
            Some('\'') => {
                chars.next();
                out.push_str(after);
            }
            _ => out.push('$'),
        }
    }
    out.push_str(after);
    out
}

/// Re-orders every object the way a JS engine lists it (array-index keys first, ascending, then
/// insertion order) and prints whole floats as integers, as `JSON.stringify` does.
pub fn normalize(v: &mut Value) {
    match v {
        Value::Array(a) => a.iter_mut().for_each(normalize),
        Value::Object(m) => {
            let mut entries: Vec<(String, Value)> = std::mem::take(m).into_iter().collect();
            entries.iter_mut().for_each(|(_, v)| normalize(v));
            let (mut idx, rest): (Vec<_>, Vec<_>) =
                entries.into_iter().partition(|(k, _)| is_array_index(k));
            idx.sort_by_key(|(k, _)| k.parse::<u64>().unwrap_or(0));
            *m = Map::from_iter(idx.into_iter().chain(rest));
        }
        Value::Number(n) => {
            if let Some(f) = n.as_f64() {
                if n.is_f64() && f.fract() == 0.0 && f.abs() < 9.0e15 {
                    *v = Value::Number(Number::from(f as i64));
                }
            }
        }
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn replace_first_handles_dollar_patterns() {
        assert_eq!(replace_first("a{x}b{x}", "{x}", "$&-$$"), "a{x}-$b{x}");
        assert_eq!(replace_first("a{x}b", "{y}", "z"), "a{x}b");
        assert_eq!(replace_first("a{x}b", "{x}", "$1"), "a$1b");
    }

    #[test]
    fn normalize_orders_index_keys_first() {
        let mut v: Value = serde_json::from_str(r#"{"b":1,"10":2,"2":3,"x":1.0}"#).unwrap();
        normalize(&mut v);
        assert_eq!(
            serde_json::to_string(&v).unwrap(),
            r#"{"2":3,"10":2,"b":1,"x":1}"#
        );
    }

    #[test]
    fn string_conversion() {
        assert_eq!(js_string(Some(&json!(2.5))), "2.5");
        assert_eq!(js_string(None), "undefined");
        assert!(!truthy(&json!("")));
        assert!(truthy(&json!({})));
    }
}
