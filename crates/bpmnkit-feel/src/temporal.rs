//! Dates, times, date-times and durations: parsing, formatting, calendar maths
//! and time zones (IANA via chrono-tz). Ports the temporal helpers of builtins.ts
//! and the epoch/shift helpers of evaluator.ts.
// The helpers below are consumed by the built-ins port; until then they are
// only reachable from tests.

use crate::ops::number_to_string;
use crate::value::{Date, DateTime, DaysTimeDuration, Time, Value, YearsMonthsDuration};
use chrono::{Offset, TimeZone};
use chrono_tz::Tz;
use regex::Regex;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use std::collections::HashMap;
use std::str::FromStr;
use std::sync::LazyLock;

/// The widest year XSD's date types allow, which bounds DMN's too.
pub(crate) const MAX_YEAR: i64 = 999_999_999;
/// The largest UTC offset XSD allows (18 hours).
pub(crate) const MAX_OFFSET_SECONDS: i32 = 18 * 3600;

const SECONDS_PER_DAY: i64 = 86_400;

fn dec(n: i64) -> Decimal {
    Decimal::from(n)
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

/// Proleptic Gregorian leap year (also for year 0 and negative years).
pub(crate) fn is_leap_year(year: i32) -> bool {
    (year.rem_euclid(4) == 0 && year.rem_euclid(100) != 0) || year.rem_euclid(400) == 0
}

/// Days in `month` (1-12) of `year`.
pub(crate) fn days_in_month(year: i32, month: u8) -> u8 {
    match month {
        2 if is_leap_year(year) => 29,
        2 => 28,
        4 | 6 | 9 | 11 => 30,
        _ => 31,
    }
}

/// Builds a date, or `None` when the day does not exist in that month.
pub(crate) fn make_date(year: i64, month: i64, day: i64) -> Option<Date> {
    if year.abs() > MAX_YEAR || !(1..=12).contains(&month) {
        return None;
    }
    let year = year as i32;
    if day < 1 || day > i64::from(days_in_month(year, month as u8)) {
        return None;
    }
    Some(Date {
        year,
        month: month as u8,
        day: day as u8,
    })
}

/// Days since 1970-01-01 (proleptic Gregorian).
pub(crate) fn date_to_epoch_days(d: &Date) -> i64 {
    let y = i64::from(d.year) - 1;
    let mut days = 365 * y + y.div_euclid(4) - y.div_euclid(100) + y.div_euclid(400);
    for m in 1..d.month {
        days += i64::from(days_in_month(d.year, m));
    }
    days + i64::from(d.day) - 719_163
}

/// Inverse of [`date_to_epoch_days`]; `None` beyond the supported year range.
// Unlike the TS twin this is also right before year 1, where the TS `%`
// on negative numbers yields garbage.
pub(crate) fn epoch_days_to_date(days: i64) -> Option<Date> {
    let remaining = days.checked_add(719_162)?;
    let year400 = remaining.div_euclid(146_097);
    let mut remaining = remaining.rem_euclid(146_097);
    let year100 = (remaining / 36_524).min(3);
    remaining -= year100 * 36_524;
    let year4 = remaining / 1461;
    remaining %= 1461;
    let year1 = (remaining / 365).min(3);
    remaining -= year1 * 365;
    let year = year400 * 400 + year100 * 100 + year4 * 4 + year1 + 1;
    if year.abs() > MAX_YEAR {
        return None;
    }
    let year = year as i32;
    let mut month = 1u8;
    while month <= 12 && remaining >= i64::from(days_in_month(year, month)) {
        remaining -= i64::from(days_in_month(year, month));
        month += 1;
    }
    Some(Date {
        year,
        month,
        day: remaining as u8 + 1,
    })
}

/// FEEL weekday: Monday is 1, Sunday is 7.
pub(crate) fn weekday(d: &Date) -> u8 {
    // 1970-01-01 (epoch day 0) was a Thursday.
    ((date_to_epoch_days(d) + 3).rem_euclid(7) + 1) as u8
}

/// Day of the week with Sunday as 0 (`dayOfWeek` in builtins.ts).
pub(crate) fn day_of_week(d: &Date) -> u8 {
    (date_to_epoch_days(d) + 4).rem_euclid(7) as u8
}

/// 1-based day of the year.
pub(crate) fn day_of_year(d: &Date) -> u16 {
    let before: u16 = (1..d.month)
        .map(|m| u16::from(days_in_month(d.year, m)))
        .sum();
    before + u16::from(d.day)
}

/// A date moved by whole months; the day is clamped to the target month's
/// length (2020-01-31 + P1M is 2020-02-29). `None` beyond the year range.
pub(crate) fn shift_months(date: &Date, months: i64) -> Option<Date> {
    let total = i64::from(date.month).checked_add(months)?;
    let year = i64::from(date.year).checked_add((total - 1).div_euclid(12))?;
    if year.abs() > MAX_YEAR {
        return None;
    }
    let year = year as i32;
    let month = (total - 1).rem_euclid(12) as u8 + 1;
    Some(Date {
        year,
        month,
        day: date.day.min(days_in_month(year, month)),
    })
}

/// A time moved around the clock: 23:00 plus two hours is 01:00. Offset and
/// zone are kept. `None` on decimal overflow.
pub(crate) fn shift_time(t: &Time, seconds: Decimal) -> Option<Time> {
    let day = dec(SECONDS_PER_DAY);
    let total = time_of_day_seconds(t).checked_add(seconds)?;
    let mut total = total.checked_rem(day)?;
    if total.is_sign_negative() && !total.is_zero() {
        total += day;
    }
    Some(split_time_of_day(total, t.offset, t.timezone.clone()))
}

/// Seconds since midnight of the written clock (no offset applied).
fn time_of_day_seconds(t: &Time) -> Decimal {
    dec(i64::from(t.hour) * 3600 + i64::from(t.minute) * 60) + t.second
}

/// A time from seconds since midnight, `0 <= total < 86400`.
fn split_time_of_day(total: Decimal, offset: Option<i32>, timezone: Option<String>) -> Time {
    let whole = total.trunc().to_i64().unwrap_or(0);
    Time {
        hour: (whole / 3600) as u8,
        minute: (whole % 3600 / 60) as u8,
        second: total - dec(whole / 60 * 60),
        offset,
        timezone,
    }
}

// ---------------------------------------------------------------------------
// Time zones
// ---------------------------------------------------------------------------

enum Zone {
    Iana(Tz),
    Fixed(i32),
}

static LOWERCASE_ZONES: LazyLock<HashMap<String, Tz>> = LazyLock::new(|| {
    chrono_tz::TZ_VARIANTS
        .iter()
        .map(|tz| (tz.name().to_ascii_lowercase(), *tz))
        .collect()
});

static FIXED_ZONE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^([+-])([0-9]{2})(?::?([0-9]{2}))?$").unwrap());

// Mirrors what `Intl.DateTimeFormat` accepts as a timeZone: IANA names in any
// letter case and fixed offsets such as `+01:00`.
fn resolve_zone(name: &str) -> Option<Zone> {
    if let Ok(tz) = Tz::from_str(name) {
        return Some(Zone::Iana(tz));
    }
    if let Some(tz) = LOWERCASE_ZONES.get(&name.to_ascii_lowercase()) {
        return Some(Zone::Iana(*tz));
    }
    let m = FIXED_ZONE.captures(name)?;
    let hours: i32 = m[2].parse().ok()?;
    let minutes: i32 = m.get(3).map_or(Some(0), |x| x.as_str().parse().ok())?;
    if hours > 23 || minutes > 59 {
        return None;
    }
    let sign = if &m[1] == "-" { -1 } else { 1 };
    Some(Zone::Fixed(sign * (hours * 3600 + minutes * 60)))
}

/// True for a zone name the time zone database knows (IANA name or `+hh:mm`).
pub(crate) fn is_known_timezone(name: &str) -> bool {
    resolve_zone(name).is_some()
}

/// The UTC offset in seconds `timezone` is on at the instant `epoch_seconds`
/// (UTC), daylight saving included, to the minute as `Intl` reports it. An
/// unknown zone is UTC.
pub(crate) fn zone_offset_at_instant(timezone: &str, epoch_seconds: i64) -> i32 {
    match resolve_zone(timezone) {
        Some(Zone::Fixed(offset)) => offset,
        Some(Zone::Iana(tz)) => chrono::DateTime::from_timestamp(epoch_seconds, 0)
            .map(|utc| {
                let off = tz.offset_from_utc_datetime(&utc.naive_utc()).fix();
                off.local_minus_utc() / 60 * 60
            })
            .unwrap_or(0),
        None => 0,
    }
}

/// The offset a zone is on at 00:00 UTC of the given epoch day, which is how
/// the TS twin resolves a zoned time's offset.
pub(crate) fn zone_offset_seconds(timezone: &str, epoch_days: i64) -> i32 {
    zone_offset_at_instant(timezone, epoch_days.saturating_mul(SECONDS_PER_DAY))
}

/// The offset a time is on, or `None` when it is a local time.
pub(crate) fn offset_of(t: &Time, epoch_days: i64) -> Option<i32> {
    match (&t.offset, &t.timezone) {
        (Some(o), _) => Some(*o),
        (None, Some(tz)) => Some(zone_offset_seconds(tz, epoch_days)),
        (None, None) => None,
    }
}

/// Seconds since midnight, shifted to UTC where the time says which UTC it
/// means. A local time carries no offset, so it is left where it is.
pub(crate) fn time_to_seconds(t: &Time, epoch_days: i64) -> Decimal {
    time_of_day_seconds(t) - dec(i64::from(offset_of(t, epoch_days).unwrap_or(0)))
}

/// True when both times are local, or both say which UTC they mean.
pub(crate) fn same_time_kind(a: &Time, b: &Time, epoch_a: i64, epoch_b: i64) -> bool {
    offset_of(a, epoch_a).is_none() == offset_of(b, epoch_b).is_none()
}

/// Instant of a date-time in seconds since the epoch, zones resolved
/// (`dateTimeToSeconds` in builtins.ts; what comparison uses).
pub(crate) fn date_time_to_seconds(dt: &DateTime) -> Decimal {
    let days = date_to_epoch_days(&dt.date);
    dec(days * SECONDS_PER_DAY) + time_to_seconds(&dt.time, days)
}

/// Seconds since the epoch using only a fixed offset, never a zone
/// (`dateTimeToEpochSeconds` in evaluator.ts; what arithmetic uses).
pub(crate) fn date_time_to_epoch_seconds(dt: &DateTime) -> Decimal {
    let days = date_to_epoch_days(&dt.date);
    dec(days * SECONDS_PER_DAY) + time_of_day_seconds(&dt.time)
        - dec(i64::from(dt.time.offset.unwrap_or(0)))
}

/// Inverse of [`date_time_to_epoch_seconds`], keeping the given offset and zone.
pub(crate) fn epoch_seconds_to_date_time(
    secs: Decimal,
    offset: Option<i32>,
    timezone: Option<String>,
) -> Option<DateTime> {
    let local = secs.checked_add(dec(i64::from(offset.unwrap_or(0))))?;
    let days = (local / dec(SECONDS_PER_DAY)).floor().to_i64()?;
    let rem = local - dec(days * SECONDS_PER_DAY);
    Some(DateTime {
        date: epoch_days_to_date(days)?,
        time: split_time_of_day(rem, offset, timezone),
    })
}

static FIXED_OFFSET: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^([+-])([0-9]{2}):([0-9]{2})$").unwrap());

/// Camunda's `date and time(date, timezone)`: the same instant on the clock of
/// another zone (an IANA name, `Z`, or `+hh:mm`). A local date-time names no
/// instant, so it has none to move and gives `None`.
pub(crate) fn in_timezone(dt: &DateTime, zone: &str) -> Option<DateTime> {
    offset_of(&dt.time, date_to_epoch_days(&dt.date))?;
    let instant = date_time_to_seconds(dt);
    let (offset, timezone) = if zone == "Z" {
        (Some(0), None)
    } else if let Some(m) = FIXED_OFFSET.captures(zone) {
        let sign = if &m[1] == "-" { -1 } else { 1 };
        let h: i32 = m[2].parse().ok()?;
        let min: i32 = m[3].parse().ok()?;
        let offset = sign * (h * 3600 + min * 60);
        if offset.abs() > MAX_OFFSET_SECONDS {
            return None;
        }
        (Some(offset), None)
    } else if is_known_timezone(zone) {
        (None, Some(zone.to_owned()))
    } else {
        return None;
    };
    let shift = match offset {
        Some(o) => o,
        None => zone_offset_at_instant(zone, instant.floor().to_i64()?),
    };
    let local = instant.checked_add(dec(i64::from(shift)))?;
    let days = (local / dec(SECONDS_PER_DAY)).floor().to_i64()?;
    let rem = local - dec(days * SECONDS_PER_DAY);
    Some(DateTime {
        date: epoch_days_to_date(days)?,
        time: split_time_of_day(rem, offset, timezone),
    })
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

static DATE_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^(-?)([0-9]{4})-([0-9]{2})-([0-9]{2})$").unwrap());

static TIME_RE: LazyLock<Regex> = LazyLock::new(|| {
    // `.` in JS excludes the four line terminators.
    Regex::new(
        r"^([0-9]{2}):([0-9]{2}):([0-9]{2}(?:\.[0-9]+)?)(?:([+-])([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?|Z)?(?:@([^\n\r\x{2028}\x{2029}]+)|\[([^\n\r\x{2028}\x{2029}]+)\])?$",
    )
    .unwrap()
});

static YM_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^-?P(?:([0-9]+)Y)?(?:([0-9]+)M)?$").unwrap());

static DT_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^-?P(?:([0-9]+)D)?(?:T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+(?:\.[0-9]*)?)S)?)?$")
        .unwrap()
});

