//! FEEL's `number`: a decimal with DMN's Decimal128 semantics, as Camunda 8
//! (feel-scala on `java.math.BigDecimal` with `MathContext.DECIMAL128`) computes it:
//! 34 significant digits, every result rounded half-even, and a scale kept like
//! `BigDecimal`'s (`100 * 1.1` is `110.0`). Equality, ordering and hashing go by
//! value, so `1.0 = 1.00`.
//!
//! The digits live in a `fastnum::D256` (77 digits), wide enough that the exact
//! product of two 34-digit numbers needs no rounding before the one rounding to
//! 34 digits; quotients are 77 digits before that rounding.

use fastnum::decimal::{Context, RoundingMode};
use fastnum::D256;
use std::cmp::Ordering;
use std::fmt;
use std::hash::{Hash, Hasher};
use std::ops::{Add, AddAssign, Div, Mul, MulAssign, Neg, Rem, Sub, SubAssign};
use std::str::FromStr;

/// Significant digits a number keeps (Decimal128's precision).
pub const PRECISION: usize = 34;

const CTX: Context = Context::default()
    .with_rounding_mode(RoundingMode::HalfEven)
    .without_traps();

/// A finite decimal of at most [`PRECISION`] significant digits; never `-0`.
#[derive(Clone, Copy)]
pub struct Decimal(D256);

/// How [`Decimal::round_dp_with_strategy`] rounds; `BigDecimal`'s modes.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RoundingStrategy {
    HalfEven,
    HalfUp,
    HalfDown,
    /// Away from zero.
    Up,
    /// Toward zero.
    Down,
    /// Toward positive infinity.
    Ceiling,
    /// Toward negative infinity.
    Floor,
}

impl RoundingStrategy {
    fn mode(self) -> RoundingMode {
        match self {
            Self::HalfEven => RoundingMode::HalfEven,
            Self::HalfUp => RoundingMode::HalfUp,
            Self::HalfDown => RoundingMode::HalfDown,
            Self::Up => RoundingMode::Up,
            Self::Down => RoundingMode::Down,
            Self::Ceiling => RoundingMode::Ceiling,
            Self::Floor => RoundingMode::Floor,
        }
    }
}

/// Text that is not a decimal, or a value out of a decimal's (or the target type's) range.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct DecimalError;

impl fmt::Display for DecimalError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("invalid or out-of-range decimal")
    }
}

impl std::error::Error for DecimalError {}

impl Decimal {
    pub const ZERO: Decimal = Decimal(D256::ZERO.with_ctx(CTX));
    pub const ONE: Decimal = Decimal(D256::ONE.with_ctx(CTX));
    pub const TWO: Decimal = Decimal(D256::TWO.with_ctx(CTX));
    pub const TEN: Decimal = Decimal(D256::TEN.with_ctx(CTX));

    /// Rounds an exact (or 77-digit) result to [`PRECISION`] digits, half-even.
    /// `None` for infinities, NaN and exponents out of range.
    fn fit(d: D256) -> Option<Decimal> {
        if !d.is_finite() {
            return None;
        }
        let mut d = d.with_ctx(CTX);
        let digits = d.digits_count();
        if digits > PRECISION {
            let scale = i32::from(d.fractional_digits_count()) - (digits - PRECISION) as i32;
            d = d.rescale(i16::try_from(scale).ok()?);
            // 99..95 rounds up to 100..0: one digit too many, and that digit is a 0.
            if d.digits_count() > PRECISION {
                d = d.rescale(i16::try_from(scale - 1).ok()?);
            }
            if !d.is_finite() {
                return None;
            }
        }
        if d.is_zero() {
            // No `-0`, and no `0E+3`: zero keeps a fraction's scale only.
            d = d.abs();
            if d.fractional_digits_count() < 0 {
                d = d.rescale(0);
            }
        }
        Some(Decimal(d))
    }

    /// `num * 10^-scale`, like `rust_decimal::Decimal::new`.
    pub fn new(num: i64, scale: u32) -> Decimal {
        let exp = -i64::from(scale);
        Self::fit(D256::from_i64(num).with_ctx(CTX).mul(pow10(exp))).unwrap_or(Self::ZERO)
    }

