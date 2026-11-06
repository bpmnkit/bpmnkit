//! String functions (`builtins.ts`, "String functions"), including the
//! Camunda extensions (`is blank`, `trim`, `extract`, `uuid`, base64, JSON).
//!
//! Patterns are XPath/JS-flavoured regular expressions run on the `regex`
//! crate, which has no backreferences or lookaround: a pattern using them
//! fails to compile and the function returns null. JS-only leniencies the
//! crate rejects (a literal `{`, an empty class `[]`) are null as well.

use super::numeric::random_u64;
use super::BuiltinFn;
use crate::ops::number_to_string;
use crate::temporal::{date_to_epoch_days, format_date, format_time, zone_offset_seconds};
use crate::value::{Context, Time, Value};
use regex::{Captures, Regex, RegexBuilder};
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use std::cell::RefCell;
use std::collections::HashMap;
use std::str::FromStr;

pub fn lookup(name: &str) -> Option<BuiltinFn> {
    Some(match name {
        "substring" => substring,
        "string length" => |a| with_str(a, |s| Value::from(s.chars().count())),
        "upper case" => |a| with_str(a, |s| Value::from(s.to_uppercase())),
        "lower case" => |a| with_str(a, |s| Value::from(s.to_lowercase())),
        "substring before" => {
            |a| with_two(a, |s, m| Value::from(s.find(m).map_or("", |i| &s[..i])))
        }
        "substring after" => |a| {
            with_two(a, |s, m| {
                Value::from(s.find(m).map_or("", |i| &s[i + m.len()..]))
            })
        },
        "contains" => |a| with_two(a, |s, m| Value::Boolean(s.contains(m))),
        "starts with" => |a| with_two(a, |s, m| Value::Boolean(s.starts_with(m))),
        "ends with" => |a| with_two(a, |s, m| Value::Boolean(s.ends_with(m))),
        "matches" => matches,
        "replace" => replace,
        "split" => split,
        "string join" => string_join,
        "is blank" => |a| with_str(a, |s| Value::Boolean(js_trim(s).is_empty())),
        "trim" => |a| with_str(a, |s| Value::from(js_trim(s))),
        "extract" => extract,
        "uuid" => |_| Value::String(uuid()),
        "to base64" => |a| with_str(a, |s| Value::String(encode_base64(s.as_bytes()))),
        "from base64" => from_base64,
        "to json" => to_json,
        "from json" => from_json,
        _ => return None,
    })
}

fn str_arg(args: &[Value], i: usize) -> Option<&str> {
    match args.get(i) {
        Some(Value::String(s)) => Some(s),
        _ => None,
    }
}

fn with_str(args: &[Value], f: impl Fn(&str) -> Value) -> Value {
    str_arg(args, 0).map_or(Value::Null, f)
}

fn with_two(args: &[Value], f: impl Fn(&str, &str) -> Value) -> Value {
    match (str_arg(args, 0), str_arg(args, 1)) {
        (Some(a), Some(b)) => f(a, b),
        _ => Value::Null,
    }
}

/// JS whitespace: Rust's set plus U+FEFF, minus U+0085.
fn is_js_space(c: char) -> bool {
    (c.is_whitespace() && c != '\u{85}') || c == '\u{FEFF}'
}

fn js_trim(s: &str) -> &str {
    s.trim_matches(is_js_space)
}

/// JS `slice` bound over `len` items: negative counts back from the end.
fn slice_bound(n: Decimal, len: usize) -> usize {
    let t = n.trunc();
    let len_d = Decimal::from(len);
    if t.is_sign_negative() {
        (len_d + t).max(Decimal::ZERO)
    } else {
        t.min(len_d)
    }
    .to_usize()
    .unwrap_or(0)
}

fn substring(args: &[Value]) -> Value {
    let (Some(s), Some(Value::Number(start))) = (str_arg(args, 0), args.get(1)) else {
        return Value::Null;
    };
    let chars: Vec<char> = s.chars().collect();
    let len = chars.len();
    // 1-based over characters; a negative start counts back from the end.
    let idx = if *start > Decimal::ZERO {
        *start - Decimal::ONE
    } else {
        (Decimal::from(len) + *start).max(Decimal::ZERO)
    };
    let from = slice_bound(idx, len);
    let to = match args.get(2) {
        None | Some(Value::Null) => len,
        Some(Value::Number(l)) => slice_bound(idx + *l, len),
        Some(_) => return Value::Null,
    };
    Value::String(chars[from.min(to)..to].iter().collect())
}

// ---------------------------------------------------------------------------
// Regular expressions
// ---------------------------------------------------------------------------

