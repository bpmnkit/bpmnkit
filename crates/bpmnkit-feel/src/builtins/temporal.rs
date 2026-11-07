//! Date built-ins (`now`, `today`, `day of week` ...), ported from `packages/feel/src/builtins.ts`.

use super::BuiltinFn;
use crate::temporal::{date_to_epoch_days, day_of_week, day_of_year, days_in_month, is_leap_year};
use crate::value::{Date, DateTime, Time, Value};
use chrono::{Datelike, Offset, Timelike};
use rust_decimal::Decimal;

pub fn lookup(name: &str) -> Option<BuiltinFn> {
    Some(match name {
        "now" => now,
        "today" => today,
        "day of week" => day_of_week_name,
        "day of year" => day_of_year_number,
        "week of year" => week_of_year,
        "month of year" => month_of_year,
        "last day of month" => last_day_of_month,
        _ => return None,
    })
}

/// The date of a date or date-time argument.
fn date_of(args: &[Value]) -> Option<&Date> {
    match args.first() {
        Some(Value::Date(d)) => Some(d),
        Some(Value::DateTime(dt)) => Some(&dt.date),
        _ => None,
    }
}

// Local time as `new Date()` reads it in the TS.
fn local_now() -> chrono::DateTime<chrono::Local> {
    chrono::Local::now()
}

fn date_from(n: &chrono::DateTime<chrono::Local>) -> Date {
    Date {
        year: n.year(),
        month: n.month() as u8,
        day: n.day() as u8,
    }
}

fn now(_: &[Value]) -> Value {
    let n = local_now();
    Value::DateTime(DateTime {
        date: date_from(&n),
        time: Time {
            hour: n.hour() as u8,
            minute: n.minute() as u8,
            second: Decimal::from(n.second()),
            offset: Some(n.offset().fix().local_minus_utc()),
            timezone: None,
        },
    })
}

fn today(_: &[Value]) -> Value {
    Value::Date(date_from(&local_now()))
}

const DAY_NAMES: [&str; 7] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const MONTH_NAMES: [&str; 12] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

fn day_of_week_name(args: &[Value]) -> Value {
    date_of(args).map_or(Value::Null, |d| {
        DAY_NAMES[usize::from(day_of_week(d))].into()
    })
}

fn day_of_year_number(args: &[Value]) -> Value {
    date_of(args).map_or(Value::Null, |d| u32::from(day_of_year(d)).into())
}

/// Monday is 1, Sunday is 7. Epoch day 0, 1970-01-01, was a Thursday.
fn iso_weekday(d: &Date) -> i64 {
    (date_to_epoch_days(d) + 3).rem_euclid(7) + 1
}

/// 52 or 53, whichever ISO 8601 gives the year.
fn iso_weeks_in_year(year: i32) -> i64 {
    let jan1 = iso_weekday(&Date {
        year,
        month: 1,
        day: 1,
    });
    if jan1 == 4 || (is_leap_year(year) && jan1 == 3) {
        53
    } else {
        52
    }
}

fn week_of_year(args: &[Value]) -> Value {
    let Some(d) = date_of(args) else {
        return Value::Null;
    };
    // ISO 8601: week 1 is the one holding the first Thursday, so the turn of
    // the year can fall in the neighbouring year's last or first week.
    let week = (i64::from(day_of_year(d)) - iso_weekday(d) + 10).div_euclid(7);
    let week = if week < 1 {
        iso_weeks_in_year(d.year - 1)
    } else if week > iso_weeks_in_year(d.year) {
        1
    } else {
        week
    };
    week.into()
}

fn month_of_year(args: &[Value]) -> Value {
    date_of(args).map_or(Value::Null, |d| {
        MONTH_NAMES[usize::from(d.month) - 1].into()
    })
}

fn last_day_of_month(args: &[Value]) -> Value {
    // The date of that day, as Camunda defines it, not the day number.
    date_of(args).map_or(Value::Null, |d| {
        Value::Date(Date {
            day: days_in_month(d.year, d.month),
            ..*d
        })
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::temporal::{parse_date, parse_date_time};

    fn call(name: &str, args: &[Value]) -> Value {
        lookup(name).unwrap()(args)
    }
    fn date(s: &str) -> Value {
        Value::Date(parse_date(s).unwrap())
    }

    #[test]
    fn calendar_names() {
        assert_eq!(call("day of week", &[date("2018-09-17")]), "Monday".into());
        assert_eq!(call("day of week", &[date("2024-02-25")]), "Sunday".into());
        assert_eq!(
            call("day of week", &[date("1969-12-31")]),
            "Wednesday".into()
        );
        assert_eq!(
            call("month of year", &[date("2018-09-17")]),
            "September".into()
        );
        assert_eq!(call("day of year", &[date("2019-09-17")]), 260.into());
        assert_eq!(call("day of year", &[date("2020-12-31")]), 366.into());
        assert_eq!(call("day of week", &[1.into()]), Value::Null);
        let dt = Value::DateTime(parse_date_time("2018-09-17T10:00:00").unwrap());
        assert_eq!(
            call("day of week", std::slice::from_ref(&dt)),
            "Monday".into()
        );
        assert_eq!(call("month of year", &[dt]), "September".into());
    }

    #[test]
    fn week_of_year_is_iso() {
        assert_eq!(call("week of year", &[date("2019-09-17")]), 38.into());
        assert_eq!(call("week of year", &[date("2005-01-01")]), 53.into());
        assert_eq!(call("week of year", &[date("2008-12-29")]), 1.into());
        assert_eq!(call("week of year", &[date("2020-12-31")]), 53.into());
        assert_eq!(call("week of year", &[date("2021-01-03")]), 53.into());
        assert_eq!(call("week of year", &[date("2021-01-04")]), 1.into());
        assert_eq!(call("week of year", &["x".into()]), Value::Null);
    }

    #[test]
    fn last_day_of_month_is_a_date() {
        assert_eq!(
            call("last day of month", &[date("2024-02-10")]),
            date("2024-02-29")
        );
        assert_eq!(
            call("last day of month", &[date("2023-02-10")]),
            date("2023-02-28")
        );
        assert_eq!(
            call("last day of month", &[date("2023-12-01")]),
            date("2023-12-31")
        );
        assert_eq!(call("last day of month", &[Value::Null]), Value::Null);
    }

    #[test]
    fn now_and_today_agree() {
        let Value::DateTime(n) = call("now", &[]) else {
            panic!("now")
        };
        assert!(n.time.offset.is_some());
        let Value::Date(t) = call("today", &[]) else {
            panic!("today")
        };
        // Equal except across midnight between the two calls.
        assert!((date_to_epoch_days(&t) - date_to_epoch_days(&n.date)).abs() <= 1);
    }
}
