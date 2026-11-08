//! FEEL values. Mirrors `packages/feel/src/types.ts`; numbers are exact decimals.

use indexmap::IndexMap;
use rust_decimal::Decimal;
use std::fmt;
use std::sync::Arc;

/// A FEEL value. Evaluation errors are `Null`, as in FEEL.
#[derive(Debug, Clone, Default)]
pub enum Value {
    #[default]
    Null,
    Boolean(bool),
    Number(Decimal),
    String(String),
    Date(Date),
    Time(Time),
    DateTime(DateTime),
    DaysTimeDuration(DaysTimeDuration),
    YearsMonthsDuration(YearsMonthsDuration),
    Range(Box<Range>),
    List(Vec<Value>),
    Context(Context),
    Function(Function),
}

/// A calendar date. `year` spans XSD's range (±999 999 999).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Date {
    pub year: i32,
    pub month: u8,
    pub day: u8,
}

/// A time of day. `second` may carry a fraction. With neither `offset` nor
/// `timezone` it is a local time; `timezone` is an IANA zone name.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Time {
    pub hour: u8,
    pub minute: u8,
    pub second: Decimal,
    /// Fixed UTC offset in seconds.
    pub offset: Option<i32>,
    pub timezone: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct DateTime {
    pub date: Date,
    pub time: Time,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct DaysTimeDuration {
    pub seconds: Decimal,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct YearsMonthsDuration {
    pub months: i64,
}

/// A range; an unbounded side has a `Null` endpoint (`< 10`).
#[derive(Debug, Clone, PartialEq)]
pub struct Range {
    pub start: Value,
    pub start_included: bool,
    pub end: Value,
    pub end_included: bool,
}

type Call = dyn Fn(&[Value]) -> Value + Send + Sync;

/// A callable value: a built-in, a `function(..)` literal, or a host function.
#[derive(Clone)]
pub struct Function {
    call: Arc<Call>,
    params: Option<Arc<[String]>>,
}

impl Function {
    /// A host function. `params` enables named invocation (`f(a: 1)`).
    pub fn new(
        params: Option<Vec<String>>,
        call: impl Fn(&[Value]) -> Value + Send + Sync + 'static,
    ) -> Self {
        Function {
            call: Arc::new(call),
            params: params.map(Into::into),
        }
    }

    pub fn call(&self, args: &[Value]) -> Value {
        (self.call)(args)
    }

    pub fn params(&self) -> Option<&[String]> {
        self.params.as_deref()
    }
}

impl fmt::Debug for Function {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "function({:?})", self.params)
    }
}

impl PartialEq for Function {
    fn eq(&self, other: &Self) -> bool {
        Arc::ptr_eq(&self.call, &other.call)
    }
}

/// Structural equality, the Rust-side counterpart of the conformance
/// comparison: numbers compare by value (`1.0 == 1`), contexts by entries with
/// key order ignored, functions by identity. FEEL's own `=` is in the evaluator.
impl PartialEq for Value {
    fn eq(&self, other: &Self) -> bool {
        use Value::*;
        match (self, other) {
            (Null, Null) => true,
            (Boolean(a), Boolean(b)) => a == b,
            (Number(a), Number(b)) => a == b,
            (String(a), String(b)) => a == b,
            (Date(a), Date(b)) => a == b,
            (Time(a), Time(b)) => a == b,
            (DateTime(a), DateTime(b)) => a == b,
            (DaysTimeDuration(a), DaysTimeDuration(b)) => a == b,
            (YearsMonthsDuration(a), YearsMonthsDuration(b)) => a == b,
            (Range(a), Range(b)) => a == b,
            (List(a), List(b)) => a == b,
            (Context(a), Context(b)) => a == b,
            (Function(a), Function(b)) => a == b,
            _ => false,
        }
    }
}

impl Value {
    /// FEEL's type name, as `instance of` spells it.
    pub fn type_name(&self) -> &'static str {
        match self {
            Value::Null => "null",
            Value::Boolean(_) => "boolean",
            Value::Number(_) => "number",
            Value::String(_) => "string",
            Value::Date(_) => "date",
            Value::Time(_) => "time",
            Value::DateTime(_) => "date and time",
            Value::DaysTimeDuration(_) => "days and time duration",
            Value::YearsMonthsDuration(_) => "years and months duration",
            Value::Range(_) => "range",
            Value::List(_) => "list",
            Value::Context(_) => "context",
            Value::Function(_) => "function",
        }
    }

    pub fn is_null(&self) -> bool {
        matches!(self, Value::Null)
    }
}

/// Renders the value as FEEL's `string()` does (`null` for `Null`).
impl fmt::Display for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match crate::ops::to_feel_string(self) {
            Some(s) => f.write_str(&s),
            None => f.write_str("null"),
        }
    }
}

macro_rules! from_int {
    ($($t:ty),*) => {$(
        impl From<$t> for Value {
            fn from(n: $t) -> Self {
                Value::Number(Decimal::from(n))
            }
        }
    )*};
}
from_int!(i32, i64, u32, u64, usize);

impl From<Decimal> for Value {
    fn from(n: Decimal) -> Self {
        Value::Number(n)
    }
}

impl From<bool> for Value {
    fn from(b: bool) -> Self {
        Value::Boolean(b)
    }
}

impl From<&str> for Value {
    fn from(s: &str) -> Self {
        Value::String(s.to_owned())
    }
}

impl From<String> for Value {
    fn from(s: String) -> Self {
        Value::String(s)
    }
}

impl From<Vec<Value>> for Value {
    fn from(l: Vec<Value>) -> Self {
        Value::List(l)
    }
}

impl From<Context> for Value {
    fn from(c: Context) -> Self {
        Value::Context(c)
    }
}

impl TryFrom<f64> for Value {
    type Error = ();
    /// Fails for NaN, infinities and magnitudes beyond the decimal range.
    fn try_from(n: f64) -> Result<Self, ()> {
        Decimal::try_from(n).map(Value::Number).map_err(|_| ())
    }
}

/// An ordered context: entries keep insertion order (`get entries`, `string()`).
#[derive(Debug, Clone, Default, PartialEq)]
pub struct Context(IndexMap<String, Value>);

impl Context {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn get(&self, key: &str) -> Option<&Value> {
        self.0.get(key)
    }

    /// Inserts or replaces; a replaced key keeps its position.
    pub fn insert(&mut self, key: impl Into<String>, value: impl Into<Value>) -> Option<Value> {
        self.0.insert(key.into(), value.into())
    }

    /// Removes a key, keeping the order of the rest.
    pub fn remove(&mut self, key: &str) -> Option<Value> {
        self.0.shift_remove(key)
    }

    pub fn contains_key(&self, key: &str) -> bool {
        self.0.contains_key(key)
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn keys(&self) -> impl Iterator<Item = &String> {
        self.0.keys()
    }

    pub fn iter(&self) -> impl Iterator<Item = (&String, &Value)> {
        self.0.iter()
    }
}

impl FromIterator<(String, Value)> for Context {
    fn from_iter<I: IntoIterator<Item = (String, Value)>>(iter: I) -> Self {
        Context(iter.into_iter().collect())
    }
}

impl IntoIterator for Context {
    type Item = (String, Value);
    type IntoIter = indexmap::map::IntoIter<String, Value>;
    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

impl<'a> IntoIterator for &'a Context {
    type Item = (&'a String, &'a Value);
    type IntoIter = indexmap::map::Iter<'a, String, Value>;
    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}