    /// Parses `[+-]digits[.digits][e[+-]digits]`, rounding beyond 34 digits half-even.
    pub fn from_scientific(s: &str) -> Result<Decimal, DecimalError> {
        parse(s, false)
    }

    /// Like [`FromStr`], but fails instead of rounding a number of more than 34 digits.
    pub fn from_str_exact(s: &str) -> Result<Decimal, DecimalError> {
        parse(s, true)
    }

    pub fn checked_add(self, o: Decimal) -> Option<Decimal> {
        Self::fit(self.0.add(o.0))
    }

    pub fn checked_sub(self, o: Decimal) -> Option<Decimal> {
        Self::fit(self.0.sub(o.0))
    }

    pub fn checked_mul(self, o: Decimal) -> Option<Decimal> {
        Self::fit(self.0.mul(o.0))
    }

    /// `None` for division by zero.
    pub fn checked_div(self, o: Decimal) -> Option<Decimal> {
        if o.is_zero() {
            return None;
        }
        Self::fit(self.0.div(o.0))
    }

    /// The truncated remainder: its sign is the dividend's. `None` for a zero
    /// divisor, and when the integer quotient needs more than 34 digits
    /// (BigDecimal's `remainder` under DECIMAL128 fails there too).
    pub fn checked_rem(self, o: Decimal) -> Option<Decimal> {
        if o.is_zero() {
            return None;
        }
        // 77 digits leave the quotient's fraction too long to round up to an integer.
        let q = self
            .0
            .div(o.0)
            .with_rounding_mode(RoundingMode::Down)
            .trunc();
        if !q.is_finite() || q.digits_count() > PRECISION {
            return None;
        }
        Self::fit(self.0.sub(q.with_ctx(CTX).mul(o.0)))
    }

    pub fn checked_neg(self) -> Option<Decimal> {
        Some(-self)
    }

    /// `self + o`, or the operand with the larger magnitude if the sum overflows.
    pub fn saturating_add(self, o: Decimal) -> Decimal {
        self.checked_add(o)
            .unwrap_or(if self.abs() >= o.abs() { self } else { o })
    }

    /// `self ** n` exactly as BigDecimal's `pow(n, DECIMAL128)` would: the
    /// squarings run at 77 digits and the result rounds once to 34.
    /// A negative `n` is `1 / self ** -n`. `None` on overflow and for `0 ** -n`.
    pub fn checked_powi(self, n: i64) -> Option<Decimal> {
        let mut base = self.0;
        let mut e = n.unsigned_abs();
        let mut acc = D256::ONE.with_ctx(CTX);
        while e > 0 {
            if e & 1 == 1 {
                acc = acc.mul(base);
            }
            e >>= 1;
            if e > 0 {
                base = base.mul(base);
            }
            if !acc.is_finite() || !base.is_finite() {
                return None;
            }
        }
        if n < 0 {
            if acc.is_zero() {
                return None;
            }
            acc = D256::ONE.with_ctx(CTX).div(acc);
        }
        Self::fit(acc)
    }

    /// Converts a float64 result the way Scala's `BigDecimal(d: Double)` does
    /// (through Java's `Double.toString`): the shortest digits that round-trip,
    /// with at least one fraction digit, so `sqrt(16)` is `4.0`.
    /// For FEEL's irrational functions, which Camunda computes in float64.
    pub fn from_f64_java(x: f64) -> Option<Decimal> {
        if !x.is_finite() {
            return None;
        }
        let (digits, exp) = shortest(x);
        let n = digits.len() as i64;
        let abs = x.abs();
        // Java writes 1e-3 <= |x| < 1e7 plainly ("123.0"), others as "1.0E7".
        let scale = if (1e-3..1e7).contains(&abs) || abs == 0.0 {
            (n - 1 - exp).max(1)
        } else {
            (n - 1).max(1) - exp
        };
        let zeros = scale - (n - 1 - exp);
        let sign = if x.is_sign_negative() { "-" } else { "" };
        let text = format!("{sign}{digits}{}e{}", "0".repeat(zeros as usize), -scale);
        Decimal::from_str(&text).ok()
    }

