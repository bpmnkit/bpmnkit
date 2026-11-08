//! Range / interval built-ins (Allen's relations), ported from `packages/feel/src/builtins.ts`.

use super::BuiltinFn;
use crate::ops::compare;
use crate::value::{Range, Value};
use std::cmp::Ordering;

pub fn lookup(name: &str) -> Option<BuiltinFn> {
    Some(match name {
        "before" => before,
        "after" => after,
        "meets" => meets,
        "met by" => met_by,
        "overlaps" => overlaps,
        "overlaps before" => overlaps_before_fn,
        "overlaps after" => overlaps_after_fn,
        "finishes" => finishes,
        "finished by" => finished_by,
        "includes" => includes,
        "during" => during,
        "starts" => starts,
        "started by" => started_by,
        "coincides" => coincides,
        _ => return None,
    })
}

/// An interval end: a value and whether the interval contains it.
struct Pt<'a> {
    v: &'a Value,
    included: bool,
}

fn start_of(v: &Value) -> Pt<'_> {
    match v {
        Value::Range(r) => Pt {
            v: &r.start,
            included: r.start_included,
        },
        v => Pt { v, included: true },
    }
}

fn end_of(v: &Value) -> Pt<'_> {
    match v {
        Value::Range(r) => Pt {
            v: &r.end,
            included: r.end_included,
        },
        v => Pt { v, included: true },
    }
}

fn range(v: Option<&Value>) -> Option<&Range> {
    match v {
        Some(Value::Range(r)) => Some(r),
        _ => None,
    }
}

/// `compareValues(a, b) ?? fallback`.
fn cmp_or(a: &Value, b: &Value, fallback: Ordering) -> Ordering {
    compare(a, b).unwrap_or(fallback)
}

/// Orders two interval ends; at equal values a closed start comes first and a
/// closed end comes last.
fn cmp_pts(a: &Pt, b: &Pt, start_edge: bool) -> Ordering {
    let c = cmp_or(a.v, b.v, Ordering::Equal);
    if c != Ordering::Equal {
        return c;
    }
    match (a.included, b.included, start_edge) {
        (x, y, _) if x == y => Ordering::Equal,
        (true, _, true) | (false, _, false) => Ordering::Less,
        _ => Ordering::Greater,
    }
}

fn null() -> Value {
    Value::Null
}

fn before(args: &[Value]) -> Value {
    let (Some(a), Some(b)) = (args.first(), args.get(1)) else {
        return null();
    };
    let (ae, bs) = (end_of(a), start_of(b));
    match cmp_or(ae.v, bs.v, Ordering::Equal) {
        Ordering::Less => true,
        Ordering::Equal => !ae.included || !bs.included,
        Ordering::Greater => false,
    }
    .into()
}

fn after(args: &[Value]) -> Value {
    let (Some(a), Some(b)) = (args.first(), args.get(1)) else {
        return null();
    };
    let (as_, be) = (start_of(a), end_of(b));
    match cmp_or(as_.v, be.v, Ordering::Equal) {
        Ordering::Greater => true,
        Ordering::Equal => !as_.included || !be.included,
        Ordering::Less => false,
    }
    .into()
}

fn meets(args: &[Value]) -> Value {
    let (Some(a), Some(b)) = (range(args.first()), range(args.get(1))) else {
        return null();
    };
    (cmp_or(&a.end, &b.start, Ordering::Greater) == Ordering::Equal
        && a.end_included
        && b.start_included)
        .into()
}

fn met_by(args: &[Value]) -> Value {
    let (Some(a), Some(b)) = (range(args.first()), range(args.get(1))) else {
        return null();
    };
    (cmp_or(&a.start, &b.end, Ordering::Greater) == Ordering::Equal
        && a.start_included
        && b.end_included)
        .into()
}

fn overlaps(args: &[Value]) -> Value {
    let (Some(a), Some(b)) = (range(args.first()), range(args.get(1))) else {
        return null();
    };
    let c1 = cmp_or(&a.end, &b.start, Ordering::Less);
    let c2 = cmp_or(&a.start, &b.end, Ordering::Greater);
    if c1 == Ordering::Less || c2 == Ordering::Greater {
        return false.into();
    }
    if c1 == Ordering::Equal && !(a.end_included && b.start_included) {
        return false.into();
    }
    if c2 == Ordering::Equal && !(a.start_included && b.end_included) {
        return false.into();
    }
    true.into()
}