/// `YYYY-MM-DD` with exactly four year digits (and an optional leading `-`).
pub(crate) fn parse_date(s: &str) -> Option<Date> {
    let m = DATE_RE.captures(s)?;
    let year: i64 = m[2].parse().ok()?;
    let year = if &m[1] == "-" { -year } else { year };
    make_date(year, m[3].parse().ok()?, m[4].parse().ok()?)
}

/// 24:00:00 is the end-of-day form the ISO calendar allows; 24:00:01 is not.
pub(crate) fn is_valid_time(hour: i64, minute: i64, second: Decimal) -> bool {
    if !(0..=24).contains(&hour)
        || !(0..=59).contains(&minute)
        || second.is_sign_negative() && !second.is_zero()
        || second >= dec(60)
    {
        return false;
    }
    hour != 24 || (minute == 0 && second.is_zero())
}

/// `hh:mm:ss[.fff][Z|±hh:mm[:ss]][@Zone|[Zone]]`.
pub(crate) fn parse_time(s: &str) -> Option<Time> {
    let m = TIME_RE.captures(s)?;
    let hour: i64 = m[1].parse().ok()?;
    let minute: i64 = m[2].parse().ok()?;
    let second = Decimal::from_str(&m[3]).ok()?;
    let mut offset: Option<i32> = None;
    let mut timezone: Option<String> = None;
    if let Some(sign) = m.get(4) {
        let sign = if sign.as_str() == "+" { 1 } else { -1 };
        let part =
            |i: usize| -> Option<i32> { m.get(i).map_or(Some(0), |x| x.as_str().parse().ok()) };
        let total = sign * (part(5)? * 3600 + part(6)? * 60 + part(7)?);
        if total.abs() > MAX_OFFSET_SECONDS {
            return None;
        }
        offset = Some(total);
    } else if s.contains('Z') {
        offset = Some(0);
    }
    if let Some(zone) = m.get(8) {
        // A zone and an offset name the same thing twice, and may disagree.
        if offset.is_some() || !is_known_timezone(zone.as_str()) {
            return None;
        }
        timezone = Some(zone.as_str().to_owned());
    } else if let Some(zone) = m.get(9) {
        // Java's form, +02:00[Europe/Berlin]: the offset is the zone's at that
        // moment, and the zone is what the value keeps.
        if !is_known_timezone(zone.as_str()) {
            return None;
        }
        offset = None;
        timezone = Some(zone.as_str().to_owned());
    }
    if !is_valid_time(hour, minute, second) {
        return None;
    }
    Some(Time {
        hour: hour as u8,
        minute: minute as u8,
        second,
        offset,
        timezone,
    })
}

