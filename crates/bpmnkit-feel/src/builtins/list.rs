//! List built-ins, ported from the list section of `packages/feel/src/builtins.ts`.

use super::BuiltinFn;
use crate::ops::{compare, deep_equals, same_item};
use crate::value::Value;
use rust_decimal::prelude::*;
use rust_decimal::MathematicalOps;
use std::cmp::Ordering;

pub fn lookup(name: &str) -> Option<BuiltinFn> {
    Some(match name {
        "list contains" => list_contains,
        "count" => count,
        "min" => min,
        "max" => max,
        "sum" => sum,
        "product" => product,
        "mean" => mean,
        "median" => median,
        "stddev" => stddev,
        "mode" => mode,
        "all" => all,
        "any" => any,
        "sublist" => sublist,
        "append" => append,
        "concatenate" => concatenate,
        "insert before" => insert_before,
        "remove" => remove,
        "reverse" => reverse,
        "index of" => index_of,
        "union" => union,
        "distinct values" => distinct_values,
        "flatten" => flatten,
        "sort" => sort,
        "duplicate values" => duplicate_values,
        "is empty" => is_empty,
        "partition" => partition,
        _ => return None,
    })
}

/// `flattenToList` + `unwrapList`: a lone list argument is the list, otherwise
/// the arguments are (so `max(1, 2)` and `max([1, 2])` agree).
fn list_of(args: &[Value]) -> &[Value] {
    match args {
        [Value::List(l)] => l,
        _ => args,
    }
}

fn as_list(v: Option<&Value>) -> Option<&[Value]> {
    match v {
        Some(Value::List(l)) => Some(l),
        _ => None,
    }
}

fn num(v: Option<&Value>) -> Option<Decimal> {
    match v {
        Some(Value::Number(n)) => Some(*n),
        _ => None,
    }
}

fn numbers(list: &[Value]) -> Option<Vec<Decimal>> {
    list.iter().map(|v| num(Some(v))).collect()
}

fn sum_of(nums: &[Decimal]) -> Option<Decimal> {
    nums.iter()
        .try_fold(Decimal::ZERO, |s, n| s.checked_add(*n))
}

fn list_contains(args: &[Value]) -> Value {
    let Some(list) = as_list(args.first()) else {
        return Value::Null;
    };
    let item = args.get(1).unwrap_or(&Value::Null);
    list.iter().any(|v| deep_equals(v, item)).into()
}

fn count(args: &[Value]) -> Value {
    if matches!(args, [Value::Null]) {
        return Value::Null;
    }
    // count([[1, 2]]) is 2 in the TS: its flatten and unwrap apply twice.
    match list_of(args) {
        [Value::List(inner)] => inner.len().into(),
        list => list.len().into(),
    }
}

fn extreme(args: &[Value], want: Ordering) -> Value {
    let list = list_of(args);
    let Some((first, rest)) = list.split_first() else {
        return Value::Null;
    };
    let mut m = first;
    for v in rest {
        if compare(v, m) == Some(want) {
            m = v;
        }
    }
    m.clone()
}

fn min(args: &[Value]) -> Value {
    extreme(args, Ordering::Less)
}

fn max(args: &[Value]) -> Value {
    extreme(args, Ordering::Greater)
}

fn sum(args: &[Value]) -> Value {
    numbers(list_of(args))
        .and_then(|n| sum_of(&n))
        .map_or(Value::Null, Value::Number)
}

fn product(args: &[Value]) -> Value {
    let list = list_of(args);
    if list.is_empty() {
        return Value::Null;
    }
    numbers(list)
        .and_then(|n| n.iter().try_fold(Decimal::ONE, |p, n| p.checked_mul(*n)))
        .map_or(Value::Null, Value::Number)
}

fn mean(args: &[Value]) -> Value {
    let list = list_of(args);
    if list.is_empty() {
        return Value::Null;
    }
    numbers(list)
        .and_then(|n| sum_of(&n))
        .and_then(|s| s.checked_div(Decimal::from(list.len())))
        .map_or(Value::Null, Value::Number)
}

fn median(args: &[Value]) -> Value {
    let Some(mut nums) = numbers(list_of(args)) else {
        return Value::Null;
    };
    if nums.is_empty() {
        return Value::Null;
    }
    nums.sort();
    let mid = nums.len() / 2;
    if nums.len() % 2 == 0 {
        nums[mid - 1]
            .checked_add(nums[mid])
            .map_or(Value::Null, |s| Value::Number(s / Decimal::TWO))
    } else {
        Value::Number(nums[mid])
    }
}

