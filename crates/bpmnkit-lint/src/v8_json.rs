//! V8's `JSON.parse` error messages (Node 22), so a lint finding about broken JSON reads
//! the same from both implementations. Only the first error is located; the value is not
//! built (serde does that).

const CONTEXT: usize = 10;

struct P<'a> {
    s: &'a [u16],
    i: usize,
}

enum Err {
    Eos,
    /// An unexpected character at the position, with no more specific message.
    Token,
    /// `Unexpected number`.
    Number,
    Msg(&'static str),
}

type R = Result<(), (Err, usize)>;

fn is_ws(c: u16) -> bool {
    matches!(c, 0x20 | 0x09 | 0x0A | 0x0D)
}

fn is_digit(c: Option<u16>) -> bool {
    c.is_some_and(|c| (b'0' as u16..=b'9' as u16).contains(&c))
}

impl P<'_> {
    fn peek(&self) -> Option<u16> {
        self.s.get(self.i).copied()
    }

    fn ws(&mut self) {
        while self.peek().is_some_and(is_ws) {
            self.i += 1;
        }
    }

    fn fail<T>(&self, e: Err) -> Result<T, (Err, usize)> {
        let e = match (e, self.peek()) {
            (Err::Token, None) => Err::Eos,
            (e, _) => e,
        };
        Err((e, self.i))
    }

    fn value(&mut self) -> R {
        self.ws();
        match self.peek() {
            None => self.fail(Err::Eos),
            Some(0x22) => self.string(),
            Some(0x7B) => self.object(),
            Some(0x5B) => self.array(),
            Some(0x74) => self.literal("true"),
            Some(0x66) => self.literal("false"),
            Some(0x6E) => self.literal("null"),
            Some(c) if c == b'-' as u16 || is_digit(Some(c)) => self.number(),
            Some(_) => self.fail(Err::Token),
        }
    }

    fn literal(&mut self, word: &str) -> R {
        for c in word.encode_utf16() {
            if self.peek() != Some(c) {
                return self.fail(Err::Token);
            }
            self.i += 1;
        }
        Ok(())
    }

    fn digits(&mut self) {
        while is_digit(self.peek()) {
            self.i += 1;
        }
    }

    fn number(&mut self) -> R {
        if self.peek() == Some(b'-' as u16) {
            self.i += 1;
            if !is_digit(self.peek()) {
                return self.fail(Err::Msg("No number after minus sign"));
            }
        }
        if self.peek() == Some(b'0' as u16) {
            self.i += 1;
            if is_digit(self.peek()) {
                return self.fail(Err::Number);
            }
        } else {
            self.digits();
        }
        if self.peek() == Some(b'.' as u16) {
            self.i += 1;
            if !is_digit(self.peek()) {
                return self.fail(Err::Msg("Unterminated fractional number"));
            }
            self.digits();
        }
        if matches!(self.peek(), Some(0x65 | 0x45)) {
            self.i += 1;
            if matches!(self.peek(), Some(0x2B | 0x2D)) {
                self.i += 1;
            }
            if !is_digit(self.peek()) {
                return self.fail(Err::Msg("Exponent part is missing a number"));
            }
            self.digits();
        }
        Ok(())
    }

    fn string(&mut self) -> R {
        self.i += 1;
        loop {
            match self.peek() {
                None => return self.fail(Err::Msg("Unterminated string")),
                Some(0x22) => {
                    self.i += 1;
                    return Ok(());
                }
                Some(0x5C) => {
                    self.i += 1;
                    match self.peek() {
                        None => return self.fail(Err::Eos),
                        Some(0x75) => {
                            self.i += 1;
                            for _ in 0..4 {
                                if !self.peek().is_some_and(|c| {
                                    char::from_u32(c as u32).is_some_and(|c| c.is_ascii_hexdigit())
                                }) {
                                    return self.fail(Err::Msg("Bad Unicode escape"));
                                }
                                self.i += 1;
                            }
                        }
                        Some(c) if "\"\\/bfnrt".encode_utf16().any(|x| x == c) => self.i += 1,
                        Some(_) => return self.fail(Err::Msg("Bad escaped character")),
                    }
                }
                Some(c) if c < 0x20 => {
                    return self.fail(Err::Msg("Bad control character in string literal"))
                }
                Some(_) => self.i += 1,
            }
        }
    }

    fn object(&mut self) -> R {
        self.i += 1;
        self.ws();
        match self.peek() {
            Some(0x7D) => {
                self.i += 1;
                return Ok(());
            }
            Some(0x22) => {}
            _ => return self.fail(Err::Msg("Expected property name or '}'")),
        }
        loop {
            self.string()?;
            self.ws();
            if self.peek() != Some(0x3A) {
                return self.fail(Err::Msg("Expected ':' after property name"));
            }
            self.i += 1;
            self.value()?;
            self.ws();
            match self.peek() {
                Some(0x2C) => {
                    self.i += 1;
                    self.ws();
                    if self.peek() != Some(0x22) {
                        return self.fail(Err::Msg("Expected double-quoted property name"));
                    }
                }
                Some(0x7D) => {
                    self.i += 1;
                    return Ok(());
                }
                _ => return self.fail(Err::Msg("Expected ',' or '}' after property value")),
            }
        }
    }

    fn array(&mut self) -> R {
        self.i += 1;
        self.ws();
        if self.peek() == Some(0x5D) {
            self.i += 1;
            return Ok(());
        }
        loop {
            self.value()?;
            self.ws();
            match self.peek() {
                Some(0x2C) => self.i += 1,
                Some(0x5D) => {
                    self.i += 1;
                    return Ok(());
                }
                _ => return self.fail(Err::Msg("Expected ',' or ']' after array element")),
            }
        }
    }
}

