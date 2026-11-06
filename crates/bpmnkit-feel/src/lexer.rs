//! Tokenizer. Port of `packages/feel/src/lexer.ts`. Offsets are byte offsets.
// STUB: filled in by the lexer/parser port.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TokenKind {
    Number,
    String,
    Temporal,
    Name,
    Keyword,
    Op,
    Punct,
    Comment,
    Whitespace,
    Backtick,
    Unknown,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Token {
    pub kind: TokenKind,
    pub value: String,
    pub start: usize,
    pub end: usize,
}

pub fn tokenize(_input: &str) -> Vec<Token> {
    todo!("lexer port")
}

/// Resolves the escapes of a string literal body (without quotes).
pub fn unescape_string(_body: &str) -> String {
    todo!("lexer port")
}
