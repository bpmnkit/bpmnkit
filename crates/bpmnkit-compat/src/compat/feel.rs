//! `camunda-compat-feel.ts`: FEEL analysis for `feel-compatibility`,
//! `unresolvable-secret-reference` and `agent-fromai-contract`, read from
//! `bpmnkit_feel`'s syntax tree and named by lezer-feel node type where a plugin
//! message quotes one. Offsets are bytes (TS: UTF-16 units); both index their own source.

use super::pattern::{has_secret_reference, is_js_space};
use bpmnkit_feel::ast::{BinaryOp, Node, NodeKind};
use bpmnkit_feel::{parse_partial, Expression, ParseOptions};
use indexmap::IndexMap;
use std::collections::HashSet;

/// Direct sub-expressions of a node, in source order.
fn feel_children(node: &Node) -> Vec<&Node> {
    use NodeKind::*;
    match &node.kind {
        List(items) => items.iter().collect(),
        Context(entries) => entries.iter().map(|(_, v)| v).collect(),
        Range { low, high, .. } => vec![low, high],
        UnaryMinus(operand) => vec![operand],
        Binary { left, right, .. } => vec![left, right],
        Path { base, .. } => vec![base],
        Filter { base, condition } => vec![base, condition],
        Call { args, .. } => args.iter().collect(),
        CallExpr { target, args } => std::iter::once(&**target).chain(args).collect(),
        CallNamed { args, .. } => args.iter().map(|(_, v)| v).collect(),
        If {
            condition,
            then,
            otherwise,
        } => vec![condition, then, otherwise],
        For { bindings, body } => bindings
            .iter()
            .map(|b| &b.domain)
            .chain(std::iter::once(&**body))
            .collect(),
        Some {
            bindings,
            satisfies,
        }
        | Every {
            bindings,
            satisfies,
        } => bindings
            .iter()
            .map(|b| &b.domain)
            .chain(std::iter::once(&**satisfies))
            .collect(),
        Between { value, low, high } => vec![value, low, high],
        InTest { value, test } => vec![value, test],
        InstanceOf { value, .. } => vec![value],
        FunctionDef { body, .. } => vec![body],
        UnaryTestList(tests) | UnaryNot(tests) => tests.iter().collect(),
        _ => vec![],
    }
}

/// Index of the `)` closing the `(` at `open`, skipping string literals and backtick names.
fn closing_paren(src: &str, open: usize) -> Option<usize> {
    let b = src.as_bytes();
    let mut depth = 0i32;
    let mut i = open;
    while i < b.len() {
        let c = b[i];
        if c == b'"' || c == b'`' {
            i += 1;
            while i < b.len() && b[i] != c {
                if b[i] == b'\\' {
                    i += 1;
                }
                i += 1;
            }
        } else if c == b'(' {
            depth += 1;
        } else if c == b')' {
            depth -= 1;
            if depth == 0 {
                return Some(i);
            }
        }
        i += 1;
    }
    None
}

/// Whether `node` is written in parentheses of its own (lezer-feel keeps a
/// `ParenthesizedExpression`, `bpmnkit_feel` drops it). `floor`: the `(` of a call's
/// argument list, which belongs to the call.
fn parenthesized(src: &str, node: &Node, floor: Option<usize>) -> bool {
    let mut b = node.start.min(src.len());
    while let Some(c) = src.get(..b).and_then(|s| s.chars().next_back()) {
        if !is_js_space(c) {
            break;
        }
        b -= c.len_utf8();
    }
    if b == 0 || src.as_bytes()[b - 1] != b'(' {
        return false;
    }
    let before = b - 1;
    if floor.is_some_and(|f| before <= f) {
        return false;
    }
    let mut after = node.end.min(src.len());
    while let Some(c) = src.get(after..).and_then(|s| s.chars().next()) {
        if !is_js_space(c) {
            break;
        }
        after += c.len_utf8();
    }
    closing_paren(src, before) == Some(after)
}

fn parse_valid(expression: &str) -> Option<Expression> {
    let partial = parse_partial(expression, &ParseOptions::default());
    if partial.errors.is_empty() {
        partial.parsed
    } else {
        None
    }
}

