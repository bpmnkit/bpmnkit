//! Tests mirroring `packages/feel/tests/evaluator.test.ts` and `spec.test.ts`
//! for the cases that need no built-in.

use super::*;
use crate::parser::{parse_expression, parse_unary_tests, ParseOptions};

fn ev_with(src: &str, vars: &Context) -> Value {
    let options = ParseOptions {
        names: vars.keys().cloned().collect(),
    };
    let parsed = parse_expression(src, &options);
    match parsed.ast {
        Some(ast) if parsed.errors.is_empty() => evaluate_root(&ast, vars, None, None),
        _ => panic!("parse failed: {src}"),
    }
}

fn ev(src: &str) -> Value {
    ev_with(src, &Context::new())
}

fn ut(src: &str, input: Value) -> bool {
    let parsed = parse_unary_tests(src, &ParseOptions::default());
    let ast = parsed.ast.expect("unary tests parse");
    test_unary(&ast, &input, &Context::new())
}

/// Each source must evaluate to what the (literal) expectation evaluates to.
fn check(cases: &[(&str, &str)]) {
    for (src, expected) in cases {
        assert_eq!(ev(src), ev(expected), "{src}");
    }
}

fn vars(entries: &[(&str, Value)]) -> Context {
    entries
        .iter()
        .map(|(k, v)| ((*k).to_owned(), v.clone()))
        .collect()
}

#[test]
fn literals_and_arithmetic() {
    check(&[
        ("42", "42"),
        ("3.14", "3.14"),
        ("\"hello\"", "\"hello\""),
        ("true", "true"),
        ("null", "null"),
        ("1 + 2", "3"),
        ("5 - 3", "2"),
        ("3 * 4", "12"),
        ("10 / 2", "5"),
        ("1 / 0", "null"),
        ("2 ** 10", "1024"),
        ("2 ** 3 ** 2", "64"),
        ("null + 1", "null"),
        ("\"a\" + \"b\"", "\"ab\""),
        ("-5", "0 - 5"),
        ("0.1 + 0.2", "0.3"),
        ("12300 = 1.23e4", "true"),
        (".872", "0.872"),
        ("unknownVar", "null"),
    ]);
    assert_eq!(ev("@\"2021-01-01\"").type_name(), "date");
}

#[cfg(feature = "tz")] // uses IANA zone names
#[test]
fn comparison_and_logic() {
    check(&[
        ("1 = 1", "true"),
        ("1 = 2", "false"),
        ("1 != 2", "true"),
        ("1 < 2", "true"),
        ("5 >= 5", "true"),
        ("false and null", "false"),
        ("true or null", "true"),
        ("null and true", "null"),
        ("null or false", "null"),
        ("true and 123", "null"),
        ("false or \"true\"", "null"),
        ("false and 123", "false"),
        ("true or 123", "true"),
        ("false = 0", "null"),
        ("100 = \"100\"", "null"),
        ("{} = []", "null"),
        ("null = null", "true"),
        ("1 = null", "false"),
        (
            "@\"2002-04-02T12:00:00-01:00\" = @\"2002-04-02T17:00:00+04:00\"",
            "true",
        ),
        (
            "@\"2018-12-08T10:00:00\" = @\"2018-12-08T10:00:00Z\"",
            "false",
        ),
        (
            "@\"2002-01-02T12:00:00@Australia/Melbourne\" = @\"2002-01-02T12:00:00+11:00\"",
            "true",
        ),
        ("5 between 1 and 10", "true"),
        ("0 between 1 and 10", "false"),
        ("null between 1 and 10", "null"),
    ]);
}

#[test]
fn if_then_else() {
    check(&[
        ("if true then 1 else 2", "1"),
        ("if false then 1 else 2", "2"),
        ("if null then 1 else 2", "2"),
    ]);
}

#[test]
fn collections_and_paths() {
    check(&[
        ("[1, 2, 3]", "[1, 2, 3]"),
        ("{a: 1, b: 2}", "{a: 1, b: 2}"),
        ("{a: 1, b: a + 1}", "{a: 1, b: 2}"),
        ("{a: 1, b: {c: a}}.b.c", "1"),
        ("{b: a + 1, a: 1}.b", "null"),
        ("{foo: \"bar\", foo: \"baz\"}", "null"),
        ("null.foo", "null"),
        ("{a: 1}.missing", "null"),
        ("[{value: 1}, {value: 2}].value", "[1, 2]"),
    ]);
    let v = vars(&[("a", Value::from(1))]);
    assert_eq!(ev_with("{a: 2, b: a}.b", &v), Value::from(2));
}

