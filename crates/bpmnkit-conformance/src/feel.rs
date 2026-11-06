//! Adapter from the neutral [`Value`] to bpmnkit-feel.

use crate::Value;
use bpmnkit_feel::{self as feel, Context, Decimal, ParseOptions};
use std::collections::BTreeMap;

/// Evaluates `expr` as the TS recorder does: parsed without the context's
/// names (so multi-word names are not special), then evaluated with them bound.
pub fn evaluate(expr: &str, context: &BTreeMap<String, Value>) -> Value {
    let mut ctx = Context::new();
    for (k, v) in context {
        match to_feel(v) {
            Some(f) => ctx.insert(k.clone(), f),
            None => return Value::Error,
        };
    }
    match feel::parse(expr, &ParseOptions::default()) {
        Ok(e) => from_feel(&e.evaluate(&ctx)),
        Err(_) => Value::Error,
    }
}

fn to_feel(v: &Value) -> Option<feel::Value> {
    Some(match v {
        Value::Null => feel::Value::Null,
        Value::Boolean(b) => feel::Value::Boolean(*b),
        Value::Number(n) => feel::Value::Number(
            Decimal::from_str_exact(n)
                .or_else(|_| Decimal::from_scientific(n))
                .ok()?,
        ),
        Value::String(s) => feel::Value::String(s.clone()),
        Value::Date(s)
        | Value::Time(s)
        | Value::DateTime(s)
        | Value::DaysTimeDuration(s)
        | Value::YearsMonthsDuration(s) => {
            match feel::evaluate(&format!("@\"{s}\""), &Context::new()) {
                Ok(t) if !t.is_null() => t,
                _ => return None,
            }
        }
        Value::Error => return None,
        Value::List(l) => feel::Value::List(l.iter().map(to_feel).collect::<Option<_>>()?),
        Value::Context(m) => feel::Value::Context(
            m.iter()
                .map(|(k, v)| Some((k.clone(), to_feel(v)?)))
                .collect::<Option<_>>()?,
        ),
    })
}

/// Encodes like the TS recorder: ranges and functions (and anything holding
/// one) are errors; temporals are their `string()`.
pub fn from_feel(v: &feel::Value) -> Value {
    match v {
        feel::Value::Null => Value::Null,
        feel::Value::Boolean(b) => Value::Boolean(*b),
        feel::Value::Number(n) => Value::Number(n.normalize().to_string()),
        feel::Value::String(s) => Value::String(s.clone()),
        feel::Value::Date(_) => Value::Date(v.to_string()),
        feel::Value::Time(_) => Value::Time(v.to_string()),
        feel::Value::DateTime(_) => Value::DateTime(v.to_string()),
        feel::Value::DaysTimeDuration(_) => Value::DaysTimeDuration(v.to_string()),
        feel::Value::YearsMonthsDuration(_) => Value::YearsMonthsDuration(v.to_string()),
        feel::Value::Range(_) | feel::Value::Function(_) => Value::Error,
        feel::Value::List(l) => {
            let items: Vec<_> = l.iter().map(from_feel).collect();
            if items.contains(&Value::Error) {
                Value::Error
            } else {
                Value::List(items)
            }
        }
        feel::Value::Context(m) => {
            let mut out = BTreeMap::new();
            for (k, v) in m {
                let e = from_feel(v);
                if e == Value::Error {
                    return Value::Error;
                }
                out.insert(k.clone(), e);
            }
            Value::Context(out)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn evaluates_with_context() {
        let ctx = BTreeMap::from([("x".to_string(), Value::Number("2".into()))]);
        assert!(evaluate("x + 1", &ctx).canonical_eq(&Value::Number("3".into())));
        assert_eq!(evaluate("1 +", &ctx), Value::Error);
    }

    #[test]
    fn temporal_round_trip() {
        let ctx = BTreeMap::from([("d".to_string(), Value::Date("2024-02-29".into()))]);
        assert_eq!(evaluate("d", &ctx), Value::Date("2024-02-29".into()));
    }
}