    /// The nearest float64 (`None` beyond its range).
    /// `f(self)` in float64, converted as [`from_f64_java`](Self::from_f64_java) does;
    /// `None` when either side is out of range or the result is NaN.
    pub fn map_f64(self, f: impl FnOnce(f64) -> f64) -> Option<Decimal> {
        Self::from_f64_java(f(self.to_f64()?))
    }

    pub fn to_f64(self) -> Option<f64> {
        let f: f64 = self.sci_text().parse().ok()?;
        f.is_finite().then_some(f)
    }

    /// The integer part as `i64`, truncated like `rust_decimal`'s `ToPrimitive`.
    pub fn to_i64(self) -> Option<i64> {
        self.trunc().0.to_i64().ok()
    }

    pub fn to_i32(self) -> Option<i32> {
        self.to_i64()?.try_into().ok()
    }

    pub fn to_u32(self) -> Option<u32> {
        self.to_i64()?.try_into().ok()
    }

    pub fn to_u64(self) -> Option<u64> {
        self.trunc().0.to_u64().ok()
    }

    pub fn to_usize(self) -> Option<usize> {
        self.to_u64()?.try_into().ok()
    }

    pub fn abs(self) -> Decimal {
        Decimal(self.0.abs())
    }

    pub fn is_zero(&self) -> bool {
        self.0.is_zero()
    }

    /// Zero is positive: there is no `-0`.
    pub fn is_sign_negative(&self) -> bool {
        self.0.is_sign_negative()
    }

    pub fn is_sign_positive(&self) -> bool {
        !self.is_sign_negative()
    }

    /// True for a whole number, whatever its scale (`2.00`).
    pub fn is_integer(&self) -> bool {
        self.fract().is_zero()
    }

    /// Digits after the point; negative for `1E+3`-style numbers.
    pub fn scale(&self) -> i32 {
        i32::from(self.0.fractional_digits_count())
    }

    /// Rounds to `dp` digits after the point (negative: to tens, hundreds ...),
    /// setting the scale to `dp` as `BigDecimal.setScale` does, unless that would
    /// take more than 34 digits. `None` when `dp` is out of range.
    pub fn round_dp_with_strategy(self, dp: i32, strategy: RoundingStrategy) -> Option<Decimal> {
        let dp16 = i16::try_from(dp).ok()?;
        let scale = self.scale();
        if dp >= scale {
            let widened = self.0.digits_count() as i64 + i64::from(dp - scale);
            if self.is_zero() || widened > PRECISION as i64 {
                return Some(self);
            }
        }
        let drop = scale - dp;
        if drop > 0 && drop >= self.0.digits_count() as i32 {
            return Some(self.round_below_unit(dp16, strategy));
        }
        let rounded = self.0.with_rounding_mode(strategy.mode()).rescale(dp16);
        Self::fit(rounded)
    }

    /// Rounding at a digit left of every digit `self` has (`|self| < 10^-dp`):
    /// the result is 0 or one unit `10^-dp`, signed like `self`.
    fn round_below_unit(self, dp: i16, strategy: RoundingStrategy) -> Decimal {
        use RoundingStrategy::*;
        let unit = pow10(-i64::from(dp));
        let half = self.abs().0.cmp(&unit.mul(D256::HALF));
        let away = !self.is_zero()
            && match strategy {
                Up => true,
                Down => false,
                Ceiling => self.is_sign_positive(),
                Floor => self.is_sign_negative(),
                HalfUp => half != Ordering::Less,
                // At a tie the even neighbour is 0.
                HalfDown | HalfEven => half == Ordering::Greater,
            };
        let magnitude = if away {
            unit
        } else {
            D256::ZERO.with_ctx(CTX).rescale(dp)
        };
        let d = if away && self.is_sign_negative() {
            magnitude.neg()
        } else {
            magnitude
        };
        Self::fit(d).unwrap_or(Self::ZERO)
    }