/// `date` or `date"T"time`; a bare date is midnight, local.
pub(crate) fn parse_date_time(s: &str) -> Option<DateTime> {
    match s.find('T') {
        None => parse_date(s).map(|date| DateTime {
            date,
            time: Time {
                hour: 0,
                minute: 0,
                second: Decimal::ZERO,
                offset: None,
                timezone: None,
            },
        }),
        Some(idx) => Some(DateTime {
            date: parse_date(&s[..idx])?,
            time: parse_time(&s[idx + 1..])?,
        }),
    }
}

/// ISO 8601 duration: `P[n]Y[n]M` is years-months, `P[n]DT[n]H[n]M[n]S`
/// days-time. `None` for anything else.
pub(crate) fn parse_duration(s: &str) -> Option<Value> {
    let negative = s.starts_with('-');
    if !s.bytes().any(|b| b.is_ascii_digit()) {
        return None;
    }
    let int = |m: &regex::Captures<'_>, i: usize| -> Option<i64> {
        m.get(i).map_or(Some(0), |x| x.as_str().parse().ok())
    };
    if let Some(m) = YM_RE.captures(s) {
        let total = int(&m, 1)?.checked_mul(12)?.checked_add(int(&m, 2)?)?;
        return Some(Value::YearsMonthsDuration(YearsMonthsDuration {
            months: if negative { -total } else { total },
        }));
    }
    let m = DT_RE.captures(s)?;
    let seconds = match m.get(4) {
        Some(x) => Decimal::from_str(x.as_str().trim_end_matches('.')).ok()?,
        None => Decimal::ZERO,
    };
    let total = dec(int(&m, 1)?)
        .checked_mul(dec(86400))?
        .checked_add(dec(int(&m, 2)?).checked_mul(dec(3600))?)?
        .checked_add(dec(int(&m, 3)?).checked_mul(dec(60))?)?
        .checked_add(seconds)?;
    // Zero stays positive: -PT0S is the same duration as PT0S.
    let seconds = if total.is_zero() {
        Decimal::ZERO
    } else if negative {
        -total
    } else {
        total
    };
    Some(Value::DaysTimeDuration(DaysTimeDuration { seconds }))
}