/// DMN's overlaps before, term by term: `a` starts first, ends inside `b` —
/// touching its start only where both ends are closed — and does not outlast it.
fn overlaps_before(a: &Range, b: &Range) -> bool {
    let a_start = Pt {
        v: &a.start,
        included: a.start_included,
    };
    let b_start = Pt {
        v: &b.start,
        included: b.start_included,
    };
    let starts_first = cmp_pts(&a_start, &b_start, true) == Ordering::Less;
    let c = cmp_or(&a.end, &b.start, Ordering::Less);
    let reaches_in =
        c == Ordering::Greater || (c == Ordering::Equal && a.end_included && b.start_included);
    let e = cmp_or(&a.end, &b.end, Ordering::Greater);
    let ends_within =
        e == Ordering::Less || (e == Ordering::Equal && (!a.end_included || b.end_included));
    starts_first && reaches_in && ends_within
}

fn overlaps_before_fn(args: &[Value]) -> Value {
    match (range(args.first()), range(args.get(1))) {
        (Some(a), Some(b)) => overlaps_before(a, b).into(),
        _ => null(),
    }
}

fn overlaps_after_fn(args: &[Value]) -> Value {
    match (range(args.first()), range(args.get(1))) {
        (Some(a), Some(b)) => overlaps_before(b, a).into(),
        _ => null(),
    }
}

fn during(args: &[Value]) -> Value {
    let (Some(a), Some(b @ Value::Range(_))) = (args.first(), args.get(1)) else {
        return null();
    };
    (cmp_pts(&start_of(b), &start_of(a), true).is_le()
        && cmp_pts(&end_of(a), &end_of(b), false).is_le())
    .into()
}

fn includes(args: &[Value]) -> Value {
    let (Some(a @ Value::Range(_)), Some(b)) = (args.first(), args.get(1)) else {
        return null();
    };
    (cmp_pts(&start_of(a), &start_of(b), true).is_le()
        && cmp_pts(&end_of(b), &end_of(a), false).is_le())
    .into()
}

fn starts(args: &[Value]) -> Value {
    let (Some(a), Some(Value::Range(b))) = (args.first(), args.get(1)) else {
        return null();
    };
    // starts(point, range): the range begins at that point, inclusively.
    let Value::Range(_) = a else {
        return (b.start_included && compare(a, &b.start) == Some(Ordering::Equal)).into();
    };
    let b = args.get(1).unwrap_or(a);
    (cmp_pts(&start_of(a), &start_of(b), true) == Ordering::Equal
        && cmp_pts(&end_of(a), &end_of(b), false).is_le())
    .into()
}

fn started_by(args: &[Value]) -> Value {
    let (Some(Value::Range(a)), Some(b)) = (args.first(), args.get(1)) else {
        return null();
    };
    let Value::Range(_) = b else {
        return (a.start_included && compare(&a.start, b) == Some(Ordering::Equal)).into();
    };
    let a = &args[0];
    (cmp_pts(&start_of(a), &start_of(b), true) == Ordering::Equal
        && cmp_pts(&end_of(b), &end_of(a), false).is_le())
    .into()
}

fn finishes(args: &[Value]) -> Value {
    let (Some(a), Some(Value::Range(b))) = (args.first(), args.get(1)) else {
        return null();
    };
    // finishes(point, range): the range ends at that point, inclusively.
    let Value::Range(_) = a else {
        return (b.end_included && compare(a, &b.end) == Some(Ordering::Equal)).into();
    };
    let b = &args[1];
    (cmp_pts(&end_of(a), &end_of(b), false) == Ordering::Equal
        && cmp_pts(&start_of(b), &start_of(a), true).is_le())
    .into()
}

fn finished_by(args: &[Value]) -> Value {
    let (Some(Value::Range(a)), Some(b)) = (args.first(), args.get(1)) else {
        return null();
    };
    let Value::Range(_) = b else {
        return (a.end_included && compare(&a.end, b) == Some(Ordering::Equal)).into();
    };
    let a = &args[0];
    (cmp_pts(&end_of(a), &end_of(b), false) == Ordering::Equal
        && cmp_pts(&start_of(a), &start_of(b), true).is_le())
    .into()
}