    fn round_whole(self, strategy: RoundingStrategy) -> Decimal {
        if self.scale() <= 0 {
            return self;
        }
        self.round_dp_with_strategy(0, strategy).unwrap_or(self)
    }

    /// Toward zero, to scale 0.
    pub fn trunc(self) -> Decimal {
        self.round_whole(RoundingStrategy::Down)
    }

    pub fn floor(self) -> Decimal {
        self.round_whole(RoundingStrategy::Floor)
    }

    pub fn ceil(self) -> Decimal {
        self.round_whole(RoundingStrategy::Ceiling)
    }

    /// Half-even, to scale 0.
    pub fn round(self) -> Decimal {
        self.round_whole(RoundingStrategy::HalfEven)
    }

    /// `self - self.trunc()`, with the sign of `self`.
    pub fn fract(self) -> Decimal {
        self.checked_sub(self.trunc()).unwrap_or(Self::ZERO)
    }

    /// The same value without trailing zeros (`BigDecimal.stripTrailingZeros`).
    pub fn normalize(self) -> Decimal {
        if self.is_zero() {
            return Self::ZERO;
        }
        Decimal(self.0.reduce())
    }

    /// `(negative, coefficient digits, scale)`.
    fn parts(&self) -> (bool, String, i32) {
        (
            self.is_sign_negative(),
            self.0.digits().to_string(),
            self.scale(),
        )
    }

    fn sci_text(&self) -> String {
        let (neg, digits, scale) = self.parts();
        format!("{}{digits}e{}", if neg { "-" } else { "" }, -scale)
    }

    /// `(coefficient digits, scale)` without trailing zeros, for JS-style formatting.
    pub(crate) fn normalized_parts(&self) -> (String, i64) {
        let (_, digits, scale) = self.normalize().parts();
        (digits, i64::from(scale))
    }
}

fn pow10(exp: i64) -> D256 {
    D256::from_str(&format!("1e{exp}"), CTX).unwrap_or(D256::ONE)
}

/// Shortest round-trip digits of a finite float (no leading zeros) and the
/// decimal exponent of the first one: `x = d.ddd * 10^exp`.
fn shortest(x: f64) -> (String, i64) {
    let text = format!("{:e}", x.abs());
    let (mant, exp) = text.split_once('e').unwrap_or((&text, "0"));
    (mant.replace('.', ""), exp.parse().unwrap_or(0))
}

fn parse(s: &str, exact: bool) -> Result<Decimal, DecimalError> {
    let (neg, rest) = match s.as_bytes().first() {
        Some(b'-') => (true, &s[1..]),
        Some(b'+') => (false, &s[1..]),
        _ => (false, s),
    };
    let (mant, exp) = match rest.find(['e', 'E']) {
        Some(i) => {
            let e = &rest[i + 1..];
            let digits = e.strip_prefix(['+', '-']).unwrap_or(e);
            if digits.is_empty() || !digits.bytes().all(|b| b.is_ascii_digit()) {
                return Err(DecimalError);
            }
            (&rest[..i], e.parse::<i64>().map_err(|_| DecimalError)?)
        }
        None => (rest, 0),
    };
    let (int, frac) = mant.split_once('.').unwrap_or((mant, ""));
    if int.is_empty() && frac.is_empty()
        || !int.bytes().chain(frac.bytes()).all(|b| b.is_ascii_digit())
    {
        return Err(DecimalError);
    }
    let all = format!("{int}{frac}");
    let mut coeff = all.trim_start_matches('0').to_owned();
    let mut exp = exp.checked_sub(frac.len() as i64).ok_or(DecimalError)?;
    if coeff.len() > PRECISION {
        if exact {
            return Err(DecimalError);
        }
        let dropped = coeff.len() - PRECISION;
        let (keep, rest) = coeff.split_at(PRECISION);
        let first = rest.as_bytes()[0];
        let beyond = rest[1..].bytes().any(|b| b != b'0');
        let odd = (keep.as_bytes()[PRECISION - 1] - b'0') % 2 == 1;
        let up = first > b'5' || first == b'5' && (beyond || odd);
        let mut kept = keep.as_bytes().to_vec();
        if up {
            let mut i = kept.len();
            loop {
                if i == 0 {
                    kept.insert(0, b'1');
                    break;
                }
                i -= 1;
                if kept[i] == b'9' {
                    kept[i] = b'0';
                } else {
                    kept[i] += 1;
                    break;
                }
            }
        }
        exp += dropped as i64;
        if kept.len() > PRECISION {
            kept.pop();
            exp += 1;
        }
        coeff = String::from_utf8(kept).map_err(|_| DecimalError)?;
    }
    if coeff.is_empty() {
        coeff.push('0');
    }
    let text = format!("{}{coeff}e{exp}", if neg { "-" } else { "" });
    let d = D256::from_str(&text, CTX).map_err(|_| DecimalError)?;
    Decimal::fit(d).ok_or(DecimalError)
}