thread_local! {
    // Patterns come from static expression text and are compiled again and
    // again inside loops and decision tables.
    static REGEX_CACHE: RefCell<HashMap<(String, String), Option<Regex>>> = RefCell::new(HashMap::new());
}
const REGEX_CACHE_LIMIT: usize = 256;

fn cached_regex(pattern: &str, flags: &str) -> Option<Regex> {
    REGEX_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        let key = (pattern.to_owned(), flags.to_owned());
        if let Some(hit) = cache.get(&key) {
            return hit.clone();
        }
        let re = build_regex(pattern, flags);
        if cache.len() >= REGEX_CACHE_LIMIT {
            cache.clear();
        }
        cache.insert(key, re.clone());
        re
    })
}

/// Removes the whitespace an `x`-flagged pattern ignores, keeping character
/// classes and escapes intact.
fn strip_pattern_whitespace(pattern: &str) -> String {
    let mut out = String::new();
    let mut in_class = false;
    let mut chars = pattern.chars();
    while let Some(c) = chars.next() {
        if c == '\\' {
            out.push(c);
            out.extend(chars.next());
            continue;
        }
        match c {
            '[' => in_class = true,
            ']' => in_class = false,
            _ => {}
        }
        if !in_class && c.is_whitespace() {
            continue;
        }
        out.push(c);
    }
    out
}

/// Rewrites the JS meanings that differ from the `regex` crate's: `\d`, `\w`
/// and `\b` are ASCII only, `.` stops at every line terminator, and `[` inside
/// a class is a literal rather than a nested class.
fn translate(pattern: &str, dot_all: bool) -> String {
    let mut out = String::new();
    let mut in_class = false;
    let mut chars = pattern.chars();
    while let Some(c) = chars.next() {
        match c {
            '\\' => match chars.next() {
                Some('d') => out.push_str(if in_class { "0-9" } else { "[0-9]" }),
                Some('w') => out.push_str(if in_class {
                    "A-Za-z0-9_"
                } else {
                    "[A-Za-z0-9_]"
                }),
                Some('D') => out.push_str("[^0-9]"),
                Some('W') => out.push_str("[^A-Za-z0-9_]"),
                Some('b') if in_class => out.push_str("\\x08"),
                Some('b') => out.push_str("(?-u:\\b)"),
                Some('B') if !in_class => out.push_str("(?-u:\\B)"),
                Some(o) => {
                    out.push('\\');
                    out.push(o);
                }
                None => out.push('\\'),
            },
            '[' if in_class => out.push_str("\\["),
            '[' => {
                in_class = true;
                out.push(c);
            }
            ']' => {
                in_class = false;
                out.push(c);
            }
            '.' if !in_class && !dot_all => out.push_str("[^\\n\\r\\x{2028}\\x{2029}]"),
            _ => out.push(c),
        }
    }
    out
}

/// The XPath flags FEEL uses: `i`, `s`, `m` map across, `x` strips the
/// pattern's whitespace and `q` makes it a literal. Any other flag fails.
fn build_regex(pattern: &str, flags: &str) -> Option<Regex> {
    if flags.chars().any(|f| !"ismgxq".contains(f)) {
        return None;
    }
    let has = |f: char| flags.contains(f);
    let source = if has('q') {
        regex::escape(pattern)
    } else {
        let p = if has('x') {
            strip_pattern_whitespace(pattern)
        } else {
            pattern.to_owned()
        };
        translate(&p, has('s'))
    };
    RegexBuilder::new(&source)
        .case_insensitive(has('i'))
        .multi_line(has('m'))
        .dot_matches_new_line(has('s'))
        .build()
        .ok()
}

/// A flags argument: absent or null is `default`, a non-string reads as "".
fn flags_arg(v: Option<&Value>, default: &str) -> String {
    match v {
        None | Some(Value::Null) => default.to_owned(),
        Some(Value::String(s)) => s.clone(),
        Some(_) => String::new(),
    }
}

fn matches(args: &[Value]) -> Value {
    let (Some(s), Some(p)) = (str_arg(args, 0), str_arg(args, 1)) else {
        return Value::Null;
    };
    cached_regex(p, &flags_arg(args.get(2), ""))
        .map_or(Value::Null, |re| Value::Boolean(re.is_match(s)))
}

