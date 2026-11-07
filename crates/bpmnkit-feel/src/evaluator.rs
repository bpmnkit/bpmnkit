//! Evaluator. Port of `packages/feel/src/evaluator.ts`.
//!
//! Scopes are a chain of borrowed frames living on the Rust stack, so a simple
//! node costs no allocation. Only a `function(..)` literal copies what is in
//! scope, to outlive the evaluation that created it.

use std::borrow::Cow;
use std::cell::RefCell;
use std::cmp::Ordering;
use std::slice;
use std::sync::Arc;

use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;

use crate::ast::{BinaryOp, Binding, Node, NodeKind};
use crate::value::{Context, Function, Range, Value};
use crate::{builtins, ops, temporal, Warning, WarningKind};

static NULL: Value = Value::Null;

/// Most elements a numeric or date range expands to; beyond it the iteration
/// is treated as failed instead of exhausting memory.
const MAX_SPAN: usize = 10_000_000;

enum Frame<'a> {
    Empty,
    /// A context whose entries are all in scope (the root, a context literal
    /// under construction, a captured scope).
    Ctx(&'a Context),
    One(&'a str, Value),
    Vars(Vec<(&'a str, Value)>),
    /// A filter element: bound to `item`, and its fields are in scope too.
    Item(&'a Value),
}

struct Scope<'a> {
    frame: Frame<'a>,
    parent: Option<&'a Scope<'a>>,
    input: Option<&'a Value>,
    /// Where suppressed failures go; `None` when nobody asked for them.
    warnings: Option<&'a RefCell<Vec<Warning>>>,
}

impl<'a> Scope<'a> {
    fn child(&'a self, frame: Frame<'a>) -> Scope<'a> {
        Scope {
            frame,
            parent: Some(self),
            input: self.input,
            warnings: self.warnings,
        }
    }

    /// Records why a result became null. The message is only built when collected.
    fn warn(&self, kind: WarningKind, message: impl FnOnce() -> String) {
        if let Some(sink) = self.warnings {
            sink.borrow_mut().push(Warning {
                kind,
                message: message(),
            });
        }
    }

    /// The value bound to `name`, even a null one.
    fn lookup(&self, name: &str) -> Option<&Value> {
        let mut cur = Some(self);
        while let Some(s) = cur {
            let found = match &s.frame {
                Frame::Empty => None,
                Frame::Ctx(c) => c.get(name),
                Frame::One(n, v) => (*n == name).then_some(v),
                Frame::Vars(vars) => vars.iter().rev().find(|(n, _)| *n == name).map(|(_, v)| v),
                Frame::Item(item) => match item {
                    Value::Context(c) if c.contains_key(name) => c.get(name),
                    _ if name == "item" => Some(*item),
                    _ => None,
                },
            };
            if found.is_some() {
                return found;
            }
            cur = s.parent;
        }
        None
    }

    fn input(&self) -> &'a Value {
        self.input.unwrap_or(&NULL)
    }
}

/// Evaluates `node` with `vars` in scope and `input` bound to `?`, collecting
/// the failures that became null into `warnings` when given.
pub fn evaluate_root(
    node: &Node,
    vars: &Context,
    input: Option<&Value>,
    warnings: Option<&RefCell<Vec<Warning>>>,
) -> Value {
    let scope = Scope {
        frame: Frame::Ctx(vars),
        parent: None,
        input,
        warnings,
    };
    eval(node, &scope)
}

/// A value as FEEL-Scala quotes it in a warning: strings in double quotes.
fn show(v: &Value) -> String {
    match v {
        Value::String(s) => format!("\"{s}\""),
        other => other.to_string(),
    }
}

fn show_args(args: &[Value]) -> String {
    args.iter().map(show).collect::<Vec<_>>().join(", ")
}

/// A built-in whose null result is an answer, not a failure.
fn null_is_an_answer(name: &str) -> bool {
    matches!(name, "get value" | "get or else")
}

fn warn_failed_call(scope: &Scope<'_>, name: &str, args: &[Value], result: &Value) {
    if result.is_null() && !null_is_an_answer(name) && !args.iter().any(Value::is_null) {
        scope.warn(WarningKind::FunctionInvocationFailure, || {
            format!(
                "Failed to invoke function '{name}' with arguments ({})",
                show_args(args)
            )
        });
    }
}

/// `evaluateUnaryTests`.
pub fn test_unary(
    node: &Node,
    input: &Value,
    vars: &Context,
    warnings: Option<&RefCell<Vec<Warning>>>,
) -> bool {
    let scope = Scope {
        frame: Frame::Ctx(vars),
        parent: None,
        input: Some(input),
        warnings,
    };
    unary_test_value(node, input, &scope) == Some(true)
}

fn boolean(b: Option<bool>) -> Value {
    b.map_or(Value::Null, Value::Boolean)
}

/// Evaluates `node`, borrowing the value when it is a bound variable.
fn eval_ref<'a>(node: &Node, scope: &'a Scope<'a>) -> Cow<'a, Value> {
    if let NodeKind::Name(name) = &node.kind {
        if name == "?" {
            return Cow::Borrowed(scope.input());
        }
        if let Some(v) = scope.lookup(name) {
            return Cow::Borrowed(v);
        }
    }
    Cow::Owned(eval(node, scope))
}

fn eval_all(nodes: &[Node], scope: &Scope<'_>) -> Vec<Value> {
    nodes.iter().map(|n| eval(n, scope)).collect()
}

fn eval<'a>(node: &Node, scope: &'a Scope<'a>) -> Value {
    match &node.kind {
        NodeKind::Null => Value::Null,
        NodeKind::Boolean(b) => Value::Boolean(*b),
        NodeKind::Number(n) => Value::Number(*n),
        NodeKind::String(s) => Value::String(s.clone()),
        NodeKind::Temporal(raw) => temporal::parse_temporal(raw),
        NodeKind::Name(name) => {
            if name == "?" {
                return scope.input().clone();
            }
            // A variable shadows a built-in of the same name (`count`, `sum`);
            // calls resolve their callee separately.
            if let Some(v) = scope.lookup(name) {
                return v.clone();
            }
            match bpmnkit_spec::feel::feel_builtin(name).and_then(|b| builtins::as_function(b.name))
            {
                Some(f) => Value::Function(f),
                None => {
                    scope.warn(WarningKind::NoVariableFound, || {
                        format!("No variable found with name '{name}'")
                    });
                    Value::Null
                }
            }
        }
        NodeKind::UnaryMinus(operand) => {
            let v = eval(operand, scope);
            let result = ops::neg(&v);
            if result.is_null() && !v.is_null() {
                scope.warn(WarningKind::InvalidType, || {
                    format!("Can't negate '{}'", show(&v))
                });
            }
            result
        }
        NodeKind::Binary { op, left, right } => eval_binary(*op, left, right, scope),
        NodeKind::List(items) => Value::List(eval_all(items, scope)),
        NodeKind::Context(entries) => {
            // Entries are evaluated in order in a scope that already holds the
            // preceding ones, so `{a: 1, b: a + 1}` resolves `a` in `b`.
            let mut result = Context::new();
            for (key, value) in entries {
                // A key given twice names two different values, which is not a
                // context at all.
                if result.contains_key(key) {
                    return Value::Null;
                }
                let v = {
                    let inner = scope.child(Frame::Ctx(&result));
                    eval(value, &inner)
                };
                result.insert(key.clone(), v);
            }
            Value::Context(result)
        }
        NodeKind::Range {
            start_included,
            low,
            high,
            end_included,
        } => Value::Range(Box::new(Range {
            start: eval(low, scope),
            start_included: *start_included,
            end: eval(high, scope),
            end_included: *end_included,
        })),
        NodeKind::Path { base, key } => match &*eval_ref(base, scope) {
            Value::Null => Value::Null,
            Value::List(items) => {
                Value::List(items.iter().map(|i| ops::get_property(i, key)).collect())
            }
            Value::Context(c) if !c.contains_key(key) => {
                scope.warn(WarningKind::NoContextEntryFound, || {
                    format!("No context entry found with key '{key}'")
                });
                Value::Null
            }
            other => ops::get_property(other, key),
        },
        NodeKind::Filter { base, condition } => eval_filter(base, condition, scope),
        NodeKind::Call { callee, args } => {
            let args = eval_all(args, scope);
            if let Some(v) = builtins::call(callee, &args) {
                warn_failed_call(scope, callee, &args, &v);
                return v;
            }
            match scope.lookup(callee) {
                Some(Value::Function(f)) => f.call(&args),
                _ => {
                    scope.warn(WarningKind::NoFunctionFound, || {
                        format!(
                            "No function found with name '{callee}' and {} parameters",
                            args.len()
                        )
                    });
                    Value::Null
                }
            }
        }
        NodeKind::CallExpr { target, args } => match eval(target, scope) {
            Value::Function(f) => f.call(&eval_all(args, scope)),
            _ => Value::Null,
        },
        NodeKind::CallNamed { callee, args } => {
            let names: Vec<&str> = args.iter().map(|(n, _)| n.as_str()).collect();
            let values: Vec<Value> = args.iter().map(|(_, v)| eval(v, scope)).collect();
            if builtins::exists(callee) {
                let Some(order) = builtins::order_named_args(callee, &names) else {
                    return Value::Null;
                };
                let ordered: Vec<Value> = order
                    .into_iter()
                    .map(|i| values.get(i).cloned().unwrap_or(Value::Null))
                    .collect();
                let v = builtins::call(callee, &ordered).unwrap_or(Value::Null);
                warn_failed_call(scope, callee, &ordered, &v);
                return v;
            }
            match scope.lookup(callee) {
                Some(Value::Function(f)) => f.call(&order_args(f.params(), &names, values)),
                _ => {
                    scope.warn(WarningKind::NoFunctionFound, || {
                        format!(
                            "No function found with name '{callee}' and parameters {}",
                            names.join(", ")
                        )
                    });
                    Value::Null
                }
            }
        }
        NodeKind::If {
            condition,
            then,
            otherwise,
        } => {
            if matches!(eval(condition, scope), Value::Boolean(true)) {
                eval(then, scope)
            } else {
                eval(otherwise, scope)
            }
        }
        NodeKind::For { bindings, body } => {
            let mut results: Vec<Value> = Vec::new();
            // Copying the results for `partial` on every iteration is quadratic, so it is
            // bound only when the body can read it.
            let reads_partial = mentions(body, "partial");
            let ok = walk(bindings, 0, scope, &mut |inner| {
                let v = if reads_partial {
                    // The body sees the results produced so far as `partial`.
                    let partial = Value::List(results.clone());
                    eval(body, &inner.child(Frame::One("partial", partial)))
                } else {
                    eval(body, inner)
                };
                results.push(v);
            });
            if ok {
                Value::List(results)
            } else {
                Value::Null
            }
        }
        NodeKind::Some {
            bindings,
            satisfies,
        } => eval_quantifier(true, bindings, satisfies, scope),
        NodeKind::Every {
            bindings,
            satisfies,
        } => eval_quantifier(false, bindings, satisfies, scope),
        NodeKind::Between { value, low, high } => {
            let v = eval(value, scope);
            let lo = eval(low, scope);
            let hi = eval(high, scope);
            match (ops::compare(&v, &lo), ops::compare(&v, &hi)) {
                (Some(a), Some(b)) => Value::Boolean(a != Ordering::Less && b != Ordering::Greater),
                (a, _) => {
                    let other = if a.is_none() { &lo } else { &hi };
                    warn_not_comparable(scope, &v, other);
                    Value::Null
                }
            }
        }
        // The right-hand side is a unary test with the left-hand value as its
        // implicit input. Unlike a decision table's test, an unknown answer
        // stays unknown.
        NodeKind::InTest { value, test } => {
            let v = eval(value, scope);
            boolean(unary_test_value(test, &v, scope))
        }
        NodeKind::InstanceOf { value, type_name } => {
            Value::Boolean(instance_of(&eval(value, scope), type_name))
        }
        NodeKind::FunctionDef { params, body } => make_function(params, body, scope),
        NodeKind::AnyInput => Value::Boolean(true),
        NodeKind::UnaryTestList(tests) => {
            let input = scope.input();
            Value::Boolean(
                tests
                    .iter()
                    .any(|t| unary_test_value(t, input, scope) == Some(true)),
            )
        }
        NodeKind::UnaryNot(tests) => {
            let input = scope.input();
            Value::Boolean(
                !tests
                    .iter()
                    .any(|t| unary_test_value(t, input, scope) == Some(true)),
            )
        }
    }
}

