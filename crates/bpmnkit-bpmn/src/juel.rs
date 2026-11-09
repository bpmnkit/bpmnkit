//! JUEL to FEEL for the subset where the two languages provably agree on non-null
//! operands: variable paths, literals, comparisons, boolean connectives and
//! arithmetic other than remainder (`juel.ts`).
//!
//! Everything else (method calls, `empty`, the ternary, indexing, `%`, the engine
//! objects `execution` / `task`) is refused with a reason rather than guessed at.

use bpmnkit_feel::{parse_partial, ParseOptions};
use serde::ser::SerializeStruct;
use serde::{Serialize, Serializer};

/// The outcome of [`translate_juel_to_feel`]. `feel` carries no leading `=`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum JuelToFeelResult {
    Ok { feel: String },
    Refused { reason: String },
}

impl Serialize for JuelToFeelResult {
    fn serialize<S: Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Ok { feel } => {
                let mut o = s.serialize_struct("JuelToFeelResult", 2)?;
                o.serialize_field("ok", &true)?;
                o.serialize_field("feel", feel)?;
                o.end()
            }
            Self::Refused { reason } => {
                let mut o = s.serialize_struct("JuelToFeelResult", 2)?;
                o.serialize_field("ok", &false)?;
                o.serialize_field("reason", reason)?;
                o.end()
            }
        }
    }
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct JuelToFeelOptions {
    /// The expression is a multi-instance completion condition, where Camunda 7's
    /// `nrOfInstances` / `nrOfActiveInstances` / `nrOfCompletedInstances` have
    /// direct Camunda 8 counterparts.
    pub multi_instance: bool,
}

/// Whether a text contains a JUEL expression (`${…}` or `#{…}`) anywhere.
pub fn contains_juel(text: &str) -> bool {
    text.contains("${") || text.contains("#{")
}

/// A FEEL string literal for `value`.
pub fn feel_string(value: &str) -> String {
    let mut out = String::with_capacity(value.len() + 2);
    out.push('"');
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
    out.push('"');
    out
}

/// Words FEEL reserves, which therefore cannot stand as a bare variable name.
const FEEL_RESERVED: [&str; 19] = [
    "true",
    "false",
    "null",
    "and",
    "or",
    "not",
    "if",
    "then",
    "else",
    "for",
    "in",
    "return",
    "some",
    "every",
    "satisfies",
    "between",
    "instance",
    "of",
    "function",
];

/// Objects the Camunda 7 engine injects into expressions; Camunda 8 has none of them.
const C7_ENGINE_OBJECTS: [&str; 8] = [
    "execution",
    "task",
    "externalTask",
    "authenticatedUserId",
    "variableScope",
    "connector",
    "caseExecution",
    "dateTime",
];

const MULTI_INSTANCE_RENAMES: [(&str, &str); 3] = [
    ("nrOfInstances", "numberOfInstances"),
    ("nrOfActiveInstances", "numberOfActiveInstances"),
    ("nrOfCompletedInstances", "numberOfCompletedInstances"),
];

/// Whether `name` can be written as a bare FEEL variable name.
pub fn is_feel_name(name: &str) -> bool {
    let mut chars = name.chars();
    let head_ok = chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_');
    head_ok
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_')
        && !FEEL_RESERVED.contains(&name)
}

/// JavaScript's `\s` and `String.prototype.trim` whitespace.
pub fn is_js_space(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202f}'
                | '\u{205f}'
                | '\u{3000}'
                | '\u{feff}'
    )
}

/// `String.prototype.trim`.
pub fn js_trim(s: &str) -> &str {
    s.trim_matches(is_js_space)
}

// ---------------------------------------------------------------------------
// Lexer
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, PartialEq)]
enum Token {
    Num(String),
    Str(String),
    Id(String),
    Op(String),
}

impl Token {
    fn text(&self) -> &str {
        match self {
            Token::Num(t) | Token::Id(t) | Token::Op(t) => t,
            Token::Str(v) => v,
        }
    }
}

struct Refusal(String);

type Res<T> = Result<T, Refusal>;

fn refuse<T>(reason: impl Into<String>) -> Res<T> {
    Err(Refusal(reason.into()))
}