fn stddev(args: &[Value]) -> Value {
    let Some(nums) = numbers(list_of(args)) else {
        return Value::Null;
    };
    if nums.len() <= 1 {
        return Value::Null;
    }
    let result = (|| {
        let mean = sum_of(&nums)?.checked_div(Decimal::from(nums.len()))?;
        let squares = nums.iter().try_fold(Decimal::ZERO, |s, n| {
            let d = n.checked_sub(mean)?;
            s.checked_add(d.checked_mul(d)?)
        })?;
        squares.checked_div(Decimal::from(nums.len() - 1))?.sqrt()
    })();
    result.map_or(Value::Null, Value::Number)
}

fn mode(args: &[Value]) -> Value {
    if args.is_empty() {
        return Value::Null;
    }
    let Some(nums) = numbers(list_of(args)) else {
        return Value::Null;
    };
    let mut counts = std::collections::BTreeMap::new();
    for n in nums {
        *counts.entry(n).or_insert(0usize) += 1;
    }
    let max_count = counts.values().copied().max().unwrap_or(0);
    // The most frequent values, in ascending order (BTreeMap order).
    Value::List(
        counts
            .into_iter()
            .filter(|(_, c)| *c == max_count)
            .map(|(n, _)| Value::Number(n))
            .collect(),
    )
}

/// `all` is `quantifier(args, false)`, `any` is `quantifier(args, true)`:
/// `decisive` ends the scan; a full scan yields its opposite, unless a null
/// was seen.
fn quantifier(args: &[Value], decisive: bool) -> Value {
    if args.is_empty() {
        return Value::Null;
    }
    let mut has_null = false;
    for v in list_of(args) {
        match v {
            Value::Boolean(b) if *b == decisive => return decisive.into(),
            Value::Boolean(_) => {}
            Value::Null => has_null = true,
            _ => return Value::Null,
        }
    }
    if has_null {
        Value::Null
    } else {
        (!decisive).into()
    }
}

fn all(args: &[Value]) -> Value {
    quantifier(args, false)
}

fn any(args: &[Value]) -> Value {
    quantifier(args, true)
}

/// A JS `Array#slice`/`splice` index: truncated, negatives count from the end.
fn js_index(len: usize, i: Decimal) -> usize {
    let t = i.trunc();
    let len_d = Decimal::from(len);
    let idx = if t.is_sign_negative() {
        (len_d + t).max(Decimal::ZERO)
    } else {
        t.min(len_d)
    };
    idx.to_usize().unwrap_or(len)
}

fn sublist(args: &[Value]) -> Value {
    let Some(list) = as_list(args.first()) else {
        return Value::Null;
    };
    let Some(st) = num(args.get(1)) else {
        return Value::Null;
    };
    let from = if st > Decimal::ZERO {
        st - Decimal::ONE
    } else {
        (Decimal::from(list.len()) + st).max(Decimal::ZERO)
    };
    let end = match args.get(2) {
        None | Some(Value::Null) => Decimal::from(list.len()),
        Some(Value::Number(len)) => from.saturating_add(*len),
        Some(_) => return Value::Null,
    };
    let (a, b) = (js_index(list.len(), from), js_index(list.len(), end));
    Value::List(list[a..b.max(a)].to_vec())
}

fn append(args: &[Value]) -> Value {
    let Some(list) = as_list(args.first()) else {
        return Value::Null;
    };
    let mut out = list.to_vec();
    out.extend_from_slice(&args[1..]);
    Value::List(out)
}

fn concatenate(args: &[Value]) -> Value {
    let mut out = Vec::new();
    for v in list_of(args) {
        match v {
            Value::List(l) => out.extend_from_slice(l),
            v => out.push(v.clone()),
        }
    }
    Value::List(out)
}

/// The splice start for a 1-based (or negative, from-the-end) FEEL position.
fn position(len: usize, p: Decimal) -> usize {
    let idx = if p > Decimal::ZERO {
        p - Decimal::ONE
    } else {
        Decimal::from(len) + p
    };
    js_index(len, idx)
}

fn insert_before(args: &[Value]) -> Value {
    let (Some(list), Some(p)) = (as_list(args.first()), num(args.get(1))) else {
        return Value::Null;
    };
    let mut out = list.to_vec();
    out.insert(
        position(list.len(), p),
        args.get(2).cloned().unwrap_or(Value::Null),
    );
    Value::List(out)
}

fn remove(args: &[Value]) -> Value {
    let (Some(list), Some(p)) = (as_list(args.first()), num(args.get(1))) else {
        return Value::Null;
    };
    let mut out = list.to_vec();
    let idx = position(list.len(), p);
    if idx < out.len() {
        out.remove(idx);
    }
    Value::List(out)
}

