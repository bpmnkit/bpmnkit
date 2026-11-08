//! Value semantics shared by the evaluator and the built-ins: comparison,
//! equality, arithmetic (numbers, temporals, durations), properties, `string()`.
//! Ports `compareValues`, `deepEquals`, `stringify` from builtins.ts, the
//! arithmetic of evaluator.ts (`evalBinary`, `addDuration`, `subtractValues`)
//! and `getProperty` from types.ts.
// Some helpers are only consumed by the built-ins port.

use crate::temporal::{
    date_time_to_epoch_seconds, date_time_to_seconds, date_to_epoch_days, epoch_days_to_date,
    epoch_seconds_to_date_time, format_date, format_date_time, format_days_time_duration,
    format_time, format_years_months_duration, same_time_kind, shift_months, shift_time,
    time_to_seconds, weekday,
};
use crate::value::{Context, DaysTimeDuration, Value, YearsMonthsDuration};
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::{Decimal, MathematicalOps, RoundingStrategy};
use std::cmp::Ordering;

fn dec(n: i64) -> Decimal {
    Decimal::from(n)
}

/// A number as JS `String(n)` writes it: normalized (no trailing zeros, no
/// `-0`), and in exponent form from 1e21 up and below 1e-6 (`1e+21`, `1e-7`).
pub(crate) fn number_to_string(n: Decimal) -> String {
    if n.is_zero() {
        return "0".to_owned();
    }
    let full = n.mantissa().unsigned_abs().to_string();
    let digits = full.trim_end_matches('0');
    let k = digits.len() as i64;
    // The value is 0.<digits> * 10^point.
    let point = full.len() as i64 - i64::from(n.scale());
    let mut out = String::new();
    if n.is_sign_negative() {
        out.push('-');
    }
    if k <= point && point <= 21 {
        out.push_str(digits);
        out.push_str(&"0".repeat((point - k) as usize));
    } else if 0 < point && point <= 21 {
        out.push_str(&digits[..point as usize]);
        out.push('.');
        out.push_str(&digits[point as usize..]);
    } else if -6 < point && point <= 0 {
        out.push_str("0.");
        out.push_str(&"0".repeat((-point) as usize));
        out.push_str(digits);
    } else {
        let exp = point - 1;
        out.push_str(&digits[..1]);
        if k > 1 {
            out.push('.');
            out.push_str(&digits[1..]);
        }
        out.push('e');
        out.push(if exp < 0 { '-' } else { '+' });
        out.push_str(&exp.abs().to_string());
    }
    out
}

fn is_temporal(v: &Value) -> bool {
    matches!(
        v,
        Value::Date(_)
            | Value::Time(_)
            | Value::DateTime(_)
            | Value::DaysTimeDuration(_)
            | Value::YearsMonthsDuration(_)
    )
}

/// `compareValues`' difference of two times of day, `None` when one is local
/// and the other is not (they have no common clock).
fn time_diff(a: &crate::value::Time, b: &crate::value::Time) -> Option<Decimal> {
    if !same_time_kind(a, b, 0, 0) {
        return None;
    }
    Some(time_to_seconds(a, 0) - time_to_seconds(b, 0))
}

/// `compareValues`: ordering of two comparable values (numbers, strings,
/// same-kind temporals, durations); `None` when they are not comparable.
pub fn compare(a: &Value, b: &Value) -> Option<Ordering> {
    match (a, b) {
        (Value::Number(x), Value::Number(y)) => Some(x.cmp(y)),
        // JS compares strings by UTF-16 code unit.
        (Value::String(x), Value::String(y)) => Some(x.encode_utf16().cmp(y.encode_utf16())),
        (Value::Date(x), Value::Date(y)) => Some(date_to_epoch_days(x).cmp(&date_to_epoch_days(y))),
        (Value::Time(x), Value::Time(y)) => time_diff(x, y).map(|d| d.cmp(&Decimal::ZERO)),
        (Value::DateTime(x), Value::DateTime(y)) => {
            let (dx, dy) = (date_to_epoch_days(&x.date), date_to_epoch_days(&y.date));
            if !same_time_kind(&x.time, &y.time, dx, dy) {
                return None;
            }
            Some(date_time_to_seconds(x).cmp(&date_time_to_seconds(y)))
        }
        (Value::DaysTimeDuration(x), Value::DaysTimeDuration(y)) => Some(x.seconds.cmp(&y.seconds)),
        (Value::YearsMonthsDuration(x), Value::YearsMonthsDuration(y)) => {
            Some(x.months.cmp(&y.months))
        }
        _ => None,
    }
}

/// FEEL `=`: `Some(bool)`, or `None` (null) when the types cannot be compared.
pub fn feel_equals(a: &Value, b: &Value) -> Option<bool> {
    // Comparing values of different types says nothing, so it is null rather
    // than false. Comparing against null stays a real answer.
    if !a.is_null() && !b.is_null() && a.type_name() != b.type_name() {
        return None;
    }
    // Temporal values are equal when they name the same point, however each
    // was written: 12:00-01:00 and 17:00+04:00 are one instant.
    let instant = if is_temporal(a) { compare(a, b) } else { None };
    Some(match instant {
        Some(ord) => ord == Ordering::Equal,
        None => a == b,
    })
}

