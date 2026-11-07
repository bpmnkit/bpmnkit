//! Tokenizer. Port of `packages/feel/src/lexer.ts`. Offsets are byte offsets.

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

const KEYWORDS: [&str; 20] = [
    "true",
    "false",
    "null",
    "if",
    "then",
    "else",
    "for",
    "in",
    "return",
    "some",
    "every",
    "satisfies",
    "function",
    "external",
    "not",
    "and",
    "or",
    "between",
    "instance",
    "of",
];

fn is_digit(c: Option<u8>) -> bool {
    matches!(c, Some(b'0'..=b'9'))
}

fn is_letter(c: u8) -> bool {
    // FEEL names are not limited to ASCII: every byte of a multi-byte UTF-8
    // sequence is above the ASCII range, so anything non-ASCII is a name
    // character, which covers accented letters and emoji alike.
    c.is_ascii_alphabetic() || c > 0x7f
}

fn is_whitespace(c: u8) -> bool {
    matches!(c, b' ' | b'\t' | b'\n' | b'\r')
}

/// End of an exponent starting at `i` ("e4", "e+4", "e-4"), or `i` if none.
fn read_exponent(input: &[u8], i: usize) -> usize {
    if !matches!(input.get(i), Some(b'e' | b'E')) {
        return i;
    }
    let mut j = i + 1;
    if matches!(input.get(j), Some(b'+' | b'-')) {
        j += 1;
    }
    if !is_digit(input.get(j).copied()) {
        return i;
    }
    while is_digit(input.get(j).copied()) {
        j += 1;
    }
    j
}

pub fn tokenize(input: &str) -> Vec<Token> {
    let bytes = input.as_bytes();
    let len = bytes.len();
    let mut tokens = Vec::new();
    let mut i = 0;
    // Unterminated literals run to the end of the input; clamp so slicing is safe.
    let push = |tokens: &mut Vec<Token>, kind: TokenKind, start: usize, end: usize| {
        let end = end.min(len);
        tokens.push(Token {
            kind,
            value: input[start..end].to_string(),
            start,
            end,
        });
    };

    while i < len {
        let start = i;
        let c = bytes[i];
        let next = bytes.get(i + 1).copied();

        if c == b'/' && next == Some(b'/') {
            i += 2;
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            push(&mut tokens, TokenKind::Comment, start, i);
            continue;
        }

        if c == b'/' && next == Some(b'*') {
            i += 2;
            while i < len && !(bytes[i] == b'*' && bytes.get(i + 1) == Some(&b'/')) {
                i += 1;
            }
            i += 2;
            push(&mut tokens, TokenKind::Comment, start, i);
            continue;
        }

        if (c == b'@' && next == Some(b'"')) || c == b'"' {
            i += if c == b'@' { 2 } else { 1 };
            while i < len && bytes[i] != b'"' {
                if bytes[i] == b'\\' {
                    i += 1;
                }
                i += 1;
            }
            i += 1;
            let kind = if c == b'@' {
                TokenKind::Temporal
            } else {
                TokenKind::String
            };
            push(&mut tokens, kind, start, i);
            continue;
        }

        if c == b'`' {
            i += 1;
            while i < len && bytes[i] != b'`' {
                i += 1;
            }
            i += 1;
            // The value excludes the backticks (and the closing one only if present).
            let value_end = if i > len { len } else { i - 1 };
            tokens.push(Token {
                kind: TokenKind::Backtick,
                value: input[start + 1..value_end].to_string(),
                start,
                end: i.min(len),
            });
            continue;
        }

        if is_whitespace(c) {
            while i < len && is_whitespace(bytes[i]) {
                i += 1;
            }
            push(&mut tokens, TokenKind::Whitespace, start, i);
            continue;
        }

        if matches!(
            (c, next),
            (b'*', Some(b'*'))
                | (b'>', Some(b'='))
                | (b'<', Some(b'='))
                | (b'!', Some(b'='))
                | (b'-', Some(b'>'))
                | (b'.', Some(b'.'))
        ) {
            push(&mut tokens, TokenKind::Op, i, i + 2);
            i += 2;
            continue;
        }
        // "==" is not standard FEEL but users familiar with JS/Java write it; treat as "=".
        if c == b'=' && next == Some(b'=') {
            tokens.push(Token {
                kind: TokenKind::Op,
                value: "=".to_string(),
                start,
                end: i + 2,
            });
            i += 2;
            continue;
        }

        if matches!(c, b'+' | b'-' | b'*' | b'/' | b'=' | b'<' | b'>' | b'?') {
            push(&mut tokens, TokenKind::Op, i, i + 1);
            i += 1;
            continue;
        }

        if matches!(c, b'(' | b')' | b'[' | b']' | b'{' | b'}' | b',' | b':') {
            push(&mut tokens, TokenKind::Punct, i, i + 1);
            i += 1;
            continue;
        }

        // Dot (not ".." and not the start of a number like ".872")
        if c == b'.' && !is_digit(next) {
            push(&mut tokens, TokenKind::Punct, i, i + 1);
            i += 1;
            continue;
        }

        // A leading "." is allowed (".872"), and ".." is never part of a number.
        if is_digit(Some(c)) || (c == b'.' && is_digit(next)) {
            while is_digit(bytes.get(i).copied()) {
                i += 1;
            }
            // Consume a fraction only if '.' is followed by a digit (not '..').
            if bytes.get(i) == Some(&b'.') && is_digit(bytes.get(i + 1).copied()) {
                i += 1;
                while is_digit(bytes.get(i).copied()) {
                    i += 1;
                }
            }
            i = read_exponent(bytes, i);
            push(&mut tokens, TokenKind::Number, start, i);
            continue;
        }

        if is_letter(c) || c == b'_' {
            i += 1;
            while i < len && (is_letter(bytes[i]) || bytes[i].is_ascii_digit() || bytes[i] == b'_')
            {
                i += 1;
            }
            let kind = if KEYWORDS.contains(&&input[start..i]) {
                TokenKind::Keyword
            } else {
                TokenKind::Name
            };
            push(&mut tokens, kind, start, i);
            continue;
        }

        // Only ASCII reaches here: everything non-ASCII is a name character.
        push(&mut tokens, TokenKind::Unknown, i, i + 1);
        i += 1;
    }

    tokens
}