fn eval_binary<'a>(op: BinaryOp, left: &Node, right: &Node, scope: &'a Scope<'a>) -> Value {
    // Three-valued logic with short-circuiting: anything that is not a boolean
    // leaves the result unknown.
    match op {
        BinaryOp::And => {
            let l = eval(left, scope);
            if matches!(l, Value::Boolean(false)) {
                return Value::Boolean(false);
            }
            return match (l, eval(right, scope)) {
                (_, Value::Boolean(false)) => Value::Boolean(false),
                (Value::Boolean(true), Value::Boolean(true)) => Value::Boolean(true),
                _ => Value::Null,
            };
        }
        BinaryOp::Or => {
            let l = eval(left, scope);
            if matches!(l, Value::Boolean(true)) {
                return Value::Boolean(true);
            }
            return match (l, eval(right, scope)) {
                (_, Value::Boolean(true)) => Value::Boolean(true),
                (Value::Boolean(false), Value::Boolean(false)) => Value::Boolean(false),
                _ => Value::Null,
            };
        }
        _ => {}
    }

    let l = eval_ref(left, scope);
    let r = eval_ref(right, scope);
    let (l, r) = (&*l, &*r);
    let arithmetic = |result: Value, verb: fn(&str, &str) -> String| {
        if result.is_null() && !l.is_null() && !r.is_null() {
            scope.warn(WarningKind::InvalidType, || verb(&show(l), &show(r)));
        }
        result
    };
    match op {
        BinaryOp::Eq | BinaryOp::Ne => {
            let Some(eq) = ops::feel_equals(l, r) else {
                warn_not_comparable(scope, l, r);
                return Value::Null;
            };
            Value::Boolean(eq == (op == BinaryOp::Eq))
        }
        BinaryOp::Add => arithmetic(ops::add(l, r), |a, b| format!("Can't add '{b}' to '{a}'")),
        BinaryOp::Sub => arithmetic(ops::sub(l, r), |a, b| {
            format!("Can't subtract '{b}' from '{a}'")
        }),
        BinaryOp::Mul => arithmetic(ops::mul(l, r), |a, b| {
            format!("Can't multiply '{a}' by '{b}'")
        }),
        BinaryOp::Div => arithmetic(ops::div(l, r), |a, b| {
            format!("Can't divide '{a}' by '{b}'")
        }),
        BinaryOp::Pow => arithmetic(ops::pow(l, r), |a, b| {
            format!("Can't raise '{a}' to the power of '{b}'")
        }),
        BinaryOp::Lt | BinaryOp::Le | BinaryOp::Gt | BinaryOp::Ge => {
            let Some(ord) = ops::compare(l, r) else {
                warn_not_comparable(scope, l, r);
                return Value::Null;
            };
            Value::Boolean(match op {
                BinaryOp::Lt => ord == Ordering::Less,
                BinaryOp::Le => ord != Ordering::Greater,
                BinaryOp::Gt => ord == Ordering::Greater,
                _ => ord != Ordering::Less,
            })
        }
        BinaryOp::And | BinaryOp::Or => Value::Null,
    }
}

