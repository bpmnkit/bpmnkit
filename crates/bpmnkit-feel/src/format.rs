//! Pretty-printer: the Rust twin of `formatFeel` in `packages/feel/src/formatter.ts`,
//! held to the same output by `conformance/feel-format/cases.json`.
//!
//! The parser drops grouping parentheses, so they are put back wherever the
//! printed text would otherwise re-parse as a different tree.

use crate::ast::{BinaryOp, Binding, Node, NodeKind};

const INDENT: &str = "  ";
const MAX_LINE_LENGTH: usize = 80;

/// Binding strengths, as in `parser.rs`'s `infix_prec`.
const PREC_COMPARE: u8 = 30;
const PREC_ADD: u8 = 40;
const PREC_UNARY: u8 = 70;
const PREC_POSTFIX: u8 = 80;
const PREC_ATOM: u8 = 100;

/// Formats a syntax tree as FEEL source that parses back to the same tree.
pub fn format(node: &Node) -> String {
    fmt(node, 0).text
}

struct Out {
    text: String,
    prec: u8,
    /// Ends in an expression that would swallow a following infix operator
    /// (`if … else 2` before `+ 10`), so it must be parenthesized unless it is last.
    open: bool,
}

impl Out {
    fn atom(text: String) -> Self {
        Out {
            text,
            prec: PREC_ATOM,
            open: false,
        }
    }

    fn paren(self) -> String {
        format!("({})", self.text)
    }

    /// The text for a position something follows: wrapped when looser than `min` or open.
    fn before(self, min: u8) -> String {
        if self.open || self.prec < min {
            self.paren()
        } else {
            self.text
        }
    }

    /// The text for a trailing position, and whether the result stays open.
    fn after(self, min: u8) -> (String, bool) {
        if self.prec < min {
            (self.paren(), false)
        } else {
            let open = self.open;
            (self.text, open)
        }
    }
}

fn op_info(op: BinaryOp) -> (&'static str, u8) {
    match op {
        BinaryOp::Or => ("or", 10),
        BinaryOp::And => ("and", 20),
        BinaryOp::Eq => ("=", PREC_COMPARE),
        BinaryOp::Ne => ("!=", PREC_COMPARE),
        BinaryOp::Lt => ("<", PREC_COMPARE),
        BinaryOp::Le => ("<=", PREC_COMPARE),
        BinaryOp::Gt => (">", PREC_COMPARE),
        BinaryOp::Ge => (">=", PREC_COMPARE),
        BinaryOp::Add => ("+", PREC_ADD),
        BinaryOp::Sub => ("-", PREC_ADD),
        BinaryOp::Mul => ("*", 50),
        BinaryOp::Div => ("/", 50),
        BinaryOp::Pow => ("**", 60),
    }
}

/// Line lengths are compared in UTF-16 units, as JavaScript's `length` counts them.
fn fits(text: &str, depth: usize) -> bool {
    let budget = MAX_LINE_LENGTH.saturating_sub(depth * INDENT.len());
    text.encode_utf16().count() <= budget
}

fn escape_string(value: &str) -> String {
    let mut out = String::with_capacity(value.len() + 2);
    for c in value.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '"' => out.push_str("\\\""),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c => out.push(c),
        }
    }
    out
}

/// An open-ended form: what follows it in the source belongs to its last part.
fn open_form(text: String) -> Out {
    Out {
        text,
        prec: PREC_ATOM,
        open: true,
    }
}

fn bindings(list: &[Binding], depth: usize) -> String {
    list.iter()
        .map(|b| format!("{} in {}", b.name, fmt(&b.domain, depth).text))
        .collect::<Vec<_>>()
        .join(", ")
}

fn join(items: &[Node], depth: usize) -> String {
    items
        .iter()
        .map(|i| fmt(i, depth).text)
        .collect::<Vec<_>>()
        .join(", ")
}

