//! Parser. Port of `packages/feel/src/parser.ts`.
// STUB: filled in by the lexer/parser port.

use crate::ast::Node;

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

pub fn parse_expression(_input: &str, _options: &ParseOptions) -> ParseResult {
    todo!("parser port")
}

pub fn parse_unary_tests(_input: &str, _options: &ParseOptions) -> ParseResult {
    todo!("parser port")
}