/// `deepEquals` as the built-ins use it (list contains, distinct values, index of ...).
// TS compares tagged values (dates, ranges ...) by object identity here; this
// compares them structurally, which only differs for equal values.
pub fn deep_equals(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::List(x), Value::List(y)) => {
            x.len() == y.len() && x.iter().zip(y).all(|(p, q)| deep_equals(p, q))
        }
        (Value::Context(x), Value::Context(y)) => {
            x.len() == y.len()
                && x.iter()
                    .all(|(k, v)| deep_equals(v, y.get(k).unwrap_or(&Value::Null)))
        }
        _ => a == b,
    }
}

/// Whether two list items are equal: the same instant, number or string, or equal structures.
pub(crate) fn same_item(a: &Value, b: &Value) -> bool {
    a.type_name() == b.type_name() && (compare(a, b) == Some(Ordering::Equal) || deep_equals(a, b))
}

/// `is()` for times and date-times: equal field by field as written, so a
/// local time is not the same value as one at UTC, nor a zone as its offset.
pub(crate) fn same_temporal(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::Time(x), Value::Time(y)) => x == y,
        (Value::DateTime(x), Value::DateTime(y)) => x == y,
        _ => false,
    }
}

// ---------------------------------------------------------------------------
// Arithmetic
// ---------------------------------------------------------------------------

fn number(n: Option<Decimal>) -> Value {
    n.map_or(Value::Null, Value::Number)
}

fn dt_dur(seconds: Option<Decimal>) -> Value {
    seconds.map_or(Value::Null, |seconds| {
        Value::DaysTimeDuration(DaysTimeDuration { seconds })
    })
}

fn ym_dur(months: Option<i64>) -> Value {
    months.map_or(Value::Null, |months| {
        Value::YearsMonthsDuration(YearsMonthsDuration { months })
    })
}

/// A scaled month count; fractional months round half away from zero (TS
/// leaves the fraction in, which no duration can write).
fn round_months(x: Option<Decimal>) -> Option<i64> {
    x?.round_dp_with_strategy(0, RoundingStrategy::MidpointAwayFromZero)
        .to_i64()
}

fn add_duration(a: &Value, b: &Value) -> Option<Value> {
    Some(match (a, b) {
        (Value::Date(d), Value::YearsMonthsDuration(m)) => Value::Date(shift_months(d, m.months)?),
        (Value::Date(d), Value::DaysTimeDuration(s)) => {
            let days = (s.seconds / dec(86400)).floor().to_i64()?;
            Value::Date(epoch_days_to_date(
                date_to_epoch_days(d).checked_add(days)?,
            )?)
        }
        (Value::DateTime(dt), Value::DaysTimeDuration(s)) => {
            let total = date_time_to_epoch_seconds(dt).checked_add(s.seconds)?;
            Value::DateTime(epoch_seconds_to_date_time(
                total,
                dt.time.offset,
                dt.time.timezone.clone(),
            )?)
        }
        (Value::DateTime(dt), Value::YearsMonthsDuration(m)) => {
            Value::DateTime(crate::value::DateTime {
                date: shift_months(&dt.date, m.months)?,
                time: dt.time.clone(),
            })
        }
        (Value::Time(t), Value::DaysTimeDuration(s)) => Value::Time(shift_time(t, s.seconds)?),
        (Value::DaysTimeDuration(x), Value::DaysTimeDuration(y)) => {
            dt_dur(x.seconds.checked_add(y.seconds))
        }
        (Value::YearsMonthsDuration(x), Value::YearsMonthsDuration(y)) => {
            ym_dur(x.months.checked_add(y.months))
        }
        _ => return None,
    })
}

fn subtract_values(a: &Value, b: &Value) -> Option<Value> {
    Some(match (a, b) {
        (Value::Time(x), Value::Time(y)) => dt_dur(Some(time_diff(x, y)?)),
        (Value::Time(t), Value::DaysTimeDuration(s)) => Value::Time(shift_time(t, -s.seconds)?),
        (Value::Date(x), Value::Date(y)) => {
            let days = date_to_epoch_days(x) - date_to_epoch_days(y);
            dt_dur(dec(days).checked_mul(dec(86400)))
        }
        (Value::Date(_) | Value::DateTime(_), Value::DaysTimeDuration(s)) => {
            return add_duration(
                a,
                &Value::DaysTimeDuration(DaysTimeDuration {
                    seconds: -s.seconds,
                }),
            );
        }
        (Value::Date(_) | Value::DateTime(_), Value::YearsMonthsDuration(m)) => {
            return add_duration(
                a,
                &Value::YearsMonthsDuration(YearsMonthsDuration {
                    months: m.months.checked_neg()?,
                }),
            );
        }
        (Value::DateTime(x), Value::DateTime(y)) => {
            dt_dur(date_time_to_epoch_seconds(x).checked_sub(date_time_to_epoch_seconds(y)))
        }
        (Value::DaysTimeDuration(x), Value::DaysTimeDuration(y)) => {
            dt_dur(x.seconds.checked_sub(y.seconds))
        }
        (Value::YearsMonthsDuration(x), Value::YearsMonthsDuration(y)) => {
            ym_dur(x.months.checked_sub(y.months))
        }
        _ => return None,
    })
}