#[test]
fn variables_shadow_builtins() {
    let v = vars(&[("count", Value::from(3))]);
    assert_eq!(ev_with("count", &v), Value::from(3));
    assert_eq!(ev_with("count + 1", &v), Value::from(4));
    let v = vars(&[("sum", Value::Null)]);
    assert_eq!(ev_with("sum", &v), Value::Null);
    let v = vars(&[("a b", Value::from(1)), ("a b c", Value::from(5))]);
    assert_eq!(ev_with("a b + 1", &v), Value::from(2));
    assert_eq!(ev_with("a b c", &v), Value::from(5));
}

#[test]
fn filters() {
    check(&[
        ("[1, 2, 3][item > 1]", "[2, 3]"),
        ("[{a: 1}, {a: 2}, {a: 3}][a >= 2]", "[{a: 2}, {a: 3}]"),
        ("[10, 20, 30][1]", "10"),
        ("[10, 20, 30][-1]", "30"),
        ("[10, 20, 30][0]", "null"),
        ("[10, 20, 30][4]", "null"),
        ("[10, 20, 30][-4]", "null"),
        ("[][1]", "null"),
        ("true[1]", "true"),
        ("true[0]", "null"),
        ("null[1]", "[]"),
    ]);
    let v = vars(&[("xs", Value::from(vec![Value::from(1), Value::from(2)]))]);
    assert_eq!(
        ev_with("xs[item = 2]", &v),
        Value::from(vec![Value::from(2)])
    );
}

#[test]
fn for_some_every() {
    check(&[
        ("for x in [1, 2, 3] return x * 2", "[2, 4, 6]"),
        ("for i in 1..3 return i * i", "[1, 4, 9]"),
        ("for i in 3..1 return i", "[3, 2, 1]"),
        ("for x in [1,2], y in 1..2 return x * y", "[1, 2, 2, 4]"),
        ("for x in [[1,2],[3,4]], y in x return y", "[1, 2, 3, 4]"),
        (
            "for i in 0..4 return if i = 0 then 1 else i * partial[-1]",
            "[1, 1, 2, 6, 24]",
        ),
        ("for i in \"a\"..\"z\" return i", "null"),
        ("for i in 1.5..4 return i", "[1.5, 2.5, 3.5]"),
        ("some x in [1, 2, 3] satisfies x > 2", "true"),
        ("some x in [1, 2, 3] satisfies x > 10", "false"),
        ("every x in [1, 2, 3] satisfies x > 0", "true"),
        ("every x in [1, 2, 3] satisfies x > 1", "false"),
        ("some x in 1..3 satisfies x > 2", "true"),
        ("every x in 1..3 satisfies x > 0", "true"),
        ("some x in [1, null] satisfies x > 5", "null"),
        ("some x in [1, null] satisfies x < 5", "true"),
        ("every x in [1, null] satisfies x < 5", "null"),
        ("every x in [10, null] satisfies x < 5", "false"),
    ]);
    let Value::List(days) = ev("for i in @\"1980-01-01\"..@\"1980-01-03\" return i") else {
        panic!("list")
    };
    assert_eq!(days.len(), 3);
    assert!(days.iter().all(|d| d.type_name() == "date"));
}

#[test]
fn in_tests_and_instance_of() {
    check(&[
        ("3 in [1..5]", "true"),
        ("\"visa\" in \"visa\"", "true"),
        ("1 in <= 10", "true"),
        ("11 in <= 10", "false"),
        ("10 in =10", "true"),
        ("10 in (1, < 5, >= 10)", "true"),
        ("7 in (1, < 5, >= 10)", "false"),
        ("5 in [1, 5, 9]", "true"),
        ("[1,2,3] in [[1,2,3,4], [1,2,3]]", "true"),
        ("null in [1..10]", "null"),
        ("5 in [null..10]", "null"),
        ("42 instance of number", "true"),
        ("\"hello\" instance of number", "false"),
        ("\"hi\" instance of string", "true"),
        ("null instance of Any", "false"),
        ("null instance of number", "false"),
        ("@\"2018-12-08T10:30:11\" instance of date and time", "true"),
        ("@\"P10D\" instance of days and time duration", "true"),
        ("[1] instance of list", "true"),
        ("{} instance of context", "true"),
    ]);
}