fn reverse(args: &[Value]) -> Value {
    as_list(args.first()).map_or(Value::Null, |l| {
        Value::List(l.iter().rev().cloned().collect())
    })
}

fn index_of(args: &[Value]) -> Value {
    let Some(list) = as_list(args.first()) else {
        return Value::Null;
    };
    let m = args.get(1).unwrap_or(&Value::Null);
    Value::List(
        list.iter()
            .enumerate()
            .filter(|(_, v)| deep_equals(v, m))
            .map(|(i, _)| (i + 1).into())
            .collect(),
    )
}

fn dedup<'a>(items: impl Iterator<Item = &'a Value>) -> Value {
    let mut out: Vec<Value> = Vec::new();
    for v in items {
        if !out.iter().any(|o| deep_equals(o, v)) {
            out.push(v.clone());
        }
    }
    Value::List(out)
}

fn union(args: &[Value]) -> Value {
    dedup(args.iter().flat_map(|v| match v {
        Value::List(l) => l.as_slice(),
        v => std::slice::from_ref(v),
    }))
}

fn distinct_values(args: &[Value]) -> Value {
    as_list(args.first()).map_or(Value::Null, |l| dedup(l.iter()))
}

fn duplicate_values(args: &[Value]) -> Value {
    let Some(list) = as_list(args.first()) else {
        return Value::Null;
    };
    // Each value occurring more than once, in the order it first occurs.
    let mut groups: Vec<(&Value, usize)> = Vec::new();
    for item in list {
        match groups.iter_mut().find(|(g, _)| same_item(g, item)) {
            Some((_, n)) => *n += 1,
            None => groups.push((item, 1)),
        }
    }
    Value::List(
        groups
            .into_iter()
            .filter(|(_, n)| *n > 1)
            .map(|(v, _)| v.clone())
            .collect(),
    )
}

fn is_empty(args: &[Value]) -> Value {
    as_list(args.first()).map_or(Value::Null, |l| l.is_empty().into())
}

fn partition(args: &[Value]) -> Value {
    let Some(list) = as_list(args.first()) else {
        return Value::Null;
    };
    // A size of zero has no partition either: it would never consume the list.
    let Some(n) = num(args.get(1)).filter(|n| n.fract().is_zero() && *n > Decimal::ZERO) else {
        return Value::Null;
    };
    let n = n.to_usize().unwrap_or(usize::MAX);
    Value::List(list.chunks(n).map(|c| Value::List(c.to_vec())).collect())
}

fn flatten(args: &[Value]) -> Value {
    fn walk(items: &[Value], out: &mut Vec<Value>) {
        for v in items {
            match v {
                Value::List(l) => walk(l, out),
                v => out.push(v.clone()),
            }
        }
    }
    let Some(list) = as_list(args.first()) else {
        return Value::Null;
    };
    let mut out = Vec::new();
    walk(list, &mut out);
    Value::List(out)
}

/// A stable merge sort. `slice::sort_by` may panic on an inconsistent
/// comparator, which a user-supplied FEEL `precedes` easily is.
fn merge_sort(items: Vec<Value>, cmp: &dyn Fn(&Value, &Value) -> Ordering) -> Vec<Value> {
    if items.len() <= 1 {
        return items;
    }
    let mut left = items;
    let right = left.split_off(left.len() / 2);
    let (left, right) = (merge_sort(left, cmp), merge_sort(right, cmp));
    let mut out = Vec::with_capacity(left.len() + right.len());
    let (mut l, mut r) = (left.into_iter().peekable(), right.into_iter().peekable());
    while let (Some(a), Some(b)) = (l.peek(), r.peek()) {
        // The right item goes first only when it strictly precedes.
        if cmp(a, b) == Ordering::Greater {
            out.extend(r.next());
        } else {
            out.extend(l.next());
        }
    }
    out.extend(l);
    out.extend(r);
    out
}