const OPERATORS: [&str; 14] = [
    "&&", "||", "==", "!=", "<=", ">=", "!", "<", ">", "+", "-", "*", "/", "%",
];
const PUNCTUATION: [char; 10] = ['(', ')', '.', ',', '?', ':', '[', ']', '{', '}'];

fn lex(source: &str) -> Res<Vec<Token>> {
    let chars: Vec<char> = source.chars().collect();
    let mut tokens = vec![];
    let mut i = 0;
    while i < chars.len() {
        let ch = chars[i];
        if is_js_space(ch) {
            i += 1;
            continue;
        }
        if ch.is_ascii_digit() {
            let mut j = i;
            while chars.get(j).is_some_and(char::is_ascii_digit) {
                j += 1;
            }
            if chars.get(j) == Some(&'.') && chars.get(j + 1).is_some_and(char::is_ascii_digit) {
                j += 1;
                while chars.get(j).is_some_and(char::is_ascii_digit) {
                    j += 1;
                }
            }
            if chars.get(j).is_some_and(|c| "eEdDfFlL.".contains(*c)) {
                let rest: String = chars[i..].iter().collect();
                return refuse(format!("numeric literal \"{rest}\" has no exact FEEL form"));
            }
            tokens.push(Token::Num(chars[i..j].iter().collect()));
            i = j;
            continue;
        }
        if ch == '\'' || ch == '"' {
            let mut value = String::new();
            let mut j = i + 1;
            loop {
                let Some(&c) = chars.get(j) else {
                    return refuse("unterminated string literal");
                };
                if c == '\\' {
                    if let Some(n) = chars.get(j + 1) {
                        value.push(*n);
                    }
                    j += 2;
                    continue;
                }
                if c == ch {
                    break;
                }
                value.push(c);
                j += 1;
            }
            tokens.push(Token::Str(value));
            i = j + 1;
            continue;
        }
        if ch.is_ascii_alphabetic() || ch == '_' || ch == '$' {
            let mut j = i;
            while chars
                .get(j)
                .is_some_and(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '$')
            {
                j += 1;
            }
            tokens.push(Token::Id(chars[i..j].iter().collect()));
            i = j;
            continue;
        }
        if let Some(op) = OPERATORS.iter().find(|op| {
            op.chars()
                .enumerate()
                .all(|(k, c)| chars.get(i + k) == Some(&c))
        }) {
            tokens.push(Token::Op((*op).to_string()));
            i += op.len();
            continue;
        }
        if PUNCTUATION.contains(&ch) {
            tokens.push(Token::Op(ch.to_string()));
            i += 1;
            continue;
        }
        return refuse(format!("unexpected character \"{ch}\""));
    }
    Ok(tokens)
}

// ---------------------------------------------------------------------------
// Parser: JUEL precedence, emitting FEEL with minimal parentheses
// ---------------------------------------------------------------------------

/// FEEL precedence of a node's outermost operator; higher binds tighter.
const PREC_OR: u8 = 1;
const PREC_AND: u8 = 2;
const PREC_COMPARE: u8 = 3;
const PREC_ADD: u8 = 4;
const PREC_MUL: u8 = 5;
const PREC_UNARY: u8 = 6;
const PREC_ATOM: u8 = 7;

struct Emitted {
    text: String,
    prec: u8,
}

fn comparison(op: &str) -> &str {
    match op {
        "==" | "eq" => "=",
        "!=" | "ne" => "!=",
        "<" | "lt" => "<",
        ">" | "gt" => ">",
        "<=" | "le" => "<=",
        ">=" | "ge" => ">=",
        other => other,
    }
}

struct Parser<'a> {
    tokens: Vec<Token>,
    pos: usize,
    options: &'a JuelToFeelOptions,
}

type Next<'a> = fn(&mut Parser<'a>) -> Res<Emitted>;

impl<'a> Parser<'a> {
    fn parse(&mut self) -> Res<Emitted> {
        if self.tokens.is_empty() {
            return refuse("empty expression");
        }
        let result = self.or()?;
        if let Some(rest) = self.tokens.get(self.pos) {
            return refuse(format!("unsupported syntax at \"{}\"", rest.text()));
        }
        Ok(result)
    }

    fn peek(&self) -> Option<&Token> {
        self.tokens.get(self.pos)
    }

