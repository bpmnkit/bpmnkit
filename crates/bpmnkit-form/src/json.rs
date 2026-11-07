//! An order-preserving JSON value with JS number semantics.
//!
//! Forms keep unknown keys verbatim and `exportForm` writes them back in the order they were
//! read, so object order is data here. `serde_json::Value` would sort it away unless the
//! `preserve_order` feature were switched on for the whole workspace.

use indexmap::IndexMap;
use serde::de::{MapAccess, SeqAccess, Visitor};
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

/// A JSON value. Numbers are doubles, as in JS.
#[derive(Debug, Clone, PartialEq)]
pub enum Json {
    Null,
    Bool(bool),
    Num(f64),
    Str(String),
    Arr(Vec<Json>),
    /// Duplicate keys keep the first position and the last value, as `JSON.parse` does.
    Obj(IndexMap<String, Json>),
}

/// A JS number. Serializes integers without a fraction, so a model dumped as JSON reads `3`,
/// not `3.0`.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct JsNumber(pub f64);

impl Serialize for JsNumber {
    fn serialize<S: Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        let n = self.0;
        if n.fract() == 0.0 && n.abs() < 9_007_199_254_740_992.0 {
            s.serialize_i64(n as i64)
        } else if n.is_finite() {
            s.serialize_f64(n)
        } else {
            // JSON.stringify writes NaN and Infinity as null.
            s.serialize_unit()
        }
    }
}

impl Serialize for Json {
    fn serialize<S: Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        match self {
            Json::Null => s.serialize_unit(),
            Json::Bool(b) => s.serialize_bool(*b),
            Json::Num(n) => JsNumber(*n).serialize(s),
            Json::Str(v) => s.serialize_str(v),
            Json::Arr(v) => v.serialize(s),
            Json::Obj(m) => m.serialize(s),
        }
    }
}

impl<'de> Deserialize<'de> for Json {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        struct V;
        impl<'de> Visitor<'de> for V {
            type Value = Json;
            fn expecting(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                f.write_str("any JSON value")
            }
            fn visit_unit<E>(self) -> Result<Json, E> {
                Ok(Json::Null)
            }
            fn visit_bool<E>(self, v: bool) -> Result<Json, E> {
                Ok(Json::Bool(v))
            }
            fn visit_i64<E>(self, v: i64) -> Result<Json, E> {
                Ok(Json::Num(v as f64))
            }
            fn visit_u64<E>(self, v: u64) -> Result<Json, E> {
                Ok(Json::Num(v as f64))
            }
            fn visit_f64<E>(self, v: f64) -> Result<Json, E> {
                Ok(Json::Num(v))
            }
            fn visit_str<E>(self, v: &str) -> Result<Json, E> {
                Ok(Json::Str(v.to_owned()))
            }
            fn visit_string<E>(self, v: String) -> Result<Json, E> {
                Ok(Json::Str(v))
            }
            fn visit_seq<A: SeqAccess<'de>>(self, mut a: A) -> Result<Json, A::Error> {
                let mut v = Vec::new();
                while let Some(x) = a.next_element()? {
                    v.push(x);
                }
                Ok(Json::Arr(v))
            }
            fn visit_map<A: MapAccess<'de>>(self, mut a: A) -> Result<Json, A::Error> {
                let mut m = IndexMap::new();
                while let Some((k, v)) = a.next_entry::<String, Json>()? {
                    m.insert(k, v);
                }
                Ok(Json::Obj(m))
            }
        }
        d.deserialize_any(V)
    }
}

impl Json {
    /// JS `String(v)`.
    pub(crate) fn to_js_string(&self) -> String {
        match self {
            Json::Null => "null".into(),
            Json::Bool(b) => b.to_string(),
            Json::Num(n) => js_number_to_string(*n),
            Json::Str(s) => s.clone(),
            // Array.prototype.toString: join(","), null and undefined as empty.
            Json::Arr(v) => v
                .iter()
                .map(|x| {
                    if *x == Json::Null {
                        String::new()
                    } else {
                        x.to_js_string()
                    }
                })
                .collect::<Vec<_>>()
                .join(","),
            Json::Obj(_) => "[object Object]".into(),
        }
    }
}

/// `JSON.stringify(v, null, 2)`.
pub(crate) fn stringify_pretty(v: &Json) -> String {
    let mut out = String::new();
    write(&mut out, v, 0);
    out
}

fn indent(out: &mut String, depth: usize) {
    out.push('\n');
    for _ in 0..depth {
        out.push_str("  ");
    }
}