/// Sorts as `localeCompare` does for the built-in names (lower case, spaces, digits).
fn locale_key(name: &str) -> (String, String) {
    (name.to_lowercase(), name.to_string())
}

/// `feelBuiltinCalls`: the built-ins (`is_builtin`) an expression calls where no
/// context entry, parameter or iteration variable shadows them; a name also called
/// as a user function does not count. `None` when it does not parse.
pub fn feel_builtin_calls(
    expression: &str,
    is_builtin: &dyn Fn(&str) -> bool,
) -> Option<Vec<String>> {
    let parsed = parse_valid(expression)?;
    struct Walk<'f> {
        is_builtin: &'f dyn Fn(&str) -> bool,
        types: IndexMap<String, bool>,
        scopes: Vec<HashSet<String>>,
    }
    impl Walk<'_> {
        fn record(&mut self, name: &str) {
            let builtin = (self.is_builtin)(name) && !self.scopes.iter().any(|s| s.contains(name));
            if !self.types.contains_key(name) || !builtin {
                self.types.insert(name.to_string(), builtin);
            }
        }
        fn walk(&mut self, node: &Node) {
            match &node.kind {
                NodeKind::Context(entries) => {
                    self.scopes.push(HashSet::new());
                    for (key, value) in entries {
                        self.walk(value);
                        if let Some(scope) = self.scopes.last_mut() {
                            scope.insert(key.clone());
                        }
                    }
                    self.scopes.pop();
                    return;
                }
                NodeKind::FunctionDef { params, body } => {
                    self.scopes.push(params.iter().cloned().collect());
                    self.walk(body);
                    self.scopes.pop();
                    return;
                }
                NodeKind::For {
                    bindings,
                    body: inner,
                }
                | NodeKind::Some {
                    bindings,
                    satisfies: inner,
                }
                | NodeKind::Every {
                    bindings,
                    satisfies: inner,
                } => {
                    for binding in bindings {
                        self.walk(&binding.domain);
                    }
                    self.scopes
                        .push(bindings.iter().map(|b| b.name.clone()).collect());
                    self.walk(inner);
                    self.scopes.pop();
                    return;
                }
                NodeKind::Call { callee, .. } | NodeKind::CallNamed { callee, .. } => {
                    self.record(callee)
                }
                _ => {}
            }
            for child in feel_children(node) {
                self.walk(child);
            }
        }
    }
    let mut w = Walk {
        is_builtin,
        types: IndexMap::new(),
        scopes: vec![],
    };
    w.walk(parsed.ast());
    let mut names: Vec<String> = w
        .types
        .into_iter()
        .filter(|(_, builtin)| *builtin)
        .map(|(n, _)| n)
        .collect();
    names.sort_by_key(|n| locale_key(n));
    Some(names)
}

/// How a FEEL expression writes a `camunda.secrets.<name>` reference the engine rejects.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct SecretReferenceViolations {
    /// Inside a string literal, where it is inert text.
    pub string_literal: bool,
    /// Inside a list.
    pub inside_list: bool,
    /// Inside a context returned by an `if` branch.
    pub inside_if_branch_context: bool,
}

/// Exactly `camunda.secrets.<name>`: not a longer path, and not the base of one.
fn is_secret_reference(node: &Node, is_path_base: bool) -> bool {
    if is_path_base {
        return false;
    }
    let NodeKind::Path { base, .. } = &node.kind else {
        return false;
    };
    let NodeKind::Path { base, key } = &base.kind else {
        return false;
    };
    key == "secrets" && matches!(&base.kind, NodeKind::Name(n) if n == "camunda")
}

