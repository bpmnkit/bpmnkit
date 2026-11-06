//! Dates, times, date-times and durations: parsing, formatting, calendar maths
//! and time zones (IANA via chrono-tz). Ports the temporal helpers of builtins.ts.
// STUB: filled in by the values/temporal port.
#![allow(unused_variables)]

use crate::value::Value;

/// The value of a `@"..."` literal body (or `date and time("...")`-style
/// string): date, date-time, time or duration, else `Null`.
pub fn parse_temporal(body: &str) -> Value {
    todo!()
}