    /// Consumes the next token when it is one of `words` (operator or keyword).
    fn accept(&mut self, words: &[&str]) -> Option<String> {
        let text = match self.peek()? {
            Token::Op(t) | Token::Id(t) => t.clone(),
            _ => return None,
        };
        if words.contains(&text.as_str()) {
            self.pos += 1;
            return Some(text);
        }
        None
    }

    fn binary(
        &mut self,
        next: Next<'a>,
        operators: &[&str],
        prec: u8,
        spell: fn(&str) -> String,
    ) -> Res<Emitted> {
        let mut left = next(self)?;
        loop {
            let Some(op) = self.accept(operators) else {
                return Ok(left);
            };
            let right = next(self)?;
            // FEEL comparisons do not chain, so a comparison operand of a comparison is always wrapped.
            let left_text = if left.prec < prec || (prec == PREC_COMPARE && left.prec == prec) {
                format!("({})", left.text)
            } else {
                left.text
            };
            let right_text = if right.prec <= prec {
                format!("({})", right.text)
            } else {
                right.text
            };
            left = Emitted {
                text: format!("{left_text} {} {right_text}", spell(&op)),
                prec,
            };
        }
    }

    fn or(&mut self) -> Res<Emitted> {
        let result = self.binary(Self::and, &["||", "or"], PREC_OR, |_| "or".into())?;
        if matches!(self.peek(), Some(Token::Op(t)) if t == "?") {
            return refuse(
                "the conditional operator ?: coerces its condition; rewrite as if-then-else",
            );
        }
        Ok(result)
    }

    fn and(&mut self) -> Res<Emitted> {
        self.binary(Self::equality, &["&&", "and"], PREC_AND, |_| "and".into())
    }

    fn equality(&mut self) -> Res<Emitted> {
        self.binary(
            Self::relational,
            &["==", "!=", "eq", "ne"],
            PREC_COMPARE,
            |op| comparison(op).into(),
        )
    }

    fn relational(&mut self) -> Res<Emitted> {
        self.binary(
            Self::additive,
            &["<", ">", "<=", ">=", "lt", "gt", "le", "ge"],
            PREC_COMPARE,
            |op| comparison(op).into(),
        )
    }

    fn additive(&mut self) -> Res<Emitted> {
        self.binary(
            Self::multiplicative_operand,
            &["+", "-"],
            PREC_ADD,
            str::to_string,
        )
    }

    fn multiplicative_operand(&mut self) -> Res<Emitted> {
        let result = self.binary(Self::unary, &["*", "/", "div"], PREC_MUL, |op| {
            if op == "div" {
                "/".into()
            } else {
                op.into()
            }
        })?;
        if self.accept(&["%", "mod"]).is_some() {
            return refuse("remainder (%) has a different sign rule in FEEL's modulo()");
        }
        Ok(result)
    }

    fn unary(&mut self) -> Res<Emitted> {
        if self.accept(&["!", "not"]).is_some() {
            let operand = self.unary()?;
            return Ok(Emitted {
                text: format!("not({})", operand.text),
                prec: PREC_ATOM,
            });
        }
        if self.accept(&["-"]).is_some() {
            let operand = self.unary()?;
            let text = if operand.prec <= PREC_UNARY {
                format!("({})", operand.text)
            } else {
                operand.text
            };
            return Ok(Emitted {
                text: format!("-{text}"),
                prec: PREC_UNARY,
            });
        }
        if self.accept(&["empty"]).is_some() {
            return refuse("\"empty\" is true for null, \"\" and empty collections alike");
        }
        self.value()
    }