/// Null on either side is FEEL's unknown, not a failure: only two values are reported.
fn warn_not_comparable(scope: &Scope<'_>, a: &Value, b: &Value) {
    if !a.is_null() && !b.is_null() {
        scope.warn(WarningKind::NotComparable, || {
            format!("Can't compare '{}' with '{}'", show(a), show(b))
        });
    }
}

fn eval_filter<'a>(base: &Node, condition: &Node, scope: &'a Scope<'a>) -> Value {
    let value = eval_ref(base, scope);
    if value.is_null() {
        return Value::List(Vec::new());
    }
    // A value that is not a list is filtered as a list holding just it, so
    // `true[1]` is true and `true[0]` is null.
    let items: &[Value] = match &*value {
        Value::List(l) => l,
        v => slice::from_ref(v),
    };
    let test = |item: &Value| {
        let inner = scope.child(Frame::Item(item));
        eval(condition, &inner)
    };
    // The first element's answer decides whether this is an index or a filter.
    let first = test(items.first().unwrap_or(&NULL));
    if let Value::Number(n) = first {
        let idx = if n > Decimal::ZERO {
            n - Decimal::ONE
        } else {
            Decimal::from(items.len()) + n
        };
        return idx
            .floor()
            .to_usize()
            .and_then(|i| items.get(i))
            .cloned()
            .unwrap_or(Value::Null);
    }
    let mut out = Vec::new();
    for (i, item) in items.iter().enumerate() {
        let keep = if i == 0 { first.clone() } else { test(item) };
        if matches!(keep, Value::Boolean(true)) {
            out.push(item.clone());
        }
    }
    Value::List(out)
}

