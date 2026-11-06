//! Conversions between reebe's `FeelValue` and `bpmnkit-feel`'s `Value`.

use crate::{FeelContext, FeelValue};
use bpmnkit_feel as bk;
use chrono::{Datelike, NaiveDate, NaiveTime, TimeZone, Timelike, Utc};
use indexmap::IndexMap;
use std::str::FromStr;

/// The bindings of `ctx` and its parents as one ordered context; a child overrides its parent.
pub(crate) fn to_feel_context(ctx: &FeelContext) -> bk::Context {
    let mut chain = vec![ctx];
    while let Some(parent) = chain.last().and_then(|c| c.parent()) {
        chain.push(parent);
    }
    let mut out = bk::Context::new();
    for scope in chain.into_iter().rev() {
        for (name, value) in scope.bindings() {
            out.insert(name.clone(), to_value(value));
        }
    }
    out
}

pub(crate) fn to_value(v: &FeelValue) -> bk::Value {
    use bk::Value;
    match v {
        FeelValue::Null => Value::Null,
        FeelValue::Bool(b) => Value::Boolean(*b),
        FeelValue::Integer(i) => Value::from(*i),
        FeelValue::Float(f) => Value::try_from(*f).unwrap_or(Value::Null),
        FeelValue::String(s) => Value::String(s.clone()),
        FeelValue::List(items) => Value::List(items.iter().map(to_value).collect()),
        FeelValue::Context(map) => {
            Value::Context(map.iter().map(|(k, v)| (k.clone(), to_value(v))).collect())
        }
        FeelValue::Date(d) => Value::Date(date(*d)),
        FeelValue::Time(t) => Value::Time(time(*t, None)),
        FeelValue::DateTime(dt) => Value::DateTime(bk::DateTime {
            date: date(dt.date_naive()),
            time: time(dt.time(), Some(0)),
        }),
        FeelValue::Duration(ms) => Value::DaysTimeDuration(bk::DaysTimeDuration {
            seconds: bk::Decimal::new(*ms, 3),
        }),
        FeelValue::YearsMonthsDuration(months) => {
            Value::YearsMonthsDuration(bk::YearsMonthsDuration { months: *months })
        }
        FeelValue::Range {
            start,
            end,
            start_inclusive,
            end_inclusive,
        } => Value::Range(Box::new(bk::Range {
            start: to_value(start),
            start_included: *start_inclusive,
            end: to_value(end),
            end_included: *end_inclusive,
        })),
    }
}

pub(crate) fn from_value(v: bk::Value) -> FeelValue {
    use bk::Value;
    match v {
        Value::Null | Value::Function(_) => FeelValue::Null,
        Value::Boolean(b) => FeelValue::Bool(b),
        Value::Number(d) => number(d),
        Value::String(s) => FeelValue::String(s),
        Value::Date(d) => NaiveDate::from_ymd_opt(d.year, d.month.into(), d.day.into())
            .map_or(FeelValue::Null, FeelValue::Date),
        Value::Time(t) => naive_time(&t).map_or(FeelValue::Null, FeelValue::Time),
        Value::DateTime(dt) => date_time(&dt).map_or(FeelValue::Null, FeelValue::DateTime),
        Value::DaysTimeDuration(d) => (d.seconds * bk::Decimal::from(1000))
            .round()
            .try_into()
            .map_or(FeelValue::Null, FeelValue::Duration),
        Value::YearsMonthsDuration(d) => FeelValue::YearsMonthsDuration(d.months),
        Value::Range(r) => FeelValue::Range {
            start: Box::new(from_value(r.start)),
            end: Box::new(from_value(r.end)),
            start_inclusive: r.start_included,
            end_inclusive: r.end_included,
        },
        Value::List(items) => FeelValue::List(items.into_iter().map(from_value).collect()),
        Value::Context(c) => FeelValue::Context(
            c.into_iter()
                .map(|(k, v)| (k, from_value(v)))
                .collect::<IndexMap<_, _>>(),
        ),
    }
}

/// An integral number that fits `i64` is an `Integer`, anything else a `Float`.
fn number(d: bk::Decimal) -> FeelValue {
    if d.fract().is_zero() {
        if let Ok(i) = i64::try_from(d) {
            return FeelValue::Integer(i);
        }
    }
    f64::try_from(d).map_or(FeelValue::Null, FeelValue::Float)
}

fn date(d: NaiveDate) -> bk::Date {
    bk::Date {
        year: d.year(),
        month: d.month() as u8,
        day: d.day() as u8,
    }
}

fn time(t: NaiveTime, offset: Option<i32>) -> bk::Time {
    let second = bk::Decimal::from(t.second())
        + bk::Decimal::new(i64::from(t.nanosecond() % 1_000_000_000), 9);
    bk::Time {
        hour: t.hour() as u8,
        minute: t.minute() as u8,
        second,
        offset,
        timezone: None,
    }
}

/// The wall-clock time, dropping offset and zone.
fn naive_time(t: &bk::Time) -> Option<NaiveTime> {
    let whole = u32::try_from(t.second.trunc()).ok()?;
    let nanos =
        u32::try_from((t.second.fract() * bk::Decimal::from(1_000_000_000)).round()).ok()?;
    NaiveTime::from_hms_nano_opt(t.hour.into(), t.minute.into(), whole, nanos)
}

/// The instant; a local date-time is taken as UTC.
fn date_time(dt: &bk::DateTime) -> Option<chrono::DateTime<Utc>> {
    let d = NaiveDate::from_ymd_opt(dt.date.year, dt.date.month.into(), dt.date.day.into())?;
    let local = d.and_time(naive_time(&dt.time)?);
    if let Some(zone) = dt
        .time
        .timezone
        .as_deref()
        .and_then(|z| chrono_tz::Tz::from_str(z).ok())
    {
        return zone
            .from_local_datetime(&local)
            .earliest()
            .map(|t| t.with_timezone(&Utc));
    }
    let offset = chrono::Duration::seconds(dt.time.offset.unwrap_or(0).into());
    Some(Utc.from_utc_datetime(&(local - offset)))
}