fn location(s: &[u16], pos: usize) -> (usize, usize) {
    let mut line = 1;
    let mut last_break = 0;
    let mut i = 0;
    while i < pos {
        if s[i] == 0x0D && i + 1 < pos && s[i + 1] == 0x0A {
            i += 1;
        }
        if s[i] == 0x0D || s[i] == 0x0A {
            line += 1;
            last_break = i + 1;
        }
        i += 1;
    }
    (line, 1 + pos - last_break)
}

/// The message `JSON.parse(text)` throws, or `None` when V8 accepts the text.
pub(crate) fn syntax_error(text: &str) -> Option<String> {
    let s: Vec<u16> = text.encode_utf16().collect();
    let mut p = P { s: &s, i: 0 };
    let result = p.value().and_then(|()| {
        p.ws();
        if p.peek().is_some() {
            p.fail(Err::Msg("Unexpected non-whitespace character after JSON"))
        } else {
            Ok(())
        }
    });
    let (err, pos) = result.err()?;
    let at = |what: &str| {
        let (line, column) = location(&s, pos);
        // The one message that already names JSON drops the "in JSON".
        let what = what
            .strip_suffix(" after JSON")
            .map_or(format!("{what} in JSON"), |w| format!("{w} after JSON"));
        format!("{what} at position {pos} (line {line} column {column})")
    };
    Some(match err {
        Err::Eos => "Unexpected end of JSON input".into(),
        Err::Number => at("Unexpected number"),
        Err::Msg(m) => at(m),
        Err::Token if ["undefined", "NaN", "Infinity", "[object Object]"].contains(&text) => {
            format!("\"{text}\" is not valid JSON")
        }
        Err::Token => {
            let token = String::from_utf16_lossy(&s[pos..pos + 1]);
            let len = s.len();
            let slice = |a: usize, b: usize| String::from_utf16_lossy(&s[a..b.min(len)]);
            let context = if len <= CONTEXT * 2 + 1 {
                format!("\"{text}\"")
            } else if pos < CONTEXT {
                format!("\"{}\"...", slice(0, pos + CONTEXT))
            } else if pos < len - CONTEXT {
                format!("...\"{}\"...", slice(pos - CONTEXT, pos + CONTEXT))
            } else {
                format!("...\"{}\"", slice(pos - CONTEXT, len))
            };
            format!("Unexpected token '{token}', {context} is not valid JSON")
        }
    })
}

#[cfg(test)]
mod tests {
    use super::syntax_error;

    #[test]
    fn messages_match_v8() {
        // Recorded with Node 22.
        let cases = [
            (
                "{ id: 1, }",
                "Expected property name or '}' in JSON at position 2 (line 1 column 3)",
            ),
            (
                "[1, x]",
                "Unexpected token 'x', \"[1, x]\" is not valid JSON",
            ),
            (
                "{\"a\":1",
                "Expected ',' or '}' after property value in JSON at position 6 (line 1 column 7)",
            ),
            ("", "Unexpected end of JSON input"),
            (
                "{\"a\" 1}",
                "Expected ':' after property name in JSON at position 5 (line 1 column 6)",
            ),
            (
                "\"abc",
                "Unterminated string in JSON at position 4 (line 1 column 5)",
            ),
            ("[1,]", "Unexpected token ']', \"[1,]\" is not valid JSON"),
            (
                "-",
                "No number after minus sign in JSON at position 1 (line 1 column 2)",
            ),
            (
                "1e",
                "Exponent part is missing a number in JSON at position 2 (line 1 column 3)",
            ),
            (
                "1.",
                "Unterminated fractional number in JSON at position 2 (line 1 column 3)",
            ),
            (
                "{} x",
                "Unexpected non-whitespace character after JSON at position 3 (line 1 column 4)",
            ),
            (
                "\"\\q\"",
                "Bad escaped character in JSON at position 2 (line 1 column 3)",
            ),
            (
                "\"a\nb\"",
                "Bad control character in string literal in JSON at position 2 (line 1 column 3)",
            ),
            ("tru", "Unexpected end of JSON input"),
            (
                "{\"a\":1,}",
                "Expected double-quoted property name in JSON at position 7 (line 1 column 8)",
            ),
            (
                "01",
                "Unexpected number in JSON at position 1 (line 1 column 2)",
            ),
            (
                "\"\\u12g4\"",
                "Bad Unicode escape in JSON at position 5 (line 1 column 6)",
            ),
            (
                "\"\\u",
                "Bad Unicode escape in JSON at position 3 (line 1 column 4)",
            ),
            ("\"\\", "Unexpected end of JSON input"),
            ("NaN", "\"NaN\" is not valid JSON"),
            (
                "\n\n  {x",
                "Expected property name or '}' in JSON at position 5 (line 3 column 4)",
            ),
            (
                "[1,2,3,4,5,6,7,8,9,10,11,12, x]",
                "Unexpected token 'x', ...\"10,11,12, x]\" is not valid JSON",
            ),
            (
                "[1,2,3,4,5,6,7,8,9,10,11,12,13,xyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy]",
                "Unexpected token 'x', ...\",11,12,13,xyyyyyyyyy\"... is not valid JSON",
            ),
            (
                "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx[",
                "Unexpected token 'x', \"xxxxxxxxxx\"... is not valid JSON",
            ),
            (
                "[1E-x]",
                "Exponent part is missing a number in JSON at position 4 (line 1 column 5)",
            ),
        ];
        for (text, message) in cases {
            assert_eq!(syntax_error(text).as_deref(), Some(message), "{text:?}");
        }
        assert_eq!(syntax_error("{\"a\":[1,true,null,\"\\u00e9\"]}"), None);
    }
}
