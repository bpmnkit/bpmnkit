//! Value semantics shared by the evaluator and the built-ins: comparison,
//! equality, arithmetic (numbers, temporals, durations), properties, `string()`.
//! Ports `compareValues`, `deepEquals`, `stringify` from builtins.ts, the
//! arithmetic of evaluator.ts (`evalBinary`, `addDuration`, `subtractValues`)
//! and `getProperty` from types.ts.
// STUB: filled in by the values/temporal port.
#![allow(unused_variables)]

use crate::value::Value;
use std::cmp::Ordering;

/// `compareValues`: ordering of two comparable values (numbers, strings,
/// same-kind temporals, durations); `None` when they are not comparable.
pub fn compare(a: &Value, b: &Value) -> Option<Ordering> {
    todo!()
}

/// FEEL `=`: `Some(bool)`, or `None` (null) when the types cannot be compared.
pub fn feel_equals(a: &Value, b: &Value) -> Option<bool> {
    todo!()
}

/// `deepEquals` as the built-ins use it (list contains, distinct values, index of ...).
pub fn deep_equals(a: &Value, b: &Value) -> bool {
    todo!()
}

pub fn add(a: &Value, b: &Value) -> Value {
    todo!()
}
pub fn sub(a: &Value, b: &Value) -> Value {
    todo!()
}
pub fn mul(a: &Value, b: &Value) -> Value {
    todo!()
}
pub fn div(a: &Value, b: &Value) -> Value {
    todo!()
}
/// `**`.
pub fn pow(a: &Value, b: &Value) -> Value {
    todo!()
}
/// Unary minus.
pub fn neg(a: &Value) -> Value {
    todo!()
}

/// `getProperty`: `x.key` on dates, times, durations, ranges and contexts.
pub fn get_property(v: &Value, key: &str) -> Value {
    todo!()
}

/// FEEL `string()`; `None` for null.
pub fn to_feel_string(v: &Value) -> Option<String> {
    todo!()
}
