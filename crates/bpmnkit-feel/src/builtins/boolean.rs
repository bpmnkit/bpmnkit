//! Boolean functions and the Camunda `assert` / `fromAi` helpers
//! (`builtins.ts`, "Boolean functions").

use super::BuiltinFn;
use crate::ops::{same_item, same_temporal};
use crate::value::Value;

pub fn lookup(name: &str) -> Option<BuiltinFn> {
    Some(match name {
        "not" => not,
        "is" => is,
        "is defined" => is_defined,
        "get or else" => get_or_else,
        "assert" => assert,
        "fromAi" => from_ai,
        _ => return None,
    })
}

fn arg(args: &[Value], i: usize) -> &Value {
    args.get(i).unwrap_or(&Value::Null)
}

fn not(args: &[Value]) -> Value {
    match arg(args, 0) {
        Value::Boolean(b) => Value::Boolean(!b),
        _ => Value::Null,
    }
}

fn is_defined(args: &[Value]) -> Value {
    Value::Boolean(!arg(args, 0).is_null())
}

fn get_or_else(args: &[Value]) -> Value {
    match arg(args, 0) {
        Value::Null => arg(args, 1).clone(),
        v => v.clone(),
    }
}

/// Camunda fails the evaluation when the condition does not hold; an
/// evaluation error is `null` here, so a failed assertion is `null`.
fn assert(args: &[Value]) -> Value {
    if !matches!(arg(args, 2), Value::Null | Value::String(_)) {
        return Value::Null;
    }
    match arg(args, 1) {
        Value::Boolean(true) => arg(args, 0).clone(),
        _ => Value::Null,
    }
}

/// The tag is read by the connector, not the engine: the value passes through.
fn from_ai(args: &[Value]) -> Value {
    arg(args, 0).clone()
}

/// DMN's `is()`: the same value, not merely an equal one. Times and
/// date-times differ when written differently even if they name one instant.
fn is(args: &[Value]) -> Value {
    if args.len() > 2 {
        return Value::Null;
    }
    let (a, b) = match (args.first(), args.get(1)) {
        (Some(a), Some(b)) => (a, b),
        _ => return Value::Boolean(false),
    };
    Value::Boolean(if a.is_null() || b.is_null() {
        a.is_null() && b.is_null()
    } else if matches!(a, Value::Time(_) | Value::DateTime(_))
        || matches!(b, Value::Time(_) | Value::DateTime(_))
    {
        same_temporal(a, b)
    } else {
        same_item(a, b)
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::temporal::parse_temporal;

    fn call(name: &str, args: &[Value]) -> Value {
        lookup(name).unwrap()(args)
    }
    fn t(v: bool) -> Value {
        Value::Boolean(v)
    }

    #[test]
    fn not_is_defined_get_or_else() {
        assert_eq!(call("not", &[t(true)]), t(false));
        assert_eq!(call("not", &[Value::from("x")]), Value::Null);
        assert_eq!(call("is defined", &[Value::Null]), t(false));
        assert_eq!(call("is defined", &[Value::from(1)]), t(true));
        assert_eq!(
            call("get or else", &[Value::Null, Value::from(2)]),
            Value::from(2)
        );
        assert_eq!(
            call("get or else", &[Value::from(1), Value::from(2)]),
            Value::from(1)
        );
        assert_eq!(call("get or else", &[Value::Null]), Value::Null);
    }

    #[test]
    fn assert_and_from_ai() {
        assert_eq!(call("assert", &[Value::from(5), t(true)]), Value::from(5));
        assert_eq!(call("assert", &[Value::from(5), t(false)]), Value::Null);
        assert_eq!(call("assert", &[Value::from(5), Value::Null]), Value::Null);
        assert_eq!(
            call("assert", &[Value::from(5), t(true), Value::from(1)]),
            Value::Null
        );
        assert_eq!(
            call("assert", &[Value::from(5), t(true), Value::from("why")]),
            Value::from(5)
        );
        assert_eq!(
            call("fromAi", &[Value::from("a"), Value::from("desc")]),
            Value::from("a")
        );
        assert_eq!(call("fromAi", &[Value::Null]), Value::Null);
    }

    #[test]
    fn is_distinguishes_written_forms() {
        let tm = parse_temporal;
        assert_eq!(call("is", &[Value::from(1), Value::from(1)]), t(true));
        assert_eq!(call("is", &[Value::from(1), Value::from("1")]), t(false));
        assert_eq!(call("is", &[Value::Null, Value::Null]), t(true));
        assert_eq!(call("is", &[Value::Null, Value::from(1)]), t(false));
        assert_eq!(call("is", &[Value::from(1)]), t(false));
        assert_eq!(call("is", &[tm("10:00:00Z"), tm("10:00:00Z")]), t(true));
        assert_eq!(call("is", &[tm("10:00:00"), tm("10:00:00Z")]), t(false));
        assert_eq!(
            call("is", &[tm("10:00:00Z"), tm("10:00:00+00:00")]),
            t(true)
        );
        assert_eq!(
            call(
                "is",
                &[
                    Value::List(vec![Value::from(1)]),
                    Value::List(vec![Value::from(1)])
                ]
            ),
            t(true)
        );
    }
}