impl FromStr for Decimal {
    type Err = DecimalError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        parse(s, false)
    }
}

macro_rules! from_int {
    ($($t:ty => $f:ident),*) => {$(
        impl From<$t> for Decimal {
            fn from(n: $t) -> Self {
                Decimal(D256::$f(n).with_ctx(CTX))
            }
        }
    )*};
}
from_int!(i8 => from_i8, i16 => from_i16, i32 => from_i32, i64 => from_i64,
    u8 => from_u8, u16 => from_u16, u32 => from_u32, u64 => from_u64, usize => from_usize);

impl From<isize> for Decimal {
    fn from(n: isize) -> Self {
        Decimal::from(n as i64)
    }
}

impl TryFrom<f64> for Decimal {
    type Error = DecimalError;
    /// The shortest decimal that round-trips to `n` (`0.1` is `0.1`).
    fn try_from(n: f64) -> Result<Self, DecimalError> {
        if !n.is_finite() {
            return Err(DecimalError);
        }
        Decimal::from_str(&format!("{n:e}"))
    }
}

macro_rules! to_int {
    ($($t:ty => $f:ident),*) => {$(
        impl TryFrom<Decimal> for $t {
            type Error = DecimalError;
            /// Truncates the fraction; fails beyond the type's range.
            fn try_from(d: Decimal) -> Result<Self, DecimalError> {
                d.$f().ok_or(DecimalError)
            }
        }
    )*};
}
to_int!(i64 => to_i64, i32 => to_i32, u32 => to_u32, u64 => to_u64, usize => to_usize);

impl TryFrom<Decimal> for f64 {
    type Error = DecimalError;
    fn try_from(d: Decimal) -> Result<Self, DecimalError> {
        d.to_f64().ok_or(DecimalError)
    }
}

impl PartialEq for Decimal {
    fn eq(&self, o: &Self) -> bool {
        self.cmp(o) == Ordering::Equal
    }
}

impl Eq for Decimal {}

impl PartialOrd for Decimal {
    fn partial_cmp(&self, o: &Self) -> Option<Ordering> {
        Some(self.cmp(o))
    }
}

impl Ord for Decimal {
    fn cmp(&self, o: &Self) -> Ordering {
        self.0.cmp(&o.0)
    }
}

impl Hash for Decimal {
    fn hash<H: Hasher>(&self, state: &mut H) {
        let (neg, digits, scale) = self.normalize().parts();
        neg.hash(state);
        digits.hash(state);
        scale.hash(state);
    }
}

impl Default for Decimal {
    fn default() -> Self {
        Self::ZERO
    }
}

/// Plain notation keeping the scale, as `BigDecimal.toPlainString` (`110.0`, `1000`).
impl fmt::Display for Decimal {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let (neg, digits, scale) = self.parts();
        let mut out = String::new();
        if neg {
            out.push('-');
        }
        if scale <= 0 {
            out.push_str(&digits);
            if !self.is_zero() {
                out.push_str(&"0".repeat(scale.unsigned_abs() as usize));
            }
        } else {
            let scale = scale as usize;
            let padded = format!("{digits:0>width$}", width = scale + 1);
            let (int, frac) = padded.split_at(padded.len() - scale);
            out.push_str(int);
            out.push('.');
            out.push_str(frac);
        }
        f.pad(&out)
    }
}

