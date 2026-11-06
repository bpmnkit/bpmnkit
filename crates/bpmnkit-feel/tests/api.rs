//! The public API only.

use bpmnkit_feel::{
    evaluate, evaluate_with_diagnostics, parse, parse_unary_tests, Context, ParseOptions, Value,
};

#[test]
fn doctest_example() {
    let mut ctx = Context::new();
    ctx.insert("x", Value::from(2));
    assert_eq!(evaluate("x * 3 + 1", &ctx).unwrap(), Value::from(7));
}

#[test]
fn exact_decimals() {
    let ctx = Context::new();
    assert_eq!(
        evaluate("0.1 + 0.2 = 0.3", &ctx).unwrap(),
        Value::Boolean(true)
    );
}

#[test]
fn invalid_operations_are_null() {
    let ctx = Context::new();
    assert_eq!(evaluate("1 / 0", &ctx).unwrap(), Value::Null);
    assert_eq!(evaluate("\"a\" - 1", &ctx).unwrap(), Value::Null);
    assert_eq!(evaluate("nothing.at.all", &ctx).unwrap(), Value::Null);
}

#[test]
fn parse_errors_are_reported() {
    let err = evaluate("1 +", &Context::new()).unwrap_err();
    assert!(!err.errors.is_empty());
    assert!(err.to_string().starts_with("FEEL parse error"));
}

#[test]
fn context_variables_and_paths() {
    let mut order = Context::new();
    order.insert("total", Value::from(120));
    order.insert("items", Value::from(vec![Value::from(1), Value::from(2)]));
    let mut ctx = Context::new();
    ctx.insert("order", order);
    assert_eq!(
        evaluate("if order.total > 100 then \"big\" else \"small\"", &ctx).unwrap(),
        Value::from("big")
    );
    assert_eq!(
        evaluate("order.items[item > 1]", &ctx).unwrap(),
        Value::from(vec![Value::from(2)])
    );
}

#[test]
fn multi_word_names_come_from_the_context() {
    let mut ctx = Context::new();
    ctx.insert("order total", Value::from(21));
    assert_eq!(evaluate("order total * 2", &ctx).unwrap(), Value::from(42));
}

#[test]
fn context_literals_and_functions() {
    let ctx = Context::new();
    assert_eq!(
        evaluate("{a: 1, b: a + 1}.b", &ctx).unwrap(),
        Value::from(2)
    );
    assert_eq!(
        evaluate("{f: function(x) x * 2}.f(21)", &ctx).unwrap(),
        Value::from(42)
    );
}

#[test]
fn loops_and_quantifiers() {
    let ctx = Context::new();
    assert_eq!(
        evaluate("for i in 1..3 return i * i", &ctx).unwrap(),
        Value::from(vec![Value::from(1), Value::from(4), Value::from(9)])
    );
    assert_eq!(
        evaluate("some x in [1, 2, 3] satisfies x > 2", &ctx).unwrap(),
        Value::Boolean(true)
    );
}

#[test]
fn parsed_expression_is_reusable() {
    let expr = parse("n + 1", &ParseOptions::default()).unwrap();
    for n in 0..3 {
        let mut ctx = Context::new();
        ctx.insert("n", Value::from(n));
        assert_eq!(expr.evaluate(&ctx), Value::from(n + 1));
    }
}

#[test]
fn unary_tests() {
    let tests = parse_unary_tests("< 10, > 20", &ParseOptions::default()).unwrap();
    let ctx = Context::new();
    assert!(tests.test(&Value::from(5), &ctx));
    assert!(!tests.test(&Value::from(15), &ctx));
    assert!(tests.test(&Value::from(25), &ctx));
    let any = parse_unary_tests("-", &ParseOptions::default()).unwrap();
    assert!(any.test(&Value::Null, &ctx));
}

#[test]
fn unary_tests_see_the_context() {
    let tests = parse_unary_tests("> limit", &ParseOptions::default()).unwrap();
    let mut ctx = Context::new();
    ctx.insert("limit", Value::from(10));
    assert!(tests.test(&Value::from(11), &ctx));
    assert!(!tests.test(&Value::from(9), &ctx));
}

/// The warnings as Zeebe prints them, checking the value matches `evaluate`.
fn diagnose(source: &str, ctx: &Context) -> (Value, Vec<String>) {
    let ev = evaluate_with_diagnostics(source, ctx).unwrap();
    assert_eq!(ev.value, evaluate(source, ctx).unwrap(), "{source}");
    (
        ev.value,
        ev.warnings.iter().map(|w| w.to_string()).collect(),
    )
}

#[test]
fn suppressed_failures_are_reported_with_the_null() {
    let mut ctx = Context::new();
    ctx.insert("orderValue", Value::from("99"));
    // The incident text in Camunda's Operate guide.
    assert_eq!(
        diagnose("orderValue >= 100", &ctx),
        (
            Value::Null,
            vec!["[NOT_COMPARABLE] Can't compare '\"99\"' with '100'".to_string()]
        )
    );
    let ctx = Context::new();
    for (source, warning) in [
        ("10 / 0", "[INVALID_TYPE] Can't divide '10' by '0'"),
        ("\"a\" + 1", "[INVALID_TYPE] Can't add '1' to '\"a\"'"),
        (
            "date(\"not-a-date\")",
            "[FUNCTION_INVOCATION_FAILURE] Failed to invoke function 'date' with arguments (\"not-a-date\")",
        ),
        ("x > 5", "[NO_VARIABLE_FOUND] No variable found with name 'x'"),
        ("{a: 1}.b", "[NO_CONTEXT_ENTRY_FOUND] No context entry found with key 'b'"),
        ("nope(1)", "[NO_FUNCTION_FOUND] No function found with name 'nope' and 1 parameters"),
        ("1 = \"1\"", "[NOT_COMPARABLE] Can't compare '1' with '\"1\"'"),
        ("-\"a\"", "[INVALID_TYPE] Can't negate '\"a\"'"),
    ] {
        assert_eq!(diagnose(source, &ctx), (Value::Null, vec![warning.to_string()]), "{source}");
    }
}

#[test]
fn answers_that_are_null_carry_no_warning() {
    let mut ctx = Context::new();
    ctx.insert("x", Value::Null);
    for source in [
        "1 + 2",
        "x = null",
        "x > 5",
        "get value({}, \"a\")",
        "null + 1",
    ] {
        assert!(diagnose(source, &ctx).1.is_empty(), "{source}");
    }
}

#[test]
fn warnings_from_nested_scopes_are_collected() {
    let (value, warnings) = diagnose("for i in [1, 0] return 10 / i", &Context::new());
    assert_eq!(value, Value::from(vec![Value::from(10), Value::Null]));
    assert_eq!(
        warnings,
        vec!["[INVALID_TYPE] Can't divide '10' by '0'".to_string()]
    );
}