/// `+`: numbers, string concatenation, and date/time/duration shifts.
pub fn add(a: &Value, b: &Value) -> Value {
    match (a, b) {
        (Value::Null, _) | (_, Value::Null) => Value::Null,
        (Value::Number(x), Value::Number(y)) => number(x.checked_add(*y)),
        (Value::String(x), Value::String(y)) => Value::String(format!("{x}{y}")),
        _ => add_duration(a, b).unwrap_or(Value::Null),
    }
}

/// `-`: numbers, date/time differences and duration shifts.
pub fn sub(a: &Value, b: &Value) -> Value {
    match (a, b) {
        (Value::Null, _) | (_, Value::Null) => Value::Null,
        (Value::Number(x), Value::Number(y)) => number(x.checked_sub(*y)),
        _ => subtract_values(a, b).unwrap_or(Value::Null),
    }
}

/// `*`: numbers, and a duration times a number (either order).
pub fn mul(a: &Value, b: &Value) -> Value {
    match (a, b) {
        (Value::Number(x), Value::Number(y)) => number(x.checked_mul(*y)),
        (Value::Number(x), Value::DaysTimeDuration(d))
        | (Value::DaysTimeDuration(d), Value::Number(x)) => dt_dur(x.checked_mul(d.seconds)),
        (Value::Number(x), Value::YearsMonthsDuration(d))
        | (Value::YearsMonthsDuration(d), Value::Number(x)) => {
            ym_dur(round_months(x.checked_mul(dec(d.months))))
        }
        _ => Value::Null,
    }
}

/// `/`: numbers, a duration by a number, and the ratio of two durations of a kind.
/// Division by zero is null.
pub fn div(a: &Value, b: &Value) -> Value {
    match (a, b) {
        (Value::Number(x), Value::Number(y)) => number(x.checked_div(*y)),
        (Value::DaysTimeDuration(d), Value::Number(x)) => dt_dur(d.seconds.checked_div(*x)),
        (Value::YearsMonthsDuration(d), Value::Number(x)) => {
            ym_dur(round_months(dec(d.months).checked_div(*x)))
        }
        // How many times one duration fits in another: P1Y / P1M is 12.
        (Value::DaysTimeDuration(x), Value::DaysTimeDuration(y)) => {
            number(x.seconds.checked_div(y.seconds))
        }
        (Value::YearsMonthsDuration(x), Value::YearsMonthsDuration(y)) => {
            number(dec(x.months).checked_div(dec(y.months)))
        }
        _ => Value::Null,
    }
}

/// A power too close to zero for 28 fraction digits is 0, as float64 rounds it (TS twin);
/// only a power too large to hold is `None`.
fn pow_decimal(x: Decimal, y: Decimal) -> Option<Decimal> {
    // `-0` is zero, not a negative base: (-0) ** 0.5 is 0.
    let x = if x.is_zero() { Decimal::ZERO } else { x };
    let real = !x.is_sign_negative() || y.is_integer();
    let shrinks = (x.abs() > Decimal::ONE) == y.is_sign_negative() && x.abs() != Decimal::ONE;
    pow_exact(x, y).or_else(|| (real && shrinks && !x.is_zero()).then_some(Decimal::ZERO))
}

fn pow_exact(x: Decimal, y: Decimal) -> Option<Decimal> {
    if y.is_integer() {
        let n = y.to_i64()?;
        if x.is_zero() && n < 0 {
            return None;
        }
        return x.checked_powi(n);
    }
    if y == Decimal::new(5, 1) {
        return x.sqrt();
    }
    if x.is_zero() {
        return y.is_sign_positive().then_some(Decimal::ZERO);
    }
    // A negative base with a fractional exponent is not a real number.
    if x.is_sign_negative() {
        return None;
    }
    x.checked_powd(y)
}

/// `**`.
pub fn pow(a: &Value, b: &Value) -> Value {
    match (a, b) {
        (Value::Number(x), Value::Number(y)) => number(pow_decimal(*x, *y)),
        _ => Value::Null,
    }
}

