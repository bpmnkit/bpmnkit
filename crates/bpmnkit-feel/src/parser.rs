//! Parser. Port of `packages/feel/src/parser.ts`.

use std::collections::HashSet;
use std::str::FromStr;
use std::sync::{Arc, OnceLock};

use rust_decimal::Decimal;

use crate::ast::{BinaryOp, Binding, Node, NodeKind};
use crate::lexer::{tokenize, unescape_string, Token, TokenKind};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParseError {
    pub message: String,
    /// Byte offsets into the source.
    pub start: usize,
    pub end: usize,
}

/// Names in scope where the expression is evaluated. FEEL names may contain
/// spaces, so `a b + 1` reads as a reference to `a b` only when listed here.
/// Without it, only multi-word built-in names are recognised.
#[derive(Debug, Clone, Default)]
pub struct ParseOptions {
    pub names: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct ParseResult {
    pub ast: Option<Node>,
    pub errors: Vec<ParseError>,
}

/// Multi-word built-in names and every strict prefix of them. The TS parser
/// hand-lists the same names that `spec/feel-builtins.json` holds.
fn builtin_names() -> &'static (HashSet<&'static str>, HashSet<String>) {
    static NAMES: OnceLock<(HashSet<&'static str>, HashSet<String>)> = OnceLock::new();
    NAMES.get_or_init(|| {
        let names: HashSet<&'static str> = bpmnkit_spec::feel::FEEL_BUILTINS
            .iter()
            .map(|b| b.name)
            .filter(|n| n.contains(' '))
            .collect();
        let prefixes = prefixes_of(names.iter().copied());
        (names, prefixes)
    })
}

/// Every strict prefix of the given multi-word names.
fn prefixes_of<'a>(names: impl Iterator<Item = &'a str>) -> HashSet<String> {
    let mut prefixes = HashSet::new();
    for name in names {
        let parts: Vec<&str> = name.split(' ').collect();
        for i in 1..parts.len() {
            prefixes.insert(parts[..i].join(" "));
        }
    }
    prefixes
}

// The property names FEEL spells with a space. A path key is matched against
// this fixed set rather than joining words greedily, so `a.b and c` still
// reads as a conjunction.
const MULTIWORD_PROPERTIES: [&str; 3] = ["time offset", "start included", "end included"];

// The symbols a FEEL name may contain besides letters, digits and spaces.
const NAME_SYMBOLS: [&str; 6] = [".", "/", "-", "'", "+", "*"];

// Multi-word type names, longest first: a prefix must not win over the whole name.
const MULTIWORD_TYPES: [&str; 3] = [
    "years and months duration",
    "days and time duration",
    "date and time",
];

fn node(start: usize, end: usize, kind: NodeKind) -> Node {
    Node { start, end, kind }
}

fn binary(op: BinaryOp, left: Node, right: Node) -> Node {
    node(
        left.start,
        right.end,
        NodeKind::Binary {
            op,
            left: Box::new(left),
            right: Box::new(right),
        },
    )
}

fn comparison_op(value: &str) -> Option<BinaryOp> {
    Some(match value {
        "=" => BinaryOp::Eq,
        "!=" => BinaryOp::Ne,
        "<" => BinaryOp::Lt,
        "<=" => BinaryOp::Le,
        ">" => BinaryOp::Gt,
        ">=" => BinaryOp::Ge,
        _ => return None,
    })
}

fn arithmetic_op(value: &str) -> Option<BinaryOp> {
    Some(match value {
        "+" => BinaryOp::Add,
        "-" => BinaryOp::Sub,
        "*" => BinaryOp::Mul,
        "/" => BinaryOp::Div,
        "**" => BinaryOp::Pow,
        _ => return None,
    })
}

fn parse_number(text: &str) -> Option<Decimal> {
    // Decimal does not accept a bare leading ".".
    let text = if text.starts_with('.') {
        format!("0{text}")
    } else {
        text.to_string()
    };
    if text.contains(['e', 'E']) {
        Decimal::from_scientific(&text).ok()
    } else {
        Decimal::from_str(&text).ok()
    }
}

fn is_word(tok: &Token) -> bool {
    matches!(tok.kind, TokenKind::Name | TokenKind::Keyword)
}

struct Parser {
    tokens: Vec<Token>,
    pos: usize,
    names: HashSet<String>,
    name_prefixes: HashSet<String>,
    errors: Vec<ParseError>,
}

impl Parser {
    fn new(input: &str, options: &ParseOptions) -> Self {
        let tokens = tokenize(input)
            .into_iter()
            .filter(|t| !matches!(t.kind, TokenKind::Whitespace | TokenKind::Comment))
            .collect();
        let scope_names: Vec<&str> = options
            .names
            .iter()
            .map(String::as_str)
            .filter(|n| n.contains(' '))
            .collect();
        Parser {
            tokens,
            pos: 0,
            name_prefixes: prefixes_of(scope_names.iter().copied()),
            names: scope_names.into_iter().map(String::from).collect(),
            errors: Vec::new(),
        }
    }

    fn is_known_name(&self, name: &str) -> bool {
        builtin_names().0.contains(name) || self.names.contains(name)
    }

    fn is_known_prefix(&self, name: &str) -> bool {
        builtin_names().1.contains(name) || self.name_prefixes.contains(name)
    }

    fn peek(&self, offset: usize) -> Option<&Token> {
        self.tokens.get(self.pos + offset)
    }

    fn advance(&mut self) -> Option<Token> {
        let tok = self.tokens.get(self.pos).cloned();
        if tok.is_some() {
            self.pos += 1;
        }
        tok
    }

    fn previous_end(&self) -> Option<usize> {
        self.pos
            .checked_sub(1)
            .and_then(|i| self.tokens.get(i))
            .map(|t| t.end)
    }

    fn check(&self, kind: TokenKind, value: &str) -> bool {
        self.peek(0)
            .is_some_and(|t| t.kind == kind && t.value == value)
    }

    fn check_kind(&self, kind: TokenKind) -> bool {
        self.peek(0).is_some_and(|t| t.kind == kind)
    }

    fn consume(&mut self, kind: TokenKind, value: &str) -> Option<Token> {
        if self.check(kind, value) {
            self.advance()
        } else {
            None
        }
    }