/// Orders the arguments of a named invocation of a user-defined function. A
/// function that declares no parameter names, or that is handed a name it does
/// not declare, gets nulls rather than a silently mis-ordered argument list.
fn order_args(params: Option<&[String]>, arg_names: &[&str], values: Vec<Value>) -> Vec<Value> {
    let Some(params) = params else {
        return Vec::new();
    };
    params
        .iter()
        .map(|p| {
            arg_names
                .iter()
                .position(|a| a == p)
                .and_then(|i| values.get(i).cloned())
                .unwrap_or(Value::Null)
        })
        .collect()
}

/// Expands the domain of a `for`/`some`/`every` binding into the values to
/// iterate. A numeric or date range yields its whole span, counting down when
/// it runs backwards; anything else iterates as a single-element list. A range
/// over values that cannot be stepped through has no iteration (`None`).
fn iteration_values(domain: Value) -> Option<Vec<Value>> {
    match domain {
        Value::List(items) => Some(items),
        Value::Range(r) => match (&r.start, &r.end) {
            (Value::Number(a), Value::Number(b)) => {
                let up = a <= b;
                let step = if up { Decimal::ONE } else { -Decimal::ONE };
                let mut out = Vec::new();
                let mut v = *a;
                while if up { v <= *b } else { v >= *b } {
                    if out.len() >= MAX_SPAN {
                        return None;
                    }
                    out.push(Value::Number(v));
                    v = v.checked_add(step)?;
                }
                Some(out)
            }
            (Value::Date(a), Value::Date(b)) => {
                let (from, to) = (
                    temporal::date_to_epoch_days(a),
                    temporal::date_to_epoch_days(b),
                );
                if from.abs_diff(to) >= MAX_SPAN as u64 {
                    return None;
                }
                let days: Vec<i64> = if from <= to {
                    (from..=to).collect()
                } else {
                    (to..=from).rev().collect()
                };
                days.into_iter()
                    .map(|d| temporal::epoch_days_to_date(d).map(Value::Date))
                    .collect()
            }
            _ => None,
        },
        other => Some(vec![other]),
    }
}

