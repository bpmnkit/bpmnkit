//! Conversion functions (`builtins.ts`, "Conversion functions"): `string`,
//! `number`, `context`, `date`, `time`, `date and time`, `duration`,
//! `years and months duration`.

use super::BuiltinFn;
use crate::ops::to_feel_string;
use crate::temporal::{
    in_timezone, is_valid_time, make_date, parse_date, parse_date_time, parse_duration, parse_time,
    time_to_seconds,
};
use crate::value::{Context, Date, DateTime, Time, Value, YearsMonthsDuration};
use regex::Regex;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use std::sync::LazyLock;

pub fn lookup(name: &str) -> Option<BuiltinFn> {
    Some(match name {
        "string" => string,
        "number" => number,
        "context" => context,
        "date" => date,
        "time" => time,
        "date and time" => date_and_time,
        "duration" => duration,
        "years and months duration" => years_and_months_duration,
        _ => return None,
    })
}

fn arg(args: &[Value], i: usize) -> &Value {
    args.get(i).unwrap_or(&Value::Null)
}

/// An integral number argument.
fn int(v: &Value) -> Option<i64> {
    match v {
        Value::Number(n) if n.fract().is_zero() => n.to_i64(),
        _ => None,
    }
}

fn string(args: &[Value]) -> Value {
    to_feel_string(arg(args, 0)).map_or(Value::Null, Value::String)
}

// JS whitespace: Rust's set plus U+FEFF, minus U+0085.
fn is_js_space(c: char) -> bool {
    (c.is_whitespace() && c != '\u{85}') || c == '\u{FEFF}'
}

static NUMBER_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^([+-]?)([0-9]*)(?:\.([0-9]*))?(?:[eE]([+-]?[0-9]+))?$").unwrap()
});

/// What JS `Number(text)` accepts for plain decimal notation (no hex, no
/// `Infinity`), exactly.
fn parse_js_number(text: &str) -> Option<Decimal> {
    let m = NUMBER_RE.captures(text.trim_matches(is_js_space))?;
    let int_part = &m[2];
    let frac = m.get(3).map_or("", |f| f.as_str());
    if int_part.is_empty() && frac.is_empty() {
        return None;
    }
    let mut s = String::from(if int_part.is_empty() { "0" } else { int_part });
    if !frac.is_empty() {
        s.push('.');
        s.push_str(frac);
    }
    let n = match m.get(4) {
        Some(e) => Decimal::from_scientific(&format!("{s}e{}", e.as_str())).ok()?,
        None => s.parse::<Decimal>().ok()?,
    };
    Some(if &m[1] == "-" { -n } else { n })
}

/// A `number()` separator: `Ok(None)` when absent, `Err` when not allowed.
fn separator(v: Option<&Value>, allowed: &[&str]) -> Result<Option<String>, ()> {
    match v {
        None | Some(Value::Null) => Ok(None),
        Some(Value::String(s)) if allowed.contains(&s.as_str()) => Ok(Some(s.clone())),
        Some(_) => Err(()),
    }
}

fn number(args: &[Value]) -> Value {
    let has_separators = args.len() > 1;
    let text = match arg(args, 0) {
        Value::Number(n) => {
            return if has_separators {
                Value::Null
            } else {
                Value::Number(*n)
            }
        }
        Value::String(s) => s,
        _ => return Value::Null,
    };
    let (Ok(grouping), Ok(decimal)) = (
        separator(args.get(1), &[" ", ",", "."]),
        separator(args.get(2), &[",", "."]),
    ) else {
        return Value::Null;
    };
    if grouping.is_some() && grouping == decimal {
        return Value::Null;
    }
    let mut text = text.clone();
    if let Some(g) = &grouping {
        text = text.replace(g.as_str(), "");
    }
    if let Some(d) = &decimal {
        text = text.replace(d.as_str(), ".");
    }
    parse_js_number(&text).map_or(Value::Null, Value::Number)
}

fn context(args: &[Value]) -> Value {
    let single;
    let list: &[Value] = match arg(args, 0) {
        Value::List(l) => l,
        v => {
            single = [v.clone()];
            &single
        }
    };
    let mut result = Context::new();
    for item in list {
        let Value::Context(entry) = item else {
            return Value::Null;
        };
        let Some(Value::String(key)) = entry.get("key") else {
            return Value::Null;
        };
        // An entry naming a key already set is a conflict, not an overwrite.
        if result.contains_key(key) {
            return Value::Null;
        }
        result.insert(
            key.clone(),
            entry.get("value").cloned().unwrap_or(Value::Null),
        );
    }
    Value::Context(result)
}