/// JS `String.replace` template expansion over one match.
fn expand(template: &str, re: &Regex, caps: &Captures<'_>, haystack: &str, out: &mut String) {
    let whole = caps.get(0).expect("group 0");
    let groups = re.captures_len() - 1;
    let named = re.capture_names().flatten().next().is_some();
    let b = template.as_bytes();
    let mut i = 0;
    while i < b.len() {
        if b[i] != b'$' || i + 1 >= b.len() {
            let ch = template[i..].chars().next().expect("char");
            out.push(ch);
            i += ch.len_utf8();
            continue;
        }
        match b[i + 1] {
            b'$' => {
                out.push('$');
                i += 2;
            }
            b'&' => {
                out.push_str(whole.as_str());
                i += 2;
            }
            b'`' => {
                out.push_str(&haystack[..whole.start()]);
                i += 2;
            }
            b'\'' => {
                out.push_str(&haystack[whole.end()..]);
                i += 2;
            }
            d @ b'0'..=b'9' => {
                let one = usize::from(d - b'0');
                let two = b
                    .get(i + 2)
                    .filter(|c| c.is_ascii_digit())
                    .map(|c| one * 10 + usize::from(c - b'0'));
                let (n, len) = match two {
                    Some(t) if (1..=groups).contains(&t) => (t, 3),
                    _ if (1..=groups).contains(&one) => (one, 2),
                    _ => {
                        out.push('$');
                        i += 1;
                        continue;
                    }
                };
                out.push_str(caps.get(n).map_or("", |m| m.as_str()));
                i += len;
            }
            b'<' if named => match template[i + 2..].find('>') {
                Some(end) => {
                    let name = &template[i + 2..i + 2 + end];
                    out.push_str(caps.name(name).map_or("", |m| m.as_str()));
                    i += end + 3;
                }
                None => {
                    out.push('$');
                    i += 1;
                }
            },
            _ => {
                out.push('$');
                i += 1;
            }
        }
    }
}

fn replace(args: &[Value]) -> Value {
    let (Some(s), Some(p), Some(r)) = (str_arg(args, 0), str_arg(args, 1), str_arg(args, 2)) else {
        return Value::Null;
    };
    let mut flags = flags_arg(args.get(3), "g");
    if !flags.contains('g') {
        flags.push('g');
    }
    let Some(re) = cached_regex(p, &flags) else {
        return Value::Null;
    };
    // $0 is XPath's whole match, which JavaScript spells $&.
    let template = r.replace("$&", "$$&").replace("$0", "$&");
    let mut out = String::new();
    let mut last = 0;
    for caps in re.captures_iter(s) {
        let m = caps.get(0).expect("group 0");
        out.push_str(&s[last..m.start()]);
        expand(&template, &re, &caps, s, &mut out);
        last = m.end();
    }
    out.push_str(&s[last..]);
    Value::String(out)
}

/// JS `String.split(regex)`: capture groups are spliced into the result and
/// an empty match at the previous split point is skipped.
fn split(args: &[Value]) -> Value {
    let (Some(s), Some(d)) = (str_arg(args, 0), str_arg(args, 1)) else {
        return Value::Null;
    };
    let strings = |parts: Vec<&str>| Value::List(parts.into_iter().map(Value::from).collect());
    let Some(re) = cached_regex(d, "") else {
        // An invalid pattern splits on its literal text.
        return if d.is_empty() {
            Value::List(s.chars().map(|c| Value::from(c.to_string())).collect())
        } else {
            strings(s.split(d).collect())
        };
    };
    if s.is_empty() {
        return Value::List(if re.is_match("") {
            vec![]
        } else {
            vec![Value::from("")]
        });
    }
    let mut out = Vec::new();
    let (mut p, mut q) = (0, 0);
    while q < s.len() {
        let Some(caps) = re.captures_at(s, q) else {
            break;
        };
        let m = caps.get(0).expect("group 0");
        if m.start() >= s.len() {
            break;
        }
        if m.end() == p {
            q = m.start() + s[m.start()..].chars().next().map_or(1, char::len_utf8);
            continue;
        }
        out.push(Value::from(&s[p..m.start()]));
        for g in caps.iter().skip(1) {
            out.push(g.map_or(Value::Null, |g| Value::from(g.as_str())));
        }
        p = m.end();
        q = p;
    }
    out.push(Value::from(&s[p..]));
    Value::List(out)
}

fn extract(args: &[Value]) -> Value {
    let (Some(s), Some(p)) = (str_arg(args, 0), str_arg(args, 1)) else {
        return Value::Null;
    };
    cached_regex(p, "g").map_or(Value::Null, |re| {
        Value::List(re.find_iter(s).map(|m| Value::from(m.as_str())).collect())
    })
}

// ---------------------------------------------------------------------------
// string join, uuid
// ---------------------------------------------------------------------------

/// An optional string argument: absent or null is "", anything else not a string is an error.
fn opt_str(v: Option<&Value>) -> Option<&str> {
    match v {
        None | Some(Value::Null) => Some(""),
        Some(Value::String(s)) => Some(s),
        Some(_) => None,
    }
}

