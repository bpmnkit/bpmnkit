//! Behaviour of the adapter over `bpmnkit-feel`: the unit tests of reebe's former own
//! evaluator and built-ins, moved here against the public API.

use reebe_feel::{evaluate, FeelContext, FeelValue};

fn eval(s: &str) -> FeelValue {
    evaluate(s, &FeelContext::new()).unwrap()
}

fn eval_with(s: &str, ctx: &FeelContext) -> FeelValue {
    evaluate(s, ctx).unwrap()
}

#[test]
fn test_arithmetic() {
    assert_eq!(eval("1 + 2"), FeelValue::Integer(3));
    assert_eq!(eval("10 - 3"), FeelValue::Integer(7));
    assert_eq!(eval("4 * 5"), FeelValue::Integer(20));
    assert_eq!(eval("10 / 4"), FeelValue::Float(2.5));
}

#[test]
fn test_comparisons() {
    assert_eq!(eval("1 < 2"), FeelValue::Bool(true));
    assert_eq!(eval("2 > 1"), FeelValue::Bool(true));
    assert_eq!(eval("1 = 1"), FeelValue::Bool(true));
    assert_eq!(eval("1 != 2"), FeelValue::Bool(true));
    assert_eq!(eval("2 <= 2"), FeelValue::Bool(true));
    assert_eq!(eval("3 >= 3"), FeelValue::Bool(true));
}

#[test]
fn test_boolean_logic() {
    assert_eq!(eval("true and false"), FeelValue::Bool(false));
    assert_eq!(eval("true or false"), FeelValue::Bool(true));
    assert_eq!(eval("not true"), FeelValue::Bool(false));
}