    fn error(&mut self, message: impl Into<String>, start: usize, end: usize) {
        self.errors.push(ParseError {
            message: message.into(),
            start,
            end,
        });
    }

    fn expect(&mut self, kind: TokenKind, value: &str) -> Option<Token> {
        let tok = self.consume(kind, value);
        if tok.is_none() {
            let pos = match self.peek(0) {
                Some(cur) => cur.start,
                None => self.tokens.last().map_or(0, |t| t.end),
            };
            self.error(format!("Expected {value}"), pos, pos + 1);
        }
        tok
    }

    /// Extends a single name token into the longest multi-word name in scope,
    /// built-in or supplied by the caller. Words consumed while reaching for a
    /// longer name that does not exist are given back, so `date and` falls back
    /// to `date` rather than becoming a name nothing can resolve.
    fn resolve_multiword_name(&mut self, first: String) -> String {
        let mut name = first.clone();
        let mut longest = first;
        let mut longest_pos = self.pos;
        while self.is_known_prefix(&name) {
            let Some(next) = self.peek(0).filter(|t| is_word(t)) else {
                break;
            };
            let extended = format!("{name} {}", next.value);
            if !self.is_known_name(&extended) && !self.is_known_prefix(&extended) {
                break;
            }
            self.advance();
            name = extended;
            if self.is_known_name(&name) {
                longest = name.clone();
                longest_pos = self.pos;
            }
        }
        self.pos = longest_pos;
        longest
    }

    // -------------------------------------------------------------------------
    // Expression parsing (Pratt)
    // -------------------------------------------------------------------------

    fn parse_expression(&mut self, min_prec: u8) -> Option<Node> {
        self.peek(0)?;
        let mut left = self.parse_prefix()?;
        loop {
            let prec = self.infix_prec();
            if prec <= min_prec {
                break;
            }
            match self.parse_infix(left, prec) {
                Ok(next) => left = next,
                // The failed operator has been consumed, as in the TS parser.
                Err(unchanged) => {
                    left = unchanged;
                    break;
                }
            }
        }
        Some(left)
    }

    fn infix_prec(&self) -> u8 {
        let Some(tok) = self.peek(0) else { return 0 };
        let value = tok.value.as_str();
        match tok.kind {
            TokenKind::Keyword => match value {
                "or" => 10,
                "and" => 20,
                "between" | "in" | "instance" => 30,
                _ => 0,
            },
            TokenKind::Op => match value {
                "=" | "!=" | "<" | "<=" | ">" | ">=" => 30,
                "+" | "-" => 40,
                "*" | "/" => 50,
                "**" => 60,
                _ => 0,
            },
            TokenKind::Punct if matches!(value, "." | "[" | "(") => 80,
            _ => 0,
        }
    }

    /// Parses a comma-separated argument list up to (not including) the closer.
    fn parse_args(&mut self) -> Vec<Node> {
        let mut args = Vec::new();
        if !self.check(TokenKind::Punct, ")") {
            args.extend(self.parse_expression(0));
            while self.consume(TokenKind::Punct, ",").is_some() {
                args.extend(self.parse_expression(0));
            }
        }
        args
    }

    /// `Err` hands `left` back when no node could be built.
    fn parse_infix(&mut self, left: Node, prec: u8) -> Result<Node, Node> {
        let Some(tok) = self.peek(0).cloned() else {
            return Err(left);
        };
        let value = tok.value.as_str();

        if tok.kind == TokenKind::Keyword && matches!(value, "or" | "and") {
            self.advance();
            let op = if value == "or" {
                BinaryOp::Or
            } else {
                BinaryOp::And
            };
            return match self.parse_expression(prec) {
                Some(right) => Ok(binary(op, left, right)),
                None => Err(left),
            };
        }

        if tok.kind == TokenKind::Op {
            if let Some(op) = comparison_op(value) {
                self.advance();
                return match self.parse_expression(prec) {
                    Some(right) => Ok(binary(op, left, right)),
                    None => Err(left),
                };
            }
            if let Some(op) = arithmetic_op(value) {
                self.advance();
                // FEEL makes every infix operator left-associative, "**" included:
                // 2 ** 3 ** 2 is (2 ** 3) ** 2.
                return match self.parse_expression(prec) {
                    Some(right) => Ok(binary(op, left, right)),
                    None => {
                        self.error(
                            format!("Expected expression after '{value}'"),
                            tok.end,
                            tok.end + 1,
                        );
                        Err(left)
                    }
                };
            }
        }

        if tok.kind == TokenKind::Keyword {
            match value {
                "between" => {
                    self.advance();
                    // Bounds bind above + and -.
                    let Some(low) = self.parse_expression(40) else {
                        return Err(left);
                    };
                    if self.expect(TokenKind::Keyword, "and").is_none() {
                        return Err(left);
                    }
                    let Some(high) = self.parse_expression(40) else {
                        return Err(left);
                    };
                    return Ok(node(
                        left.start,
                        high.end,
                        NodeKind::Between {
                            value: Box::new(left),
                            low: Box::new(low),
                            high: Box::new(high),
                        },
                    ));
                }
                "in" => {
                    self.advance();
                    let Some(test) = self.parse_in_test_expr() else {
                        return Err(left);
                    };
                    return Ok(node(
                        left.start,
                        test.end,
                        NodeKind::InTest {
                            value: Box::new(left),
                            test: Box::new(test),
                        },
                    ));
                }
                "instance" => {
                    self.advance();
                    if self.expect(TokenKind::Keyword, "of").is_none() {
                        return Err(left);
                    }
                    let Some(type_name) = self.parse_type_name() else {
                        return Err(left);
                    };
                    let end = self.previous_end().unwrap_or(left.end);
                    return Ok(node(
                        left.start,
                        end,
                        NodeKind::InstanceOf {
                            value: Box::new(left),
                            type_name,
                        },
                    ));
                }
                _ => {}
            }
        }

        if tok.kind == TokenKind::Punct {
            match value {
                "." => {
                    self.advance();
                    let Some(name_tok) = self.peek(0).filter(|t| is_word(t)).cloned() else {
                        self.error("Expected name after '.'", tok.start, tok.end);
                        return Err(left);
                    };
                    let mut key = name_tok.value.clone();
                    let mut end = name_tok.end;
                    if let Some(multiword) = MULTIWORD_PROPERTIES
                        .iter()
                        .find(|p| self.try_consume_words(p))
                    {
                        key = (*multiword).to_string();
                        end = self.previous_end().unwrap_or(name_tok.end);
                    } else {
                        self.advance();
                    }
                    return Ok(node(
                        left.start,
                        end,
                        NodeKind::Path {
                            base: Box::new(left),
                            key,
                        },
                    ));
                }
                "(" => {
                    // Invocation of a function-valued expression: expr(args)
                    self.advance();
                    let args = self.parse_args();
                    let close = self.expect(TokenKind::Punct, ")");
                    let end = close
                        .map(|c| c.end)
                        .or_else(|| args.last().map(|a| a.end))
                        .unwrap_or(left.end);
                    return Ok(node(
                        left.start,
                        end,
                        NodeKind::CallExpr {
                            target: Box::new(left),
                            args,
                        },
                    ));
                }
                "[" => {
                    self.advance();
                    let Some(condition) = self.parse_expression(0) else {
                        return Err(left);
                    };
                    let close = self.expect(TokenKind::Punct, "]");
                    let end = close.map_or(condition.end, |c| c.end);
                    return Ok(node(
                        left.start,
                        end,
                        NodeKind::Filter {
                            base: Box::new(left),
                            condition: Box::new(condition),
                        },
                    ));
                }
                _ => {}
            }
        }

        Err(left)
    }