fn fmt(node: &Node, depth: usize) -> Out {
    let ind = INDENT.repeat(depth);
    let ind1 = INDENT.repeat(depth + 1);

    match &node.kind {
        NodeKind::Null => Out::atom("null".into()),
        NodeKind::Boolean(b) => Out::atom(b.to_string()),
        NodeKind::Number(n) => Out::atom(n.normalize().to_string()),
        NodeKind::String(s) => Out::atom(format!("\"{}\"", escape_string(s))),
        NodeKind::Temporal(body) => Out::atom(format!("@\"{body}\"")),
        NodeKind::Name(name) => Out::atom(name.clone()),
        NodeKind::AnyInput => Out::atom("-".into()),

        NodeKind::UnaryMinus(operand) => {
            // The operand is parsed above `**`: -2 ** 2 is (-2) ** 2.
            let (text, open) = fmt(operand, depth).after(PREC_UNARY + 1);
            Out {
                text: format!("-{text}"),
                prec: PREC_UNARY,
                open,
            }
        }

        NodeKind::Binary { op, left, right } => {
            let (sym, prec) = op_info(*op);
            // Every infix operator is left-associative, `**` included.
            let l = fmt(left, depth).before(prec);
            let (r, open) = fmt(right, depth).after(prec + 1);
            Out {
                text: format!("{l} {sym} {r}"),
                prec,
                open,
            }
        }

        NodeKind::Path { base, key } => Out {
            text: format!("{}.{key}", fmt(base, depth).before(PREC_POSTFIX)),
            prec: PREC_POSTFIX,
            open: false,
        },

        NodeKind::Filter { base, condition } => Out {
            text: format!(
                "{}[{}]",
                fmt(base, depth).before(PREC_POSTFIX),
                fmt(condition, depth).text
            ),
            prec: PREC_POSTFIX,
            open: false,
        },

        NodeKind::Range {
            start_included,
            low,
            high,
            end_included,
        } => Out::atom(format!(
            "{}{}..{}{}",
            if *start_included { "[" } else { "(" },
            fmt(low, depth).text,
            fmt(high, depth).text,
            if *end_included { "]" } else { ")" },
        )),

        NodeKind::List(items) => {
            if items.is_empty() {
                return Out::atom("[]".into());
            }
            let inline = format!("[{}]", join(items, depth));
            if fits(&inline, depth) {
                return Out::atom(inline);
            }
            let lines: Vec<String> = items
                .iter()
                .map(|i| format!("{ind1}{}", fmt(i, depth + 1).text))
                .collect();
            Out::atom(format!("[\n{}\n{ind}]", lines.join(",\n")))
        }

        NodeKind::Context(entries) => {
            if entries.is_empty() {
                return Out::atom("{}".into());
            }
            let inline = format!(
                "{{{}}}",
                entries
                    .iter()
                    .map(|(k, v)| format!("{k}: {}", fmt(v, depth).text))
                    .collect::<Vec<_>>()
                    .join(", ")
            );
            if fits(&inline, depth) {
                return Out::atom(inline);
            }
            let lines: Vec<String> = entries
                .iter()
                .map(|(k, v)| format!("{ind1}{k}: {}", fmt(v, depth + 1).text))
                .collect();
            Out::atom(format!("{{\n{}\n{ind}}}", lines.join(",\n")))
        }

        NodeKind::Call { callee, args } => Out::atom(format!("{callee}({})", join(args, depth))),

        NodeKind::CallExpr { target, args } => Out {
            text: format!(
                "{}({})",
                fmt(target, depth).before(PREC_POSTFIX),
                join(args, depth)
            ),
            prec: PREC_POSTFIX,
            open: false,
        },

        NodeKind::CallNamed { callee, args } => Out::atom(format!(
            "{callee}({})",
            args.iter()
                .map(|(n, v)| format!("{n}: {}", fmt(v, depth).text))
                .collect::<Vec<_>>()
                .join(", ")
        )),

        NodeKind::If {
            condition,
            then,
            otherwise,
        } => {
            let cond = fmt(condition, depth).text;
            let thn = fmt(then, depth).text;
            let els = fmt(otherwise, depth).text;
            let inline = format!("if {cond} then {thn} else {els}");
            if fits(&inline, depth) {
                return open_form(inline);
            }
            open_form(format!("if {cond}\n{ind1}then {thn}\n{ind1}else {els}"))
        }

        NodeKind::For { bindings: b, body } => {
            let binds = bindings(b, depth);
            let body = fmt(body, depth).text;
            let inline = format!("for {binds} return {body}");
            if fits(&inline, depth) {
                return open_form(inline);
            }
            open_form(format!("for {binds}\n{ind1}return {body}"))
        }

        NodeKind::Some {
            bindings: b,
            satisfies,
        }
        | NodeKind::Every {
            bindings: b,
            satisfies,
        } => {
            let word = if matches!(node.kind, NodeKind::Some { .. }) {
                "some"
            } else {
                "every"
            };
            let binds = bindings(b, depth);
            let sat = fmt(satisfies, depth).text;
            let inline = format!("{word} {binds} satisfies {sat}");
            if fits(&inline, depth) {
                return open_form(inline);
            }
            open_form(format!("{word} {binds}\n{ind1}satisfies {sat}"))
        }

        NodeKind::Between { value, low, high } => {
            let v = fmt(value, depth).before(PREC_COMPARE);
            // Bounds are parsed above + and -.
            let lo = fmt(low, depth).before(PREC_ADD + 1);
            let (hi, open) = fmt(high, depth).after(PREC_ADD + 1);
            Out {
                text: format!("{v} between {lo} and {hi}"),
                prec: PREC_COMPARE,
                open,
            }
        }

        NodeKind::InTest { value, test } => {
            let v = fmt(value, depth).before(PREC_COMPARE);
            // A list of tests needs its parentheses; a single test is parsed as a
            // whole expression, so the `in` swallows whatever follows it.
            let t = match &test.kind {
                NodeKind::UnaryTestList(tests) => format!("({})", join(tests, depth)),
                _ => fmt(test, depth).text,
            };
            Out {
                text: format!("{v} in {t}"),
                prec: PREC_COMPARE,
                open: true,
            }
        }

        NodeKind::InstanceOf { value, type_name } => Out {
            text: format!(
                "{} instance of {type_name}",
                fmt(value, depth).before(PREC_COMPARE)
            ),
            prec: PREC_COMPARE,
            open: false,
        },

        NodeKind::FunctionDef { params, body } => open_form(format!(
            "function({}) {}",
            params.join(", "),
            fmt(body, depth).text
        )),

        NodeKind::UnaryTestList(tests) => Out {
            text: join(tests, depth),
            prec: 0,
            open: true,
        },

        NodeKind::UnaryNot(tests) => Out::atom(format!("not({})", join(tests, depth))),
    }
}

