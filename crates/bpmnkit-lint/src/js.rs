//! The bits of JavaScript semantics the lint messages depend on: `String(number)`,
//! `JSON.stringify`, `String.prototype.trim`, `Object.entries` order and UTF-16 offsets.

use bpmnkit_form::Json;
use indexmap::IndexMap;

/// JS `String(n)`: shortest round-trip digits, no `.0` on integers, exponent form outside
/// `[1e-6, 1e21)`.
pub(crate) fn number_to_string(n: f64) -> String {
    if n.is_nan() {
        return "NaN".into();
    }
    if n == 0.0 {
        return "0".into();
    }
    if n.is_infinite() {
        return if n > 0.0 { "Infinity" } else { "-Infinity" }.into();
    }
    let sci = format!("{:e}", n.abs());
    let (mantissa, exp) = sci.split_once('e').unwrap_or((&sci, "0"));
    let digits: String = mantissa.chars().filter(char::is_ascii_digit).collect();
    let k = digits.len() as i32;
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

/// JS whitespace for `trim`: Rust's `White_Space` minus U+0085, plus U+FEFF.
fn is_js_space(c: char) -> bool {
    (c.is_whitespace() && c != '\u{85}') || c == '\u{FEFF}'
}

/// `String.prototype.trim`.
pub(crate) fn trim(s: &str) -> &str {
    s.trim_matches(is_js_space)
}

/// A byte offset into `s` as a UTF-16 index, which is what TS positions count.
pub(crate) fn utf16_offset(s: &str, byte: usize) -> usize {
    let end = byte.min(s.len());
    let end = (0..=end)
        .rev()
        .find(|&i| s.is_char_boundary(i))
        .unwrap_or(0);
    s[..end].encode_utf16().count()
}

/// Whether `key` is an array index (`0` … `2^32 - 2`, canonical), which JS objects list
/// before every other key.
fn is_array_index(key: &str) -> bool {
    if key.is_empty() || key.len() > 10 || !key.bytes().all(|b| b.is_ascii_digit()) {
        return false;
    }
    if key.len() > 1 && key.starts_with('0') {
        return false;
    }
    key.parse::<u64>().is_ok_and(|n| n < u32::MAX as u64)
}

/// `Object.entries` order: array indices ascending, then the other keys as inserted.
pub(crate) fn entries<V>(map: &IndexMap<String, V>) -> Vec<(&String, &V)> {
    let mut indices: Vec<(&String, &V)> = map.iter().filter(|(k, _)| is_array_index(k)).collect();
    indices.sort_by_key(|(k, _)| k.parse::<u64>().unwrap_or(0));
    indices.extend(map.iter().filter(|(k, _)| !is_array_index(k)));
    indices
}

/// `JSON.stringify(v)`; `None` is `undefined` (which JS prints as `undefined` in a template).
pub(crate) fn stringify(v: Option<&Json>) -> String {
    match v {
        None => "undefined".into(),
        Some(v) => {
            let mut out = String::new();
            write(&mut out, v);
            out
        }
    }
}

fn write(out: &mut String, v: &Json) {
    match v {
        Json::Null => out.push_str("null"),
        Json::Bool(b) => out.push_str(if *b { "true" } else { "false" }),
        Json::Num(n) if n.is_finite() => out.push_str(&number_to_string(*n)),
        Json::Num(_) => out.push_str("null"),
        Json::Str(s) => write_string(out, s),
        Json::Arr(a) => {
            out.push('[');
            for (i, x) in a.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                write(out, x);
            }
            out.push(']');
        }
        Json::Obj(m) => {
            out.push('{');
            for (i, (k, x)) in entries(m).into_iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                write_string(out, k);
                out.push(':');
                write(out, x);
            }
            out.push('}');
        }
    }
}

pub(crate) fn write_string(out: &mut String, s: &str) {
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

/// `JSON.parse`, with V8's error message when the text is not JSON.
pub(crate) fn parse_json(text: &str) -> Result<Json, String> {
    match serde_json::from_str::<Json>(text) {
        Ok(v) => Ok(v),
        Err(e) => Err(crate::v8_json::syntax_error(text).unwrap_or_else(|| e.to_string())),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn numbers_print_like_js() {
        for (n, s) in [
            (0.0, "0"),
            (16.0, "16"),
            (-1.5, "-1.5"),
            (1e21, "1e+21"),
            (1e-7, "1e-7"),
        ] {
            assert_eq!(number_to_string(n), s);
        }
    }

    #[test]
    fn trim_is_js_trim() {
        assert_eq!(trim("\u{FEFF} a\u{A0}"), "a");
        assert_eq!(trim("\u{85}a"), "\u{85}a");
    }

    #[test]
    fn entries_put_array_indices_first() {
        let m: IndexMap<String, u8> = [("b", 1), ("2", 2), ("a", 3), ("10", 4), ("01", 5)]
            .into_iter()
            .map(|(k, v)| (k.to_string(), v))
            .collect();
        let keys: Vec<&str> = entries(&m).into_iter().map(|(k, _)| k.as_str()).collect();
        assert_eq!(keys, ["2", "10", "b", "a", "01"]);
    }

    #[test]
    fn stringify_is_compact() {
        let v: Json = serde_json::from_str(r#"{"a":[1,"x\n",null],"b":{}}"#).unwrap();
        assert_eq!(stringify(Some(&v)), r#"{"a":[1,"x\n",null],"b":{}}"#);
        assert_eq!(stringify(None), "undefined");
    }

    #[test]
    fn utf16_offsets() {
        assert_eq!(utf16_offset("a😀b", 5), 3);
        assert_eq!(utf16_offset("abc", 2), 2);
    }
}