fn simple_escape(c: char) -> Option<char> {
    match c {
        '\'' => Some('\''),
        '"' => Some('"'),
        '\\' => Some('\\'),
        'n' => Some('\n'),
        'r' => Some('\r'),
        't' => Some('\t'),
        _ => None,
    }
}

/// The hex digits (at most `max`) starting at char index `from`.
fn hex_digits(chars: &[char], from: usize, max: usize) -> String {
    chars
        .iter()
        .skip(from)
        .take(max)
        .take_while(|c| c.is_ascii_hexdigit())
        .collect()
}

/// A `\uXXXX` escape right after a high surrogate, if it is a low surrogate.
fn low_surrogate_at(chars: &[char], at: usize) -> Option<u32> {
    if chars.get(at) != Some(&'\\') || chars.get(at + 1) != Some(&'u') {
        return None;
    }
    let digits = hex_digits(chars, at + 2, 4);
    if digits.len() != 4 {
        return None;
    }
    let low = u32::from_str_radix(&digits, 16).ok()?;
    (0xdc00..0xe000).contains(&low).then_some(low)
}

/// Decodes a `\u`/`\U` escape at `i`: the character and how many chars the
/// escape spans, or `None` when it is not a valid one.
fn read_code_point(chars: &[char], i: usize) -> Option<(char, usize)> {
    let is_u = chars[i + 1] == 'u';
    let digits = hex_digits(chars, i + 2, if is_u { 4 } else { 6 });
    // \u takes exactly four digits; \U takes as many as still form a code point,
    // so "\U101EF0" is \U101EF followed by a literal "0".
    let min_length = if is_u { 4 } else { 1 };
    let mut len = digits.len();
    while len >= min_length && len > 0 {
        if is_u && len != 4 {
            break;
        }
        let code = u32::from_str_radix(&digits[..len], 16).ok()?;
        if code <= 0x10ffff {
            // JS strings can hold half a surrogate pair, so a high surrogate
            // escape followed by a low surrogate escape is one character.
            if is_u && (0xd800..0xdc00).contains(&code) {
                if let Some(low) = low_surrogate_at(chars, i + 6) {
                    let c = 0x10000 + ((code - 0xd800) << 10) + (low - 0xdc00);
                    return char::from_u32(c).map(|c| (c, 12));
                }
            }
            // A lone surrogate cannot live in a Rust string.
            return Some((char::from_u32(code).unwrap_or('\u{fffd}'), 2 + len));
        }
        len -= 1;
    }
    None
}