#[cfg(test)]
mod tests {
    use crate::{evaluate, parse, parse_unary_tests, Context, ParseOptions, Value};

    fn ctx() -> Context {
        let mut c = Context::new();
        c.insert("a", Value::Boolean(true));
        c.insert("b", Value::Boolean(false));
        c.insert("c", Value::Boolean(false));
        c.insert("x", Value::from(2));
        c
    }

    /// The tree without its source offsets, which formatting moves.
    fn shape(node: &crate::ast::Node) -> String {
        let offsets = regex::Regex::new(r"start: \d+, end: \d+, ").unwrap();
        offsets.replace_all(&format!("{node:?}"), "").into_owned()
    }

    fn roundtrip(src: &str) -> String {
        let c = ctx();
        let options = ParseOptions {
            names: c.keys().cloned().collect(),
        };
        let expr = parse(src, &options).unwrap();
        let out = expr.format();
        let again = parse(&out, &options)
            .unwrap_or_else(|e| panic!("{src} formatted as {out} does not parse: {e}"));
        assert_eq!(shape(again.ast()), shape(expr.ast()), "{src} => {out}");
        assert_eq!(again.evaluate(&c), expr.evaluate(&c), "{src} => {out}");
        out
    }

    // Issue #291.
    #[test]
    fn keeps_needed_parentheses() {
        for (src, want) in [
            ("(1 + 2) * 3", "(1 + 2) * 3"),
            ("1 - (2 - 3)", "1 - (2 - 3)"),
            ("2 ** (3 ** 2)", "2 ** (3 ** 2)"),
            ("-(2 ** 2)", "-(2 ** 2)"),
            ("(a or b) and c", "(a or b) and c"),
            (
                "(if true then 1 else 2) + 10",
                "(if true then 1 else 2) + 10",
            ),
            (
                "(for i in [1, 2] return i) = [1, 2]",
                "(for i in [1, 2] return i) = [1, 2]",
            ),
            ("x in (1, 2)", "x in (1, 2)"),
            ("5 between (1 + 1) and 10", "5 between (1 + 1) and 10"),
        ] {
            assert_eq!(roundtrip(src), want);
        }
        assert_eq!(evaluate("(1 + 2) * 3", &ctx()).unwrap(), Value::from(9));
    }

