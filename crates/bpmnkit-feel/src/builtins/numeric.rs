//! Number functions (`builtins.ts`, "Number functions"). Numbers are exact
//! decimals, so rounding uses the decimal's own strategies instead of the
//! float juggling the TS twin needs.

use super::BuiltinFn;
use crate::value::{DaysTimeDuration, Value, YearsMonthsDuration};
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::{Decimal, MathematicalOps, RoundingStrategy};
use std::sync::atomic::{AtomicU64, Ordering};

pub fn lookup(name: &str) -> Option<BuiltinFn> {
    Some(match name {
        "decimal" => |a| round_fn(a, Mode::HalfEven, true),
        "floor" => |a| round_fn(a, Mode::Floor, false),
        "ceiling" => |a| round_fn(a, Mode::Ceiling, false),
        "round up" => |a| round_fn(a, Mode::Up, false),
        "round down" => |a| round_fn(a, Mode::Down, false),
        "round half up" => |a| round_fn(a, Mode::HalfUp, false),
        "round half down" => |a| round_fn(a, Mode::HalfDown, false),
        "abs" => abs,
        "modulo" => modulo,
        "sqrt" => |a| unary(a, |n| n.sqrt()),
        "log" => |a| unary(a, |n| n.checked_ln()),
        "exp" => |a| unary(a, |n| n.checked_exp()),
        "odd" => |a| unary_bool(a, |n| n.abs() % Decimal::TWO == Decimal::ONE),
        "even" => |a| unary_bool(a, |n| (n % Decimal::TWO).is_zero()),
        "random number" => |_| random_number(),
        _ => return None,
    })
}

fn num(args: &[Value], i: usize) -> Option<Decimal> {
    match args.get(i) {
        Some(Value::Number(n)) => Some(*n),
        _ => None,
    }
}

fn unary(args: &[Value], f: impl Fn(Decimal) -> Option<Decimal>) -> Value {
    num(args, 0).and_then(f).map_or(Value::Null, Value::Number)
}

fn unary_bool(args: &[Value], f: impl Fn(Decimal) -> bool) -> Value {
    num(args, 0).map_or(Value::Null, |n| Value::Boolean(f(n)))
}

// Same bounds as the TS twin (Decimal128's exponent range).
const MIN_SCALE: i64 = -6111;
const MAX_SCALE: i64 = 6176;

/// A rounding scale: absent is 0, an explicit null or non-number is an error.
fn to_scale(arg: Option<&Value>) -> Option<i64> {
    let n = match arg {
        None => return Some(0),
        Some(Value::Number(n)) => n.trunc(),
        Some(_) => return None,
    };
    let scale = n.to_i64()?;
    (MIN_SCALE..=MAX_SCALE).contains(&scale).then_some(scale)
}

#[derive(Clone, Copy)]
enum Mode {
    HalfEven,
    Floor,
    Ceiling,
    Up,
    Down,
    HalfUp,
    HalfDown,
}

impl Mode {
    fn strategy(self) -> RoundingStrategy {
        match self {
            Mode::HalfEven => RoundingStrategy::MidpointNearestEven,
            Mode::Floor => RoundingStrategy::ToNegativeInfinity,
            Mode::Ceiling => RoundingStrategy::ToPositiveInfinity,
            Mode::Up => RoundingStrategy::AwayFromZero,
            Mode::Down => RoundingStrategy::ToZero,
            Mode::HalfUp => RoundingStrategy::MidpointAwayFromZero,
            Mode::HalfDown => RoundingStrategy::MidpointTowardZero,
        }
    }
}

fn round_fn(args: &[Value], mode: Mode, scale_required: bool) -> Value {
    let (Some(n), Some(scale)) = (num(args, 0), to_scale(args.get(1))) else {
        return Value::Null;
    };
    if scale_required && args.len() < 2 {
        return Value::Null;
    }
    round_at(n, scale, mode).map_or(Value::Null, Value::Number)
}