fn string_join(args: &[Value]) -> Value {
    let single;
    let list: &[Value] = match args.first() {
        None | Some(Value::Null) => return Value::Null,
        Some(Value::List(l)) => l,
        Some(v) => {
            single = [v.clone()];
            &single
        }
    };
    let mut parts = Vec::new();
    for v in list {
        match v {
            Value::Null => {}
            Value::String(s) => parts.push(s.as_str()),
            _ => return Value::Null,
        }
    }
    let (Some(between), Some(head), Some(tail)) = (
        opt_str(args.get(1)),
        opt_str(args.get(2)),
        opt_str(args.get(3)),
    ) else {
        return Value::Null;
    };
    Value::String(format!("{head}{}{tail}", parts.join(between)))
}

/// A version 4 UUID.
fn uuid() -> String {
    let mut bytes = [0_u8; 16];
    bytes[..8].copy_from_slice(&random_u64().to_le_bytes());
    bytes[8..].copy_from_slice(&random_u64().to_le_bytes());
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    let hex: String = bytes.iter().map(|b| format!("{b:02x}")).collect();
    format!(
        "{}-{}-{}-{}-{}",
        &hex[..8],
        &hex[8..12],
        &hex[12..16],
        &hex[16..20],
        &hex[20..]
    )
}

// ---------------------------------------------------------------------------
// base64
// ---------------------------------------------------------------------------

const BASE64: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

fn encode_base64(bytes: &[u8]) -> String {
    let mut out = String::new();
    for chunk in bytes.chunks(3) {
        let b = |i: usize| u32::from(chunk.get(i).copied().unwrap_or(0));
        let n = (b(0) << 16) | (b(1) << 8) | b(2);
        let sextet = |shift: u32| char::from(BASE64[((n >> shift) & 63) as usize]);
        out.push(sextet(18));
        out.push(sextet(12));
        out.push(if chunk.len() > 1 { sextet(6) } else { '=' });
        out.push(if chunk.len() > 2 { sextet(0) } else { '=' });
    }
    out
}

/// Decodes padded base64, or `None` when the text is not base64.
fn decode_base64(s: &str) -> Option<Vec<u8>> {
    let b = s.as_bytes();
    if !b.len().is_multiple_of(4) {
        return None;
    }
    let pad = b.iter().rev().take_while(|&&c| c == b'=').count();
    if pad > 2 || b[..b.len() - pad].iter().any(|c| !BASE64.contains(c)) {
        return None;
    }
    let mut bytes = Vec::new();
    for chunk in b.chunks(4) {
        let mut n = 0_u32;
        for &c in chunk {
            let v = BASE64.iter().position(|&x| x == c).unwrap_or(0) as u32;
            n = (n << 6) | v;
        }
        bytes.push((n >> 16) as u8);
        if chunk[2] != b'=' {
            bytes.push((n >> 8) as u8);
        }
        if chunk[3] != b'=' {
            bytes.push(n as u8);
        }
    }
    Some(bytes)
}

fn from_base64(args: &[Value]) -> Value {
    let Some(s) = str_arg(args, 0) else {
        return Value::Null;
    };
    decode_base64(s)
        .and_then(|bytes| String::from_utf8(bytes).ok())
        .map_or(Value::Null, Value::String)
}

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

fn json_string(s: &str) -> String {
    serde_json::to_string(s).unwrap_or_default()
}

/// A value's JSON text, or `None` for one JSON has no form for (a function, a range).
fn json_text(v: &Value) -> Option<String> {
    Some(match v {
        Value::Null => "null".to_owned(),
        Value::Boolean(b) => b.to_string(),
        Value::Number(n) => number_to_string(*n),
        Value::String(s) => json_string(s),
        Value::List(items) => {
            let parts: Option<Vec<String>> = items.iter().map(json_text).collect();
            format!("[{}]", parts?.join(","))
        }
        Value::Context(c) => {
            let mut parts = Vec::new();
            for (k, value) in c {
                parts.push(format!("{}:{}", json_string(k), json_text(value)?));
            }
            format!("{{{}}}", parts.join(","))
        }
        // A zoned date and time carries its offset as well, the form Java
        // writes: 2025-11-24T10:00:00+01:00[Europe/Berlin].
        Value::DateTime(dt) if dt.time.timezone.is_some() && dt.time.offset.is_none() => {
            let zone = dt.time.timezone.as_deref()?;
            let offset = zone_offset_seconds(zone, date_to_epoch_days(&dt.date));
            let time = format_time(&Time {
                offset: Some(offset),
                timezone: None,
                ..dt.time.clone()
            });
            json_string(&format!("{}T{time}[{zone}]", format_date(&dt.date)))
        }
        Value::Range(_) | Value::Function(_) => return None,
        other => json_string(&crate::ops::to_feel_string(other)?),
    })
}

