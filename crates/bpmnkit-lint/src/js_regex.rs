//! Whether `new RegExp(pattern)` (no flags, so Annex B syntax) throws, with V8's message
//! (Node 22). Only syntax is checked; nothing is compiled.

struct P<'a> {
    s: &'a [u16],
    i: usize,
    named: bool,
    names: Vec<Vec<u16>>,
    references: Vec<Vec<u16>>,
}

type R<T = ()> = Result<T, &'static str>;

const fn u(c: char) -> u16 {
    c as u16
}

fn is_digit(c: Option<u16>) -> bool {
    c.is_some_and(|c| (u('0')..=u('9')).contains(&c))
}

fn hex(c: u16) -> Option<u32> {
    char::from_u32(c as u32).and_then(|c| c.to_digit(16))
}

/// What one atom of a character class stands for.
enum ClassAtom {
    Char(u32),
    /// `\d`, `\w`, … — not a single character, so never a range endpoint that is out of order.
    Set,
}

impl P<'_> {
    fn peek(&self) -> Option<u16> {
        self.s.get(self.i).copied()
    }

    fn at(&self, k: usize) -> Option<u16> {
        self.s.get(self.i + k).copied()
    }

    fn eat(&mut self, c: char) -> bool {
        if self.peek() == Some(u(c)) {
            self.i += 1;
            true
        } else {
            false
        }
    }

    fn disjunction(&mut self, depth: usize) -> R {
        loop {
            self.alternative()?;
            match self.peek() {
                Some(c) if c == u('|') => self.i += 1,
                Some(c) if c == u(')') => {
                    if depth == 0 {
                        return Err("Unmatched ')'");
                    }
                    self.i += 1;
                    return Ok(());
                }
                None if depth > 0 => return Err("Unterminated group"),
                _ => return Ok(()),
            }
        }
    }

    fn alternative(&mut self) -> R {
        // What the last term can take: a quantifier (`Some(true)`), "Invalid quantifier"
        // (`Some(false)`, a lookbehind), or nothing to repeat (`None`).
        let mut quantifiable: Option<bool> = None;
        loop {
            let Some(c) = self.peek() else { return Ok(()) };
            if c == u('|') || c == u(')') {
                return Ok(());
            }
            if let Some(()) = self.quantifier()? {
                match quantifiable {
                    None => return Err("Nothing to repeat"),
                    Some(false) => return Err("Invalid quantifier"),
                    Some(true) => {}
                }
                quantifiable = None;
                continue;
            }
            quantifiable = self.term()?;
        }
    }

    /// Reads a quantifier at the cursor, if there is one (a `{` that does not form one is
    /// a literal in Annex B).
    fn quantifier(&mut self) -> R<Option<()>> {
        let start = self.i;
        match self.peek() {
            Some(c) if c == u('*') || c == u('+') || c == u('?') => self.i += 1,
            Some(c) if c == u('{') => {
                self.i += 1;
                let Some(min) = self.number() else {
                    self.i = start;
                    return Ok(None);
                };
                let mut max = Some(min);
                if self.eat(',') {
                    max = if is_digit(self.peek()) {
                        self.number()
                    } else {
                        None
                    };
                }
                if !self.eat('}') {
                    self.i = start;
                    return Ok(None);
                }
                if max.is_some_and(|m| m < min) {
                    return Err("numbers out of order in {} quantifier");
                }
            }
            _ => return Ok(None),
        }
        self.eat('?');
        Ok(Some(()))
    }

    fn number(&mut self) -> Option<u128> {
        if !is_digit(self.peek()) {
            return None;
        }
        let mut n: u128 = 0;
        while let Some(c) = self.peek().filter(|&c| is_digit(Some(c))) {
            n = n.saturating_mul(10).saturating_add((c - u('0')) as u128);
            self.i += 1;
        }
        Some(n)
    }

    /// One term; returns whether a quantifier may follow (see `alternative`).
    fn term(&mut self) -> R<Option<bool>> {
        let c = self.peek().unwrap_or(0);
        self.i += 1;
        match char::from_u32(c as u32).unwrap_or('\0') {
            '^' | '$' => Ok(None),
            '\\' => match self.peek() {
                None => Err("\\ at end of pattern"),
                Some(n) if n == u('b') || n == u('B') => {
                    self.i += 1;
                    Ok(None)
                }
                Some(n) if n == u('k') && self.named => {
                    self.i += 1;
                    if !self.eat('<') {
                        return Err("Invalid named reference");
                    }
                    let name = self.group_name()?;
                    self.references.push(name);
                    Ok(Some(true))
                }
                Some(_) => {
                    self.atom_escape();
                    Ok(Some(true))
                }
            },
            '[' => {
                self.class()?;
                Ok(Some(true))
            }
            '(' => {
                let mut lookbehind = false;
                let mut lookahead = false;
                if self.eat('?') {
                    match self.peek().and_then(|c| char::from_u32(c as u32)) {
                        Some(':') => self.i += 1,
                        Some('=') | Some('!') => {
                            self.i += 1;
                            lookahead = true;
                        }
                        Some('<') if matches!(self.at(1), Some(c) if c == u('=') || c == u('!')) => {
                            self.i += 2;
                            lookbehind = true;
                        }
                        Some('<') => {
                            self.i += 1;
                            let name = self.group_name()?;
                            if self.names.contains(&name) {
                                return Err("Duplicate capture group name");
                            }
                            self.names.push(name);
                        }
                        _ => return Err("Invalid group"),
                    }
                }
                self.disjunction(1)?;
                // Annex B lets a lookahead be quantified, never a lookbehind.
                Ok(Some(!lookbehind || lookahead))
            }
            _ => Ok(Some(true)),
        }
    }

    /// The escape after `\` outside a class; in Annex B every one of them is valid.
    fn atom_escape(&mut self) {
        let c = self.peek().unwrap_or(0);
        self.i += 1;
        match char::from_u32(c as u32).unwrap_or('\0') {
            'x' => {
                if self.peek().and_then(hex).is_some() && self.at(1).and_then(hex).is_some() {
                    self.i += 2;
                }
            }
            'u' => {
                if (0..4).all(|k| self.at(k).and_then(hex).is_some()) {
                    self.i += 4;
                }
            }
            'c' => {
                if self
                    .peek()
                    .and_then(|c| char::from_u32(c as u32))
                    .is_some_and(|c| c.is_ascii_alphabetic())
                {
                    self.i += 1;
                } else {
                    // `\c` without a letter is a literal backslash; the `c` is read again.
                    self.i -= 1;
                }
            }
            _ => {}
        }
    }

    /// A `<name>` after `(?<` or `\k<`, up to and including `>`.
    fn group_name(&mut self) -> R<Vec<u16>> {
        const BAD: &str = "Invalid capture group name";
        let start = self.i;
        let mut first = true;
        loop {
            let Some(c) = self.peek() else {
                return Err(BAD);
            };
            if c == u('>') {
                if first {
                    return Err(BAD);
                }
                let name = self.s[start..self.i].to_vec();
                self.i += 1;
                return Ok(name);
            }
            // A surrogate pair is one identifier character.
            let (ch, width) = match (c, self.at(1)) {
                (0xD800..=0xDBFF, Some(lo @ 0xDC00..=0xDFFF)) => (
                    char::from_u32(0x10000 + ((c as u32 - 0xD800) << 10) + (lo as u32 - 0xDC00)),
                    2,
                ),
                _ => (char::from_u32(c as u32), 1),
            };
            let Some(ch) = ch else { return Err(BAD) };
            let ok = ch == '$'
                || ch == '_'
                || if first {
                    ch.is_alphabetic()
                } else {
                    ch.is_alphanumeric() || ch == '\u{200C}' || ch == '\u{200D}'
                };
            if !ok {
                return Err(BAD);
            }
            self.i += width;
            first = false;
        }
    }

    fn class(&mut self) -> R {
        self.eat('^');
        loop {
            match self.peek() {
                None => return Err("Unterminated character class"),
                Some(c) if c == u(']') => {
                    self.i += 1;
                    return Ok(());
                }
                _ => {}
            }
            let from = self.class_atom()?;
            if self.peek() == Some(u('-')) && !matches!(self.at(1), Some(c) if c == u(']')) {
                if self.at(1).is_none() {
                    return Err("Unterminated character class");
                }
                self.i += 1;
                let to = self.class_atom()?;
                if let (ClassAtom::Char(a), ClassAtom::Char(b)) = (from, to) {
                    if a > b {
                        return Err("Range out of order in character class");
                    }
                }
            }
        }
    }

    fn class_atom(&mut self) -> R<ClassAtom> {
        let c = self.peek().ok_or("Unterminated character class")?;
        self.i += 1;
        if c != u('\\') {
            return Ok(ClassAtom::Char(c as u32));
        }
        let e = self.peek().ok_or("\\ at end of pattern")?;
        self.i += 1;
        let ch = char::from_u32(e as u32).unwrap_or('\0');
        Ok(match ch {
            'd' | 'D' | 's' | 'S' | 'w' | 'W' => ClassAtom::Set,
            'b' => ClassAtom::Char(8),
            'f' => ClassAtom::Char(12),
            'n' => ClassAtom::Char(10),
            'r' => ClassAtom::Char(13),
            't' => ClassAtom::Char(9),
            'v' => ClassAtom::Char(11),
            '0'..='7' => {
                // Legacy octal: up to three digits, at most \377.
                let mut v = e as u32 - '0' as u32;
                for _ in 0..2 {
                    match self.peek() {
                        Some(d)
                            if (u('0')..=u('7')).contains(&d)
                                && v * 8 + (d - u('0')) as u32 <= 0o377 =>
                        {
                            v = v * 8 + (d - u('0')) as u32;
                            self.i += 1;
                        }
                        _ => break,
                    }
                }
                ClassAtom::Char(v)
            }
            'x' => match (self.peek().and_then(hex), self.at(1).and_then(hex)) {
                (Some(a), Some(b)) => {
                    self.i += 2;
                    ClassAtom::Char(a * 16 + b)
                }
                _ => ClassAtom::Char(e as u32),
            },
            'u' => {
                let digits: Option<Vec<u32>> = (0..4).map(|k| self.at(k).and_then(hex)).collect();
                match digits {
                    Some(d) => {
                        self.i += 4;
                        ClassAtom::Char(d.iter().fold(0, |acc, x| acc * 16 + x))
                    }
                    None => ClassAtom::Char(e as u32),
                }
            }
            'c' => match self.peek().and_then(|c| char::from_u32(c as u32)) {
                Some(l) if l.is_ascii_alphanumeric() || l == '_' => {
                    self.i += 1;
                    ClassAtom::Char(l as u32 % 32)
                }
                _ => {
                    self.i -= 1;
                    ClassAtom::Char('\\' as u32)
                }
            },
            _ => ClassAtom::Char(e as u32),
        })
    }
}