fn contains_secret_reference(node: &Node, is_path_base: bool) -> bool {
    if is_secret_reference(node, is_path_base) {
        return true;
    }
    let is_path = matches!(node.kind, NodeKind::Path { .. });
    feel_children(node)
        .into_iter()
        .any(|child| contains_secret_reference(child, is_path))
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Container {
    List,
    Context,
}

/// `secretReferenceViolations` (the plugin's `findSecretReferenceViolations`).
pub fn secret_reference_violations(expression: &str) -> SecretReferenceViolations {
    let mut violations = SecretReferenceViolations::default();
    let Some(parsed) = parse_valid(expression) else {
        return violations;
    };
    fn visit(src: &str, node: &Node, v: &mut SecretReferenceViolations) {
        if let NodeKind::String(_) = node.kind {
            let content = src
                .get(node.start + 1..node.end.saturating_sub(1))
                .unwrap_or("");
            if has_secret_reference(content) {
                v.string_literal = true;
            }
        }
        for child in feel_children(node) {
            visit(src, child, v);
        }
    }
    visit(expression, parsed.ast(), &mut violations);

    fn container_kind(src: &str, node: &Node) -> Option<Container> {
        if parenthesized(src, node, None) {
            return None;
        }
        match &node.kind {
            NodeKind::List(_) => contains_secret_reference(node, false).then_some(Container::List),
            NodeKind::Context(_) => {
                contains_secret_reference(node, false).then_some(Container::Context)
            }
            NodeKind::If {
                then, otherwise, ..
            } => container_kind(src, then).or_else(|| container_kind(src, otherwise)),
            _ => None,
        }
    }
    fn reference_kind(src: &str, node: &Node) -> Option<Container> {
        if let NodeKind::Context(entries) = &node.kind {
            if !parenthesized(src, node, None) {
                return entries.iter().find_map(|(_, v)| reference_kind(src, v));
            }
        }
        container_kind(src, node)
    }
    match reference_kind(expression, parsed.ast()) {
        Some(Container::List) => violations.inside_list = true,
        Some(Container::Context) => violations.inside_if_branch_context = true,
        None => {}
    }
    violations
}

/// A `fromAi()` argument: its lezer-feel node type and its source text.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FromAiArgument {
    pub kind: String,
    pub text: String,
}

/// One `fromAi()` call (in any casing) and its arguments by the engine's parameter
/// slots (`value`, `description`, `type`, `schema`, `options`).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FromAiCall {
    pub name: String,
    pub args: Vec<Option<FromAiArgument>>,
}

const FROM_AI_PARAMETERS: [&str; 5] = ["value", "description", "type", "schema", "options"];

fn lezer_type(node: &Node) -> &'static str {
    use NodeKind::*;
    match &node.kind {
        Number(_) => "NumericLiteral",
        UnaryMinus(operand) => match operand.kind {
            Number(_) => "NumericLiteral",
            _ => "ArithmeticExpression",
        },
        String(_) => "StringLiteral",
        Boolean(_) => "BooleanLiteral",
        Null => "null",
        Temporal(_) => "DateTimeLiteral",
        Name(_) => "VariableName",
        Path { .. } => "PathExpression",
        Filter { .. } => "FilterExpression",
        Call { callee, .. } | CallNamed { callee, .. } => {
            if matches!(
                callee.as_str(),
                "date" | "time" | "date and time" | "duration"
            ) {
                "DateTimeLiteral"
            } else {
                "FunctionInvocation"
            }
        }
        CallExpr { .. } => "FunctionInvocation",
        List(_) => "List",
        Context(_) => "Context",
        Range { .. } => "SimplePositiveUnaryTest",
        Binary { op, .. } => match op {
            BinaryOp::Add | BinaryOp::Sub | BinaryOp::Mul | BinaryOp::Div | BinaryOp::Pow => {
                "ArithmeticExpression"
            }
            BinaryOp::And => "Conjunction",
            BinaryOp::Or => "Disjunction",
            _ => "Comparison",
        },
        Between { .. } | InTest { .. } => "Comparison",
        InstanceOf { .. } => "InstanceOfExpression",
        If { .. } => "IfExpression",
        For { .. } => "ForExpression",
        Some { .. } | Every { .. } => "QuantifiedExpression",
        FunctionDef { .. } => "FunctionDefinition",
        UnaryTestList(_) => "unary-test-list",
        UnaryNot(_) => "unary-not",
        AnyInput => "any-input",
    }
}