fn date(args: &[Value]) -> Value {
    match args.len() {
        1 => match &args[0] {
            Value::String(s) => parse_date(s).map_or(Value::Null, Value::Date),
            Value::DateTime(dt) => Value::Date(dt.date),
            v @ Value::Date(_) => v.clone(),
            _ => Value::Null,
        },
        3 => match (int(&args[0]), int(&args[1]), int(&args[2])) {
            (Some(y), Some(m), Some(d)) => make_date(y, m, d).map_or(Value::Null, Value::Date),
            _ => Value::Null,
        },
        _ => Value::Null,
    }
}

fn midnight() -> Time {
    Time {
        hour: 0,
        minute: 0,
        second: Decimal::ZERO,
        offset: None,
        timezone: None,
    }
}

fn time(args: &[Value]) -> Value {
    if args.len() == 1 {
        return match &args[0] {
            // ISO 8601's time designator may lead: time("T23:59:00").
            Value::String(s) => {
                parse_time(s.strip_prefix('T').unwrap_or(s)).map_or(Value::Null, Value::Time)
            }
            Value::DateTime(dt) => Value::Time(dt.time.clone()),
            v @ Value::Time(_) => v.clone(),
            Value::Date(_) => Value::Time(midnight()),
            _ => Value::Null,
        };
    }
    if args.len() < 3 {
        return Value::Null;
    }
    // The TS twin lets a fractional hour or minute through; they are errors here.
    let (Some(h), Some(m), Value::Number(s)) = (int(&args[0]), int(&args[1]), &args[2]) else {
        return Value::Null;
    };
    if !is_valid_time(h, m, *s) {
        return Value::Null;
    }
    let offset = match args.get(3) {
        Some(Value::DaysTimeDuration(d)) => match d.seconds.to_i32() {
            Some(o) if d.seconds.fract().is_zero() => Some(o),
            _ => return Value::Null,
        },
        _ => None,
    };
    Value::Time(Time {
        hour: h as u8,
        minute: m as u8,
        second: *s,
        offset,
        timezone: None,
    })
}

fn date_and_time(args: &[Value]) -> Value {
    match args {
        [Value::String(s)] => parse_date_time(s).map_or(Value::Null, Value::DateTime),
        [Value::Date(d), Value::Time(t)] => Value::DateTime(DateTime {
            date: *d,
            time: t.clone(),
        }),
        [Value::DateTime(d), Value::Time(t)] => Value::DateTime(DateTime {
            date: d.date,
            time: t.clone(),
        }),
        [Value::DateTime(d), Value::String(zone)] => {
            in_timezone(d, zone).map_or(Value::Null, Value::DateTime)
        }
        _ => Value::Null,
    }
}

fn duration(args: &[Value]) -> Value {
    match arg(args, 0) {
        Value::String(s) => parse_duration(s).unwrap_or(Value::Null),
        _ => Value::Null,
    }
}

fn date_of(v: &Value) -> Option<Date> {
    match v {
        Value::Date(d) => Some(*d),
        Value::DateTime(dt) => Some(dt.date),
        _ => None,
    }
}

/// Day of month and time of day, the parts that decide whether the last
/// month was completed.
fn within_month(v: &Value) -> (i64, Decimal) {
    match v {
        Value::Date(d) => (i64::from(d.day), Decimal::ZERO),
        // The TS twin resolves the time's offset on epoch day 0.
        Value::DateTime(dt) => (i64::from(dt.date.day), time_to_seconds(&dt.time, 0)),
        _ => (0, Decimal::ZERO),
    }
}

