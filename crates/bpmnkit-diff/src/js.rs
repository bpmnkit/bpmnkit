//! `JSON.stringify` and UTF-16 ordering, reproduced exactly: the semantic hash is a SHA-256 of
//! the TypeScript implementation's string, so any byte of drift changes it.

use serde_json::Value;
use std::cmp::Ordering;
use std::fmt::Write;

/// Orders strings by UTF-16 code unit, as JavaScript's `<` does. It differs from Rust's byte
/// order only when an astral character meets one in U+E000..=U+FFFF.
pub(crate) fn cmp_utf16(a: &str, b: &str) -> Ordering {
    a.encode_utf16().cmp(b.encode_utf16())
}

/// A number as `JSON.stringify` prints it (`100.0` is `100`, `1e21` is `1e+21`).
pub(crate) fn number(n: &serde_json::Number) -> String {
    if let Some(i) = n.as_i64() {
        return i.to_string();
    }
    if let Some(u) = n.as_u64() {
        return u.to_string();
    }
    f64_to_js(n.as_f64().unwrap_or(0.0))
}

pub(crate) fn f64_to_js(f: f64) -> String {
    if f == 0.0 || !f.is_finite() {
        // `-0` and non-finite values (which JSON has no spelling for) all print as 0 / null.
        return if f.is_finite() {
            "0".into()
        } else {
            "null".into()
        };
    }
    // `{:e}` gives the shortest digits that round-trip, like JS; only the layout differs.
    let sci = format!("{:e}", f.abs());
    let (mantissa, exp) = sci.split_once('e').unwrap_or((&sci, "0"));
    let digits: String = mantissa.chars().filter(|c| *c != '.').collect();
    let k = digits.len() as i32;
    let n = exp.parse::<i32>().unwrap_or(0) + 1;
    let sign = if f < 0.0 { "-" } else { "" };
    let body = if k <= n && n <= 21 {
        format!("{digits}{}", "0".repeat((n - k) as usize))
    } else if 0 < n && n <= 21 {
        format!("{}.{}", &digits[..n as usize], &digits[n as usize..])
    } else if -6 < n && n <= 0 {
        format!("0.{}{digits}", "0".repeat((-n) as usize))
    } else {
        let e = n - 1;
        let sign_e = if e < 0 { '-' } else { '+' };
        if k == 1 {
            format!("{digits}e{sign_e}{}", e.abs())
        } else {
            format!("{}.{}e{sign_e}{}", &digits[..1], &digits[1..], e.abs())
        }
    };
    format!("{sign}{body}")
}

fn string(s: &str, out: &mut String) {
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
            c if (c as u32) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
    out.push('"');
}

/// An object's entries in UTF-16 key order.
pub(crate) fn sorted_entries(map: &serde_json::Map<String, Value>) -> Vec<(&String, &Value)> {
    let mut entries: Vec<_> = map.iter().collect();
    entries.sort_by(|a, b| cmp_utf16(a.0, b.0));
    entries
}

/// `JSON.stringify(value)`, keys in UTF-16 order.
pub(crate) fn stringify(v: &Value) -> String {
    let mut out = String::new();
    write_value(v, &mut out);
    out
}

fn write_value(v: &Value, out: &mut String) {
    match v {
        Value::Null => out.push_str("null"),
        Value::Bool(b) => out.push_str(if *b { "true" } else { "false" }),
        Value::Number(n) => out.push_str(&number(n)),
        Value::String(s) => string(s, out),
        Value::Array(a) => {
            out.push('[');
            for (i, e) in a.iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                write_value(e, out);
            }
            out.push(']');
        }
        Value::Object(m) => {
            out.push('{');
            for (i, (k, e)) in sorted_entries(m).into_iter().enumerate() {
                if i > 0 {
                    out.push(',');
                }
                string(k, out);
                out.push(':');
                write_value(e, out);
            }
            out.push('}');
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn numbers_print_like_javascript() {
        for (f, want) in [
            (100.0, "100"),
            (-0.0, "0"),
            (1.5, "1.5"),
            (0.1, "0.1"),
            (123456789012345680000.0, "123456789012345680000"),
            (1e21, "1e+21"),
            (1.5e300, "1.5e+300"),
            (0.000001, "0.000001"),
            (0.0000001, "1e-7"),
            (1.25e-9, "1.25e-9"),
            (-2.5, "-2.5"),
        ] {
            assert_eq!(f64_to_js(f), want, "{f}");
        }
    }

    #[test]
    fn strings_escape_like_javascript() {
        let v = Value::String("a\"b\\c\n\u{1}\u{7f}\u{2028}/é".into());
        assert_eq!(stringify(&v), "\"a\\\"b\\\\c\\n\\u0001\u{7f}\u{2028}/é\"");
    }

    #[test]
    fn utf16_order_puts_astral_before_high_bmp() {
        assert_eq!(cmp_utf16("\u{1F600}", "\u{FF01}"), Ordering::Less);
        assert_eq!("\u{1F600}".cmp("\u{FF01}"), Ordering::Greater);
    }
}
