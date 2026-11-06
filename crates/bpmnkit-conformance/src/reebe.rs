//! Adapter from the neutral [`Value`] to reebe-feel (temporary until bpmnkit-feel exists).
//! reebe-feel keeps one duration kind (milliseconds) and no year-month durations, so
//! those conversions are lossy and such cases belong in pending.json.

use crate::Value;
use chrono::{DateTime, NaiveDate, NaiveTime, SecondsFormat};
use reebe_feel::{FeelContext, FeelValue};
use std::collections::BTreeMap;

pub fn evaluate_with_reebe(expr: &str, context: &BTreeMap<String, Value>) -> Value {
    let mut ctx = FeelContext::new();
    for (k, v) in context {
        match to_feel(v) {
            Some(f) => ctx.set(k.clone(), f),
            None => return Value::Error,
        }
    }
    match reebe_feel::evaluate(expr, &ctx) {
        Ok(v) => from_feel(&v),
        Err(_) => Value::Error,
    }
}

fn to_feel(v: &Value) -> Option<FeelValue> {
    Some(match v {
        Value::Null => FeelValue::Null,
        Value::Boolean(b) => FeelValue::Bool(*b),
        Value::Number(n) => match n.parse::<i64>() {
            Ok(i) => FeelValue::Integer(i),
            Err(_) => FeelValue::Float(n.parse().ok()?),
        },
        Value::String(s) => FeelValue::String(s.clone()),
        Value::Date(s) => FeelValue::Date(NaiveDate::parse_from_str(s, "%Y-%m-%d").ok()?),
        Value::Time(s) => FeelValue::Time(NaiveTime::parse_from_str(s, "%H:%M:%S%.f").ok()?),
        Value::DateTime(s) => FeelValue::DateTime(DateTime::parse_from_rfc3339(s).ok()?.into()),
        Value::DaysTimeDuration(s) => FeelValue::Duration(parse_days_time(s)?),
        Value::YearsMonthsDuration(_) | Value::Error => return None,
        Value::List(l) => FeelValue::List(l.iter().map(to_feel).collect::<Option<_>>()?),
        Value::Context(m) => FeelValue::Context(
            m.iter()
                .map(|(k, v)| Some((k.clone(), to_feel(v)?)))
                .collect::<Option<_>>()?,
        ),
    })
}

fn from_feel(v: &FeelValue) -> Value {
    match v {
        FeelValue::Null => Value::Null,
        FeelValue::Bool(b) => Value::Boolean(*b),
        FeelValue::Integer(i) => Value::Number(i.to_string()),
        FeelValue::Float(f) if f.is_finite() => Value::Number(f.to_string()),
        FeelValue::Float(_) => Value::Null,
        FeelValue::String(s) => Value::String(s.clone()),
        FeelValue::List(l) => Value::List(l.iter().map(from_feel).collect()),
        FeelValue::Context(m) => {
            Value::Context(m.iter().map(|(k, v)| (k.clone(), from_feel(v))).collect())
        }
        FeelValue::Date(d) => Value::Date(d.to_string()),
        FeelValue::Time(t) => Value::Time(t.to_string()),
        FeelValue::DateTime(d) => Value::DateTime(d.to_rfc3339_opts(SecondsFormat::AutoSi, true)),
        FeelValue::Duration(ms) => Value::DaysTimeDuration(format_days_time(*ms)),
        // No neutral representation for ranges.
        FeelValue::Range { .. } => Value::Error,
    }
}

fn format_days_time(ms: i64) -> String {
    let sign = if ms < 0 { "-" } else { "" };
    let ms = ms.unsigned_abs();
    let (d, h, m) = (ms / 86_400_000, ms / 3_600_000 % 24, ms / 60_000 % 60);
    let (s, frac) = (ms / 1000 % 60, ms % 1000);
    let mut out = format!("{sign}P");
    if d > 0 {
        out += &format!("{d}D");
    }
    if h > 0 || m > 0 || s > 0 || frac > 0 {
        out += "T";
        if h > 0 {
            out += &format!("{h}H");
        }
        if m > 0 {
            out += &format!("{m}M");
        }
        if s > 0 || frac > 0 {
            out += &if frac > 0 {
                format!("{s}.{frac:03}").trim_end_matches('0').to_string() + "S"
            } else {
                format!("{s}S")
            };
        }
    }
    if out.ends_with('P') {
        out += "T0S";
    }
    out
}

fn parse_days_time(s: &str) -> Option<i64> {
    let (neg, rest) = match s.strip_prefix('-') {
        Some(r) => (true, r),
        None => (false, s),
    };
    let rest = rest.strip_prefix('P')?;
    let (date, time) = rest.split_once('T').unwrap_or((rest, ""));
    let mut ms = 0f64;
    for (part, units) in [
        (date, &[('D', 86_400_000f64)][..]),
        (time, &[('H', 3_600_000.), ('M', 60_000.), ('S', 1000.)][..]),
    ] {
        let mut num = String::new();
        for c in part.chars() {
            if c.is_ascii_digit() || c == '.' {
                num.push(c);
            } else {
                let (_, mult) = units.iter().find(|(u, _)| *u == c)?;
                ms += num.parse::<f64>().ok()? * mult;
                num.clear();
            }
        }
        if !num.is_empty() {
            return None;
        }
    }
    let ms = ms.round() as i64;
    Some(if neg { -ms } else { ms })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn duration_roundtrip() {
        for s in ["P1DT2H3M4S", "PT0S", "-PT1.5S", "P2D"] {
            assert_eq!(format_days_time(parse_days_time(s).unwrap()), s);
        }
    }

    #[test]
    fn evaluates_with_context() {
        let ctx = BTreeMap::from([("x".to_string(), Value::Number("2".into()))]);
        assert!(evaluate_with_reebe("x + 1", &ctx).canonical_eq(&Value::Number("3".into())));
        assert_eq!(evaluate_with_reebe("1 +", &ctx), Value::Error);
    }
}