    #[test]
    fn drops_redundant_parentheses() {
        for (src, want) in [
            ("((1)) + (2 * 3)", "1 + 2 * 3"),
            ("(1 - 2) - 3", "1 - 2 - 3"),
            ("(2 ** 3) ** 2", "2 ** 3 ** 2"),
            ("(-2) ** 2", "-2 ** 2"),
            ("a or (b and c)", "a or b and c"),
            ("10 + (if true then 1 else 2)", "10 + if true then 1 else 2"),
            ("(x in (1, 2)) or b", "(x in (1, 2)) or b"),
            ("(function(n) n + 1)(2)", "(function(n) n + 1)(2)"),
            (
                "(1 + 1 between 0 and 5) = true",
                "1 + 1 between 0 and 5 = true",
            ),
            ("-(-x)", "-(-x)"),
            ("{k: (1 + 2) * x}.k", "{k: (1 + 2) * x}.k"),
            ("[1, 2, 3][item > 1]", "[1, 2, 3][item > 1]"),
            ("\"a\\\"b\\n\"", "\"a\\\"b\\n\""),
            ("@\"2024-01-01\"", "@\"2024-01-01\""),
        ] {
            assert_eq!(roundtrip(src), want);
        }
    }

    // JavaScript prints numbers without trailing zeros.
    #[test]
    fn numbers_print_as_javascript_does() {
        let expr = parse("1.50 + .5", &ParseOptions::default()).unwrap();
        assert_eq!(expr.format(), "1.5 + 0.5");
    }

    #[test]
    fn unary_tests() {
        let tests = parse_unary_tests("< 10, [1..5], not(3)", &ParseOptions::default()).unwrap();
        assert_eq!(tests.format(), "? < 10, [1..5], not(3)");
        assert_eq!(
            parse_unary_tests("-", &ParseOptions::default())
                .unwrap()
                .format(),
            "-"
        );
    }

    /// The fixture `formatFeel` is tested against, so both print the same text.
    #[test]
    fn shared_cases() {
        let path = concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/../../conformance/feel-format/cases.json"
        );
        let text = std::fs::read_to_string(path).unwrap();
        let cases: Vec<serde_json::Value> = serde_json::from_str(&text).unwrap();
        assert!(!cases.is_empty());
        for case in cases {
            let input = case["input"].as_str().unwrap();
            let output = case["output"].as_str().unwrap();
            let expr =
                parse(input, &ParseOptions::default()).unwrap_or_else(|e| panic!("{input}: {e}"));
            assert_eq!(expr.format(), output, "input: {input}");
        }
    }
}