/// Visits every combination of the bindings. Each domain is evaluated with the
/// bindings to its left in scope, so `for x in xs, y in x` works. `false`
/// when some domain cannot be iterated.
fn walk<'a>(
    bindings: &'a [Binding],
    idx: usize,
    scope: &'a Scope<'a>,
    leaf: &mut impl FnMut(&Scope<'_>),
) -> bool {
    let Some(binding) = bindings.get(idx) else {
        leaf(scope);
        return true;
    };
    let Some(domain) = iteration_values(eval(&binding.domain, scope)) else {
        return false;
    };
    for value in domain {
        let inner = scope.child(Frame::One(&binding.name, value));
        if !walk(bindings, idx + 1, &inner, leaf) {
            return false;
        }
    }
    true
}

/// `some`/`every`. A definite answer wins over an unknown one: one true
/// satisfies `some` whatever else the domain holds, and one false settles
/// `every`. Otherwise an unknown anywhere makes the whole answer unknown.
fn eval_quantifier<'a>(
    is_some: bool,
    bindings: &'a [Binding],
    satisfies: &Node,
    scope: &'a Scope<'a>,
) -> Value {
    let (mut saw_true, mut saw_false, mut saw_unknown) = (false, false, false);
    let ok = walk(
        bindings,
        0,
        scope,
        &mut |inner| match eval(satisfies, inner) {
            Value::Boolean(true) => saw_true = true,
            Value::Boolean(false) => saw_false = true,
            _ => saw_unknown = true,
        },
    );
    if !ok {
        return Value::Null;
    }
    let (definite, other) = if is_some {
        (saw_true, false)
    } else {
        (saw_false, true)
    };
    if definite {
        Value::Boolean(!other)
    } else if saw_unknown {
        Value::Null
    } else {
        Value::Boolean(other)
    }
}

/// Everything a `function(..)` literal needs after the evaluation that made it
/// is gone: a copy of what was in scope.
struct Captured {
    vars: Context,
    input: Option<Value>,
    params: Vec<String>,
    body: Arc<Node>,
}