fn to_json(args: &[Value]) -> Value {
    json_text(args.first().unwrap_or(&Value::Null)).map_or(Value::Null, Value::String)
}

/// `JSON.parse` that keeps object key order. Numbers are read exactly.
struct JsonParser<'a> {
    s: &'a str,
    i: usize,
    depth: usize,
}

const MAX_JSON_DEPTH: usize = 512;

impl JsonParser<'_> {
    fn peek(&self) -> Option<u8> {
        self.s.as_bytes().get(self.i).copied()
    }

    fn skip_ws(&mut self) {
        while matches!(self.peek(), Some(b' ' | b'\t' | b'\n' | b'\r')) {
            self.i += 1;
        }
    }

    fn eat(&mut self, lit: &str) -> bool {
        let ok = self.s[self.i..].starts_with(lit);
        if ok {
            self.i += lit.len();
        }
        ok
    }

    fn value(&mut self) -> Option<Value> {
        self.skip_ws();
        match self.peek()? {
            b'n' => self.eat("null").then_some(Value::Null),
            b't' => self.eat("true").then_some(Value::Boolean(true)),
            b'f' => self.eat("false").then_some(Value::Boolean(false)),
            b'"' => self.string().map(Value::String),
            b'[' => self.nested(|p| {
                p.i += 1;
                let mut items = Vec::new();
                p.skip_ws();
                if p.peek()? == b']' {
                    p.i += 1;
                    return Some(Value::List(items));
                }
                loop {
                    items.push(p.value()?);
                    p.skip_ws();
                    match p.peek()? {
                        b',' => p.i += 1,
                        b']' => {
                            p.i += 1;
                            return Some(Value::List(items));
                        }
                        _ => return None,
                    }
                }
            }),
            b'{' => self.nested(|p| {
                p.i += 1;
                let mut ctx = Context::new();
                p.skip_ws();
                if p.peek()? == b'}' {
                    p.i += 1;
                    return Some(Value::Context(ctx));
                }
                loop {
                    p.skip_ws();
                    let key = p.string()?;
                    p.skip_ws();
                    if p.peek()? != b':' {
                        return None;
                    }
                    p.i += 1;
                    ctx.insert(key, p.value()?);
                    p.skip_ws();
                    match p.peek()? {
                        b',' => p.i += 1,
                        b'}' => {
                            p.i += 1;
                            return Some(Value::Context(ctx));
                        }
                        _ => return None,
                    }
                }
            }),
            b'-' | b'0'..=b'9' => self.number(),
            _ => None,
        }
    }

    fn nested(&mut self, f: impl FnOnce(&mut Self) -> Option<Value>) -> Option<Value> {
        if self.depth >= MAX_JSON_DEPTH {
            return None;
        }
        self.depth += 1;
        let v = f(self);
        self.depth -= 1;
        v
    }

    fn digits(&mut self) -> usize {
        let start = self.i;
        while self.peek().is_some_and(|c| c.is_ascii_digit()) {
            self.i += 1;
        }
        self.i - start
    }

    fn number(&mut self) -> Option<Value> {
        let start = self.i;
        if self.peek() == Some(b'-') {
            self.i += 1;
        }
        match self.peek()? {
            b'0' => self.i += 1,
            b'1'..=b'9' => {
                self.digits();
            }
            _ => return None,
        }
        if self.peek() == Some(b'.') {
            self.i += 1;
            if self.digits() == 0 {
                return None;
            }
        }
        if matches!(self.peek(), Some(b'e' | b'E')) {
            self.i += 1;
            if matches!(self.peek(), Some(b'+' | b'-')) {
                self.i += 1;
            }
            if self.digits() == 0 {
                return None;
            }
        }
        let text = &self.s[start..self.i];
        let exact = if text.contains(['e', 'E']) {
            Decimal::from_scientific(text).ok()
        } else {
            Decimal::from_str(text).ok()
        };
        // Beyond a decimal's 28 digits JSON.parse would have used a float too.
        exact
            .or_else(|| {
                text.parse::<f64>()
                    .ok()
                    .and_then(|f| Decimal::try_from(f).ok())
            })
            .map(Value::Number)
    }

    fn hex4(&mut self) -> Option<u32> {
        let h = self.s.get(self.i..self.i + 4)?;
        if !h.bytes().all(|c| c.is_ascii_hexdigit()) {
            return None;
        }
        self.i += 4;
        u32::from_str_radix(h, 16).ok()
    }

    fn string(&mut self) -> Option<String> {
        if self.peek()? != b'"' {
            return None;
        }
        self.i += 1;
        let mut out = String::new();
        loop {
            let c = self.s[self.i..].chars().next()?;
            self.i += c.len_utf8();
            match c {
                '"' => return Some(out),
                '\\' => {
                    let e = self.peek()?;
                    self.i += 1;
                    match e {
                        b'"' => out.push('"'),
                        b'\\' => out.push('\\'),
                        b'/' => out.push('/'),
                        b'b' => out.push('\u{8}'),
                        b'f' => out.push('\u{c}'),
                        b'n' => out.push('\n'),
                        b'r' => out.push('\r'),
                        b't' => out.push('\t'),
                        b'u' => {
                            let hi = self.hex4()?;
                            let code = if (0xD800..0xDC00).contains(&hi)
                                && self.s[self.i..].starts_with("\\u")
                            {
                                let save = self.i;
                                self.i += 2;
                                match self.hex4() {
                                    Some(lo) if (0xDC00..0xE000).contains(&lo) => {
                                        0x10000 + ((hi - 0xD800) << 10) + (lo - 0xDC00)
                                    }
                                    _ => {
                                        self.i = save;
                                        hi
                                    }
                                }
                            } else {
                                hi
                            };
                            // A lone surrogate has no Rust form.
                            out.push(char::from_u32(code).unwrap_or('\u{FFFD}'));
                        }
                        _ => return None,
                    }
                }
                c if c < '\u{20}' => return None,
                c => out.push(c),
            }
        }
    }
}