/// The value of a `@"..."` literal body (or `date and time("...")`-style
/// string): date, date-time, time or duration, else `Null`.
pub fn parse_temporal(body: &str) -> Value {
    if let Some(d) = parse_date(body) {
        return Value::Date(d);
    }
    if let Some(dt) = parse_date_time(body) {
        return Value::DateTime(dt);
    }
    if let Some(t) = parse_time(body) {
        return Value::Time(t);
    }
    parse_duration(body).unwrap_or(Value::Null)
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/// `YYYY-MM-DD`. A negative year pads its sign like the TS twin
/// (`-5` becomes `00-5`).
pub(crate) fn format_date(d: &Date) -> String {
    format!("{:0>4}-{:02}-{:02}", d.year.to_string(), d.month, d.day)
}

/// Two digits before the decimal point, and the fraction as written.
pub(crate) fn format_seconds(second: Decimal) -> String {
    let whole = second.floor().to_i64().unwrap_or(0);
    let text = number_to_string(second);
    match text.split_once('.') {
        Some((_, fraction)) => format!("{whole:02}.{fraction}"),
        None => format!("{whole:02}"),
    }
}

/// `hh:mm:ss[.fff][Z|±hh:mm][@Zone]`.
pub(crate) fn format_time(t: &Time) -> String {
    let mut s = format!("{:02}:{:02}:{}", t.hour, t.minute, format_seconds(t.second));
    if let Some(offset) = t.offset {
        if offset == 0 {
            s.push('Z');
        } else {
            let abs = offset.abs();
            let sign = if offset >= 0 { '+' } else { '-' };
            s.push_str(&format!("{sign}{:02}:{:02}", abs / 3600, abs % 3600 / 60));
            // Offsets are written to the second only when they have one.
            if abs % 60 != 0 {
                s.push_str(&format!(":{:02}", abs % 60));
            }
        }
    }
    if let Some(tz) = t.timezone.as_deref().filter(|tz| !tz.is_empty()) {
        s.push('@');
        s.push_str(tz);
    }
    s
}

/// `dateTtime`.
pub(crate) fn format_date_time(dt: &DateTime) -> String {
    format!("{}T{}", format_date(&dt.date), format_time(&dt.time))
}

/// A days-time duration as ISO 8601 (`P1DT2H`, `-PT0.5S`, `PT0S`).
pub(crate) fn format_days_time_duration(seconds: Decimal) -> String {
    let s = seconds.abs();
    let d = (s / dec(86400)).floor();
    let h = (s % dec(86400) / dec(3600)).floor();
    let m = (s % dec(3600) / dec(60)).floor();
    let sec = s % dec(60);
    let mut r = String::from(if seconds.is_sign_negative() && !seconds.is_zero() {
        "-P"
    } else {
        "P"
    });
    if !d.is_zero() {
        r.push_str(&format!("{}D", number_to_string(d)));
    }
    if !(h.is_zero() && m.is_zero() && sec.is_zero()) {
        r.push('T');
        if !h.is_zero() {
            r.push_str(&format!("{}H", number_to_string(h)));
        }
        if !m.is_zero() {
            r.push_str(&format!("{}M", number_to_string(m)));
        }
        if !sec.is_zero() {
            r.push_str(&format!("{}S", number_to_string(sec)));
        }
    }
    if r == "P" || r == "-P" {
        r.push_str("T0S");
    }
    r
}

/// A years-months duration as ISO 8601 (`P1Y2M`, `-P3M`, `P0M`).
pub(crate) fn format_years_months_duration(months: i64) -> String {
    let mo = months.unsigned_abs();
    let (y, m) = (mo / 12, mo % 12);
    let mut r = String::from(if months < 0 { "-P" } else { "P" });
    if y != 0 {
        r.push_str(&format!("{y}Y"));
    }
    if m != 0 {
        r.push_str(&format!("{m}M"));
    }
    if r == "P" || r == "-P" {
        r.push_str("0M");
    }
    r
}

#[cfg(test)]
mod tests {
    use super::*;

    fn d(s: &str) -> Decimal {
        s.parse().unwrap()
    }

    fn date(s: &str) -> Date {
        parse_date(s).unwrap()
    }

    #[test]
    fn parses_and_formats_dates() {
        assert_eq!(format_date(&date("2020-03-15")), "2020-03-15");
        assert_eq!(format_date(&date("0001-01-01")), "0001-01-01");
        assert_eq!(parse_date("2020-02-30"), None);
        assert_eq!(parse_date("2021-02-29"), None);
        assert!(parse_date("2020-02-29").is_some());
        assert_eq!(parse_date("01211-01-01"), None);
        assert_eq!(parse_date("2020-13-01"), None);
        assert_eq!(parse_date("2020-1-01"), None);
        assert_eq!(date("-0005-01-01").year, -5);
        assert_eq!(format_date(&date("-0005-01-01")), "00-5-01-01");
        assert_eq!(make_date(1_000_000_000, 1, 1), None);
        assert!(make_date(999_999_999, 12, 31).is_some());
    }

    #[test]
    fn epoch_days_round_trip() {
        assert_eq!(date_to_epoch_days(&date("1970-01-01")), 0);
        assert_eq!(date_to_epoch_days(&date("2000-03-01")), 11017);
        assert_eq!(date_to_epoch_days(&date("1969-12-31")), -1);
        for s in [
            "2020-02-29",
            "1900-03-01",
            "0001-01-01",
            "0000-12-31",
            "-0001-12-31",
            "2400-12-31",
        ] {
            let dt = date(s);
            assert_eq!(epoch_days_to_date(date_to_epoch_days(&dt)), Some(dt), "{s}");
        }
        // Before year 1 the calendar keeps counting backwards.
        assert_eq!(
            epoch_days_to_date(date_to_epoch_days(&date("0001-01-01")) - 1),
            Some(date("0000-12-31"))
        );
    }

    #[test]
    fn weekdays_and_day_of_year() {
        assert_eq!(weekday(&date("2020-01-01")), 3); // Wednesday
        assert_eq!(weekday(&date("2020-01-05")), 7); // Sunday
        assert_eq!(weekday(&date("0001-01-01")), 1); // Monday
        assert_eq!(day_of_week(&date("2020-01-05")), 0);
        assert_eq!(day_of_week(&date("2020-01-01")), 3);
        assert_eq!(day_of_year(&date("2020-03-01")), 61);
        assert_eq!(day_of_year(&date("2021-03-01")), 60);
    }

    #[test]
    fn shifts_months_clamping_the_day() {
        assert_eq!(
            shift_months(&date("2020-01-31"), 1),
            Some(date("2020-02-29"))
        );
        assert_eq!(
            shift_months(&date("2021-01-31"), 1),
            Some(date("2021-02-28"))
        );
        assert_eq!(
            shift_months(&date("2020-03-15"), -3),
            Some(date("2019-12-15"))
        );
        assert_eq!(
            shift_months(&date("2020-03-15"), 13),
            Some(date("2021-04-15"))
        );
        assert_eq!(shift_months(&date("2020-03-15"), i64::MAX), None);
    }

    #[test]
    fn parses_times() {
        let t = parse_time("10:30:15.5").unwrap();
        assert_eq!((t.hour, t.minute, t.second), (10, 30, d("15.5")));
        assert_eq!((t.offset, t.timezone.clone()), (None, None));
        assert_eq!(parse_time("10:00:00Z").unwrap().offset, Some(0));
        assert_eq!(parse_time("10:00:00+02:00").unwrap().offset, Some(7200));
        assert_eq!(parse_time("10:00:00-05:30").unwrap().offset, Some(-19800));
        assert_eq!(parse_time("10:00:00+01:00:30").unwrap().offset, Some(3630));
        assert_eq!(parse_time("10:00:00+19:00"), None);
        assert_eq!(parse_time("25:00:00"), None);
        assert_eq!(parse_time("24:00:00").unwrap().hour, 24);
        assert_eq!(parse_time("24:00:01"), None);
        assert_eq!(parse_time("10:60:00"), None);
        assert_eq!(parse_time("10:00:60"), None);
        let z = parse_time("10:00:00@Europe/Berlin").unwrap();
        assert_eq!(
            (z.offset, z.timezone.as_deref()),
            (None, Some("Europe/Berlin"))
        );
        let j = parse_time("10:00:00+02:00[Europe/Berlin]").unwrap();
        assert_eq!(
            (j.offset, j.timezone.as_deref()),
            (None, Some("Europe/Berlin"))
        );
        // A zone and an offset may disagree, so both is an error.
        assert_eq!(parse_time("10:00:00+02:00@Europe/Berlin"), None);
        assert_eq!(parse_time("10:00:00@Nowhere/Land"), None);
        // Intl is lenient about case and accepts fixed offsets as zones.
        assert!(parse_time("10:00:00@europe/berlin").is_some());
        assert!(parse_time("10:00:00@+01:00").is_some());
        assert!(parse_time("10:00:00@UTC").is_some());
    }

    #[test]
    fn formats_times() {
        for s in [
            "10:30:15.5",
            "10:00:00",
            "10:00:00Z",
            "10:00:00+02:00",
            "10:00:00-05:30",
            "10:00:00+01:00:30",
            "10:00:00@Europe/Berlin",
            "00:00:00.25",
        ] {
            assert_eq!(format_time(&parse_time(s).unwrap()), s, "{s}");
        }
        assert_eq!(
            format_time(&parse_time("10:00:00.250").unwrap()),
            "10:00:00.25"
        );
        assert_eq!(
            format_time(&parse_time("09:05:07.000").unwrap()),
            "09:05:07"
        );
        assert_eq!(
            format_time(&parse_time("10:00:00+02:00[Europe/Berlin]").unwrap()),
            "10:00:00@Europe/Berlin"
        );
    }

    #[test]
    fn parses_date_times() {
        let dt = parse_date_time("2020-01-01T10:00:00Z").unwrap();
        assert_eq!(format_date_time(&dt), "2020-01-01T10:00:00Z");
        let dt = parse_date_time("2020-01-01").unwrap();
        assert_eq!(format_date_time(&dt), "2020-01-01T00:00:00");
        assert_eq!(parse_date_time("2020-01-01T25:00:00"), None);
        assert_eq!(parse_date_time("2020-13-01T10:00:00"), None);
        let dt = parse_date_time("2020-01-01T10:00:00@Europe/Berlin").unwrap();
        assert_eq!(format_date_time(&dt), "2020-01-01T10:00:00@Europe/Berlin");
    }

    #[test]
    fn parses_and_formats_durations() {
        let ym = |s: &str| match parse_duration(s) {
            Some(Value::YearsMonthsDuration(d)) => Some(d.months),
            _ => None,
        };
        let dt = |s: &str| match parse_duration(s) {
            Some(Value::DaysTimeDuration(d)) => Some(d.seconds),
            _ => None,
        };
        assert_eq!(ym("P1Y2M"), Some(14));
        assert_eq!(ym("-P1Y"), Some(-12));
        assert_eq!(ym("P0M"), Some(0));
        assert_eq!(ym("-P0M"), Some(0));
        assert_eq!(dt("P1D"), Some(d("86400")));
        assert_eq!(dt("PT1.5S"), Some(d("1.5")));
        assert_eq!(dt("P1DT2H3M4.5S"), Some(d("93784.5")));
        assert_eq!(dt("-PT0.5S"), Some(d("-0.5")));
        assert_eq!(dt("PT5.S"), Some(d("5")));
        assert_eq!(parse_duration("P"), None);
        assert_eq!(parse_duration("PT"), None);
        assert_eq!(parse_duration("P1Y1D"), None);
        assert_eq!(parse_duration("1D"), None);
        assert!(
            matches!(parse_duration("-PT0S"), Some(Value::DaysTimeDuration(x)) if x.seconds.is_zero() && !x.seconds.is_sign_negative())
        );

        assert_eq!(format_days_time_duration(d("93784.5")), "P1DT2H3M4.5S");
        assert_eq!(format_days_time_duration(d("-0.5")), "-PT0.5S");
        assert_eq!(format_days_time_duration(d("0")), "PT0S");
        assert_eq!(format_days_time_duration(d("86400")), "P1D");
        assert_eq!(format_days_time_duration(d("3600")), "PT1H");
        assert_eq!(format_days_time_duration(d("-90")), "-PT1M30S");
        assert_eq!(format_years_months_duration(14), "P1Y2M");
        assert_eq!(format_years_months_duration(-12), "-P1Y");
        assert_eq!(format_years_months_duration(0), "P0M");
        assert_eq!(format_years_months_duration(5), "P5M");
    }

    #[test]
    fn parse_temporal_picks_the_kind() {
        assert!(matches!(parse_temporal("2020-01-01"), Value::Date(_)));
        assert!(matches!(
            parse_temporal("2020-01-01T10:00:00"),
            Value::DateTime(_)
        ));
        assert!(matches!(parse_temporal("10:00:00"), Value::Time(_)));
        assert!(matches!(parse_temporal("P1D"), Value::DaysTimeDuration(_)));
        assert!(matches!(
            parse_temporal("P1Y"),
            Value::YearsMonthsDuration(_)
        ));
        assert!(matches!(parse_temporal("nonsense"), Value::Null));
        assert!(matches!(parse_temporal("2020-02-30"), Value::Null));
    }

    #[test]
    fn zone_offsets_follow_daylight_saving() {
        let day = |s: &str| date_to_epoch_days(&date(s));
        // Melbourne: +11:00 in April (summer time just ended), +10:00 in October... and back.
        assert_eq!(
            zone_offset_seconds("Australia/Melbourne", day("2020-01-15")),
            11 * 3600
        );
        assert_eq!(
            zone_offset_seconds("Australia/Melbourne", day("2020-07-15")),
            10 * 3600
        );
        assert_eq!(
            zone_offset_seconds("Australia/Melbourne", day("2020-10-15")),
            11 * 3600
        );
        assert_eq!(
            zone_offset_seconds("Europe/Berlin", day("2020-07-01")),
            7200
        );
        assert_eq!(
            zone_offset_seconds("Europe/Berlin", day("2020-01-01")),
            3600
        );
        assert_eq!(
            zone_offset_seconds("America/New_York", day("2020-07-01")),
            -4 * 3600
        );
        assert_eq!(
            zone_offset_seconds("Asia/Kolkata", day("2020-07-01")),
            5 * 3600 + 1800
        );
        assert_eq!(zone_offset_seconds("+02:00", 0), 7200);
        assert_eq!(zone_offset_seconds("Nowhere/Land", 0), 0);
        assert!(is_known_timezone("Europe/Berlin"));
        assert!(!is_known_timezone("Europe/Atlantis"));
        assert!(!is_known_timezone(""));
    }

    #[test]
    fn date_times_convert_to_instants() {
        let dt = |s: &str| parse_date_time(s).unwrap();
        assert_eq!(date_time_to_seconds(&dt("1970-01-01T00:00:00Z")), d("0"));
        assert_eq!(
            date_time_to_seconds(&dt("1970-01-01T01:00:00+01:00")),
            d("0")
        );
        // A zone's offset is resolved: Berlin is +02:00 in July.
        assert_eq!(
            date_time_to_seconds(&dt("2020-07-01T10:00:00@Europe/Berlin")),
            date_time_to_seconds(&dt("2020-07-01T08:00:00Z"))
        );
        // Arithmetic ignores zones and only uses fixed offsets.
        assert_eq!(
            date_time_to_epoch_seconds(&dt("2020-07-01T10:00:00@Europe/Berlin")),
            date_time_to_epoch_seconds(&dt("2020-07-01T10:00:00Z"))
        );
        let back = epoch_seconds_to_date_time(d("86400.5"), Some(3600), None).unwrap();
        assert_eq!(format_date_time(&back), "1970-01-02T01:00:00.5+01:00");
        let before = epoch_seconds_to_date_time(d("-1"), None, None).unwrap();
        assert_eq!(format_date_time(&before), "1969-12-31T23:59:59");
    }

    #[test]
    fn shifts_times_around_the_clock() {
        let t = parse_time("23:00:00+01:00").unwrap();
        assert_eq!(
            format_time(&shift_time(&t, d("7200")).unwrap()),
            "01:00:00+01:00"
        );
        assert_eq!(
            format_time(&shift_time(&t, d("-82800")).unwrap()),
            "00:00:00+01:00"
        );
        let t = parse_time("00:30:00.5").unwrap();
        assert_eq!(
            format_time(&shift_time(&t, d("-3600")).unwrap()),
            "23:30:00.5"
        );
        assert!(shift_time(&t, Decimal::MAX).is_none());
    }

    #[test]
    fn moves_an_instant_to_another_zone() {
        let dt = parse_date_time("2020-07-01T10:00:00Z").unwrap();
        let berlin = in_timezone(&dt, "Europe/Berlin").unwrap();
        assert_eq!(
            format_date_time(&berlin),
            "2020-07-01T12:00:00@Europe/Berlin"
        );
        let melbourne = in_timezone(&dt, "Australia/Melbourne").unwrap();
        assert_eq!(
            format_date_time(&melbourne),
            "2020-07-01T20:00:00@Australia/Melbourne"
        );
        let fixed = in_timezone(&dt, "-05:30").unwrap();
        assert_eq!(format_date_time(&fixed), "2020-07-01T04:30:00-05:30");
        let z = in_timezone(&berlin, "Z").unwrap();
        assert_eq!(format_date_time(&z), "2020-07-01T10:00:00Z");
        let next_day =
            in_timezone(&parse_date_time("2020-07-01T23:00:00Z").unwrap(), "+02:00").unwrap();
        assert_eq!(format_date_time(&next_day), "2020-07-02T01:00:00+02:00");
        assert_eq!(in_timezone(&dt, "Nowhere/Land"), None);
        assert_eq!(in_timezone(&dt, "+19:00"), None);
        // A local date-time names no instant.
        let local = parse_date_time("2020-07-01T10:00:00").unwrap();
        assert_eq!(in_timezone(&local, "Z"), None);
    }
}