fn write(out: &mut String, v: &Json, depth: usize) {
    match v {
        Json::Null => out.push_str("null"),
        Json::Bool(b) => out.push_str(if *b { "true" } else { "false" }),
        Json::Num(n) if n.is_finite() => out.push_str(&js_number_to_string(*n)),
        Json::Num(_) => out.push_str("null"),
        Json::Str(s) => write_string(out, s),
        Json::Arr(a) if a.is_empty() => out.push_str("[]"),
        Json::Arr(a) => {
            out.push('[');
            for (i, x) in a.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                indent(out, depth + 1);
                write(out, x, depth + 1);
            }
            indent(out, depth);
            out.push(']');
        }
        Json::Obj(m) if m.is_empty() => out.push_str("{}"),
        Json::Obj(m) => {
            out.push('{');
            for (i, (k, x)) in m.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                indent(out, depth + 1);
                write_string(out, k);
                out.push_str(": ");
                write(out, x, depth + 1);
            }
            indent(out, depth);
            out.push('}');
        }
    }
}

fn write_string(out: &mut String, s: &str) {
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\u{8}' => out.push_str("\\b"),
            '\u{c}' => out.push_str("\\f"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out.push('"');
}

/// JS `String(n)`: shortest round-trip digits, no `.0` on integers, exponent form outside
/// `[1e-6, 1e21)`.
pub(crate) fn js_number_to_string(n: f64) -> String {
    if n.is_nan() {
        return "NaN".into();
    }
    if n == 0.0 {
        return "0".into();
    }
    if n.is_infinite() {
        return if n > 0.0 { "Infinity" } else { "-Infinity" }.into();
    }
    // `{:e}` gives the shortest digits that round-trip: "d.ddde<exp>".
    let sci = format!("{:e}", n.abs());
    let (mantissa, exp) = sci.split_once('e').unwrap_or((&sci, "0"));
    let digits: String = mantissa.chars().filter(char::is_ascii_digit).collect();
    let k = digits.len() as i32;
    // The decimal point sits n_pos digits from the left of `digits`.
    let n_pos = exp.parse::<i32>().unwrap_or(0) + 1;
    let mut out = String::new();
    if n < 0.0 {
        out.push('-');
    }
    if k <= n_pos && n_pos <= 21 {
        out.push_str(&digits);
        out.extend(std::iter::repeat_n('0', (n_pos - k) as usize));
    } else if 0 < n_pos && n_pos <= 21 {
        out.push_str(&digits[..n_pos as usize]);
        out.push('.');
        out.push_str(&digits[n_pos as usize..]);
    } else if -6 < n_pos && n_pos <= 0 {
        out.push_str("0.");
        out.extend(std::iter::repeat_n('0', (-n_pos) as usize));
        out.push_str(&digits);
    } else {
        let e = n_pos - 1;
        out.push_str(&digits[..1]);
        if k > 1 {
            out.push('.');
            out.push_str(&digits[1..]);
        }
        out.push('e');
        out.push(if e < 0 { '-' } else { '+' });
        out.push_str(&e.abs().to_string());
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn numbers_print_like_js() {
        for (n, s) in [
            (0.0, "0"),
            (-0.0, "0"),
            (16.0, "16"),
            (-12.0, "-12"),
            (1.5, "1.5"),
            (0.1 + 0.2, "0.30000000000000004"),
            (0.000001, "0.000001"),
            (0.0000001, "1e-7"),
            (1e21, "1e+21"),
            (123456789012345680000.0, "123456789012345680000"),
        ] {
            assert_eq!(js_number_to_string(n), s);
        }
    }

    #[test]
    fn stringify_matches_json_stringify() {
        let v: Json =
            serde_json::from_str(r#"{"a":[],"b":{},"c":[1,{"d":"x\u0001\n\""}],"e":null}"#)
                .unwrap();
        assert_eq!(
            stringify_pretty(&v),
            "{\n  \"a\": [],\n  \"b\": {},\n  \"c\": [\n    1,\n    {\n      \"d\": \"x\\u0001\\n\\\"\"\n    }\n  ],\n  \"e\": null\n}"
        );
    }

    #[test]
    fn duplicate_keys_keep_first_position_last_value() {
        let v: Json = serde_json::from_str(r#"{"a":1,"b":2,"a":3}"#).unwrap();
        assert_eq!(stringify_pretty(&v), "{\n  \"a\": 3,\n  \"b\": 2\n}");
    }

    #[test]
    fn to_js_string_follows_string_of() {
        let v: Json = serde_json::from_str(r#"[1,null,[2,true],{"a":1}]"#).unwrap();
        assert_eq!(v.to_js_string(), "1,,2,true,[object Object]");
    }
}