fn from_json(args: &[Value]) -> Value {
    let Some(text) = str_arg(args, 0) else {
        return Value::Null;
    };
    let mut p = JsonParser {
        s: text,
        i: 0,
        depth: 0,
    };
    let value = p.value();
    p.skip_ws();
    match value {
        Some(v) if p.i == text.len() => v,
        _ => Value::Null,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::temporal::parse_temporal;

    fn st(s: &str) -> Value {
        Value::from(s)
    }
    fn n(s: &str) -> Value {
        Value::Number(s.parse().unwrap())
    }
    fn call(name: &str, args: &[Value]) -> Value {
        lookup(name).unwrap()(args)
    }
    fn list(items: &[&str]) -> Value {
        Value::List(items.iter().map(|s| st(s)).collect())
    }

    #[test]
    fn substring_and_friends() {
        let sub = |s: &str, a: &str, l: Option<&str>| {
            let mut args = vec![st(s), n(a)];
            args.extend(l.map(n));
            call("substring", &args)
        };
        assert_eq!(sub("foobar", "3", None), st("obar"));
        assert_eq!(sub("foobar", "3", Some("3")), st("oba"));
        assert_eq!(sub("foobar", "3", Some("2")), st("ob"));
        assert_eq!(sub("foobar", "-2", Some("1")), st("a"));
        assert_eq!(sub("foobar", "-2", None), st("ar"));
        assert_eq!(sub("foobar", "0", Some("2")), st(""));
        assert_eq!(sub("foobar", "10", None), st(""));
        assert_eq!(sub("foobar", "3", Some("-1")), st(""));
        assert_eq!(sub("héllo😀x", "6", Some("2")), st("😀x"));
        assert_eq!(call("substring", &[st("a"), st("1")]), Value::Null);
        assert_eq!(call("substring", &[Value::Null, n("1")]), Value::Null);
        assert_eq!(call("string length", &[st("héllo")]), n("5"));
        assert_eq!(call("string length", &[st("😀")]), n("1"));
        assert_eq!(call("string length", &[n("1")]), Value::Null);
        assert_eq!(call("upper case", &[st("abc")]), st("ABC"));
        assert_eq!(call("lower case", &[st("ABc")]), st("abc"));
        assert_eq!(
            call("substring before", &[st("foobar"), st("bar")]),
            st("foo")
        );
        assert_eq!(call("substring before", &[st("foobar"), st("xyz")]), st(""));
        assert_eq!(call("substring after", &[st("foobar"), st("ob")]), st("ar"));
        assert_eq!(
            call("substring after", &[st("foobar"), st("")]),
            st("foobar")
        );
        assert_eq!(
            call("contains", &[st("foobar"), st("oba")]),
            Value::Boolean(true)
        );
        assert_eq!(
            call("starts with", &[st("foobar"), st("fo")]),
            Value::Boolean(true)
        );
        assert_eq!(
            call("ends with", &[st("foobar"), st("bar")]),
            Value::Boolean(true)
        );
        assert_eq!(call("ends with", &[st("foobar"), Value::Null]), Value::Null);
    }

    #[test]
    fn matches_replace_flags() {
        let m = |s: &str, p: &str, f: Option<&str>| {
            let mut a = vec![st(s), st(p)];
            a.extend(f.map(st));
            call("matches", &a)
        };
        assert_eq!(m("foobar", "^fo*b", None), Value::Boolean(true));
        assert_eq!(m("foobar", "^fo*z", None), Value::Boolean(false));
        assert_eq!(m("FOO", "foo", Some("i")), Value::Boolean(true));
        assert_eq!(m("a\nb", "a.b", None), Value::Boolean(false));
        assert_eq!(m("a\nb", "a.b", Some("s")), Value::Boolean(true));
        assert_eq!(m("a\nb", "^b$", Some("m")), Value::Boolean(true));
        assert_eq!(m("a.b", "a.b", Some("q")), Value::Boolean(true));
        assert_eq!(m("axb", "a.b", Some("q")), Value::Boolean(false));
        assert_eq!(m("ab", "a b", Some("x")), Value::Boolean(true));
        assert_eq!(m("١", "\\d", None), Value::Boolean(false));
        assert_eq!(m("abc", "[", None), Value::Null);
        assert_eq!(m("abc", "a", Some("z")), Value::Null);
        assert_eq!(m("aa", "(a)\\1", None), Value::Null);
        assert_eq!(m("ab", "a(?=b)", None), Value::Null);
        assert_eq!(m("a[b", "[[]", None), Value::Boolean(true));
        let r = |s: &str, p: &str, rep: &str, f: Option<&str>| {
            let mut a = vec![st(s), st(p), st(rep)];
            a.extend(f.map(st));
            call("replace", &a)
        };
        assert_eq!(r("abcabc", "b", "X", None), st("aXcaXc"));
        assert_eq!(r("abcabc", "B", "X", Some("i")), st("aXcaXc"));
        assert_eq!(r("abc", "(a)(b)", "$2$1", None), st("bac"));
        assert_eq!(r("abc", "b", "[$0]", None), st("a[b]c"));
        assert_eq!(r("abc", "b", "[$&]", None), st("a[$&]c"));
        assert_eq!(r("abc", "b", "$$", None), st("a$c"));
        assert_eq!(r("abc", "b", "$9", None), st("a$9c"));
        assert_eq!(r("abc", "x*", "-", None), st("-a-b-c-"));
        assert_eq!(r("abc", "(?P<x>b)", "<$<x>>", None), st("a<b>c"));
        assert_eq!(r("abc", "b", "X", Some("z")), Value::Null);
        assert_eq!(r("abc", "(", "X", None), Value::Null);
    }

    #[test]
    fn split_follows_js() {
        let sp = |s: &str, d: &str| call("split", &[st(s), st(d)]);
        assert_eq!(sp("John Doe", "\\s"), list(&["John", "Doe"]));
        assert_eq!(sp("a,b,,c", ","), list(&["a", "b", "", "c"]));
        assert_eq!(sp("abc", ""), list(&["a", "b", "c"]));
        assert_eq!(sp("", ","), list(&[""]));
        assert_eq!(sp("", ""), Value::List(vec![]));
        assert_eq!(sp("a1b2c", "[0-9]"), list(&["a", "b", "c"]));
        assert_eq!(
            sp("a1b", "([0-9])"),
            Value::List(vec![st("a"), st("1"), st("b")])
        );
        assert_eq!(sp("abc", "b|x*"), list(&["a", "c"]));
        assert_eq!(sp(",a,", ","), list(&["", "a", ""]));
        assert_eq!(sp("a(b", "("), list(&["a", "b"]));
    }

    #[test]
    fn string_join_and_camunda_extras() {
        let j = |items: Vec<Value>, rest: &[Value]| {
            let mut a = vec![Value::List(items)];
            a.extend_from_slice(rest);
            call("string join", &a)
        };
        assert_eq!(j(vec![st("a"), st("b")], &[st(", ")]), st("a, b"));
        assert_eq!(j(vec![st("a"), st("b")], &[]), st("ab"));
        assert_eq!(
            j(
                vec![st("a"), Value::Null, st("b")],
                &[st("-"), st("["), st("]")]
            ),
            st("[a-b]")
        );
        assert_eq!(j(vec![st("a"), n("1")], &[st("-")]), Value::Null);
        assert_eq!(j(vec![], &[st("-")]), st(""));
        assert_eq!(j(vec![st("a")], &[n("1")]), Value::Null);
        assert_eq!(call("string join", &[st("a"), st("-")]), st("a"));
        assert_eq!(call("string join", &[Value::Null]), Value::Null);
        assert_eq!(call("is blank", &[st(" \t\u{feff}")]), Value::Boolean(true));
        assert_eq!(call("is blank", &[st(" a ")]), Value::Boolean(false));
        assert_eq!(call("is blank", &[Value::Null]), Value::Null);
        assert_eq!(call("trim", &[st("  a b \n")]), st("a b"));
        assert_eq!(
            call("extract", &[st("a1b22c333"), st("[0-9]+")]),
            list(&["1", "22", "333"])
        );
        assert_eq!(
            call("extract", &[st("abc"), st("[0-9]+")]),
            Value::List(vec![])
        );
    }

    #[test]
    fn uuid_is_v4_and_fresh() {
        let Value::String(a) = call("uuid", &[]) else {
            panic!()
        };
        let Value::String(b) = call("uuid", &[]) else {
            panic!()
        };
        assert_ne!(a, b);
        assert_eq!(a.len(), 36);
        let re =
            Regex::new("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")
                .unwrap();
        assert!(re.is_match(&a), "{a}");
    }

    #[test]
    fn base64_round_trips() {
        assert_eq!(call("to base64", &[st("Hello")]), st("SGVsbG8="));
        assert_eq!(call("to base64", &[st("Hi")]), st("SGk="));
        assert_eq!(call("to base64", &[st("abc")]), st("YWJj"));
        assert_eq!(call("to base64", &[st("")]), st(""));
        assert_eq!(call("to base64", &[st("héllo😀")]), st("aMOpbGxv8J+YgA=="));
        assert_eq!(call("from base64", &[st("SGVsbG8=")]), st("Hello"));
        assert_eq!(
            call("from base64", &[st("aMOpbGxv8J+YgA==")]),
            st("héllo😀")
        );
        assert_eq!(call("from base64", &[st("SGVsbG8")]), Value::Null);
        assert_eq!(call("from base64", &[st("SG!s")]), Value::Null);
        assert_eq!(call("from base64", &[st("A===")]), Value::Null);
        assert_eq!(call("from base64", &[st("/w==")]), Value::Null); // 0xFF: not UTF-8
        assert_eq!(call("to base64", &[n("1")]), Value::Null);
    }

    #[test]
    fn to_json_keeps_order() {
        let ctx = Value::Context(
            [
                ("b".to_owned(), n("1")),
                (
                    "a".to_owned(),
                    Value::List(vec![st("x\"y"), Value::Null, Value::Boolean(true)]),
                ),
            ]
            .into_iter()
            .collect(),
        );
        assert_eq!(
            call("to json", &[ctx]),
            st("{\"b\":1,\"a\":[\"x\\\"y\",null,true]}")
        );
        assert_eq!(call("to json", &[n("1.50")]), st("1.5"));
        assert_eq!(call("to json", &[Value::Null]), st("null"));
        assert_eq!(call("to json", &[st("é\n")]), st("\"é\\n\""));
        assert_eq!(
            call("to json", &[parse_temporal("2024-01-02")]),
            st("\"2024-01-02\"")
        );
        assert_eq!(call("to json", &[parse_temporal("PT1H")]), st("\"PT1H\""));
        #[cfg(feature = "tz")]
        assert_eq!(
            call(
                "to json",
                &[parse_temporal("2025-11-24T10:00:00@Europe/Berlin")]
            ),
            st("\"2025-11-24T10:00:00+01:00[Europe/Berlin]\"")
        );
        let f = Value::Function(crate::value::Function::new(None, |_| Value::Null));
        assert_eq!(call("to json", &[Value::List(vec![f])]), Value::Null);
    }

    #[test]
    fn from_json_keeps_order_and_precision() {
        let Value::Context(c) = call(
            "from json",
            &[st("{\"z\": 1, \"a\": [0.1, \"s\", null, false], \"z\": 2}")],
        ) else {
            panic!()
        };
        assert_eq!(c.keys().collect::<Vec<_>>(), ["z", "a"]);
        assert_eq!(c.get("z"), Some(&n("2")));
        assert_eq!(
            c.get("a"),
            Some(&Value::List(vec![
                n("0.1"),
                st("s"),
                Value::Null,
                Value::Boolean(false)
            ]))
        );
        assert_eq!(call("from json", &[st(" 12 ")]), n("12"));
        assert_eq!(call("from json", &[st("-1.5e2")]), n("-150"));
        assert_eq!(
            call("from json", &[st("\"\\u00e9\\ud83d\\ude00\"")]),
            st("é😀")
        );
        assert_eq!(call("from json", &[st("[]")]), Value::List(vec![]));
        assert_eq!(
            call("from json", &[st("{}")]),
            Value::Context(Context::new())
        );
        for bad in [
            "",
            "{",
            "[1,]",
            "01",
            "1.",
            "'a'",
            "{\"a\":1} x",
            "nul",
            "\"a\nb\"",
        ] {
            assert_eq!(call("from json", &[st(bad)]), Value::Null, "{bad:?}");
        }
        assert_eq!(call("from json", &[n("1")]), Value::Null);
        let deep = "[".repeat(600) + &"]".repeat(600);
        assert_eq!(call("from json", &[st(&deep)]), Value::Null);
    }
}