fn years_and_months_duration(args: &[Value]) -> Value {
    let (Some(d1), Some(d2)) = (date_of(arg(args, 0)), date_of(arg(args, 1))) else {
        return Value::Null;
    };
    let mut months = (i64::from(d2.year) - i64::from(d1.year)) * 12
        + (i64::from(d2.month) - i64::from(d1.month));
    // Only whole months count: an end that has not reached the start's
    // day-and-time within the month gives back the month it was counted.
    let (day_a, sec_a) = within_month(arg(args, 0));
    let (day_b, sec_b) = within_month(arg(args, 1));
    let remainder = if day_b != day_a {
        day_b - day_a
    } else {
        match (sec_b - sec_a).cmp(&Decimal::ZERO) {
            std::cmp::Ordering::Less => -1,
            std::cmp::Ordering::Equal => 0,
            std::cmp::Ordering::Greater => 1,
        }
    };
    if months > 0 && remainder < 0 {
        months -= 1;
    } else if months < 0 && remainder > 0 {
        months += 1;
    }
    Value::YearsMonthsDuration(YearsMonthsDuration { months })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::temporal::parse_temporal;

    fn n(s: &str) -> Value {
        Value::Number(s.parse().unwrap())
    }
    fn call(name: &str, args: &[Value]) -> Value {
        lookup(name).unwrap()(args)
    }
    fn tm(s: &str) -> Value {
        parse_temporal(s)
    }
    fn st(s: &str) -> Value {
        Value::from(s)
    }

    #[test]
    fn string_renders_like_feel() {
        assert_eq!(call("string", &[n("1.50")]), st("1.5"));
        assert_eq!(call("string", &[Value::Boolean(true)]), st("true"));
        assert_eq!(call("string", &[Value::Null]), Value::Null);
        assert_eq!(call("string", &[st("x")]), st("x"));
        assert_eq!(
            call("string", &[Value::List(vec![n("1"), st("a")])]),
            st("[1, \"a\"]")
        );
        assert_eq!(call("string", &[tm("2024-01-02")]), st("2024-01-02"));
        assert_eq!(call("string", &[tm("P1DT2H")]), st("P1DT2H"));
        assert_eq!(call("string", &[tm("-P1Y2M")]), st("-P1Y2M"));
        assert_eq!(call("string", &[tm("PT0S")]), st("PT0S"));
        assert_eq!(call("string", &[n("0.1")]), st("0.1"));
    }

    #[test]
    fn number_parses_exactly() {
        assert_eq!(call("number", &[st("3.14")]), n("3.14"));
        assert_eq!(call("number", &[st("0.1")]), n("0.1"));
        assert_eq!(call("number", &[st(" 12 ")]), n("12"));
        assert_eq!(call("number", &[st("-.5")]), n("-0.5"));
        assert_eq!(call("number", &[st("5.")]), n("5"));
        assert_eq!(call("number", &[st("1e3")]), n("1000"));
        assert_eq!(call("number", &[st("abc")]), Value::Null);
        assert_eq!(call("number", &[st("")]), Value::Null);
        assert_eq!(call("number", &[st(".")]), Value::Null);
        assert_eq!(call("number", &[n("5")]), n("5"));
        assert_eq!(call("number", &[n("5"), st(",")]), Value::Null);
        assert_eq!(call("number", &[Value::Null]), Value::Null);
        assert_eq!(
            call("number", &[st("1,000.5"), st(","), st(".")]),
            n("1000.5")
        );
        assert_eq!(
            call("number", &[st("1.000,5"), st("."), st(",")]),
            n("1000.5")
        );
        assert_eq!(call("number", &[st("1 000"), st(" ")]), n("1000"));
        assert_eq!(call("number", &[st("1.5"), Value::Null, st(".")]), n("1.5"));
        assert_eq!(call("number", &[st("1.5"), st("."), st(".")]), Value::Null);
        assert_eq!(call("number", &[st("1.5"), st("x")]), Value::Null);
    }

    #[test]
    fn context_from_entries() {
        let entry = |k: &str, v: i32| {
            Value::Context(
                [
                    ("key".to_owned(), st(k)),
                    ("value".to_owned(), Value::from(v)),
                ]
                .into_iter()
                .collect(),
            )
        };
        let r = call(
            "context",
            &[Value::List(vec![entry("b", 1), entry("a", 2)])],
        );
        let Value::Context(c) = &r else { panic!() };
        assert_eq!(c.keys().collect::<Vec<_>>(), ["b", "a"]);
        assert_eq!(c.get("a"), Some(&n("2")));
        let single = call("context", &[entry("a", 1)]);
        assert!(matches!(single, Value::Context(_)));
        assert_eq!(
            call(
                "context",
                &[Value::List(vec![entry("a", 1), entry("a", 2)])]
            ),
            Value::Null
        );
        assert_eq!(call("context", &[Value::List(vec![n("1")])]), Value::Null);
        assert_eq!(
            call("context", &[Value::List(vec![])]),
            Value::Context(Context::new())
        );
    }

    #[test]
    fn date_time_conversions() {
        assert_eq!(call("date", &[st("2017-01-01")]), tm("2017-01-01"));
        assert_eq!(call("date", &[st("2017-02-30")]), Value::Null);
        assert_eq!(call("date", &[n("2017"), n("1"), n("1")]), tm("2017-01-01"));
        assert_eq!(call("date", &[n("2017"), n("13"), n("1")]), Value::Null);
        assert_eq!(call("date", &[n("2017"), n("1.5"), n("1")]), Value::Null);
        assert_eq!(call("date", &[tm("2017-03-04T10:00:00")]), tm("2017-03-04"));
        assert_eq!(call("date", &[n("1")]), Value::Null);
        assert_eq!(call("time", &[st("10:11:12")]), tm("10:11:12"));
        assert_eq!(call("time", &[st("T23:59:00")]), tm("23:59:00"));
        assert_eq!(call("time", &[tm("2017-03-04T10:11:12Z")]), tm("10:11:12Z"));
        assert_eq!(call("time", &[tm("2017-03-04")]), tm("00:00:00"));
        assert_eq!(call("time", &[n("10"), n("11"), n("12")]), tm("10:11:12"));
        assert_eq!(
            call("time", &[n("10"), n("11"), n("12"), tm("PT1H")]),
            tm("10:11:12+01:00")
        );
        assert_eq!(
            call("time", &[n("10"), n("11"), n("12"), Value::Null]),
            tm("10:11:12")
        );
        assert_eq!(call("time", &[n("25"), n("0"), n("0")]), Value::Null);
        assert_eq!(call("time", &[n("24"), n("0"), n("0")]), tm("24:00:00"));
        assert_eq!(
            call("date and time", &[st("2017-01-01T10:00:00Z")]),
            tm("2017-01-01T10:00:00Z")
        );
        assert_eq!(
            call("date and time", &[st("2017-01-01")]),
            tm("2017-01-01T00:00:00")
        );
        assert_eq!(
            call("date and time", &[tm("2017-01-01"), tm("10:00:00")]),
            tm("2017-01-01T10:00:00")
        );
        assert_eq!(
            call(
                "date and time",
                &[tm("2017-01-01T05:00:00Z"), tm("10:00:00")]
            ),
            tm("2017-01-01T10:00:00")
        );
        assert_eq!(
            call(
                "date and time",
                &[tm("2024-01-01T10:00:00Z"), st("Europe/Berlin")]
            ),
            tm("2024-01-01T11:00:00@Europe/Berlin")
        );
        assert_eq!(
            call("date and time", &[tm("2024-01-01T10:00:00Z"), st("+02:00")]),
            tm("2024-01-01T12:00:00+02:00")
        );
        assert_eq!(
            call("date and time", &[tm("2024-01-01T10:00:00"), st("Z")]),
            Value::Null
        );
        assert_eq!(call("date and time", &[st("nope")]), Value::Null);
    }

    #[test]
    fn durations() {
        assert_eq!(call("duration", &[st("P1DT2H")]), tm("P1DT2H"));
        assert_eq!(call("duration", &[st("P1Y2M")]), tm("P1Y2M"));
        assert_eq!(call("duration", &[st("x")]), Value::Null);
        assert_eq!(call("duration", &[n("1")]), Value::Null);
        let ym = |a: &str, b: &str| call("years and months duration", &[tm(a), tm(b)]);
        assert_eq!(ym("2011-12-22", "2013-08-24"), tm("P1Y8M"));
        assert_eq!(ym("2011-12-22", "2013-08-21"), tm("P1Y7M"));
        assert_eq!(ym("2013-08-24", "2011-12-22"), tm("-P1Y8M"));
        assert_eq!(ym("2013-08-21", "2011-12-22"), tm("-P1Y7M"));
        assert_eq!(ym("2013-08-24", "2011-12-26"), tm("-P1Y7M"));
        assert_eq!(
            ym("2011-12-22T10:00:00", "2013-08-24T09:00:00"),
            tm("P1Y8M")
        );
        assert_eq!(
            call("years and months duration", &[n("1"), tm("2013-08-24")]),
            Value::Null
        );
    }
}