fn make_function(params: &[String], body: &Arc<Node>, scope: &Scope<'_>) -> Value {
    let mut chain = Vec::new();
    let mut cur = Some(scope);
    while let Some(s) = cur {
        chain.push(s);
        cur = s.parent;
    }
    let mut vars = Context::new();
    for s in chain.iter().rev() {
        match &s.frame {
            Frame::Empty => {}
            Frame::Ctx(c) => {
                for (k, v) in *c {
                    vars.insert(k.clone(), v.clone());
                }
            }
            Frame::One(n, v) => {
                vars.insert(*n, v.clone());
            }
            Frame::Vars(vs) => {
                for (n, v) in vs {
                    vars.insert(*n, v.clone());
                }
            }
            Frame::Item(item) => {
                vars.insert("item", (*item).clone());
                if let Value::Context(c) = item {
                    for (k, v) in c {
                        vars.insert(k.clone(), v.clone());
                    }
                }
            }
        }
    }
    let cap = Arc::new(Captured {
        vars,
        input: scope.input.cloned(),
        params: params.to_vec(),
        body: Arc::clone(body),
    });
    Value::Function(Function::new(Some(params.to_vec()), move |args| {
        let root = Scope {
            frame: Frame::Ctx(&cap.vars),
            parent: None,
            input: cap.input.as_ref(),
            warnings: None,
        };
        let bound = cap
            .params
            .iter()
            .enumerate()
            .map(|(i, p)| (p.as_str(), args.get(i).cloned().unwrap_or(Value::Null)))
            .collect();
        let inner = root.child(Frame::Vars(bound));
        eval(&cap.body, &inner)
    }))
}

fn test_includes(test: &Value, val: &Value) -> Option<bool> {
    match test {
        // Two lists are compared, not searched: [1,2,3] is a member of
        // [[1,2,3,4], [1,2,3]] rather than of its elements.
        Value::List(_) if matches!(val, Value::List(_)) => Some(ops::deep_equals(test, val)),
        Value::Range(r) => {
            let (cs, ce) = (ops::compare(val, &r.start)?, ops::compare(val, &r.end)?);
            let start_ok = if r.start_included {
                cs != Ordering::Less
            } else {
                cs == Ordering::Greater
            };
            let end_ok = if r.end_included {
                ce != Ordering::Greater
            } else {
                ce == Ordering::Less
            };
            Some(start_ok && end_ok)
        }
        Value::List(t) => Some(t.iter().any(|x| test_includes(x, val) == Some(true))),
        _ => Some(ops::deep_equals(val, test)),
    }
}

fn instance_of(val: &Value, type_name: &str) -> bool {
    // null is not an instance of anything, Any included: it is the absence of
    // a value rather than a value of some type.
    if val.is_null() {
        return type_name == "null" || type_name == "Null";
    }
    match type_name {
        "number" => matches!(val, Value::Number(_)),
        "string" => matches!(val, Value::String(_)),
        "boolean" => matches!(val, Value::Boolean(_)),
        "date" => matches!(val, Value::Date(_)),
        "time" => matches!(val, Value::Time(_)),
        "date and time" => matches!(val, Value::DateTime(_)),
        "days and time duration" | "dayTimeDuration" => matches!(val, Value::DaysTimeDuration(_)),
        "years and months duration" | "yearMonthDuration" => {
            matches!(val, Value::YearsMonthsDuration(_))
        }
        "list" => matches!(val, Value::List(_)),
        "context" => matches!(val, Value::Context(_)),
        "function" => matches!(val, Value::Function(_)),
        "Any" | "any" => true,
        _ => false,
    }
}

