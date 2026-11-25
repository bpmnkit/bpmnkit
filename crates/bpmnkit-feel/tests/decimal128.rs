//! FEEL numbers are DMN Decimal128 (34 significant digits, half-even), as
//! Camunda 8 computes them. Expected strings are Camunda 8.10.10's
//! `string(<expression>)` (bpmnkit/bpmnkit#320).

use bpmnkit_feel::{evaluate, Context, Value};

fn ctx() -> Context {
    let mut c = Context::new();
    c.insert("amount", Value::from(100));
    c
}

/// `string(expr)`, as Camunda's REST API was read.
fn string(expr: &str) -> String {
    match evaluate(&format!("string({expr})"), &ctx()).unwrap() {
        Value::String(s) => s,
        other => panic!("string({expr}) = {other:?}"),
    }
}

fn eval(expr: &str) -> Value {
    evaluate(expr, &ctx()).unwrap()
}

#[test]
fn camunda_8_10_table() {
    let rows = [
        ("0.1 + 0.2", "0.3"),
        ("0.1 + 0.2 = 0.3", "true"),
        ("0.1 + 0.2 <= 0.3", "true"),
        ("0.7 + 0.1 >= 0.8", "true"),
        ("sum([0.1, 0.2, 0.3]) = 0.6", "true"),
        ("amount * 1.1", "110.0"),
        ("floor(0.29 * 100)", "29"),
        ("ceiling(0.1 * 3 * 10)", "3"),
        ("1 / 3", "0.3333333333333333333333333333333333"),
        ("10 / 3 * 3 = 10", "false"),
        ("9007199254740993 + 1", "9007199254740994"),
        ("2 ** 0.5", "1.4142135623730951"),
        ("sqrt(2)", "1.4142135623730951"),
        ("amount * 0.5", "50.0"),
        ("amount * 1.1 <= 110", "true"),
    ];
    for (expr, want) in rows {
        assert_eq!(string(expr), want, "{expr}");
    }
}

#[test]
fn one_third_has_34_digits() {
    let Value::Number(n) = eval("1 / 3") else {
        panic!()
    };
    assert_eq!(n.to_string(), format!("0.{}", "3".repeat(34)));
    assert_eq!(string("2 / 3"), format!("0.{}7", "6".repeat(33)));
}

#[test]
fn literals_keep_34_digits_and_round_beyond_half_even() {
    let d34 = "1234567890123456789012345678901234";
    assert_eq!(string(d34), d34);
    assert_eq!(string(&format!("0.{d34}")), format!("0.{d34}"));
    // 35th digit 5, nothing after: the tie goes to the even neighbour.
    assert_eq!(
        string("0.12345678901234567890123456789012345"),
        "0.1234567890123456789012345678901234"
    );
    assert_eq!(
        string("0.12345678901234567890123456789012335"),
        "0.1234567890123456789012345678901234"
    );
    assert_eq!(
        string("0.123456789012345678901234567890123451"),
        "0.1234567890123456789012345678901235"
    );
    // A tie in a result: 34 nines + 0.5 rounds to the even 10^34.
    assert_eq!(
        string(&format!("{} + 0.5", "9".repeat(34))),
        format!("1{}", "0".repeat(34))
    );
    assert_eq!(
        string(&format!("{}2 + 0.5", "1".repeat(33))),
        format!("{}2", "1".repeat(33))
    );
    assert_eq!(
        string(&format!("{}3 + 0.5", "1".repeat(33))),
        format!("{}4", "1".repeat(33))
    );
}

#[test]
fn equality_and_order_by_value() {
    assert_eq!(eval("1.0 = 1.00"), Value::Boolean(true));
    assert_eq!(eval("1.0 < 1.01"), Value::Boolean(true));
    assert_eq!(eval("[1.0, 2] = [1, 2.00]"), Value::Boolean(true));
    assert_eq!(string("1.50 + 1.50"), "3.00");
}

#[test]
fn integer_powers_are_exact() {
    assert_eq!(string("2 ** 100"), "1267650600228229401496703205376");
    assert_eq!(string("10 ** -2"), "0.01");
    assert_eq!(eval("10 ** -2 = 0.01"), Value::Boolean(true));
    assert_eq!(string("1.1 ** 2"), "1.21");
}

#[test]
fn invalid_operations_are_null() {
    assert_eq!(eval("1 / 0"), Value::Null);
    assert_eq!(eval("0 ** -1"), Value::Null);
    assert_eq!(eval("modulo(1, 0)"), Value::Null);
}