/// Rounds `n` at `scale` (digits after the point; negative rounds to tens,
/// hundreds ...). `None` when the result does not fit a decimal.
fn round_at(n: Decimal, scale: i64, mode: Mode) -> Option<Decimal> {
    if scale >= 0 {
        // A decimal has at most 28 fraction digits, so it is already exact.
        return Some(if i64::from(n.scale()) <= scale {
            n
        } else {
            n.round_dp_with_strategy(scale as u32, mode.strategy())
        });
    }
    let k = (-scale) as u32;
    if k > 28 {
        // |n| < 10^29 <= 10^k: the quotient is below 1, so it rounds to 0
        // unless the mode rounds any remainder away from zero, and that
        // result (+-10^k) is out of range. (Half modes also round the
        // 0.5..0.79 quotients of k = 29 to 0; not worth a wider type.)
        let away = match mode {
            Mode::Up => !n.is_zero(),
            Mode::Ceiling => n.is_sign_positive() && !n.is_zero(),
            Mode::Floor => n.is_sign_negative() && !n.is_zero(),
            _ => false,
        };
        return (!away).then_some(Decimal::ZERO);
    }
    let factor = Decimal::from_i128_with_scale(10_i128.pow(k), 0);
    let q = (n / factor).round_dp_with_strategy(0, mode.strategy());
    q.checked_mul(factor)
}

fn abs(args: &[Value]) -> Value {
    match args.first() {
        Some(Value::Number(n)) => Value::Number(n.abs()),
        Some(Value::DaysTimeDuration(d)) => Value::DaysTimeDuration(DaysTimeDuration {
            seconds: d.seconds.abs(),
        }),
        Some(Value::YearsMonthsDuration(d)) => Value::YearsMonthsDuration(YearsMonthsDuration {
            months: d.months.abs(),
        }),
        _ => Value::Null,
    }
}

/// The result takes the divisor's sign, as `((n % d) + d) % d` does.
fn modulo(args: &[Value]) -> Value {
    let (Some(n), Some(d)) = (num(args, 0), num(args, 1)) else {
        return Value::Null;
    };
    let Some(r) = n.checked_rem(d) else {
        return Value::Null;
    };
    let r = if !r.is_zero() && r.is_sign_negative() != d.is_sign_negative() {
        r + d
    } else {
        r
    };
    Value::Number(r)
}

static STATE: AtomicU64 = AtomicU64::new(0);

/// splitmix64 over a counter mixed with the clock: enough for `uuid()` and
/// `random number()`, and it builds for wasm32-unknown-unknown without getrandom.
pub(crate) fn random_u64() -> u64 {
    let nanos = chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0) as u64;
    let mut z = STATE
        .fetch_add(0x9E37_79B9_7F4A_7C15, Ordering::Relaxed)
        .wrapping_add(nanos)
        .wrapping_add(0x9E37_79B9_7F4A_7C15);
    z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
    z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
    z ^ (z >> 31)
}