#[test]
fn functions() {
    check(&[
        ("{f: function(a) a * 2}.f(3)", "6"),
        ("(function(a) a + 1)(2)", "3"),
        ("{f: 1}.f(3)", "null"),
        ("{k: 10, f: function(a) a + k}.f(3)", "13"),
        ("(function(a, b) a - b)(5)", "null"),
        ("{f: function(a, b) a - b}.f(5, 3)", "2"),
    ]);
    let f = ev("function(x) x * 2");
    assert!(matches!(f, Value::Function(_)));
    let v = vars(&[("double", f)]);
    assert_eq!(ev_with("double(3)", &v), Value::from(6));
    assert_eq!(ev_with("double(y: 3)", &v), Value::Null);
    assert_eq!(ev_with("double(x: 3)", &v), Value::from(6));

    let v = vars(&[("f", ev("function(a, b) a - b"))]);
    assert_eq!(ev_with("f(b: 1, a: 5)", &v), Value::from(4));
    assert_eq!(ev_with("f(c: 1)", &v), Value::Null);
    assert_eq!(ev_with("g(1)", &v), Value::Null);

    let fns: Context = [("double".to_owned(), ev("function(a) a * 2"))]
        .into_iter()
        .collect();
    let v = vars(&[("fns", fns.into())]);
    assert_eq!(ev_with("fns.double(4)", &v), Value::from(8));
}

#[test]
fn function_values_are_thread_safe() {
    fn assert_send_sync<T: Send + Sync>() {}
    assert_send_sync::<Value>();
    let Value::Function(f) = ev("function(a) a + 1") else {
        panic!("function")
    };
    let handle = std::thread::spawn(move || f.call(&[Value::from(1)]));
    assert_eq!(handle.join().unwrap(), Value::from(2));
}

#[test]
fn temporal_arithmetic() {
    check(&[
        ("@\"2021-01-15\" + @\"P1Y\"", "@\"2022-01-15\""),
        ("@\"2020-01-31\" + @\"P1M\"", "@\"2020-02-29\""),
    ]);
}

#[test]
fn unary_tests() {
    assert!(ut("-", Value::from(42)));
    assert!(ut("-", Value::from("anything")));
    assert!(ut("\"visa\"", Value::from("visa")));
    assert!(!ut("\"visa\"", Value::from("master")));
    assert!(ut("< 5", Value::from(3)));
    assert!(!ut("< 5", Value::from(7)));
    assert!(ut("[1..5]", Value::from(3)));
    assert!(!ut("[1..5]", Value::from(6)));
    assert!(ut("\"visa\", \"master\"", Value::from("visa")));
    assert!(!ut("\"visa\", \"master\"", Value::from("amex")));
    assert!(ut("not(\"visa\")", Value::from("master")));
    assert!(!ut("not(\"visa\")", Value::from("visa")));
    assert!(ut("null", Value::Null));
    assert!(!ut("null", Value::from(0)));
    assert!(!ut("null", Value::from("")));
    assert!(!ut("< 5", Value::Null));
    assert!(ut("instance of string", Value::from("hello")));
    assert!(!ut("instance of string", Value::from(42)));
    assert!(!ut("instance of string", Value::Null));
    assert!(!ut("not(instance of string)", Value::from("hello")));
    assert!(ut("not(instance of string)", Value::Null));
    assert!(ut("not(instance of number)", Value::from("oops")));
}

#[test]
fn boolean_input_entries() {
    assert!(ut("true", Value::Boolean(true)));
    assert!(!ut("true", Value::Boolean(false)));
    assert!(ut("false", Value::Boolean(false)));
    assert!(!ut("false", Value::Boolean(true)));
    assert!(ut("not(true)", Value::Boolean(false)));
    assert!(!ut("not(true)", Value::Boolean(true)));
    assert!(ut("true, false", Value::Boolean(false)));
    assert!(ut("? = false", Value::Boolean(false)));
    assert!(!ut("? != false", Value::Boolean(false)));
}

#[test]
fn input_is_visible_to_expressions() {
    let ast = parse_expression("? + 1", &ParseOptions::default())
        .ast
        .unwrap();
    let input = Value::from(4);
    assert_eq!(
        evaluate_root(&ast, &Context::new(), Some(&input), None),
        Value::from(5)
    );
    assert_eq!(
        evaluate_root(&ast, &Context::new(), None, None),
        Value::Null
    );
}

#[test]

fn builtin_calls() {
    check(&[
        ("string length(\"hello\")", "5"),
        ("count([1, 2, 3])", "3"),
        ("sum([1, 2, 3])", "6"),
        ("floor(3.7)", "3"),
        (
            "substring(start position: 2, string: \"hello\")",
            "\"ello\"",
        ),
        ("substring(str: \"hello\", start position: 2)", "null"),
        ("count(for i in 1..3 return i)", "3"),
    ]);
    let v = vars(&[("count", Value::from(3))]);
    assert_eq!(ev_with("count([1, 2])", &v), Value::from(2));
    assert!(matches!(ev("count"), Value::Function(_)));
}