fn coincides(args: &[Value]) -> Value {
    let (Some(a), Some(b)) = (args.first(), args.get(1)) else {
        return null();
    };
    match (a, b) {
        (Value::Range(_), Value::Range(_)) => (cmp_pts(&start_of(a), &start_of(b), true)
            == Ordering::Equal
            && cmp_pts(&end_of(a), &end_of(b), false) == Ordering::Equal)
            .into(),
        (Value::Range(_), _) | (_, Value::Range(_)) => null(),
        _ => (compare(a, b) == Some(Ordering::Equal)).into(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn call(name: &str, args: &[Value]) -> Value {
        lookup(name).unwrap()(args)
    }
    fn n(i: i64) -> Value {
        Value::from(i)
    }
    /// `[a..b]`-style range with the given inclusiveness.
    fn r(a: i64, ai: bool, b: i64, bi: bool) -> Value {
        Value::Range(Box::new(Range {
            start: n(a),
            start_included: ai,
            end: n(b),
            end_included: bi,
        }))
    }
    fn closed(a: i64, b: i64) -> Value {
        r(a, true, b, true)
    }
    fn is(name: &str, a: &Value, b: &Value) -> bool {
        call(name, &[a.clone(), b.clone()]) == true.into()
    }

    #[test]
    fn before_after_points_and_ranges() {
        assert!(is("before", &n(1), &n(10)));
        assert!(!is("before", &n(10), &n(1)));
        assert!(is("before", &closed(1, 5), &closed(6, 9)));
        assert!(!is("before", &closed(1, 5), &closed(5, 9)));
        assert!(is("before", &r(1, true, 5, false), &closed(5, 9)));
        assert!(is("before", &n(1), &r(1, false, 10, true)));
        assert!(is("after", &n(10), &n(1)));
        assert!(is("after", &closed(6, 9), &closed(1, 5)));
        assert!(!is("after", &closed(5, 9), &closed(1, 5)));
        assert!(is("after", &r(5, false, 9, true), &closed(1, 5)));
    }

    #[test]
    fn meets_and_overlaps() {
        assert!(is("meets", &closed(1, 5), &closed(5, 8)));
        assert!(!is("meets", &closed(1, 5), &r(5, false, 8, true)));
        assert!(is("met by", &closed(5, 8), &closed(1, 5)));
        assert_eq!(call("meets", &[n(1), closed(1, 2)]), Value::Null);
        assert!(is("overlaps", &closed(1, 5), &closed(3, 8)));
        assert!(is("overlaps", &closed(1, 5), &closed(5, 8)));
        assert!(!is("overlaps", &closed(1, 5), &r(5, false, 8, true)));
        assert!(!is("overlaps", &closed(1, 2), &closed(3, 8)));
        assert!(is("overlaps before", &closed(1, 5), &closed(3, 8)));
        assert!(!is("overlaps before", &closed(3, 8), &closed(1, 5)));
        assert!(is("overlaps after", &closed(3, 8), &closed(1, 5)));
        assert_eq!(call("overlaps before", &[n(1), closed(1, 2)]), Value::Null);
    }

    #[test]
    fn containment_relations() {
        assert!(is("during", &n(3), &closed(1, 5)));
        assert!(is("during", &closed(2, 4), &closed(1, 5)));
        assert!(is("during", &closed(1, 5), &closed(1, 5)));
        assert!(!is("during", &closed(1, 5), &r(1, false, 5, true)));
        assert_eq!(call("during", &[n(3), n(5)]), Value::Null);
        assert!(is("includes", &closed(1, 5), &n(3)));
        assert!(is("includes", &closed(1, 5), &closed(2, 4)));
        assert!(!is("includes", &closed(1, 5), &closed(2, 6)));
        assert_eq!(call("includes", &[n(3), n(3)]), Value::Null);
    }

    #[test]
    fn starts_and_finishes() {
        assert!(is("starts", &n(1), &closed(1, 5)));
        assert!(!is("starts", &n(1), &r(1, false, 5, true)));
        assert!(is("starts", &closed(1, 3), &closed(1, 5)));
        assert!(!is("starts", &closed(1, 7), &closed(1, 5)));
        assert!(is("started by", &closed(1, 5), &n(1)));
        assert!(is("started by", &closed(1, 5), &closed(1, 3)));
        assert!(!is("started by", &closed(1, 3), &closed(1, 5)));
        assert!(is("finishes", &n(5), &closed(1, 5)));
        assert!(!is("finishes", &n(5), &r(1, true, 5, false)));
        assert!(is("finishes", &closed(3, 5), &closed(1, 5)));
        assert!(is("finished by", &closed(1, 5), &n(5)));
        assert!(is("finished by", &closed(1, 5), &closed(3, 5)));
        assert!(!is("finished by", &closed(3, 5), &closed(1, 5)));
        assert_eq!(call("starts", &[n(1), n(1)]), Value::Null);
        assert_eq!(call("started by", &[n(1), n(1)]), Value::Null);
    }

    #[test]
    fn coincides_ranges_and_points() {
        assert!(is("coincides", &closed(1, 5), &closed(1, 5)));
        assert!(!is("coincides", &closed(1, 5), &r(1, true, 5, false)));
        assert!(is("coincides", &n(5), &n(5)));
        assert!(!is("coincides", &n(5), &n(6)));
        assert_eq!(call("coincides", &[n(5), closed(1, 5)]), Value::Null);
    }
}