fn random_number() -> Value {
    let bits = random_u64() >> 11; // 53 bits, like Math.random
    Value::Number(Decimal::from(bits) / Decimal::from(1_u64 << 53))
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

    #[test]
    fn rounding_modes() {
        let r = |f: &str, x: &str, sc: Option<&str>| {
            let mut a = vec![n(x)];
            a.extend(sc.map(n));
            call(f, &a)
        };
        assert_eq!(r("floor", "1.5", None), n("1"));
        assert_eq!(r("floor", "-1.5", None), n("-2"));
        assert_eq!(r("ceiling", "1.5", None), n("2"));
        assert_eq!(r("ceiling", "-1.5", None), n("-1"));
        assert_eq!(r("round up", "5.5", None), n("6"));
        assert_eq!(r("round up", "-5.5", None), n("-6"));
        assert_eq!(r("round down", "-5.5", None), n("-5"));
        assert_eq!(r("round half up", "5.5", None), n("6"));
        assert_eq!(r("round half up", "-5.5", None), n("-6"));
        assert_eq!(r("round half down", "5.5", None), n("5"));
        assert_eq!(r("round half down", "-5.5", None), n("-5"));
        assert_eq!(r("round half up", "1.005", Some("2")), n("1.01"));
        assert_eq!(r("floor", "1.567", Some("2")), n("1.56"));
        assert_eq!(r("ceiling", "1.561", Some("2")), n("1.57"));
        assert_eq!(r("round down", "1.567", Some("2")), n("1.56"));
        assert_eq!(r("round up", "1.561", Some("2")), n("1.57"));
        assert_eq!(r("round half up", "1250", Some("-2")), n("1300"));
        assert_eq!(r("floor", "1250", Some("-2")), n("1200"));
        assert_eq!(r("floor", "5", Some("-30")), n("0"));
        assert_eq!(r("ceiling", "5", Some("-30")), Value::Null);
        assert_eq!(r("floor", "1.5", Some("7000")), Value::Null);
        assert_eq!(r("floor", "1.5", Some("40")), n("1.5"));
        assert_eq!(call("floor", &[Value::from("a")]), Value::Null);
        assert_eq!(call("floor", &[n("1.5"), Value::Null]), Value::Null);
    }

    #[test]
    fn decimal_is_half_even_and_needs_scale() {
        assert_eq!(call("decimal", &[n("1.5"), n("0")]), n("2"));
        assert_eq!(call("decimal", &[n("2.5"), n("0")]), n("2"));
        assert_eq!(call("decimal", &[n("0.3333333"), n("2")]), n("0.33"));
        assert_eq!(call("decimal", &[n("1.5")]), Value::Null);
    }

    #[test]
    fn abs_modulo_sqrt_log_exp() {
        assert_eq!(call("abs", &[n("-10")]), n("10"));
        assert_eq!(
            call("abs", &[parse_temporal("-PT5S")]),
            parse_temporal("PT5S")
        );
        assert_eq!(
            call("abs", &[parse_temporal("-P1Y")]),
            parse_temporal("P1Y")
        );
        assert_eq!(call("abs", &[Value::from("a")]), Value::Null);
        assert_eq!(call("modulo", &[n("12"), n("5")]), n("2"));
        assert_eq!(call("modulo", &[n("-12"), n("5")]), n("3"));
        assert_eq!(call("modulo", &[n("12"), n("-5")]), n("-3"));
        assert_eq!(call("modulo", &[n("10.1"), n("4.5")]), n("1.1"));
        assert_eq!(call("modulo", &[n("1"), n("0")]), Value::Null);
        assert_eq!(call("sqrt", &[n("16")]), n("4"));
        assert_eq!(call("sqrt", &[n("-1")]), Value::Null);
        assert_eq!(call("log", &[n("0")]), Value::Null);
        assert_eq!(call("log", &[n("1")]), n("0"));
        assert_eq!(call("exp", &[n("0")]), n("1"));
        assert_eq!(call("exp", &[n("100000")]), Value::Null);
    }

    #[test]
    fn odd_even() {
        assert_eq!(call("odd", &[n("5")]), Value::Boolean(true));
        assert_eq!(call("odd", &[n("-5")]), Value::Boolean(true));
        assert_eq!(call("odd", &[n("2")]), Value::Boolean(false));
        assert_eq!(call("odd", &[n("2.5")]), Value::Boolean(false));
        assert_eq!(call("even", &[n("2")]), Value::Boolean(true));
        assert_eq!(call("even", &[n("-3")]), Value::Boolean(false));
        assert_eq!(call("even", &[Value::Null]), Value::Null);
    }

    #[test]
    fn random_is_in_unit_interval_and_varies() {
        let a = call("random number", &[]);
        let b = call("random number", &[]);
        for v in [&a, &b] {
            let Value::Number(x) = v else { panic!() };
            assert!(*x >= Decimal::ZERO && *x < Decimal::ONE);
        }
        assert_ne!(a, b);
    }
}