    fn value(&mut self) -> Res<Emitted> {
        let Some(token) = self.peek().cloned() else {
            return refuse("expression ends early");
        };
        self.pos += 1;
        match token {
            Token::Num(t) => Ok(Emitted {
                text: t,
                prec: PREC_ATOM,
            }),
            Token::Str(v) => Ok(Emitted {
                text: feel_string(&v),
                prec: PREC_ATOM,
            }),
            Token::Op(t) => {
                if t == "(" {
                    let inner = self.or()?;
                    if self.accept(&[")"]).is_none() {
                        return refuse("unbalanced parentheses");
                    }
                    return Ok(Emitted {
                        text: format!("({})", inner.text),
                        prec: PREC_ATOM,
                    });
                }
                refuse(format!("unsupported syntax at \"{t}\""))
            }
            Token::Id(t) => {
                if t == "true" || t == "false" || t == "null" {
                    return Ok(Emitted {
                        text: t,
                        prec: PREC_ATOM,
                    });
                }
                let mut path = vec![self.name(&t, true)?];
                loop {
                    match self.peek() {
                        Some(Token::Op(t)) if t == "[" => {
                            return refuse(
                                "indexing ([…]) is zero-based in JUEL and one-based in FEEL",
                            );
                        }
                        Some(Token::Op(t)) if t == "(" => {
                            return refuse(format!(
                                "method or function call \"{}(…)\" has no FEEL equivalent",
                                path.join(".")
                            ));
                        }
                        _ => {}
                    }
                    if self.accept(&["."]).is_none() {
                        break;
                    }
                    let Some(Token::Id(member)) = self.peek().cloned() else {
                        return refuse("a property name must follow '.'");
                    };
                    self.pos += 1;
                    path.push(self.name(&member, false)?);
                }
                Ok(Emitted {
                    text: path.join("."),
                    prec: PREC_ATOM,
                })
            }
        }
    }

    fn name(&self, text: &str, head: bool) -> Res<String> {
        if head && C7_ENGINE_OBJECTS.contains(&text) {
            return refuse(format!(
                "\"{text}\" is a Camunda 7 engine object with no Camunda 8 counterpart"
            ));
        }
        if head {
            if let Some((_, renamed)) = MULTI_INSTANCE_RENAMES
                .iter()
                .find(|(from, _)| *from == text)
            {
                if !self.options.multi_instance {
                    return refuse(format!(
                        "\"{text}\" exists only in a multi-instance completion condition"
                    ));
                }
                return Ok((*renamed).to_string());
            }
        }
        if !is_feel_name(text) {
            return refuse(format!("\"{text}\" is not a valid FEEL name"));
        }
        Ok(text.to_string())
    }
}