/// Whether `name` occurs anywhere in `node` as a name or a callee (conservatively: bindings,
/// context entries and function bodies are searched too).
fn mentions(node: &Node, name: &str) -> bool {
    use NodeKind as K;
    let any = |nodes: &[Node]| nodes.iter().any(|n| mentions(n, name));
    let bound = |bs: &[Binding]| bs.iter().any(|b| mentions(&b.domain, name));
    match &node.kind {
        K::Name(n) => n == name,
        K::Number(_) | K::String(_) | K::Boolean(_) | K::Null | K::Temporal(_) | K::AnyInput => {
            false
        }
        K::List(items) | K::UnaryTestList(items) | K::UnaryNot(items) => any(items),
        K::Context(entries) => entries.iter().any(|(_, n)| mentions(n, name)),
        K::Range { low, high, .. } => mentions(low, name) || mentions(high, name),
        K::UnaryMinus(n) | K::Path { base: n, .. } | K::InstanceOf { value: n, .. } => {
            mentions(n, name)
        }
        K::Binary { left, right, .. } => mentions(left, name) || mentions(right, name),
        K::Filter { base, condition } => mentions(base, name) || mentions(condition, name),
        K::Call { callee, args } => callee == name || any(args),
        K::CallExpr { target, args } => mentions(target, name) || any(args),
        K::CallNamed { callee, args } => {
            callee == name || args.iter().any(|(_, n)| mentions(n, name))
        }
        K::If {
            condition,
            then,
            otherwise,
        } => mentions(condition, name) || mentions(then, name) || mentions(otherwise, name),
        K::For { bindings, body } => bound(bindings) || mentions(body, name),
        K::Some {
            bindings,
            satisfies,
        }
        | K::Every {
            bindings,
            satisfies,
        } => bound(bindings) || mentions(satisfies, name),
        K::Between { value, low, high } => {
            mentions(value, name) || mentions(low, name) || mentions(high, name)
        }
        K::InTest { value, test } => mentions(value, name) || mentions(test, name),
        K::FunctionDef { body, .. } => mentions(body, name),
    }
}

/// Whether an expression reads the unary-test input `?`, explicitly or
/// implicitly. As in the TS port, context entries, named arguments and
/// binding domains are not searched.
fn reads_input(node: &Node) -> bool {
    use NodeKind as K;
    let any = |nodes: &[Node]| nodes.iter().any(reads_input);
    match &node.kind {
        K::Name(n) => n == "?",
        // These already test the input; their boolean is the outcome.
        K::UnaryNot(_) | K::UnaryTestList(_) | K::AnyInput => true,
        K::Number(_)
        | K::String(_)
        | K::Boolean(_)
        | K::Null
        | K::Temporal(_)
        | K::Context(_)
        | K::CallNamed { .. } => false,
        K::List(items) => any(items),
        K::Range { low, high, .. } => reads_input(low) || reads_input(high),
        K::UnaryMinus(n) => reads_input(n),
        K::Binary { left, right, .. } => reads_input(left) || reads_input(right),
        K::Path { base, .. } => reads_input(base),
        K::Filter { base, condition } => reads_input(base) || reads_input(condition),
        K::Call { args, .. } => any(args),
        K::CallExpr { target, args } => reads_input(target) || any(args),
        K::If {
            condition,
            then,
            otherwise,
        } => reads_input(condition) || reads_input(then) || reads_input(otherwise),
        K::For { body, .. } => reads_input(body),
        K::Some { satisfies, .. } | K::Every { satisfies, .. } => reads_input(satisfies),
        K::Between { value, low, high } => {
            reads_input(value) || reads_input(low) || reads_input(high)
        }
        K::InTest { value, test } => reads_input(value) || reads_input(test),
        K::InstanceOf { value, .. } => reads_input(value),
        K::FunctionDef { body, .. } => reads_input(body),
    }
}

/// Evaluates a unary test, keeping an unknown answer unknown (`None`).
fn unary_test_value<'a>(node: &Node, input: &Value, scope: &'a Scope<'a>) -> Option<bool> {
    let with_input = Scope {
        frame: Frame::Empty,
        parent: Some(scope),
        input: Some(input),
        warnings: scope.warnings,
    };
    let result = eval(node, &with_input);
    match &result {
        // A boolean that does not depend on `?` (the literal `true` in a
        // boolean input column) is a value to compare with, not the outcome.
        Value::Boolean(b) => Some(match input {
            Value::Boolean(i) if !reads_input(node) => b == i,
            _ => *b,
        }),
        // A range in unary-test context is a membership test.
        Value::Range(_) => test_includes(&result, input),
        // A list matches when any element does.
        Value::List(items) => {
            let mut unknown = false;
            for item in items {
                match test_includes(item, input) {
                    Some(true) => return Some(true),
                    None => unknown = true,
                    Some(false) => {}
                }
            }
            if unknown {
                None
            } else {
                Some(false)
            }
        }
        // A plain expression is an equality test. A null result only matches
        // when the node itself is the null literal (null arithmetic must not
        // match anything).
        Value::Null => Some(matches!(node.kind, NodeKind::Null) && input.is_null()),
        other => Some(ops::deep_equals(other, input)),
    }
}

#[cfg(test)]
#[path = "evaluator_tests.rs"]
mod tests;