impl fmt::Debug for Decimal {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt::Display::fmt(self, f)
    }
}

impl Neg for Decimal {
    type Output = Decimal;
    fn neg(self) -> Decimal {
        if self.is_zero() {
            self
        } else {
            Decimal(self.0.neg())
        }
    }
}

// The operators are for results that cannot overflow (small integers, bounded
// times). They never panic: an impossible result is 0. Use `checked_*` elsewhere.
macro_rules! op {
    ($tr:ident $f:ident $checked:ident, $tra:ident $fa:ident) => {
        impl $tr for Decimal {
            type Output = Decimal;
            fn $f(self, o: Decimal) -> Decimal {
                self.$checked(o).unwrap_or(Decimal::ZERO)
            }
        }
        impl $tra for Decimal {
            fn $fa(&mut self, o: Decimal) {
                *self = self.$checked(o).unwrap_or(Decimal::ZERO);
            }
        }
    };
}
op!(Add add checked_add, AddAssign add_assign);
op!(Sub sub checked_sub, SubAssign sub_assign);
op!(Mul mul checked_mul, MulAssign mul_assign);

impl Div for Decimal {
    type Output = Decimal;
    fn div(self, o: Decimal) -> Decimal {
        self.checked_div(o).unwrap_or(Decimal::ZERO)
    }
}

impl Rem for Decimal {
    type Output = Decimal;
    fn rem(self, o: Decimal) -> Decimal {
        self.checked_rem(o).unwrap_or(Decimal::ZERO)
    }
}

