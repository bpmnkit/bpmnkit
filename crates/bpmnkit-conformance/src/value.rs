use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// Language-neutral FEEL value, as written in the case files.
/// Numbers are decimal strings so no implementation loses precision.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "t", content = "v", rename_all = "kebab-case")]
pub enum Value {
    Null,
    Boolean(bool),
    Number(String),
    String(String),
    Date(String),
    Time(String),
    DateTime(String),
    DaysTimeDuration(String),
    YearsMonthsDuration(String),
    List(Vec<Value>),
    Context(BTreeMap<String, Value>),
    Error,
}

impl Value {
    /// Structural equality where numbers compare as decimals ("1.0" == "1").
    /// Context key order is irrelevant; list order is not.
    pub fn canonical_eq(&self, other: &Value) -> bool {
        use Value::*;
        match (self, other) {
            (Number(a), Number(b)) => decimal_eq(a, b),
            (List(a), List(b)) => {
                a.len() == b.len() && a.iter().zip(b).all(|(x, y)| x.canonical_eq(y))
            }
            (Context(a), Context(b)) => {
                a.len() == b.len()
                    && a.iter()
                        .all(|(k, x)| b.get(k).is_some_and(|y| x.canonical_eq(y)))
            }
            _ => self == other,
        }
    }
}

/// (negative, digits without leading/trailing zeros, decimal exponent of the last digit).
fn normalize(s: &str) -> Option<(bool, String, i64)> {
    let s = s.trim();
    let (neg, s) = match s.strip_prefix('-') {
        Some(r) => (true, r),
        None => (false, s.strip_prefix('+').unwrap_or(s)),
    };
    let (mant, exp) = match s.find(['e', 'E']) {
        Some(i) => (&s[..i], s[i + 1..].parse::<i64>().ok()?),
        None => (s, 0),
    };
    let (int, frac) = mant.split_once('.').unwrap_or((mant, ""));
    if int.is_empty() && frac.is_empty()
        || !int.bytes().chain(frac.bytes()).all(|b| b.is_ascii_digit())
    {
        return None;
    }
    let digits = format!("{int}{frac}");
    let mut exp = exp - frac.len() as i64;
    let trimmed = digits.trim_start_matches('0');
    let body = trimmed.trim_end_matches('0');
    exp += (trimmed.len() - body.len()) as i64;
    if body.is_empty() {
        return Some((false, String::new(), 0)); // zero, sign-insensitive
    }
    Some((neg, body.to_string(), exp))
}

/// Significant digits float64 always round-trips. TS (the recorder) computes in
/// float64 and Rust in exact decimals, so `0.1 + 0.2` is recorded as
/// `0.30000000000000004` and computed as `0.3`; agreeing to this many digits is
/// agreement. Exactly-representable results still compare exactly.
const FLOAT64_DIGITS: usize = 15;

/// Rounds `(neg, digits, exp)` half-up to [`FLOAT64_DIGITS`] significant digits.
fn round_float64((neg, digits, exp): (bool, String, i64)) -> (bool, String, i64) {
    if digits.len() <= FLOAT64_DIGITS {
        return (neg, digits, exp);
    }
    let cut = digits.len() - FLOAT64_DIGITS;
    let mut kept: Vec<u8> = digits.as_bytes()[..FLOAT64_DIGITS].to_vec();
    let mut exp = exp + cut as i64;
    if digits.as_bytes()[FLOAT64_DIGITS] >= b'5' {
        let mut i = kept.len();
        loop {
            if i == 0 {
                kept.insert(0, b'1');
                break;
            }
            i -= 1;
            if kept[i] == b'9' {
                kept[i] = b'0';
            } else {
                kept[i] += 1;
                break;
            }
        }
    }
    let s = String::from_utf8(kept).unwrap_or_default();
    let body = s.trim_end_matches('0');
    exp += (s.len() - body.len()) as i64;
    (neg, body.to_string(), exp)
}

/// Decimal equality on string representations, to float64's precision (see
/// `FLOAT64_DIGITS`); unparsable input falls back to string equality.
pub fn decimal_eq(a: &str, b: &str) -> bool {
    match (normalize(a), normalize(b)) {
        (Some(x), Some(y)) => x == y || round_float64(x) == round_float64(y),
        _ => a == b,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn decimals() {
        assert!(decimal_eq("1.0", "1"));
        assert!(decimal_eq("100", "1e2"));
        assert!(decimal_eq("0.50", ".5"));
        assert!(decimal_eq("-0", "0.0"));
        assert!(!decimal_eq("1.01", "1.1"));
        assert!(!decimal_eq("-1", "1"));
        assert!(!decimal_eq("10", "1"));
        assert!(decimal_eq("0.30000000000000004", "0.3"));
        assert!(decimal_eq(
            "0.3333333333333333",
            "0.3333333333333333333333333333"
        ));
        assert!(decimal_eq("0.9999999999999999", "1"));
        assert!(!decimal_eq("0.30000000000004", "0.3"));
    }

    #[test]
    fn serde_shape() {
        let v: Value = serde_json::from_str(r#"{"t":"days-time-duration","v":"P1D"}"#).unwrap();
        assert_eq!(v, Value::DaysTimeDuration("P1D".into()));
        let v: Value = serde_json::from_str(r#"{"t":"error"}"#).unwrap();
        assert_eq!(v, Value::Error);
        let v: Value =
            serde_json::from_str(r#"{"t":"date-time","v":"2024-01-01T00:00:00Z"}"#).unwrap();
        assert!(matches!(v, Value::DateTime(_)));
    }

    #[test]
    fn canonical_compare() {
        let a: Value = serde_json::from_str(
            r#"{"t":"list","v":[{"t":"number","v":"1.0"},{"t":"context","v":{"a":{"t":"number","v":"2"}}}]}"#,
        )
        .unwrap();
        let b: Value = serde_json::from_str(
            r#"{"t":"list","v":[{"t":"number","v":"1"},{"t":"context","v":{"a":{"t":"number","v":"2.00"}}}]}"#,
        )
        .unwrap();
        assert!(a.canonical_eq(&b));
        assert!(!a.canonical_eq(&Value::Null));
    }
}