/// Translates one JUEL expression (the whole text must be a single `${…}` or
/// `#{…}`) into FEEL.
///
/// ```
/// use bpmnkit_bpmn::juel::{translate_juel_to_feel, JuelToFeelOptions, JuelToFeelResult};
/// assert_eq!(
///     translate_juel_to_feel("${order.total > 100 && approved}", JuelToFeelOptions::default()),
///     JuelToFeelResult::Ok { feel: "order.total > 100 and approved".into() },
/// );
/// ```
pub fn translate_juel_to_feel(expression: &str, options: JuelToFeelOptions) -> JuelToFeelResult {
    let trimmed = js_trim(expression);
    let wrapped = trimmed.len() >= 3
        && (trimmed.starts_with("${") || trimmed.starts_with("#{"))
        && trimmed.ends_with('}');
    if !wrapped {
        return JuelToFeelResult::Refused {
            reason: if contains_juel(trimmed) {
                "text mixed with ${…} is string templating, which FEEL does not do implicitly"
            } else {
                "not a JUEL expression"
            }
            .into(),
        };
    }
    let inner = &trimmed[2..trimmed.len() - 1];
    let emitted = lex(inner).and_then(|tokens| {
        Parser {
            tokens,
            pos: 0,
            options: &options,
        }
        .parse()
    });
    match emitted {
        Err(Refusal(reason)) => JuelToFeelResult::Refused { reason },
        Ok(emitted) => {
            let parsed = parse_partial(&emitted.text, &ParseOptions::default());
            match parsed.errors.first() {
                Some(e) => JuelToFeelResult::Refused {
                    reason: format!("translation is not valid FEEL: {}", e.message),
                },
                None => JuelToFeelResult::Ok { feel: emitted.text },
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn t(juel: &str) -> JuelToFeelResult {
        translate_juel_to_feel(juel, JuelToFeelOptions::default())
    }

    fn ok(feel: &str) -> JuelToFeelResult {
        JuelToFeelResult::Ok { feel: feel.into() }
    }

    #[test]
    fn translates_the_table() {
        let rows: &[(&str, &str)] = &[
            ("${approved}", "approved"),
            ("${order.customer.vip}", "order.customer.vip"),
            ("#{amount}", "amount"),
            ("${'EUR'}", "\"EUR\""),
            ("${\"say \\\"hi\\\"\"}", "\"say \\\"hi\\\"\""),
            ("${42}", "42"),
            ("${3.25}", "3.25"),
            ("${true}", "true"),
            ("${null}", "null"),
            ("${a == b}", "a = b"),
            ("${status eq 'open'}", "status = \"open\""),
            ("${a != b}", "a != b"),
            ("${a ne b}", "a != b"),
            ("${total < 100}", "total < 100"),
            ("${total lt 100}", "total < 100"),
            ("${total >= 100}", "total >= 100"),
            ("${total ge 100}", "total >= 100"),
            ("${total gt 100}", "total > 100"),
            ("${total le 100}", "total <= 100"),
            ("${a && b}", "a and b"),
            ("${a and b}", "a and b"),
            ("${a || b}", "a or b"),
            ("${a or b and c}", "a or b and c"),
            ("${(a or b) and c}", "(a or b) and c"),
            ("${!approved}", "not(approved)"),
            ("${not approved}", "not(approved)"),
            ("${!(a && b)}", "not((a and b))"),
            ("${a + b * c}", "a + b * c"),
            ("${(a + b) * c}", "(a + b) * c"),
            ("${a - (b - c)}", "a - (b - c)"),
            ("${a div 2}", "a / 2"),
            ("${-x}", "-x"),
            ("${a < b == c}", "(a < b) = c"),
            (
                "${approved && order.total <= 1000}",
                "approved and order.total <= 1000",
            ),
            ("${ order.total > 100 }", "order.total > 100"),
        ];
        for (juel, feel) in rows {
            assert_eq!(t(juel), ok(feel), "{juel}");
        }
    }

    #[test]
    fn refuses_what_it_cannot_prove() {
        let rows: &[(&str, &str)] = &[
            ("${execution.getVariable('x')}", "engine object"),
            ("${task.assignee}", "engine object"),
            ("${authenticatedUserId}", "engine object"),
            ("${inventory.reserve(order)}", "method or function call"),
            ("${now()}", "method or function call"),
            ("${empty items}", "empty"),
            ("${a ? b : c}", "conditional operator"),
            ("${items[0]}", "indexing"),
            ("${count % 2}", "remainder"),
            ("${count mod 2}", "remainder"),
            ("Hello ${name}", "string templating"),
            ("plain text", "not a JUEL expression"),
            ("${nrOfInstances > 2}", "multi-instance"),
            ("${for}", "not a valid FEEL name"),
            ("${a$b}", "not a valid FEEL name"),
            ("${1e3}", "no exact FEEL form"),
            ("${10L}", "no exact FEEL form"),
            ("${(a}", "unbalanced"),
            ("${'open}", "unterminated"),
            ("${}", "empty expression"),
            ("${a @ b}", "unexpected character"),
        ];
        for (juel, because) in rows {
            match t(juel) {
                JuelToFeelResult::Refused { reason } => {
                    assert!(reason.contains(because), "{juel}: {reason}")
                }
                other => panic!("{juel} translated: {other:?}"),
            }
        }
    }

    #[test]
    fn renames_the_multi_instance_counters() {
        let mi = JuelToFeelOptions {
            multi_instance: true,
        };
        assert_eq!(
            translate_juel_to_feel("${nrOfCompletedInstances / nrOfInstances >= 0.6}", mi),
            ok("numberOfCompletedInstances / numberOfInstances >= 0.6")
        );
        assert_eq!(
            translate_juel_to_feel("${nrOfActiveInstances == 0}", mi),
            ok("numberOfActiveInstances = 0")
        );
    }

    /// Regression: TS looked the head up with `in`, which also finds `Object.prototype`
    /// members, so a variable called `constructor` was refused as multi-instance only.
    #[test]
    fn variables_named_like_object_members_translate() {
        for name in [
            "constructor",
            "toString",
            "valueOf",
            "hasOwnProperty",
            "__proto__",
        ] {
            assert_eq!(t(&format!("${{{name} == 1}}")), ok(&format!("{name} = 1")));
        }
    }

    #[test]
    fn helpers() {
        assert!(contains_juel("a #{b}") && !contains_juel("a {b}"));
        assert_eq!(feel_string("a\"b\\c\n\t"), "\"a\\\"b\\\\c\\n\\t\"");
        assert!(is_feel_name("a_1") && !is_feel_name("1a") && !is_feel_name("for"));
        assert!(!is_feel_name("function") && !is_feel_name(""));
    }
}