/// Whether the pattern has a named group, which makes `\k` a named reference (V8 scans
/// for one before parsing).
fn has_named_groups(s: &[u16]) -> bool {
    let mut i = 0;
    let mut in_class = false;
    while i < s.len() {
        let c = s[i];
        if c == u('\\') {
            i += 2;
            continue;
        }
        if in_class {
            in_class = c != u(']');
        } else if c == u('[') {
            in_class = true;
        } else if c == u('(')
            && s.get(i + 1) == Some(&u('?'))
            && s.get(i + 2) == Some(&u('<'))
            && !matches!(s.get(i + 3), Some(&x) if x == u('=') || x == u('!'))
        {
            return true;
        }
        i += 1;
    }
    false
}

/// The message `new RegExp(pattern)` throws, or `None` when V8 accepts it.
pub(crate) fn syntax_error(pattern: &str) -> Option<String> {
    let s: Vec<u16> = pattern.encode_utf16().collect();
    let mut p = P {
        s: &s,
        i: 0,
        named: has_named_groups(&s),
        names: vec![],
        references: vec![],
    };
    let result = p.disjunction(0).and_then(|()| {
        if p.references.iter().all(|r| p.names.contains(r)) {
            Ok(())
        } else {
            Err("Invalid named capture referenced")
        }
    });
    result
        .err()
        .map(|m| format!("Invalid regular expression: /{pattern}/: {m}"))
}