/// `fromAiCalls`: the `fromAi()` calls in an expression, in any casing, outermost first.
pub fn from_ai_calls(expression: &str) -> Vec<FromAiCall> {
    let Some(parsed) = parse_partial(expression, &ParseOptions::default()).parsed else {
        return vec![];
    };
    let argument = |node: &Node, floor: Option<usize>| FromAiArgument {
        kind: if parenthesized(expression, node, floor) {
            "ParenthesizedExpression".into()
        } else {
            lezer_type(node).into()
        },
        text: expression.get(node.start..node.end).unwrap_or("").into(),
    };
    let mut calls = vec![];
    let mut stack = vec![parsed.ast()];
    while let Some(node) = stack.pop() {
        match &node.kind {
            NodeKind::Call { callee, args } if callee.eq_ignore_ascii_case("fromai") => {
                let open = expression
                    .get(node.start..)
                    .and_then(|s| s.find('('))
                    .map(|i| i + node.start);
                calls.push(FromAiCall {
                    name: callee.clone(),
                    args: args.iter().map(|a| Some(argument(a, open))).collect(),
                });
            }
            NodeKind::CallNamed { callee, args } if callee.eq_ignore_ascii_case("fromai") => {
                let mut slots: Vec<Option<FromAiArgument>> = vec![];
                for (name, value) in args {
                    if let Some(index) = FROM_AI_PARAMETERS.iter().position(|p| p == name) {
                        if slots.len() <= index {
                            slots.resize(index + 1, None);
                        }
                        slots[index] = Some(argument(value, None));
                    }
                }
                calls.push(FromAiCall {
                    name: callee.clone(),
                    args: slots,
                });
            }
            _ => {}
        }
        let mut children = feel_children(node);
        children.reverse();
        stack.extend(children);
    }
    calls
}

#[cfg(test)]
mod tests {
    use super::*;

    fn gated(name: &str) -> bool {
        matches!(name, "uuid" | "is empty" | "trim")
    }

    #[test]
    fn builtin_calls_skip_shadowed_names() {
        assert_eq!(
            feel_builtin_calls("uuid() + trim(x)", &gated),
            Some(vec!["trim".to_string(), "uuid".to_string()])
        );
        assert_eq!(
            feel_builtin_calls("{uuid: function() 1, id: uuid()}", &gated),
            Some(vec![])
        );
        assert_eq!(
            feel_builtin_calls("for uuid in [1] return uuid()", &gated),
            Some(vec![])
        );
        assert_eq!(feel_builtin_calls("uuid(", &gated), None);
    }

    #[test]
    fn secret_references() {
        let v = secret_reference_violations(r#""camunda.secrets.A""#);
        assert!(v.string_literal && !v.inside_list);
        let v = secret_reference_violations("[camunda.secrets.A]");
        assert!(v.inside_list);
        let v = secret_reference_violations("([camunda.secrets.A])");
        assert!(!v.inside_list);
        let v = secret_reference_violations("{a: if x then {b: camunda.secrets.A} else null}");
        assert!(v.inside_if_branch_context);
        let v = secret_reference_violations("camunda.secrets.A.b");
        assert_eq!(v, SecretReferenceViolations::default());
    }

    #[test]
    fn from_ai_arguments() {
        let calls = from_ai_calls(r#"fromAi(toolCall.url, "The URL") + FROMAI(("x"))"#);
        assert_eq!(calls.len(), 2);
        let first = &calls[0];
        assert_eq!(first.name, "fromAi");
        assert_eq!(
            first.args[0],
            Some(FromAiArgument {
                kind: "PathExpression".into(),
                text: "toolCall.url".into()
            })
        );
        assert_eq!(
            first.args[1].as_ref().map(|a| a.kind.as_str()),
            Some("StringLiteral")
        );
        assert_eq!(
            calls[1].args[0].as_ref().map(|a| a.kind.as_str()),
            Some("ParenthesizedExpression")
        );
        let named = from_ai_calls(r#"fromAi(description: "d")"#);
        assert_eq!(named[0].args[0], None);
        assert!(named[0].args[1].is_some());
    }
}
