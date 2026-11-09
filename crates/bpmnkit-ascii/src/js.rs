//! JS string semantics: text is UTF-16 code units, as `.length`, `slice` and `text[i]` see it.

pub(crate) type U16s = Vec<u16>;

pub(crate) fn u(s: &str) -> U16s {
    s.encode_utf16().collect()
}

pub(crate) fn len(s: &[u16]) -> i64 {
    s.len() as i64
}

pub(crate) fn repeat(s: &str, n: i64) -> U16s {
    if n <= 0 {
        return vec![];
    }
    u(s).repeat(n as usize)
}

/// `s.slice(0, n)` for `n >= 0`.
pub(crate) fn head(s: &[u16], n: i64) -> &[u16] {
    &s[..(n.max(0) as usize).min(s.len())]
}

/// `s.padEnd(w)` with spaces.
pub(crate) fn pad_end(s: &[u16], w: i64) -> U16s {
    let mut out = s.to_vec();
    while len(&out) < w {
        out.push(b' ' as u16);
    }
    out
}

/// `Math.floor(a / 2)` on integers.
pub(crate) fn half(a: i64) -> i64 {
    a.div_euclid(2)
}

/// `String.prototype.trimEnd`: ECMAScript WhiteSpace and LineTerminator.
pub(crate) fn trim_end(s: &[u16]) -> &[u16] {
    let mut end = s.len();
    while end > 0 && is_js_space(s[end - 1]) {
        end -= 1;
    }
    &s[..end]
}

fn is_js_space(c: u16) -> bool {
    matches!(
        c,
        0x09..=0x0D
            | 0x20
            | 0xA0
            | 0x1680
            | 0x2000..=0x200A
            | 0x2028
            | 0x2029
            | 0x202F
            | 0x205F
            | 0x3000
            | 0xFEFF
    )
}

/// Lone surrogates become U+FFFD, as Node does when it writes the string as UTF-8.
pub(crate) fn to_string(s: &[u16]) -> String {
    String::from_utf16_lossy(s)
}

/// Joins lines with `\n`.
pub(crate) fn join_lines(lines: &[U16s]) -> U16s {
    lines.join(&(b'\n' as u16))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trim_end_follows_js() {
        assert_eq!(to_string(trim_end(&u("a \u{FEFF}\u{3000}"))), "a");
        assert_eq!(to_string(trim_end(&u("a\u{85}"))), "a\u{85}");
    }

    #[test]
    fn half_floors() {
        assert_eq!(half(-3), -2);
        assert_eq!(half(3), 1);
    }
}