#[cfg(test)]
mod tests {
    use super::syntax_error;

    #[test]
    fn messages_match_v8() {
        // Recorded with Node 22.
        let bad = [
            ("([a-z", "Unterminated character class"),
            ("(", "Unterminated group"),
            ("a)", "Unmatched ')'"),
            ("*", "Nothing to repeat"),
            ("a**", "Nothing to repeat"),
            ("a{2,1}", "numbers out of order in {} quantifier"),
            ("[z-a]", "Range out of order in character class"),
            ("(?x)", "Invalid group"),
            ("\\", "\\ at end of pattern"),
            ("[\\", "\\ at end of pattern"),
            ("(?<1a>x)", "Invalid capture group name"),
            ("(?<a>x)(?<a>y)", "Duplicate capture group name"),
            ("(?<a>x)|(?<a>y)", "Duplicate capture group name"),
            ("(?<a>x)\\k<b>", "Invalid named capture referenced"),
            ("(?<=a)*", "Invalid quantifier"),
            ("(?<=a){2}", "Invalid quantifier"),
            ("{1}", "Nothing to repeat"),
            ("^*", "Nothing to repeat"),
            ("(?<a", "Invalid capture group name"),
            ("(?<", "Invalid capture group name"),
            ("(?", "Invalid group"),
            ("(?<a>", "Unterminated group"),
            ("x{2}{3}", "Nothing to repeat"),
            ("(?:", "Unterminated group"),
            ("a*?*", "Nothing to repeat"),
            ("$*", "Nothing to repeat"),
            ("\\b*", "Nothing to repeat"),
            ("(?<a>)\\k", "Invalid named reference"),
            ("(?<a>)\\k<", "Invalid capture group name"),
            ("(?<a>)\\k<b>(", "Unterminated group"),
            ("[b-a\\d]", "Range out of order in character class"),
            ("(?i:a)", "Invalid group"),
            ("a{3,2}*", "numbers out of order in {} quantifier"),
            ("[\\b-\\0]", "Range out of order in character class"),
            ("[\\x41-\\x40]", "Range out of order in character class"),
            ("[\\c1-\\c0]", "Range out of order in character class"),
            ("[\\u0062-\\u0061]", "Range out of order in character class"),
            ("[\\101-\\100]", "Range out of order in character class"),
            ("a|*", "Nothing to repeat"),
        ];
        for (p, m) in bad {
            assert_eq!(
                syntax_error(p),
                Some(format!("Invalid regular expression: /{p}/: {m}")),
                "{p:?}"
            );
        }
        let good = [
            "a{1",
            "\\k<a>",
            "[\\d-z]",
            "(?=a)*",
            "(?!a)+",
            "a{,5}",
            "a{1,}?",
            "a??",
            "a{99999999999}",
            "[]",
            "[^]",
            "]",
            "}",
            "{",
            "a{1}?",
            "\\c",
            "\\u{1}",
            "\\1",
            "(?<=a)",
            "(?<!a)",
            "[\\w-a]",
            "[a-\\w]",
            "(?<é>x)",
            "(?<$a_1>x)",
            "(?<a>x)\\k<a>",
            "x\\k<a>",
            "\\k<a>(?<a>)",
            "a{2,1",
            "[a-]",
            "[-a]",
            "^\\d{3}-[A-Z]+$",
        ];
        for p in good {
            assert_eq!(syntax_error(p), None, "{p:?}");
        }
    }
}