    fn parse_prefix(&mut self) -> Option<Node> {
        let tok = self.peek(0)?.clone();
        let value = tok.value.as_str();
        let (start, end) = (tok.start, tok.end);

        if tok.kind == TokenKind::Op && value == "-" {
            self.advance();
            let operand = self.parse_expression(70)?;
            return Some(node(
                start,
                operand.end,
                NodeKind::UnaryMinus(Box::new(operand)),
            ));
        }

        match tok.kind {
            TokenKind::Number => {
                self.advance();
                match parse_number(value) {
                    Some(n) => return Some(node(start, end, NodeKind::Number(n))),
                    None => {
                        self.error(
                            format!("Number literal '{value}' is out of range"),
                            start,
                            end,
                        );
                        return None;
                    }
                }
            }
            TokenKind::String => {
                self.advance();
                let text = unescape_string(&value[1..value.len() - 1]);
                return Some(node(start, end, NodeKind::String(text)));
            }
            TokenKind::Temporal => {
                self.advance();
                // The body stays escaped, as in the TS parser.
                let body = value[2..value.len() - 1].to_string();
                return Some(node(start, end, NodeKind::Temporal(body)));
            }
            TokenKind::Backtick => {
                self.advance();
                return Some(node(start, end, NodeKind::Name(tok.value.clone())));
            }
            _ => {}
        }

        if tok.kind == TokenKind::Keyword {
            match value {
                "true" | "false" => {
                    self.advance();
                    return Some(node(start, end, NodeKind::Boolean(value == "true")));
                }
                "null" => {
                    self.advance();
                    return Some(node(start, end, NodeKind::Null));
                }
                "if" => return self.parse_if(),
                "for" => return self.parse_for(),
                "some" | "every" => return self.parse_quantifier(value == "some"),
                "function" => return self.parse_function_def(),
                "not" => return self.parse_not(),
                _ => {}
            }
        }

        if tok.kind == TokenKind::Name {
            self.advance();
            let name = self.resolve_multiword_name(tok.value.clone());
            return self.parse_name_or_call(name, start);
        }

        if tok.kind == TokenKind::Punct {
            match value {
                "(" => return self.parse_paren_or_range(),
                "[" => return self.parse_list_or_range(),
                "{" => return self.parse_context(),
                _ => {}
            }
        }

        // The implicit input of unary tests; also a valid reference in expressions.
        if tok.kind == TokenKind::Op && value == "?" {
            self.advance();
            return Some(node(start, end, NodeKind::Name("?".to_string())));
        }

        self.error(format!("Unexpected token '{value}'"), start, end);
        self.advance(); // skip for error recovery
        None
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    fn parse_name_or_call(&mut self, name: String, start: usize) -> Option<Node> {
        if self.check(TokenKind::Punct, "(") {
            self.advance();
            if self.is_named_arg_list() {
                return self.parse_named_call(name, start);
            }
            let args = self.parse_args();
            let close = self.expect(TokenKind::Punct, ")");
            let end = close
                .map(|c| c.end)
                .or_else(|| args.last().map(|a| a.end))
                .unwrap_or(start);
            return Some(node(start, end, NodeKind::Call { callee: name, args }));
        }
        let end = self.previous_end().unwrap_or(start);
        Some(node(start, end, NodeKind::Name(name)))
    }

    /// One or more name words followed by a colon? Parameter names may have
    /// spaces, as in `substring(start position: 2, string: "hello")`.
    fn is_named_arg_list(&self) -> bool {
        let mut offset = 0;
        while self.peek(offset).is_some_and(is_word) {
            offset += 1;
        }
        offset > 0
            && self
                .peek(offset)
                .is_some_and(|t| t.kind == TokenKind::Punct && t.value == ":")
    }

    fn parse_named_pair(&mut self, args: &mut Vec<(String, Node)>) -> bool {
        let mut words: Vec<String> = Vec::new();
        while self.peek(0).is_some_and(is_word) {
            if let Some(word) = self.advance() {
                words.push(word.value);
            }
        }
        if words.is_empty() {
            let (start, end) = self.peek(0).map_or((0, 0), |t| (t.start, t.end));
            self.error("Expected parameter name", start, end);
            return false;
        }
        if self.expect(TokenKind::Punct, ":").is_none() {
            return false;
        }
        let Some(value) = self.parse_expression(0) else {
            return false;
        };
        args.push((words.join(" "), value));
        true
    }

    fn parse_named_call(&mut self, callee: String, start: usize) -> Option<Node> {
        let mut args = Vec::new();
        if !self.check(TokenKind::Punct, ")") {
            if !self.parse_named_pair(&mut args) {
                return None;
            }
            while self.consume(TokenKind::Punct, ",").is_some() {
                if !self.parse_named_pair(&mut args) {
                    break;
                }
            }
        }
        let close = self.expect(TokenKind::Punct, ")");
        Some(node(
            start,
            close.map_or(start, |c| c.end),
            NodeKind::CallNamed { callee, args },
        ))
    }

    /// Parses the domain of a `for`/`some`/`every` binding. Unlike other
    /// positions, a range may appear here undelimited: `for i in 1..3`.
    fn parse_iteration_domain(&mut self) -> Option<Node> {
        let domain = self.parse_expression(0)?;
        if !self.check(TokenKind::Op, "..") {
            return Some(domain);
        }
        self.advance();
        let high = self.parse_expression(0)?;
        Some(node(
            domain.start,
            high.end,
            NodeKind::Range {
                start_included: true,
                low: Box::new(domain),
                high: Box::new(high),
                end_included: true,
            },
        ))
    }

    /// Reads a context key, which runs up to the colon and so can be gathered
    /// without ambiguity. A FEEL name may hold spaces and the symbols listed in
    /// NAME_SYMBOLS, which is what lets `{_2021-01-11: ...}` and `{foo+bar: ...}`
    /// be keys rather than arithmetic.
    fn parse_context_key(&mut self) -> String {
        let mut key = String::new();
        let mut previous_was_word = false;
        while let Some(tok) = self.peek(0) {
            let is_word = matches!(
                tok.kind,
                TokenKind::Name | TokenKind::Keyword | TokenKind::Number
            );
            let is_symbol = tok.kind == TokenKind::Op && NAME_SYMBOLS.contains(&tok.value.as_str());
            if !is_word && !is_symbol {
                break;
            }
            // Two words in a row are separated by the space that separated them.
            if is_word && previous_was_word {
                key.push(' ');
            }
            key.push_str(&tok.value);
            previous_was_word = is_word;
            self.pos += 1;
        }
        key
    }

    fn parse_if(&mut self) -> Option<Node> {
        let start = self.peek(0).map_or(0, |t| t.start);
        self.advance();
        let condition = self.parse_expression(0)?;
        self.expect(TokenKind::Keyword, "then")?;
        let then = self.parse_expression(0)?;
        self.expect(TokenKind::Keyword, "else")?;
        let otherwise = self.parse_expression(0)?;
        Some(node(
            start,
            otherwise.end,
            NodeKind::If {
                condition: Box::new(condition),
                then: Box::new(then),
                otherwise: Box::new(otherwise),
            },
        ))
    }

    fn parse_binding(&mut self, bindings: &mut Vec<Binding>) -> bool {
        let Some(name_tok) = self.advance() else {
            return false;
        };
        if !matches!(name_tok.kind, TokenKind::Name | TokenKind::Backtick) {
            return false;
        }
        if self.expect(TokenKind::Keyword, "in").is_none() {
            return false;
        }
        let Some(domain) = self.parse_iteration_domain() else {
            return false;
        };
        bindings.push(Binding {
            name: name_tok.value,
            domain,
        });
        true
    }

    fn parse_bindings(&mut self) -> Option<Vec<Binding>> {
        let mut bindings = Vec::new();
        if !self.parse_binding(&mut bindings) {
            return None;
        }
        while self.consume(TokenKind::Punct, ",").is_some() {
            if !self.parse_binding(&mut bindings) {
                break;
            }
        }
        Some(bindings)
    }

    fn parse_for(&mut self) -> Option<Node> {
        let start = self.peek(0).map_or(0, |t| t.start);
        self.advance();
        let bindings = self.parse_bindings()?;
        self.expect(TokenKind::Keyword, "return")?;
        let body = self.parse_expression(0)?;
        Some(node(
            start,
            body.end,
            NodeKind::For {
                bindings,
                body: Box::new(body),
            },
        ))
    }

    fn parse_quantifier(&mut self, is_some: bool) -> Option<Node> {
        let start = self.peek(0).map_or(0, |t| t.start);
        self.advance();
        let bindings = self.parse_bindings()?;
        self.expect(TokenKind::Keyword, "satisfies")?;
        let satisfies = Box::new(self.parse_expression(0)?);
        let end = satisfies.end;
        let kind = if is_some {
            NodeKind::Some {
                bindings,
                satisfies,
            }
        } else {
            NodeKind::Every {
                bindings,
                satisfies,
            }
        };
        Some(node(start, end, kind))
    }

    fn parse_function_def(&mut self) -> Option<Node> {
        let start = self.peek(0).map_or(0, |t| t.start);
        self.advance();
        self.expect(TokenKind::Punct, "(")?;
        let mut params = Vec::new();
        // A parameter may declare a type, which this package does not check:
        // `function(a: number) a + 1`.
        let mut parse_param = |p: &mut Self| {
            if let Some(name) = p.advance() {
                params.push(name.value);
            }
            if p.consume(TokenKind::Punct, ":").is_some() {
                p.parse_type_name();
            }
        };
        if !self.check(TokenKind::Punct, ")") {
            parse_param(self);
            while self.consume(TokenKind::Punct, ",").is_some() {
                parse_param(self);
            }
        }
        self.expect(TokenKind::Punct, ")")?;
        let body = self.parse_expression(0)?;
        Some(node(
            start,
            body.end,
            NodeKind::FunctionDef {
                params,
                body: Arc::new(body),
            },
        ))
    }

    fn parse_not(&mut self) -> Option<Node> {
        let start = self.peek(0).map_or(0, |t| t.start);
        self.advance();
        if !self.check(TokenKind::Punct, "(") {
            // `not` as a prefix operator: `not x`
            let operand = self.parse_expression(70)?;
            return Some(node(
                start,
                operand.end,
                NodeKind::Call {
                    callee: "not".to_string(),
                    args: vec![operand],
                },
            ));
        }
        self.advance();
        let expr = self.parse_expression(0)?;
        let close = self.expect(TokenKind::Punct, ")");
        let end = close.map_or(expr.end, |c| c.end);
        Some(node(
            start,
            end,
            NodeKind::Call {
                callee: "not".to_string(),
                args: vec![expr],
            },
        ))
    }

    /// The `high` bound and closing bracket of a range whose low bound is parsed.
    fn finish_range(&mut self, start: usize, start_included: bool, low: Node) -> Option<Node> {
        self.advance(); // ..
        let high = self.parse_expression(0)?;
        let close = self.advance();
        let end_included = close.as_ref().is_some_and(|c| c.value == "]");
        let end = close.map_or(high.end, |c| c.end);
        Some(node(
            start,
            end,
            NodeKind::Range {
                start_included,
                low: Box::new(low),
                high: Box::new(high),
                end_included,
            },
        ))
    }

    fn parse_paren_or_range(&mut self) -> Option<Node> {
        let start = self.peek(0)?.start;
        self.advance();
        let expr = self.parse_expression(0)?;
        if self.check(TokenKind::Op, "..") {
            return self.finish_range(start, false, expr);
        }
        self.expect(TokenKind::Punct, ")");
        Some(expr)
    }

    fn parse_list_or_range(&mut self) -> Option<Node> {
        let open = self.peek(0)?.clone();
        let start = open.start;
        self.advance();

        if self.check(TokenKind::Punct, "]") {
            self.advance();
            return Some(node(start, open.end + 1, NodeKind::List(Vec::new())));
        }

        let first = self.parse_expression(0)?;
        if self.check(TokenKind::Op, "..") {
            return self.finish_range(start, true, first);
        }

        let first_end = first.end;
        let mut items = vec![first];
        while self.consume(TokenKind::Punct, ",").is_some() {
            items.extend(self.parse_expression(0));
        }
        let close = self.expect(TokenKind::Punct, "]");
        Some(node(
            start,
            close.map_or(first_end, |c| c.end),
            NodeKind::List(items),
        ))
    }

    fn parse_context_entry(&mut self) -> Option<(String, Node)> {
        let key = if self.check_kind(TokenKind::String) {
            let tok = self.advance()?;
            unescape_string(&tok.value[1..tok.value.len() - 1])
        } else if self.peek(0).is_some_and(is_word) {
            self.parse_context_key()
        } else {
            let (start, end) = self.peek(0).map_or((0, 0), |t| (t.start, t.end));
            self.error("Expected context key", start, end);
            return None;
        };
        self.expect(TokenKind::Punct, ":")?;
        let value = self.parse_expression(0)?;
        Some((key, value))
    }

    fn parse_context(&mut self) -> Option<Node> {
        let start = self.peek(0)?.start;
        self.advance();

        let mut entries = Vec::new();
        if !self.check(TokenKind::Punct, "}") {
            match self.parse_context_entry() {
                None => {
                    // error recovery: skip to }
                    while self.peek(0).is_some() && !self.check(TokenKind::Punct, "}") {
                        self.advance();
                    }
                }
                Some(entry) => {
                    entries.push(entry);
                    while self.consume(TokenKind::Punct, ",").is_some() {
                        match self.parse_context_entry() {
                            Some(entry) => entries.push(entry),
                            None => break,
                        }
                    }
                }
            }
        }
        let close = self.expect(TokenKind::Punct, "}");
        Some(node(
            start,
            close.map_or(start, |c| c.end),
            NodeKind::Context(entries),
        ))
    }

    /// Parses the right-hand side of `in`, which FEEL defines as a positive
    /// unary test rather than an expression: `x in <= 10`, `x in [1..5]`,
    /// `x in (1, < 5, >= 10)`, `x in y`.
    fn parse_in_test_expr(&mut self) -> Option<Node> {
        if self.check(TokenKind::Punct, "(") {
            return self.parse_in_paren();
        }
        self.parse_one_unary_test()
    }

    /// A parenthesized `in` operand is a range, a comma-separated list of unary
    /// tests, or a plain grouped expression.
    fn parse_in_paren(&mut self) -> Option<Node> {
        let start = self.peek(0)?.start;
        self.advance();

        let first = self.parse_one_unary_test()?;

        if self.check(TokenKind::Op, "..") {
            return self.finish_range(start, false, first);
        }

        if self.check(TokenKind::Punct, ",") {
            let mut tests = vec![first];
            while self.consume(TokenKind::Punct, ",").is_some() {
                tests.extend(self.parse_one_unary_test());
            }
            let close = self.expect(TokenKind::Punct, ")");
            let end = close
                .map(|c| c.end)
                .or_else(|| tests.last().map(|t| t.end))
                .unwrap_or(start);
            return Some(node(start, end, NodeKind::UnaryTestList(tests)));
        }

        self.expect(TokenKind::Punct, ")");
        Some(first)
    }

    /// Parses a type name after `instance of`. Multi-word names are tried
    /// longest-first, since "date" is also the start of "date and time". Type
    /// arguments (`list<number>`, `function<number> -> string`) are consumed and
    /// ignored: this package checks the outer type only.
    fn parse_type_name(&mut self) -> Option<String> {
        let tok = self.peek(0).filter(|t| is_word(t))?.clone();
        let name = match MULTIWORD_TYPES.iter().find(|c| self.try_consume_words(c)) {
            Some(candidate) => (*candidate).to_string(),
            None => {
                self.advance();
                tok.value
            }
        };
        self.skip_type_arguments();
        Some(name)
    }

    /// Consumes the tokens spelling `phrase`, or nothing if they do not follow.
    fn try_consume_words(&mut self, phrase: &str) -> bool {
        let words: Vec<&str> = phrase.split(' ').collect();
        for (i, word) in words.iter().enumerate() {
            if !self.peek(i).is_some_and(|t| is_word(t) && t.value == *word) {
                return false;
            }
        }
        self.pos += words.len();
        true
    }

    /// Skips `<...>` type arguments and a `-> type` function result.
    fn skip_type_arguments(&mut self) {
        if self.check(TokenKind::Op, "<") {
            let mut depth = 0i32;
            while self.peek(0).is_some() {
                if self.check(TokenKind::Op, "<") {
                    depth += 1;
                } else if self.check(TokenKind::Op, ">") || self.check(TokenKind::Op, ">=") {
                    // ">>" lexes as one token pair.
                    depth -= 1;
                }
                self.advance();
                if depth == 0 {
                    break;
                }
            }
        }
        if self.check(TokenKind::Op, "->") {
            self.advance();
            self.parse_type_name();
        }
    }

    // -------------------------------------------------------------------------
    // Unary-test mode
    // -------------------------------------------------------------------------

    fn parse_unary_tests(&mut self) -> Option<Node> {
        let start = self.peek(0).map_or(0, |t| t.start);

        // "-" means any input
        if self.check(TokenKind::Op, "-") && self.tokens.len() == 1 {
            self.advance();
            let tok = &self.tokens[0];
            return Some(node(tok.start, tok.end, NodeKind::AnyInput));
        }

        let first = self.parse_one_unary_test()?;
        let mut tests = vec![first];
        while self.consume(TokenKind::Punct, ",").is_some() {
            tests.extend(self.parse_one_unary_test());
        }

        if tests.len() == 1 {
            return tests.pop();
        }
        let end = tests.last().map_or(start, |t| t.end);
        Some(node(start, end, NodeKind::UnaryTestList(tests)))
    }

    fn parse_one_unary_test(&mut self) -> Option<Node> {
        let tok = self.peek(0)?.clone();
        let value = tok.value.as_str();

        // "-" = any input
        if tok.kind == TokenKind::Op && value == "-" {
            self.advance();
            return Some(node(tok.start, tok.end, NodeKind::AnyInput));
        }

        if tok.kind == TokenKind::Keyword && value == "not" {
            self.advance();
            self.expect(TokenKind::Punct, "(")?;
            let inner = self.parse_unary_tests_inner();
            let close = self.expect(TokenKind::Punct, ")");
            return Some(node(
                tok.start,
                close.map_or(tok.start, |c| c.end),
                NodeKind::UnaryNot(inner),
            ));
        }

        // Comparison operator prefix: < 5, >= 10, = 3, != 4
        if tok.kind == TokenKind::Op {
            if let Some(op) = comparison_op(value) {
                self.advance();
                let expr = self.parse_expression(0)?;
                let input = node(tok.start, tok.start, NodeKind::Name("?".to_string()));
                return Some(node(
                    tok.start,
                    expr.end,
                    NodeKind::Binary {
                        op,
                        left: Box::new(input),
                        right: Box::new(expr),
                    },
                ));
            }
        }

        // The TS parser sends "(" through the list parser first, which consumes
        // the opening token without looking at which bracket it was, so `(1..5)`
        // reads as an inclusive-start range here; the fallback only runs when the
        // list parse fails. Kept for parity.
        if tok.kind == TokenKind::Punct && matches!(value, "[" | "(") {
            return self
                .parse_list_or_range()
                .or_else(|| self.parse_paren_or_range());
        }

        // "instance of X" with the implicit input "?" as the subject
        if tok.kind == TokenKind::Keyword && value == "instance" {
            let start = tok.start;
            self.advance();
            self.expect(TokenKind::Keyword, "of")?;
            let type_name = self.parse_type_name()?;
            let implicit = node(start, start, NodeKind::Name("?".to_string()));
            let end = self.previous_end().unwrap_or(start);
            return Some(node(
                start,
                end,
                NodeKind::InstanceOf {
                    value: Box::new(implicit),
                    type_name,
                },
            ));
        }

        // Expression equality test
        self.parse_expression(0)
    }

    fn parse_unary_tests_inner(&mut self) -> Vec<Node> {
        let mut tests = Vec::new();
        tests.extend(self.parse_one_unary_test());
        while self.consume(TokenKind::Punct, ",").is_some() {
            tests.extend(self.parse_one_unary_test());
        }
        tests
    }

    /// Push an error if there are unconsumed tokens remaining.
    fn check_done(&mut self) {
        if let Some(tok) = self.tokens.get(self.pos).cloned() {
            self.error(
                format!("Unexpected token '{}'", tok.value),
                tok.start,
                tok.end,
            );
        }
    }
}

pub fn parse_expression(input: &str, options: &ParseOptions) -> ParseResult {
    let mut p = Parser::new(input, options);
    let ast = p.parse_expression(0);
    p.check_done();
    ParseResult {
        ast,
        errors: p.errors,
    }
}

pub fn parse_unary_tests(input: &str, options: &ParseOptions) -> ParseResult {
    if input.trim() == "-" {
        return ParseResult {
            ast: Some(node(0, input.len(), NodeKind::AnyInput)),
            errors: Vec::new(),
        };
    }
    let mut p = Parser::new(input, options);
    let ast = p.parse_unary_tests();
    ParseResult {
        ast,
        errors: p.errors,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ast(input: &str) -> Node {
        parse_expression(input, &ParseOptions::default())
            .ast
            .unwrap_or_else(|| panic!("no ast for {input}"))
    }

    fn errors(input: &str) -> Vec<ParseError> {
        parse_expression(input, &ParseOptions::default()).errors
    }

    fn ut(input: &str) -> Node {
        parse_unary_tests(input, &ParseOptions::default())
            .ast
            .unwrap_or_else(|| panic!("no ast for {input}"))
    }

    fn num(n: i64) -> NodeKind {
        NodeKind::Number(Decimal::from(n))
    }

    fn binary_parts(input: &str) -> (BinaryOp, Node, Node) {
        match ast(input).kind {
            NodeKind::Binary { op, left, right } => (op, *left, *right),
            other => panic!("not binary: {other:?}"),
        }
    }

    #[test]
    fn literals() {
        assert_eq!(ast("42").kind, num(42));
        assert_eq!(ast("1.5").kind, NodeKind::Number("1.5".parse().unwrap()));
        assert_eq!(ast(".5").kind, NodeKind::Number("0.5".parse().unwrap()));
        assert_eq!(ast("1.23e4").kind, num(12300));
        assert_eq!(ast("1E+2").kind, num(100));
        assert_eq!(ast("\"hello\"").kind, NodeKind::String("hello".into()));
        assert_eq!(ast(r#""a\"b""#).kind, NodeKind::String("a\"b".into()));
        assert_eq!(ast("true").kind, NodeKind::Boolean(true));
        assert_eq!(ast("false").kind, NodeKind::Boolean(false));
        assert_eq!(ast("null").kind, NodeKind::Null);
        assert_eq!(
            ast("@\"2021-01-01\"").kind,
            NodeKind::Temporal("2021-01-01".into())
        );
        assert_eq!(
            ast("`First Name`").kind,
            NodeKind::Name("First Name".into())
        );
    }

    #[test]
    fn number_out_of_range_is_an_error() {
        let result = parse_expression(&"9".repeat(40), &ParseOptions::default());
        assert!(result.ast.is_none());
        assert_eq!(result.errors.len(), 1);
        assert!(result.errors[0].message.contains("out of range"));
    }

    #[test]
    fn negative_number_is_unary_minus() {
        match ast("-1").kind {
            NodeKind::UnaryMinus(operand) => assert_eq!(operand.kind, num(1)),
            other => panic!("{other:?}"),
        }
    }

    #[test]
    fn arithmetic_precedence() {
        let (op, left, right) = binary_parts("1 + 2");
        assert_eq!((op, left.kind, right.kind), (BinaryOp::Add, num(1), num(2)));
        let (op, _, right) = binary_parts("1 + 2 * 3");
        assert_eq!(op, BinaryOp::Add);
        assert!(matches!(
            right.kind,
            NodeKind::Binary {
                op: BinaryOp::Mul,
                ..
            }
        ));
    }

    // FEEL makes every infix operator left-associative, "**" included.
    #[test]
    fn exponentiation_is_left_associative() {
        let (op, left, _) = binary_parts("2 ** 3 ** 4");
        assert_eq!(op, BinaryOp::Pow);
        assert!(matches!(
            left.kind,
            NodeKind::Binary {
                op: BinaryOp::Pow,
                ..
            }
        ));
    }

    #[test]
    fn comparison_and_logic() {
        assert_eq!(binary_parts("a = 1").0, BinaryOp::Eq);
        assert_eq!(binary_parts("a != 1").0, BinaryOp::Ne);
        assert_eq!(binary_parts("a < 5").0, BinaryOp::Lt);
        assert_eq!(binary_parts("a and b").0, BinaryOp::And);
        assert_eq!(binary_parts("a or b").0, BinaryOp::Or);
        assert_eq!(binary_parts("a == 1").0, BinaryOp::Eq);
        let (op, ..) = binary_parts("a or b and c");
        assert_eq!(op, BinaryOp::Or);
    }

    #[test]
    fn if_for_quantifiers() {
        let n = ast("if x > 0 then x else -x");
        assert!(matches!(n.kind, NodeKind::If { .. }));
        match ast("for x in [1, 2, 3] return x * 2").kind {
            NodeKind::For { bindings, .. } => assert_eq!(bindings[0].name, "x"),
            other => panic!("{other:?}"),
        }
        assert!(matches!(
            ast("some x in [1,2,3] satisfies x > 2").kind,
            NodeKind::Some { .. }
        ));
        assert!(matches!(
            ast("every x in [1,2,3] satisfies x > 0").kind,
            NodeKind::Every { .. }
        ));
    }

    #[test]
    fn iteration_domain_may_be_an_undelimited_range() {
        match ast("for i in 1..3 return i").kind {
            NodeKind::For { bindings, .. } => assert!(matches!(
                bindings[0].domain.kind,
                NodeKind::Range {
                    start_included: true,
                    end_included: true,
                    ..
                }
            )),
            other => panic!("{other:?}"),
        }
    }

    #[test]
    fn collections() {
        match ast("[1, 2, 3]").kind {
            NodeKind::List(items) => {
                let kinds: Vec<_> = items.into_iter().map(|n| n.kind).collect();
                assert_eq!(kinds, [num(1), num(2), num(3)]);
            }
            other => panic!("{other:?}"),
        }
        assert_eq!(ast("[]").kind, NodeKind::List(vec![]));
        assert_eq!(ast("[]").end, 2);
        match ast("{a: 1, b: 2}").kind {
            NodeKind::Context(entries) => {
                let keys: Vec<_> = entries.iter().map(|(k, _)| k.as_str()).collect();
                assert_eq!(keys, ["a", "b"]);
            }
            other => panic!("{other:?}"),
        }
    }

    #[test]
    fn context_keys() {
        let keys = |src: &str| match ast(src).kind {
            NodeKind::Context(entries) => entries.into_iter().map(|(k, _)| k).collect::<Vec<_>>(),
            other => panic!("{other:?}"),
        };
        assert_eq!(keys("{\"a b\": 1}"), ["a b"]);
        assert_eq!(keys("{first name: 1}"), ["first name"]);
        assert_eq!(keys("{foo+bar: 1}"), ["foo+bar"]);
        assert_eq!(keys("{_2021-01-11: 1}"), ["_2021-01-11"]);
    }

    #[test]
    fn ranges() {
        let range = |src: &str| match ast(src).kind {
            NodeKind::Range {
                start_included,
                low,
                high,
                end_included,
            } => (start_included, low.kind, high.kind, end_included),
            other => panic!("{other:?}"),
        };
        assert_eq!(range("[1..5]"), (true, num(1), num(5), true));
        let flags = |src: &str| {
            let r = range(src);
            (r.0, r.3)
        };
        assert_eq!(flags("(1..5)"), (false, false));
        assert_eq!(flags("[1..5)"), (true, false));
        assert_eq!(flags("(1..5]"), (false, true));
    }

    #[test]
    fn calls() {
        match ast("contains(a, b)").kind {
            NodeKind::Call { callee, args } => {
                assert_eq!(callee, "contains");
                assert_eq!(args.len(), 2);
            }
            other => panic!("{other:?}"),
        }
        match ast("string length(\"hello\")").kind {
            NodeKind::Call { callee, .. } => assert_eq!(callee, "string length"),
            other => panic!("{other:?}"),
        }
        match ast("substring(string: s, start position: 1)").kind {
            NodeKind::CallNamed { callee, args } => {
                assert_eq!(callee, "substring");
                let names: Vec<_> = args.iter().map(|(n, _)| n.as_str()).collect();
                assert_eq!(names, ["string", "start position"]);
            }
            other => panic!("{other:?}"),
        }
        assert!(matches!(ast("ctx.fn(1)").kind, NodeKind::CallExpr { .. }));
        assert!(matches!(
            ast("(function(a) a)(1)").kind,
            NodeKind::CallExpr { .. }
        ));
    }

    #[test]
    fn not_forms() {
        for src in ["not(true)", "not true"] {
            match ast(src).kind {
                NodeKind::Call { callee, args } => {
                    assert_eq!(callee, "not");
                    assert_eq!(args.len(), 1);
                }
                other => panic!("{other:?}"),
            }
        }
    }

    #[test]
    fn multiword_names_in_scope() {
        let options = ParseOptions {
            names: vec!["order total".into()],
        };
        let result = parse_expression("order total + 1", &options);
        assert!(result.errors.is_empty());
        let Some(Node {
            kind: NodeKind::Binary { left, .. },
            ..
        }) = result.ast
        else {
            panic!("not binary");
        };
        assert_eq!(left.kind, NodeKind::Name("order total".into()));
        // Without the name it is two names in a row.
        assert!(!errors("order total + 1").is_empty());
        // A longer name that does not exist gives its words back.
        match ast("date and time(x) and y").kind {
            NodeKind::Binary { left, .. } => assert!(matches!(
                left.kind,
                NodeKind::Call { ref callee, .. } if callee == "date and time"
            )),
            other => panic!("{other:?}"),
        }
        assert_eq!(binary_parts("date and y").0, BinaryOp::And);
    }

    #[test]
    fn path_and_filter() {
        match ast("a.b").kind {
            NodeKind::Path { base, key } => {
                assert_eq!(base.kind, NodeKind::Name("a".into()));
                assert_eq!(key, "b");
            }
            other => panic!("{other:?}"),
        }
        match ast("a.time offset").kind {
            NodeKind::Path { key, .. } => assert_eq!(key, "time offset"),
            other => panic!("{other:?}"),
        }
        assert_eq!(binary_parts("a.b and c").0, BinaryOp::And);
        assert!(matches!(
            ast("list[item > 1]").kind,
            NodeKind::Filter { .. }
        ));
    }

    #[test]
    fn between_in_instance_of() {
        assert!(matches!(
            ast("x between 1 and 10").kind,
            NodeKind::Between { .. }
        ));
        assert!(matches!(ast("x in [1..5]").kind, NodeKind::InTest { .. }));
        match ast("x in (1, < 5, >= 10)").kind {
            NodeKind::InTest { test, .. } => {
                assert!(matches!(test.kind, NodeKind::UnaryTestList(ref t) if t.len() == 3));
            }
            other => panic!("{other:?}"),
        }
        match ast("x instance of number").kind {
            NodeKind::InstanceOf { type_name, .. } => assert_eq!(type_name, "number"),
            other => panic!("{other:?}"),
        }
        let type_of = |src: &str| match ast(src).kind {
            NodeKind::InstanceOf { type_name, .. } => type_name,
            other => panic!("{other:?}"),
        };
        assert_eq!(type_of("x instance of date and time"), "date and time");
        assert_eq!(type_of("x instance of list<number>"), "list");
        assert_eq!(
            type_of("x instance of function<number> -> string"),
            "function"
        );
    }

    #[test]
    fn function_definition() {
        match ast("function(x) x + 1").kind {
            NodeKind::FunctionDef { params, .. } => assert_eq!(params, ["x"]),
            other => panic!("{other:?}"),
        }
        match ast("function(a: number, b: string) a").kind {
            NodeKind::FunctionDef { params, .. } => assert_eq!(params, ["a", "b"]),
            other => panic!("{other:?}"),
        }
    }

    #[test]
    fn offsets_are_bytes() {
        let n = ast("é + 1");
        assert_eq!((n.start, n.end), (0, 6));
    }

    #[test]
    fn error_recovery() {
        let result = parse_expression("1 + ", &ParseOptions::default());
        assert!(!result.errors.is_empty());
        assert_eq!(result.errors[0].message, "Expected expression after '+'",);
        assert!(!errors("foo bar").is_empty());
        assert_eq!(errors("foo bar")[0].message, "Unexpected token 'bar'");
        assert!(errors("foo + bar").is_empty());
        assert!(errors("contains(a, b)").is_empty());
        assert!(errors("x > 5 and y < 10").is_empty());
        assert_eq!(
            errors("(1")[0],
            ParseError {
                message: "Expected )".into(),
                start: 2,
                end: 3
            }
        );
        assert_eq!(errors("a.")[0].message, "Expected name after '.'");
        assert!(!errors("{a 1}").is_empty());
        assert!(parse_expression("", &ParseOptions::default()).ast.is_none());
    }

    #[test]
    fn unary_tests() {
        assert_eq!(ut("-").kind, NodeKind::AnyInput);
        assert_eq!(ut(" - ").kind, NodeKind::AnyInput);
        assert_eq!(ut("\"visa\"").kind, NodeKind::String("visa".into()));
        match ut("< 5").kind {
            NodeKind::Binary { op, left, right } => {
                assert_eq!(op, BinaryOp::Lt);
                assert_eq!(left.kind, NodeKind::Name("?".into()));
                assert_eq!(right.kind, num(5));
            }
            other => panic!("{other:?}"),
        }
        assert!(matches!(ut("[1..5]").kind, NodeKind::Range { .. }));
        assert!(matches!(
            ut("\"visa\", \"master\"").kind,
            NodeKind::UnaryTestList(ref t) if t.len() == 2
        ));
        assert!(matches!(
            ut("not(\"visa\")").kind,
            NodeKind::UnaryNot(ref t) if t.len() == 1
        ));
        assert!(matches!(
            ut("instance of number").kind,
            NodeKind::InstanceOf { .. }
        ));
    }

    fn conformance_cases() -> Vec<(String, String, Vec<String>, bool)> {
        let dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance/feel");
        let mut cases = Vec::new();
        let mut files: Vec<_> = std::fs::read_dir(dir)
            .unwrap()
            .map(|e| e.unwrap().path())
            .filter(|p| p.extension().is_some_and(|e| e == "jsonl"))
            .collect();
        files.sort();
        for file in files {
            for line in std::fs::read_to_string(file).unwrap().lines() {
                if line.trim().is_empty() {
                    continue;
                }
                let v: serde_json::Value = serde_json::from_str(line).unwrap();
                let names = v["context"]
                    .as_object()
                    .map(|o| o.keys().cloned().collect())
                    .unwrap_or_default();
                cases.push((
                    v["id"].as_str().unwrap().to_string(),
                    v["expr"].as_str().unwrap().to_string(),
                    names,
                    v["expected"]["t"] == "error",
                ));
            }
        }
        cases
    }

    #[test]
    fn conformance_expressions_parse() {
        let cases = conformance_cases();
        assert!(cases.len() > 100);
        let mut failures = Vec::new();
        for (id, expr, names, expects_error) in cases {
            let result = parse_expression(&expr, &ParseOptions { names });
            let failed = result.ast.is_none() || !result.errors.is_empty();
            if !expects_error && failed {
                failures.push(format!("{id}: {expr} -> {:?}", result.errors));
            }
            if expects_error {
                // Whether TS also fails at parse level is checked by hand; see the report.
                println!("error case {id}: {expr} parse_failed={failed}");
            }
        }
        assert!(failures.is_empty(), "{}", failures.join("\n"));
    }
}