fn sort(args: &[Value]) -> Value {
    let Some(list) = as_list(args.first()) else {
        return Value::Null;
    };
    let sorted = match args.get(1) {
        Some(Value::Function(f)) => merge_sort(list.to_vec(), &|a, b| match f
            .call(&[a.clone(), b.clone()])
        {
            Value::Boolean(true) => Ordering::Less,
            Value::Boolean(false) => Ordering::Greater,
            _ => Ordering::Equal,
        }),
        _ => merge_sort(list.to_vec(), &|a, b| {
            compare(a, b).unwrap_or(Ordering::Equal)
        }),
    };
    Value::List(sorted)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::value::Function;

    fn call(name: &str, args: &[Value]) -> Value {
        lookup(name).unwrap()(args)
    }
    fn n(i: i64) -> Value {
        Value::from(i)
    }
    fn d(x: f64) -> Value {
        Value::try_from(x).unwrap()
    }
    fn l(items: &[i64]) -> Value {
        Value::List(items.iter().map(|i| n(*i)).collect())
    }
    fn s(x: &str) -> Value {
        Value::from(x)
    }

    #[test]
    fn contains_count_empty() {
        assert_eq!(call("list contains", &[l(&[1, 2]), n(2)]), true.into());
        assert_eq!(call("list contains", &[l(&[1, 2]), n(3)]), false.into());
        assert_eq!(call("list contains", &[n(1), n(3)]), Value::Null);
        let nested = Value::List(vec![l(&[1])]);
        assert_eq!(call("list contains", &[nested, l(&[1])]), true.into());
        assert_eq!(call("count", &[l(&[1, 2, 3])]), n(3));
        assert_eq!(call("count", &[]), n(0));
        assert_eq!(call("count", &[Value::Null]), Value::Null);
        assert_eq!(call("is empty", &[l(&[])]), true.into());
        assert_eq!(call("is empty", &[n(1)]), Value::Null);
    }

    #[test]
    fn min_max_sum_variadic() {
        assert_eq!(call("min", &[l(&[3, 1, 2])]), n(1));
        assert_eq!(call("min", &[n(3), n(1), n(2)]), n(1));
        assert_eq!(call("max", &[n(3), n(1), n(2)]), n(3));
        assert_eq!(call("max", &[l(&[])]), Value::Null);
        assert_eq!(call("min", &[s("b"), s("a")]), s("a"));
        assert_eq!(call("sum", &[l(&[1, 2, 3])]), n(6));
        assert_eq!(call("sum", &[n(1), n(2)]), n(3));
        assert_eq!(call("sum", &[l(&[])]), n(0));
        assert_eq!(call("sum", &[Value::List(vec![n(1), s("a")])]), Value::Null);
        assert_eq!(call("product", &[l(&[2, 3, 4])]), n(24));
        assert_eq!(call("product", &[l(&[])]), Value::Null);
    }

    #[test]
    fn statistics() {
        assert_eq!(call("mean", &[l(&[1, 2, 3, 4])]), d(2.5));
        assert_eq!(call("mean", &[n(1), n(2)]), d(1.5));
        assert_eq!(call("mean", &[l(&[])]), Value::Null);
        assert_eq!(call("median", &[l(&[1, 2, 3, 4])]), d(2.5));
        assert_eq!(call("median", &[l(&[3, 1, 2])]), n(2));
        let Value::Number(sd) = call("stddev", &[l(&[2, 4, 4, 4, 5, 5, 7, 9])]) else {
            panic!("stddev")
        };
        assert!((sd - Decimal::try_from(2.138089935299395).unwrap()).abs() < Decimal::new(1, 12));
        assert_eq!(call("stddev", &[l(&[1])]), Value::Null);
        assert_eq!(call("mode", &[l(&[1, 2, 2, 3, 3])]), l(&[2, 3]));
        assert_eq!(call("mode", &[l(&[6, 3, 9, 6, 6])]), l(&[6]));
        assert_eq!(call("mode", &[l(&[])]), l(&[]));
        assert_eq!(call("mode", &[]), Value::Null);
    }

    #[test]
    fn all_any() {
        let t = || Value::from(true);
        let f = || Value::from(false);
        assert_eq!(call("all", &[Value::List(vec![t(), t()])]), true.into());
        assert_eq!(
            call("all", &[Value::List(vec![t(), f(), Value::Null])]),
            false.into()
        );
        assert_eq!(
            call("all", &[Value::List(vec![t(), Value::Null])]),
            Value::Null
        );
        assert_eq!(call("all", &[l(&[])]), true.into());
        assert_eq!(call("all", &[Value::List(vec![t(), n(1)])]), Value::Null);
        assert_eq!(call("any", &[Value::List(vec![f(), t()])]), true.into());
        assert_eq!(
            call("any", &[Value::List(vec![f(), Value::Null])]),
            Value::Null
        );
        assert_eq!(call("any", &[Value::List(vec![f(), f()])]), false.into());
        assert_eq!(call("any", &[l(&[])]), false.into());
        assert_eq!(call("any", &[t(), f()]), true.into());
        assert_eq!(call("any", &[]), Value::Null);
    }

    #[test]
    fn slicing_and_editing() {
        assert_eq!(call("sublist", &[l(&[1, 2, 3]), n(2)]), l(&[2, 3]));
        assert_eq!(call("sublist", &[l(&[1, 2, 3]), n(1), n(2)]), l(&[1, 2]));
        assert_eq!(call("sublist", &[l(&[1, 2, 3]), n(-2), n(1)]), l(&[2]));
        assert_eq!(call("sublist", &[l(&[1, 2, 3]), n(0)]), l(&[]));
        assert_eq!(call("sublist", &[l(&[1, 2, 3]), n(-5)]), l(&[1, 2, 3]));
        assert_eq!(call("sublist", &[l(&[1, 2, 3]), n(2), n(-1)]), l(&[]));
        assert_eq!(call("sublist", &[l(&[1, 2, 3]), n(1), d(1.5)]), l(&[1]));
        assert_eq!(call("sublist", &[l(&[1, 2, 3]), s("a")]), Value::Null);
        assert_eq!(call("append", &[l(&[1]), n(2), n(3)]), l(&[1, 2, 3]));
        assert_eq!(call("concatenate", &[l(&[1]), l(&[2, 3])]), l(&[1, 2, 3]));
        let nested = Value::List(vec![l(&[1]), l(&[2])]);
        assert_eq!(call("concatenate", &[nested]), l(&[1, 2]));
        assert_eq!(
            call("insert before", &[l(&[1, 3]), n(2), n(2)]),
            l(&[1, 2, 3])
        );
        assert_eq!(
            call("insert before", &[l(&[1, 2]), n(5), n(9)]),
            l(&[1, 2, 9])
        );
        assert_eq!(call("insert before", &[l(&[1]), n(-1), n(0)]), l(&[0, 1]));
        assert_eq!(call("insert before", &[l(&[1]), n(-5), n(0)]), l(&[0, 1]));
        assert_eq!(call("remove", &[l(&[1, 2, 3]), n(2)]), l(&[1, 3]));
        assert_eq!(call("remove", &[l(&[1, 2, 3]), n(-1)]), l(&[1, 2]));
        assert_eq!(call("remove", &[l(&[1, 2]), n(5)]), l(&[1, 2]));
        assert_eq!(call("remove", &[l(&[1, 2]), n(0)]), l(&[1, 2]));
        assert_eq!(call("reverse", &[l(&[1, 2, 3])]), l(&[3, 2, 1]));
        assert_eq!(
            call("partition", &[l(&[1, 2, 3]), n(2)]),
            Value::List(vec![l(&[1, 2]), l(&[3])])
        );
        assert_eq!(call("partition", &[l(&[1, 2, 3]), n(0)]), Value::Null);
        assert_eq!(call("partition", &[l(&[1, 2, 3]), d(1.5)]), Value::Null);
    }

    #[test]
    fn sets() {
        assert_eq!(call("index of", &[l(&[1, 2, 1]), n(1)]), l(&[1, 3]));
        assert_eq!(call("index of", &[l(&[1, 2]), n(9)]), l(&[]));
        assert_eq!(
            call("union", &[l(&[1, 2]), l(&[2, 3]), n(4)]),
            l(&[1, 2, 3, 4])
        );
        assert_eq!(
            call("distinct values", &[l(&[1, 2, 1, 3, 2])]),
            l(&[1, 2, 3])
        );
        assert_eq!(
            call("duplicate values", &[l(&[1, 2, 1, 3, 2, 1])]),
            l(&[1, 2])
        );
        let lists = Value::List(vec![l(&[1]), l(&[1]), l(&[2])]);
        assert_eq!(
            call("duplicate values", &[lists]),
            Value::List(vec![l(&[1])])
        );
        let nested = Value::List(vec![n(1), Value::List(vec![n(2), l(&[3, 4])]), n(5)]);
        assert_eq!(call("flatten", &[nested]), l(&[1, 2, 3, 4, 5]));
    }

    #[test]
    fn sorting() {
        assert_eq!(call("sort", &[l(&[3, 1, 2])]), l(&[1, 2, 3]));
        let desc = Value::Function(Function::new(None, |a| match (&a[0], &a[1]) {
            (Value::Number(x), Value::Number(y)) => (x > y).into(),
            _ => Value::Null,
        }));
        assert_eq!(call("sort", &[l(&[3, 1, 2]), desc]), l(&[3, 2, 1]));
        // An inconsistent comparator must not panic.
        let odd = Value::Function(Function::new(None, |_| true.into()));
        assert!(matches!(
            call("sort", &[l(&[3, 1, 2, 5, 4]), odd]),
            Value::List(_)
        ));
        assert_eq!(call("sort", &[n(1), Value::Null]), Value::Null);
    }
}