impl std::iter::Sum for Decimal {
    fn sum<I: Iterator<Item = Decimal>>(iter: I) -> Decimal {
        iter.fold(Decimal::ZERO, |a, b| a + b)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn d(s: &str) -> Decimal {
        s.parse().unwrap()
    }

    #[test]
    fn parse_and_display_keep_scale() {
        for s in [
            "0",
            "1.50",
            "-12.375",
            "0.00",
            "1000",
            "0.0000001",
            "123456789",
        ] {
            assert_eq!(d(s).to_string(), s);
        }
        assert_eq!(d("1e3").to_string(), "1000");
        assert_eq!(d("1.5e-3").to_string(), "0.0015");
        assert_eq!(d("-0").to_string(), "0");
        assert_eq!(d(".5").to_string(), "0.5");
        assert!("1.2.3".parse::<Decimal>().is_err());
        assert!("".parse::<Decimal>().is_err());
        assert!("1e".parse::<Decimal>().is_err());
        assert!("abc".parse::<Decimal>().is_err());
    }

    #[test]
    fn rounds_to_34_digits_half_even() {
        let many = "1234567890123456789012345678901234";
        assert_eq!(d(many).to_string(), many);
        assert_eq!(d(&format!("{many}5")).to_string(), format!("{many}0"));
        assert_eq!(
            d("0.33333333333333333333333333333333335").to_string(),
            "0.3333333333333333333333333333333334"
        );
        assert_eq!(
            d("0.33333333333333333333333333333333325").to_string(),
            "0.3333333333333333333333333333333332"
        );
        assert_eq!(
            d("0.333333333333333333333333333333333251").to_string(),
            "0.3333333333333333333333333333333333"
        );
        assert_eq!(
            d("9999999999999999999999999999999999.5").to_string(),
            format!("1{}", "0".repeat(34))
        );
        assert!(Decimal::from_str_exact(&format!("{many}5")).is_err());
    }

    #[test]
    fn arithmetic() {
        assert_eq!((d("0.1") + d("0.2")).to_string(), "0.3");
        assert_eq!((d("100") * d("1.1")).to_string(), "110.0");
        assert_eq!(
            (d("1") / d("3")).to_string(),
            "0.3333333333333333333333333333333333"
        );
        assert_eq!(
            (d("2") / d("3")).to_string(),
            "0.6666666666666666666666666666666667"
        );
        assert_eq!((d("10") / d("4")).to_string(), "2.5");
        assert_eq!(d("1").checked_div(Decimal::ZERO), None);
        assert_eq!(d("7").checked_rem(d("-3")), Some(d("1")));
        assert_eq!(d("-7").checked_rem(d("3")), Some(d("-1")));
        assert_eq!(d("10.1").checked_rem(d("4.5")), Some(d("1.1")));
        assert_eq!(d("1e40").checked_rem(d("7")), None);
        assert_eq!(d("1e33").checked_rem(d("7")), Some(d("6")));
        assert_eq!(
            d("2").checked_powi(100).unwrap().to_string(),
            "1267650600228229401496703205376"
        );
        assert_eq!(d("10").checked_powi(-2).unwrap().to_string(), "0.01");
        assert_eq!(d("0").checked_powi(-1), None);
        assert_eq!(d("10").checked_powi(100_000), None);
        assert_eq!(d("1e30000").checked_mul(d("1e30000")), None);
        assert_eq!(d("1.0"), d("1.00"));
        assert_eq!((-Decimal::ZERO).to_string(), "0");
    }

    #[test]
    fn rounding() {
        let r = |x: &str, dp, s| d(x).round_dp_with_strategy(dp, s).unwrap().to_string();
        assert_eq!(r("2.5", 0, RoundingStrategy::HalfEven), "2");
        assert_eq!(r("5", -1, RoundingStrategy::HalfUp), "10");
        assert_eq!(r("5", -1, RoundingStrategy::HalfEven), "0");
        assert_eq!(r("5", -1, RoundingStrategy::HalfDown), "0");
        assert_eq!(r("6", -1, RoundingStrategy::HalfDown), "10");
        assert_eq!(r("-0.04", 1, RoundingStrategy::Floor), "-0.1");
        assert_eq!(r("0.04", 1, RoundingStrategy::Floor), "0.0");
        assert_eq!(r("-0.04", 1, RoundingStrategy::Up), "-0.1");
        assert_eq!(r("0.05", 1, RoundingStrategy::HalfUp), "0.1");
        assert_eq!(r("0.05", 1, RoundingStrategy::HalfEven), "0.0");
        assert_eq!(r("0.051", 1, RoundingStrategy::HalfEven), "0.1");
        assert_eq!(
            d("-0.0000115740740740740740740740740740741").floor(),
            d("-1")
        );
        assert_eq!(r("1.5", 2, RoundingStrategy::HalfEven), "1.50");
        assert_eq!(r("1250", -2, RoundingStrategy::HalfUp), "1300");
        assert_eq!(r("5", -30, RoundingStrategy::Down), "0");
        assert_eq!(
            r("5", -30, RoundingStrategy::Up),
            format!("1{}", "0".repeat(30))
        );
        assert_eq!(d("-5.5").floor(), d("-6"));
        assert_eq!(d("-5.5").ceil(), d("-5"));
        assert_eq!(d("-5.5").trunc(), d("-5"));
        assert_eq!(d("-5.25").fract(), d("-0.25"));
        assert_eq!(d("2.5").round(), d("2"));
    }

    #[test]
    fn floats() {
        assert_eq!(
            Decimal::from_f64_java(2f64.sqrt()).unwrap().to_string(),
            "1.4142135623730951"
        );
        assert_eq!(Decimal::from_f64_java(4.0).unwrap().to_string(), "4.0");
        assert_eq!(Decimal::from_f64_java(1e7).unwrap().to_string(), "10000000");
        assert_eq!(
            Decimal::from_f64_java(0.0001).unwrap().to_string(),
            "0.00010"
        );
        assert_eq!(Decimal::from_f64_java(-0.5).unwrap().to_string(), "-0.5");
        assert_eq!(Decimal::try_from(0.1).unwrap().to_string(), "0.1");
        assert_eq!(d("0.1").to_f64(), Some(0.1));
        assert_eq!(d("2.9").to_i64(), Some(2));
        assert_eq!(d("-2.9").to_i64(), Some(-2));
    }
}