#[test]
fn test_string_concat() {
    assert_eq!(
        eval(r#""hello" + " " + "world""#),
        FeelValue::String("hello world".to_string())
    );
}

#[test]
fn test_variable_lookup() {
    let mut ctx = FeelContext::new();
    ctx.set("x", FeelValue::Integer(42));
    assert_eq!(eval_with("x", &ctx), FeelValue::Integer(42));
    assert_eq!(eval_with("x > 40", &ctx), FeelValue::Bool(true));
}

#[test]
fn test_if_then_else() {
    assert_eq!(eval("if true then 1 else 2"), FeelValue::Integer(1));
    assert_eq!(eval("if false then 1 else 2"), FeelValue::Integer(2));
}

#[test]
fn test_list_literal_values() {
    assert_eq!(
        eval("[1, 2, 3]"),
        FeelValue::List(vec![
            FeelValue::Integer(1),
            FeelValue::Integer(2),
            FeelValue::Integer(3)
        ])
    );
}

#[test]
fn test_in_range() {
    assert_eq!(eval("5 in [1..10]"), FeelValue::Bool(true));
    assert_eq!(eval("15 in [1..10]"), FeelValue::Bool(false));
    assert_eq!(eval("1 in [1..10]"), FeelValue::Bool(true));
    assert_eq!(eval("1 in (1..10]"), FeelValue::Bool(false));
}

#[test]
fn test_in_list() {
    assert_eq!(eval(r#""a" in ["a", "b", "c"]"#), FeelValue::Bool(true));
    assert_eq!(eval(r#""d" in ["a", "b", "c"]"#), FeelValue::Bool(false));
}

#[test]
fn test_for_expression() {
    let result = eval("for x in [1, 2, 3] return x * 2");
    assert_eq!(
        result,
        FeelValue::List(vec![
            FeelValue::Integer(2),
            FeelValue::Integer(4),
            FeelValue::Integer(6)
        ])
    );
}

#[test]
fn test_some_satisfies() {
    assert_eq!(
        eval("some x in [1, 2, 3] satisfies x > 2"),
        FeelValue::Bool(true)
    );
    assert_eq!(
        eval("some x in [1, 2, 3] satisfies x > 10"),
        FeelValue::Bool(false)
    );
}

#[test]
fn test_every_satisfies() {
    assert_eq!(
        eval("every x in [1, 2, 3] satisfies x > 0"),
        FeelValue::Bool(true)
    );
    assert_eq!(
        eval("every x in [1, 2, 3] satisfies x > 1"),
        FeelValue::Bool(false)
    );
}

#[test]
fn test_path_expression() {
    let mut ctx = FeelContext::new();
    let mut inner = indexmap::IndexMap::new();
    inner.insert("name".to_string(), FeelValue::String("Alice".to_string()));
    ctx.set("person", FeelValue::Context(inner));
    assert_eq!(
        eval_with("person.name", &ctx),
        FeelValue::String("Alice".to_string())
    );
}

#[test]
fn test_null_arithmetic() {
    assert_eq!(eval("null + 1"), FeelValue::Null);
    assert_eq!(eval("1 + null"), FeelValue::Null);
}

#[test]
fn test_string_length() {
    assert_eq!(eval(r#"string length("hello")"#), FeelValue::Integer(5));
}

#[test]
fn test_upper_lower_case() {
    assert_eq!(
        eval(r#"upper case("hello")"#),
        FeelValue::String("HELLO".to_string())
    );
    assert_eq!(
        eval(r#"lower case("WORLD")"#),
        FeelValue::String("world".to_string())
    );
}

#[test]
fn test_contains() {
    assert_eq!(
        eval(r#"contains("hello world", "world")"#),
        FeelValue::Bool(true)
    );
    assert_eq!(
        eval(r#"contains("hello", "world")"#),
        FeelValue::Bool(false)
    );
}

#[test]
fn test_starts_ends_with() {
    assert_eq!(
        eval(r#"starts with("hello", "hel")"#),
        FeelValue::Bool(true)
    );
    assert_eq!(eval(r#"ends with("hello", "llo")"#), FeelValue::Bool(true));
}

#[test]
fn test_substring() {
    assert_eq!(
        eval(r#"substring("hello", 2, 3)"#),
        FeelValue::String("ell".to_string())
    );
}

#[test]
fn test_floor_ceiling() {
    assert_eq!(eval("floor(3.7)"), FeelValue::Integer(3));
    assert_eq!(eval("ceiling(3.2)"), FeelValue::Integer(4));
}

#[test]
fn test_abs() {
    assert_eq!(eval("abs(-5)"), FeelValue::Integer(5));
}

#[test]
fn test_min_max() {
    assert_eq!(eval("min([1, 2, 3])"), FeelValue::Integer(1));
    assert_eq!(eval("max([1, 2, 3])"), FeelValue::Integer(3));
}

#[test]
fn test_sum() {
    assert_eq!(eval("sum([1, 2, 3])"), FeelValue::Integer(6));
}

#[test]
fn test_count_literal() {
    assert_eq!(eval("count([1, 2, 3])"), FeelValue::Integer(3));
}

#[test]
fn test_list_contains() {
    assert_eq!(eval("list contains([1, 2, 3], 2)"), FeelValue::Bool(true));
    assert_eq!(eval("list contains([1, 2, 3], 5)"), FeelValue::Bool(false));
}

#[test]
fn test_reverse() {
    assert_eq!(
        eval("reverse([1, 2, 3])"),
        FeelValue::List(vec![
            FeelValue::Integer(3),
            FeelValue::Integer(2),
            FeelValue::Integer(1)
        ])
    );
}

#[test]
fn test_append() {
    assert_eq!(
        eval("append([1, 2], 3)"),
        FeelValue::List(vec![
            FeelValue::Integer(1),
            FeelValue::Integer(2),
            FeelValue::Integer(3)
        ])
    );
}

#[test]
fn test_flatten() {
    assert_eq!(
        eval("flatten([[1, 2], [3, 4]])"),
        FeelValue::List(vec![
            FeelValue::Integer(1),
            FeelValue::Integer(2),
            FeelValue::Integer(3),
            FeelValue::Integer(4)
        ])
    );
}

#[test]
fn test_distinct_values() {
    assert_eq!(
        eval("distinct values([1, 2, 1, 3, 2])"),
        FeelValue::List(vec![
            FeelValue::Integer(1),
            FeelValue::Integer(2),
            FeelValue::Integer(3)
        ])
    );
}

#[test]
fn test_is_defined() {
    assert_eq!(eval("is defined(null)"), FeelValue::Bool(false));
    assert_eq!(eval("is defined(1)"), FeelValue::Bool(true));
}

#[test]
fn test_get_or_else() {
    assert_eq!(eval("get or else(null, 42)"), FeelValue::Integer(42));
    assert_eq!(eval("get or else(10, 42)"), FeelValue::Integer(10));
}

#[test]
fn test_odd_even() {
    assert_eq!(eval("odd(3)"), FeelValue::Bool(true));
    assert_eq!(eval("even(4)"), FeelValue::Bool(true));
}

#[test]
fn test_not_function() {
    assert_eq!(eval("not(true)"), FeelValue::Bool(false));
}

// ---- Behaviour that comes from bpmnkit-feel (DMN / TS semantics) ----

#[test]
fn arithmetic_is_exact_and_integral_results_are_integers() {
    // The old evaluator computed in f64 (`0.1 + 0.2` was 0.30000000000000004).
    assert_eq!(eval("0.1 + 0.2"), FeelValue::Float(0.3));
    assert_eq!(eval("10 / 2"), FeelValue::Integer(5));
}

#[test]
fn division_by_zero_is_null() {
    // The old evaluator returned FeelError::DivisionByZero.
    assert_eq!(eval("10 / 0"), FeelValue::Null);
}

#[test]
fn syntax_error_is_err() {
    assert!(evaluate("1 +", &FeelContext::new()).is_err());
}

#[test]
fn context_keeps_insertion_order() {
    let FeelValue::Context(map) = eval(r#"{ z: 1, a: 2, m: 3 }"#) else {
        panic!("context")
    };
    assert_eq!(map.keys().collect::<Vec<_>>(), ["z", "a", "m"]);
}

#[test]
fn multi_word_variable_names() {
    let mut ctx = FeelContext::new();
    ctx.set("order total", FeelValue::Integer(7));
    assert_eq!(evaluate("order total + 1", &ctx), Ok(FeelValue::Integer(8)));
}

#[test]
fn years_months_duration() {
    assert_eq!(
        eval(r#"duration("P1Y2M")"#),
        FeelValue::YearsMonthsDuration(14)
    );
    assert_eq!(
        serde_json::Value::from(FeelValue::YearsMonthsDuration(14)),
        serde_json::json!("P1Y2M")
    );
}

#[test]
fn child_scope_overrides_parent_in_expressions() {
    let mut parent = FeelContext::new();
    parent.set("x", FeelValue::Integer(1));
    parent.set("y", FeelValue::Integer(10));
    let mut child = FeelContext::child(parent);
    child.set("x", FeelValue::Integer(2));
    assert_eq!(evaluate("x + y", &child), Ok(FeelValue::Integer(12)));
}