/// Decodes the escape sequences of a FEEL string literal body (the text between
/// the quotes). Recognizes \' \" \\ \n \r \t, \uXXXX and the extended
/// \UXXXXXX form; an unrecognized sequence is left as written, since dropping
/// the backslash would silently alter the author's data.
pub fn unescape_string(body: &str) -> String {
    if !body.contains('\\') {
        return body.to_string();
    }
    let chars: Vec<char> = body.chars().collect();
    let mut out = String::with_capacity(body.len());
    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];
        if c != '\\' || i + 1 >= chars.len() {
            out.push(c);
            i += 1;
            continue;
        }
        if let Some(simple) = simple_escape(chars[i + 1]) {
            out.push(simple);
            i += 2;
            continue;
        }
        if matches!(chars[i + 1], 'u' | 'U') {
            if let Some((decoded, length)) = read_code_point(&chars, i) {
                out.push(decoded);
                i += length;
                continue;
            }
        }
        out.push(c);
        i += 1;
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use TokenKind::{
        Backtick, Comment, Keyword, Name, Number, Op, Punct, Temporal, Unknown, Whitespace,
    };

    fn kinds(input: &str) -> Vec<TokenKind> {
        tokenize(input).iter().map(|t| t.kind).collect()
    }

    fn values(input: &str) -> Vec<String> {
        tokenize(input).into_iter().map(|t| t.value).collect()
    }

    #[test]
    fn numbers() {
        assert_eq!(kinds("42"), [Number]);
        assert_eq!(kinds("3.14"), [Number]);
        assert_eq!(values(".872"), [".872"]);
        assert_eq!(values("1.5e-3"), ["1.5e-3"]);
        assert_eq!(values("1e"), ["1", "e"]);
    }

    #[test]
    fn strings() {
        assert_eq!(kinds("\"hello\""), [TokenKind::String]);
        assert_eq!(values("\"hello\""), ["\"hello\""]);
        assert_eq!(values(r#""a\"b""#), [r#""a\"b""#]);
    }

    #[test]
    fn unterminated_literals_run_to_the_end() {
        let t = tokenize("\"abc");
        assert_eq!((t[0].value.as_str(), t[0].end), ("\"abc", 4));
        let t = tokenize("`abc");
        assert_eq!((t[0].value.as_str(), t[0].end), ("abc", 4));
        assert_eq!(tokenize("/* x")[0].end, 4);
    }

    #[test]
    fn temporal() {
        let t = tokenize("@\"2021-01-01\"");
        assert_eq!(t[0].kind, Temporal);
        assert_eq!(t[0].value, "@\"2021-01-01\"");
    }

    #[test]
    fn backtick_names() {
        let t = tokenize("`First Name`");
        assert_eq!(t[0].kind, Backtick);
        assert_eq!(t[0].value, "First Name");
    }

    #[test]
    fn keywords_and_names() {
        for k in ["true", "false", "null", "if", "and"] {
            assert_eq!(kinds(k), [Keyword]);
        }
        assert_eq!(kinds("foo"), [Name]);
        assert_eq!(kinds("myVar"), [Name]);
        assert_eq!(kinds("größe_1"), [Name]);
    }

    #[test]
    fn operators() {
        for o in ["**", "..", ">=", "<=", "!=", "->", "+", "-", "*", "/", "?"] {
            assert_eq!(kinds(o), [Op], "{o}");
        }
        assert_eq!(values("a == b"), ["a", " ", "=", " ", "b"]);
        assert_eq!(values("2**3"), ["2", "**", "3"]);
        assert_eq!(values("1..5"), ["1", "..", "5"]);
    }

    #[test]
    fn punctuation() {
        for p in ["(", ")", "[", "]", "{", "}", ",", ":", "."] {
            assert_eq!(kinds(p), [Punct], "{p}");
        }
    }

    #[test]
    fn comments_and_whitespace() {
        let t = tokenize("x // comment\ny");
        let comment = t.iter().find(|t| t.kind == Comment).unwrap();
        assert_eq!(comment.value, "// comment");
        let t = tokenize("x /* block */ y");
        let comment = t.iter().find(|t| t.kind == Comment).unwrap();
        assert_eq!(comment.value, "/* block */");
        assert_eq!(tokenize("a b")[1].kind, Whitespace);
    }

    #[test]
    fn positions_are_byte_offsets() {
        let t = tokenize("42 + 3");
        assert_eq!((t[0].start, t[0].end), (0, 2));
        assert_eq!((t[2].start, t[2].end), (3, 4));
        let t = tokenize("é+1");
        assert_eq!((t[0].start, t[0].end), (0, 2));
        assert_eq!(t[1].start, 2);
    }

    #[test]
    fn empty_input() {
        assert!(tokenize("").is_empty());
    }

    #[test]
    fn unknown_character() {
        assert_eq!(kinds("#"), [Unknown]);
    }

    #[test]
    fn unescape() {
        assert_eq!(unescape_string("plain"), "plain");
        assert_eq!(unescape_string(r#"a\"b\n\t\\\'"#), "a\"b\n\t\\'");
        assert_eq!(unescape_string(r"A"), "A");
        assert_eq!(unescape_string(r"\U01F600"), "\u{1F600}");
        assert_eq!(unescape_string(r"😀"), "\u{1F600}");
        assert_eq!(unescape_string(r"\U101EF0"), "\u{101EF0}");
        assert_eq!(unescape_string(r"\u00"), r"\u00");
        assert_eq!(unescape_string(r"\q"), r"\q");
        assert_eq!(unescape_string("a\\"), "a\\");
        assert_eq!(unescape_string(r"\U110000"), "\u{11000}0");
    }
}
