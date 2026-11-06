//! The public API only.

use bpmnkit_feel::{evaluate, parse, parse_unary_tests, Context, ParseOptions, Value};

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