/// Unary minus.
pub fn neg(a: &Value) -> Value {
    match a {
        Value::Number(x) => Value::Number(-*x),
        Value::DaysTimeDuration(d) => dt_dur(Some(-d.seconds)),
        Value::YearsMonthsDuration(d) => ym_dur(d.months.checked_neg()),
        _ => Value::Null,
    }
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

fn offset_duration(offset: Option<i32>) -> Value {
    offset.map_or(Value::Null, |o| dt_dur(Some(dec(i64::from(o)))))
}

fn time_property(t: &crate::value::Time, key: &str) -> Option<Value> {
    Some(match key {
        "hour" => Value::from(t.hour as i32),
        "minute" => Value::from(t.minute as i32),
        "second" => Value::Number(t.second),
        "time offset" => offset_duration(t.offset),
        "timezone" => t.timezone.clone().map_or(Value::Null, Value::String),
        _ => return None,
    })
}

/// `getProperty`: `x.key` on dates, times, durations, ranges and contexts.
pub fn get_property(v: &Value, key: &str) -> Value {
    match v {
        Value::Date(d) => match key {
            "year" => Value::from(d.year),
            "month" => Value::from(d.month as i32),
            "day" => Value::from(d.day as i32),
            "weekday" => Value::from(weekday(d) as i32),
            _ => Value::Null,
        },
        Value::Time(t) => time_property(t, key).unwrap_or(Value::Null),
        Value::DateTime(dt) => match key {
            "year" | "month" | "day" | "weekday" => get_property(&Value::Date(dt.date), key),
            "time" => Value::Time(dt.time.clone()),
            _ => time_property(&dt.time, key).unwrap_or(Value::Null),
        },
        Value::DaysTimeDuration(d) => {
            let total = d.seconds;
            match key {
                "days" => Value::Number((total / dec(86400)).trunc()),
                "hours" => Value::Number((total % dec(86400) / dec(3600)).trunc()),
                "minutes" => Value::Number((total % dec(3600) / dec(60)).trunc()),
                "seconds" => Value::Number(total % dec(60)),
                _ => Value::Null,
            }
        }
        Value::YearsMonthsDuration(d) => match key {
            "years" => Value::from(d.months / 12),
            "months" => Value::from(d.months % 12),
            _ => Value::Null,
        },
        Value::Range(r) => match key {
            "start" => r.start.clone(),
            "end" => r.end.clone(),
            "start included" => Value::Boolean(r.start_included),
            "end included" => Value::Boolean(r.end_included),
            _ => Value::Null,
        },
        Value::Context(c) => c.get(key).cloned().unwrap_or(Value::Null),
        _ => Value::Null,
    }
}

// ---------------------------------------------------------------------------
// string()
// ---------------------------------------------------------------------------

/// Renders a value the way FEEL's `string()` does. Strings nested inside a
/// list or context are quoted; a string rendered on its own is not.
fn stringify(v: &Value, nested: bool) -> Option<String> {
    match v {
        Value::Null | Value::Range(_) | Value::Function(_) => None,
        Value::String(s) if nested => Some(serde_json::to_string(s).unwrap_or_default()),
        Value::String(s) => Some(s.clone()),
        Value::List(items) => {
            let parts: Vec<String> = items
                .iter()
                .map(|i| stringify(i, true).unwrap_or_else(|| "null".to_owned()))
                .collect();
            Some(format!("[{}]", parts.join(", ")))
        }
        Value::Context(c) => Some(stringify_context(c)),
        Value::Boolean(b) => Some(b.to_string()),
        Value::Number(n) => Some(number_to_string(*n)),
        Value::Date(d) => Some(format_date(d)),
        Value::Time(t) => Some(format_time(t)),
        Value::DateTime(dt) => Some(format_date_time(dt)),
        Value::DaysTimeDuration(d) => Some(format_days_time_duration(d.seconds)),
        Value::YearsMonthsDuration(d) => Some(format_years_months_duration(d.months)),
    }
}

fn stringify_context(c: &Context) -> String {
    let parts: Vec<String> = c
        .iter()
        .map(|(k, v)| {
            format!(
                "{k}: {}",
                stringify(v, true).unwrap_or_else(|| "null".to_owned())
            )
        })
        .collect();
    format!("{{{}}}", parts.join(", "))
}

/// FEEL `string()`; `None` for null.
pub fn to_feel_string(v: &Value) -> Option<String> {
    stringify(v, false)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::temporal::parse_temporal;
    use crate::value::Range;

    fn n(s: &str) -> Value {
        Value::Number(s.parse().unwrap())
    }

    fn t(s: &str) -> Value {
        let v = parse_temporal(s);
        assert!(!v.is_null(), "{s}");
        v
    }

    fn s(v: &Value) -> String {
        to_feel_string(v).unwrap()
    }

    fn ctx(entries: &[(&str, Value)]) -> Value {
        Value::Context(
            entries
                .iter()
                .map(|(k, v)| ((*k).to_owned(), v.clone()))
                .collect(),
        )
    }

    #[test]
    fn numbers_render_like_js() {
        let r = |x: &str| number_to_string(x.parse().unwrap());
        assert_eq!(r("0"), "0");
        assert_eq!(r("-0.0"), "0");
        assert_eq!(r("1.50"), "1.5");
        assert_eq!(r("100"), "100");
        assert_eq!(r("-12.375"), "-12.375");
        assert_eq!(r("0.000001"), "0.000001");
        assert_eq!(r("0.0000001"), "1e-7");
        assert_eq!(r("0.00000012"), "1.2e-7");
        assert_eq!(r("-0.0000001"), "-1e-7");
        assert_eq!(r("100000000000000000000"), "100000000000000000000");
        assert_eq!(r("1000000000000000000000"), "1e+21");
        assert_eq!(r("1230000000000000000000000"), "1.23e+24");
        assert_eq!(
            r("0.3333333333333333333333333333"),
            "0.3333333333333333333333333333"
        );
    }

    #[test]
    fn arithmetic_is_exact_and_total() {
        assert_eq!(add(&n("0.1"), &n("0.2")), n("0.3"));
        assert_eq!(s(&add(&n("0.1"), &n("0.2"))), "0.3");
        assert_eq!(sub(&n("1"), &n("0.9")), n("0.1"));
        assert_eq!(mul(&n("3"), &n("0.1")), n("0.3"));
        assert_eq!(div(&n("1"), &n("0")), Value::Null);
        assert_eq!(div(&n("10"), &n("4")), n("2.5"));
        assert_eq!(add(&Value::Null, &n("1")), Value::Null);
        assert_eq!(add(&n("1"), &Value::Null), Value::Null);
        assert_eq!(add(&n("1"), &Value::from("a")), Value::Null);
        assert_eq!(add(&Value::from("a"), &Value::from("b")), Value::from("ab"));
        assert_eq!(sub(&Value::from("a"), &Value::from("b")), Value::Null);
        assert_eq!(mul(&Value::Number(Decimal::MAX), &n("2")), Value::Null);
        assert_eq!(neg(&n("5")), n("-5"));
        assert_eq!(neg(&Value::from("a")), Value::Null);
        assert_eq!(neg(&Value::Null), Value::Null);
        assert_eq!(neg(&t("P1D")), t("-P1D"));
        assert_eq!(neg(&t("P1Y")), t("-P1Y"));
        assert_eq!(neg(&t("2020-01-01")), Value::Null);
    }

    #[test]
    fn powers() {
        assert_eq!(pow(&n("2"), &n("10")), n("1024"));
        assert_eq!(pow(&n("2"), &n("-2")), n("0.25"));
        assert_eq!(pow(&n("0"), &n("0")), n("1"));
        assert_eq!(pow(&n("0"), &n("-1")), Value::Null);
        assert_eq!(pow(&n("0"), &n("2")), n("0"));
        assert_eq!(pow(&n("4"), &n("0.5")), n("2"));
        assert_eq!(pow(&n("-8"), &n("0.3333")), Value::Null);
        assert_eq!(pow(&n("10"), &n("1000")), Value::Null);
        assert_eq!(pow(&n("1"), &n("1000000000000")), n("1"));
        assert_eq!(pow(&n("10"), &n("21")), n("1000000000000000000000"));
        assert_eq!(pow(&Value::from("a"), &n("2")), Value::Null);
        // Fuzz regressions: underflow is 0 (TS rounds the double), overflow stays null.
        assert_eq!(pow(&n("10"), &n("-29")), n("0"));
        assert_eq!(pow(&n("-12"), &n("-27")), n("0"));
        assert_eq!(pow(&n("0.5"), &n("200")), n("0"));
        assert_eq!(pow(&n("2"), &n("-100.5")), n("0"));
        assert_eq!(pow(&n("-0.5"), &n("0.3")), Value::Null);
        assert_eq!(pow(&n("-4"), &n("48")), Value::Null);
        assert_eq!(pow(&n("-0"), &n("0.5")), n("0"));
        assert_eq!(pow(&n("-0"), &n("1.5")), n("0"));
        match pow(&n("2"), &n("1.5")) {
            Value::Number(x) => assert!(
                (x - "2.8284271247461900976033774484".parse::<Decimal>().unwrap()).abs()
                    < "1e-12".parse().unwrap()
            ),
            other => panic!("{other:?}"),
        }
    }

    #[test]
    fn date_arithmetic() {
        assert_eq!(add(&t("2020-03-15"), &t("P1D")), t("2020-03-16"));
        assert_eq!(add(&t("2020-03-15"), &t("P1M")), t("2020-04-15"));
        assert_eq!(add(&t("2020-01-31"), &t("P1M")), t("2020-02-29"));
        assert_eq!(add(&t("2020-03-15"), &t("P1Y1M")), t("2021-04-15"));
        assert_eq!(add(&t("2020-03-15"), &t("PT36H")), t("2020-03-16"));
        assert_eq!(sub(&t("2020-03-15"), &t("P1D")), t("2020-03-14"));
        assert_eq!(sub(&t("2020-03-15"), &t("P1M")), t("2020-02-15"));
        assert_eq!(sub(&t("2020-03-31"), &t("P1M")), t("2020-02-29"));
        assert_eq!(sub(&t("2020-03-15"), &t("2020-03-01")), t("P14D"));
        assert_eq!(sub(&t("2020-03-01"), &t("2020-03-15")), t("-P14D"));
        // Not defined (the TS twin gives null too).
        assert_eq!(add(&t("P1D"), &t("2020-01-01")), Value::Null);
        assert_eq!(add(&t("2020-01-01"), &t("2020-01-01")), Value::Null);
        assert_eq!(
            sub(&t("2020-01-01"), &t("2020-01-01T00:00:00")),
            Value::Null
        );
        // Years before year 1 and the edge of the calendar.
        assert_eq!(sub(&t("0001-01-01"), &t("P1D")), t("0000-12-31"));
        let last = Value::Date(crate::temporal::make_date(999_999_999, 12, 31).unwrap());
        assert_eq!(add(&last, &t("P1D")), Value::Null);
    }

    #[cfg(feature = "tz")] // uses IANA zone names
    #[test]
    fn date_time_arithmetic() {
        assert_eq!(
            s(&add(&t("2020-01-01T23:30:00Z"), &t("PT1H"))),
            "2020-01-02T00:30:00Z"
        );
        assert_eq!(
            s(&sub(&t("2020-01-01T00:30:00+01:00"), &t("PT1H"))),
            "2019-12-31T23:30:00+01:00"
        );
        assert_eq!(
            s(&add(&t("2020-01-31T10:00:00"), &t("P1M"))),
            "2020-02-29T10:00:00"
        );
        // Arithmetic shifts the wall clock and keeps the zone.
        assert_eq!(
            s(&add(&t("2020-01-01T10:00:00@Europe/Berlin"), &t("PT1H"))),
            "2020-01-01T11:00:00@Europe/Berlin"
        );
        assert_eq!(
            sub(&t("2020-01-02T10:00:00Z"), &t("2020-01-01T10:00:00Z")),
            t("P1D")
        );
        assert_eq!(
            sub(&t("2020-01-01T12:00:00+02:00"), &t("2020-01-01T10:00:00Z")),
            t("PT0S")
        );
        assert_eq!(
            s(&add(&t("2020-01-01T10:00:00.5Z"), &t("PT0.25S"))),
            "2020-01-01T10:00:00.75Z"
        );
    }

    #[test]
    fn time_arithmetic() {
        assert_eq!(s(&add(&t("23:00:00"), &t("PT2H"))), "01:00:00");
        assert_eq!(s(&sub(&t("01:00:00Z"), &t("PT2H"))), "23:00:00Z");
        assert_eq!(sub(&t("12:00:00Z"), &t("10:00:00Z")), t("PT2H"));
        assert_eq!(sub(&t("12:00:00+01:00"), &t("10:00:00Z")), t("PT1H"));
        assert_eq!(sub(&t("12:00:00"), &t("10:00:00")), t("PT2H"));
        // A local time and one at an offset have no common clock.
        assert_eq!(sub(&t("12:00:00"), &t("10:00:00Z")), Value::Null);
    }

    #[test]
    fn duration_arithmetic() {
        assert_eq!(add(&t("P1D"), &t("PT12H")), t("P1DT12H"));
        assert_eq!(sub(&t("P1D"), &t("PT12H")), t("PT12H"));
        assert_eq!(add(&t("P1Y"), &t("P3M")), t("P1Y3M"));
        assert_eq!(sub(&t("P1Y"), &t("P13M")), t("-P1M"));
        assert_eq!(add(&t("P1D"), &t("P1M")), Value::Null);
        assert_eq!(mul(&n("2"), &t("PT1H")), t("PT2H"));
        assert_eq!(mul(&t("PT1H"), &n("1.5")), t("PT1H30M"));
        assert_eq!(mul(&n("2"), &t("P1Y")), t("P2Y"));
        assert_eq!(mul(&t("P1Y"), &n("2.5")), t("P2Y6M"));
        assert_eq!(mul(&t("P1Y"), &t("P1Y")), Value::Null);
        assert_eq!(div(&t("PT1H"), &n("2")), t("PT30M"));
        assert_eq!(div(&t("P1Y"), &n("4")), t("P3M"));
        assert_eq!(div(&t("P1Y"), &n("5")), t("P2M"));
        assert_eq!(div(&t("P1D"), &n("0")), Value::Null);
        assert_eq!(div(&t("P1Y"), &n("0")), Value::Null);
        assert_eq!(div(&t("P1D"), &t("PT12H")), n("2"));
        assert_eq!(div(&t("P1Y"), &t("P1M")), n("12"));
        assert_eq!(div(&t("P1Y"), &t("P0M")), Value::Null);
        assert_eq!(div(&n("1"), &t("P1D")), Value::Null);
    }

    #[cfg(feature = "tz")] // uses IANA zone names
    #[test]
    fn comparison() {
        use Ordering::*;
        assert_eq!(compare(&n("1"), &n("2")), Some(Less));
        assert_eq!(compare(&n("1.0"), &n("1")), Some(Equal));
        assert_eq!(compare(&Value::from("a"), &Value::from("b")), Some(Less));
        assert_eq!(compare(&Value::from("b"), &Value::from("a")), Some(Greater));
        // UTF-16 order: an astral character sorts below U+FFFF.
        assert_eq!(
            compare(&Value::from("\u{1F600}"), &Value::from("\u{FFFF}")),
            Some(Less)
        );
        assert_eq!(compare(&t("2020-01-01"), &t("2020-01-02")), Some(Less));
        assert_eq!(compare(&t("P1D"), &t("PT24H")), Some(Equal));
        assert_eq!(compare(&t("P1Y"), &t("P11M")), Some(Greater));
        assert_eq!(compare(&t("10:00:00Z"), &t("11:00:00+01:00")), Some(Equal));
        assert_eq!(compare(&t("10:00:00"), &t("11:00:00")), Some(Less));
        assert_eq!(compare(&t("10:00:00"), &t("10:00:00Z")), None);
        assert_eq!(
            compare(
                &t("2020-07-01T10:00:00@Europe/Berlin"),
                &t("2020-07-01T08:00:00Z")
            ),
            Some(Equal)
        );
        assert_eq!(
            compare(
                &t("2020-01-01T10:00:00@Europe/Berlin"),
                &t("2020-01-01T08:00:00Z")
            ),
            Some(Greater)
        );
        assert_eq!(
            compare(&t("2020-01-01T10:00:00"), &t("2020-01-01T10:00:00Z")),
            None
        );
        assert_eq!(
            compare(&t("2020-01-01T10:00:00"), &t("2020-01-01T11:00:00")),
            Some(Less)
        );
        assert_eq!(compare(&n("1"), &Value::from("1")), None);
        assert_eq!(compare(&Value::Boolean(true), &Value::Boolean(false)), None);
        assert_eq!(compare(&t("2020-01-01"), &t("2020-01-01T00:00:00")), None);
        assert_eq!(compare(&t("P1D"), &t("P1M")), None);
        assert_eq!(compare(&Value::Null, &Value::Null), None);
    }

    #[cfg(feature = "tz")] // uses IANA zone names
    #[test]
    fn melbourne_zone_follows_daylight_saving() {
        // Melbourne is +11:00 in January and +10:00 in July.
        assert_eq!(
            compare(
                &t("2020-01-15T10:00:00@Australia/Melbourne"),
                &t("2020-01-14T23:00:00Z")
            ),
            Some(Ordering::Equal)
        );
        assert_eq!(
            compare(
                &t("2020-07-15T10:00:00@Australia/Melbourne"),
                &t("2020-07-15T00:00:00Z")
            ),
            Some(Ordering::Equal)
        );
        assert_eq!(
            compare(&t("10:00:00@Europe/Berlin"), &t("09:00:00Z")),
            Some(Ordering::Equal)
        );
    }

    #[cfg(feature = "tz")] // uses IANA zone names
    #[test]
    fn feel_equality() {
        assert_eq!(feel_equals(&n("1"), &n("1.0")), Some(true));
        assert_eq!(feel_equals(&n("1"), &n("2")), Some(false));
        assert_eq!(feel_equals(&n("1"), &Value::from("1")), None);
        assert_eq!(feel_equals(&Value::Null, &Value::Null), Some(true));
        assert_eq!(feel_equals(&Value::Null, &n("1")), Some(false));
        assert_eq!(feel_equals(&n("1"), &Value::Null), Some(false));
        assert_eq!(
            feel_equals(&Value::Boolean(true), &Value::Boolean(true)),
            Some(true)
        );
        assert_eq!(feel_equals(&Value::Boolean(true), &n("1")), None);
        // Temporals are equal when they name the same point.
        assert_eq!(
            feel_equals(&t("12:00:00-01:00"), &t("17:00:00+04:00")),
            Some(true)
        );
        assert_eq!(feel_equals(&t("10:00:00Z"), &t("10:00:00")), Some(false));
        assert_eq!(
            feel_equals(
                &t("2020-07-01T10:00:00@Europe/Berlin"),
                &t("2020-07-01T08:00:00Z")
            ),
            Some(true)
        );
        assert_eq!(feel_equals(&t("P1D"), &t("PT24H")), Some(true));
        assert_eq!(feel_equals(&t("P1D"), &t("P1M")), None);
        assert_eq!(
            feel_equals(&t("2020-01-01"), &t("2020-01-01T00:00:00")),
            None
        );
        assert_eq!(feel_equals(&t("2020-01-01"), &t("2020-01-02")), Some(false));
        // Structures.
        let l = |a: &str, b: &str| Value::List(vec![n(a), n(b)]);
        assert_eq!(feel_equals(&l("1", "2"), &l("1", "2")), Some(true));
        assert_eq!(feel_equals(&l("1", "2"), &l("2", "1")), Some(false));
        assert_eq!(
            feel_equals(&l("1", "2"), &Value::List(vec![n("1")])),
            Some(false)
        );
        let a = ctx(&[("a", n("1")), ("b", n("2"))]);
        let b = ctx(&[("b", n("2")), ("a", n("1"))]);
        assert_eq!(feel_equals(&a, &b), Some(true));
        assert_eq!(feel_equals(&a, &ctx(&[("a", n("1"))])), Some(false));
        let range = |lo: &str| {
            Value::Range(Box::new(Range {
                start: n(lo),
                start_included: true,
                end: n("5"),
                end_included: false,
            }))
        };
        assert_eq!(feel_equals(&range("1"), &range("1")), Some(true));
        assert_eq!(feel_equals(&range("1"), &range("2")), Some(false));
        assert_eq!(feel_equals(&range("1"), &a), None);
    }

    #[test]
    fn built_in_equality_helpers() {
        let l = |items: Vec<Value>| Value::List(items);
        assert!(deep_equals(
            &l(vec![n("1"), l(vec![n("2")])]),
            &l(vec![n("1"), l(vec![n("2")])])
        ));
        assert!(!deep_equals(&l(vec![n("1")]), &l(vec![n("1"), n("2")])));
        assert!(deep_equals(
            &ctx(&[("a", n("1")), ("b", n("2"))]),
            &ctx(&[("b", n("2")), ("a", n("1"))])
        ));
        assert!(deep_equals(&Value::Null, &Value::Null));
        assert!(!deep_equals(&n("1"), &Value::from("1")));
        // The same instant is the same item; different kinds never are.
        assert!(same_item(&t("10:00:00Z"), &t("11:00:00+01:00")));
        assert!(same_item(&n("1"), &n("1.00")));
        assert!(!same_item(&t("2020-01-01"), &t("2020-01-01T00:00:00")));
        assert!(!same_item(&n("1"), &Value::from("1")));
        // is(): written form, not instant.
        assert!(!same_temporal(&t("10:00:00Z"), &t("11:00:00+01:00")));
        assert!(same_temporal(&t("10:00:00Z"), &t("10:00:00Z")));
        assert!(!same_temporal(&t("10:00:00Z"), &t("10:00:00")));
        assert!(!same_temporal(&t("2020-01-01"), &t("2020-01-01")));
    }

    #[test]
    fn strings() {
        assert_eq!(to_feel_string(&Value::Null), None);
        assert_eq!(s(&Value::from("a\"b")), "a\"b");
        assert_eq!(s(&Value::Boolean(true)), "true");
        assert_eq!(s(&n("1.50")), "1.5");
        assert_eq!(s(&n("1000000000000000000000")), "1e+21");
        assert_eq!(s(&t("2020-03-15")), "2020-03-15");
        assert_eq!(
            s(&t("2020-03-15T10:00:00+02:00")),
            "2020-03-15T10:00:00+02:00"
        );
        assert_eq!(s(&t("10:00:00.250")), "10:00:00.25");
        assert_eq!(s(&t("P1DT2H3M4.5S")), "P1DT2H3M4.5S");
        assert_eq!(s(&t("-PT0.5S")), "-PT0.5S");
        assert_eq!(s(&t("PT0S")), "PT0S");
        assert_eq!(s(&t("P14M")), "P1Y2M");
        assert_eq!(s(&t("P0M")), "P0M");
        let v = Value::List(vec![
            n("1"),
            Value::from("a"),
            ctx(&[
                ("z", Value::from("x\n\"y")),
                ("b", Value::List(vec![Value::Null])),
                ("a", Value::Null),
            ]),
        ]);
        assert_eq!(s(&v), "[1, \"a\", {z: \"x\\n\\\"y\", b: [null], a: null}]");
        assert_eq!(s(&Value::List(vec![])), "[]");
        assert_eq!(s(&ctx(&[])), "{}");
        let range = Value::Range(Box::new(Range {
            start: n("1"),
            start_included: true,
            end: n("2"),
            end_included: true,
        }));
        assert_eq!(to_feel_string(&range), None);
        assert_eq!(s(&Value::List(vec![range])), "[null]");
        assert_eq!(format!("{}", Value::Null), "null");
        assert_eq!(format!("{}", n("2.50")), "2.5");
    }

    #[cfg(feature = "tz")] // uses IANA zone names
    #[test]
    fn properties() {
        let p = |v: &str, k: &str| get_property(&t(v), k);
        assert_eq!(p("2020-01-01", "year"), n("2020"));
        assert_eq!(p("2020-01-01", "month"), n("1"));
        assert_eq!(p("2020-01-01", "day"), n("1"));
        assert_eq!(p("2020-01-01", "weekday"), n("3"));
        assert_eq!(p("2020-01-01", "hour"), Value::Null);
        assert_eq!(p("10:20:30.5+01:00", "hour"), n("10"));
        assert_eq!(p("10:20:30.5+01:00", "minute"), n("20"));
        assert_eq!(p("10:20:30.5+01:00", "second"), n("30.5"));
        assert_eq!(p("10:20:30.5+01:00", "time offset"), t("PT1H"));
        assert_eq!(p("10:20:30", "time offset"), Value::Null);
        assert_eq!(p("10:20:30", "timezone"), Value::Null);
        assert_eq!(
            p("10:20:30@Europe/Berlin", "timezone"),
            Value::from("Europe/Berlin")
        );
        assert_eq!(p("2020-01-01T10:20:30Z", "year"), n("2020"));
        assert_eq!(p("2020-01-01T10:20:30Z", "hour"), n("10"));
        assert_eq!(p("2020-01-01T10:20:30Z", "weekday"), n("3"));
        assert_eq!(p("2020-01-01T10:20:30+01:00", "time offset"), t("PT1H"));
        assert_eq!(p("2020-01-01T10:20:30Z", "time"), t("10:20:30Z"));
        assert_eq!(p("2020-01-01T10:20:30Z", "nope"), Value::Null);
        assert_eq!(p("P1DT2H3M4.5S", "days"), n("1"));
        assert_eq!(p("P1DT2H3M4.5S", "hours"), n("2"));
        assert_eq!(p("P1DT2H3M4.5S", "minutes"), n("3"));
        assert_eq!(p("P1DT2H3M4.5S", "seconds"), n("4.5"));
        assert_eq!(p("-P1DT2H3M4S", "hours"), n("-2"));
        assert_eq!(p("-P1DT2H3M4S", "days"), n("-1"));
        assert_eq!(p("P14M", "years"), n("1"));
        assert_eq!(p("P14M", "months"), n("2"));
        assert_eq!(p("-P14M", "years"), n("-1"));
        assert_eq!(p("-P14M", "months"), n("-2"));
        let range = Value::Range(Box::new(Range {
            start: n("1"),
            start_included: true,
            end: Value::Null,
            end_included: false,
        }));
        assert_eq!(get_property(&range, "start"), n("1"));
        assert_eq!(get_property(&range, "end"), Value::Null);
        assert_eq!(get_property(&range, "start included"), Value::Boolean(true));
        assert_eq!(get_property(&range, "end included"), Value::Boolean(false));
        let c = ctx(&[("a", n("1")), ("n", Value::Null)]);
        assert_eq!(get_property(&c, "a"), n("1"));
        assert_eq!(get_property(&c, "missing"), Value::Null);
        assert_eq!(get_property(&n("1"), "a"), Value::Null);
        assert_eq!(get_property(&Value::List(vec![]), "a"), Value::Null);
    }
}
