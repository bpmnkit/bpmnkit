//! Bearer tokens from `BPMNKIT_BUILDER_TOKEN`: comma-separated `caller=token` (or bare `token`).

use std::fmt;

/// Short tokens are guessable; the service refuses to start with one.
pub const MIN_TOKEN_LEN: usize = 16;

#[derive(Clone)]
pub struct Tokens(Vec<(String, String)>);

impl fmt::Debug for Tokens {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let callers: Vec<_> = self.0.iter().map(|(c, _)| c).collect();
        f.debug_tuple("Tokens").field(&callers).finish()
    }
}

impl Tokens {
    pub fn parse(spec: &str) -> Result<Self, String> {
        let mut v: Vec<(String, String)> = Vec::new();
        for (i, e) in spec
            .split(',')
            .map(str::trim)
            .filter(|e| !e.is_empty())
            .enumerate()
        {
            // A bare token may itself contain `=` (base64 padding), so only a plausible
            // `name=` prefix in front of a long enough token makes it a named entry.
            let named = e.split_once('=').and_then(|(c, t)| {
                let (c, t) = (c.trim(), t.trim());
                let name_ok = !c.is_empty()
                    && c.bytes()
                        .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'_' | b'.' | b'-'));
                (name_ok && t.len() >= MIN_TOKEN_LEN).then(|| (c.to_owned(), t.to_owned()))
            });
            let (caller, token) =
                named.unwrap_or_else(|| (format!("caller-{}", i + 1), e.to_owned()));
            if token.len() < MIN_TOKEN_LEN {
                return Err(format!(
                    "token for `{caller}` is shorter than {MIN_TOKEN_LEN} characters"
                ));
            }
            if v.iter().any(|(c, _)| *c == caller) {
                return Err(format!("caller `{caller}` listed twice"));
            }
            v.push((caller, token));
        }
        if v.is_empty() {
            return Err("no tokens: set BPMNKIT_BUILDER_TOKEN".into());
        }
        Ok(Self(v))
    }

    /// The caller an `Authorization` header value belongs to.
    pub fn caller(&self, authorization: Option<&str>) -> Option<&str> {
        let t = authorization?.strip_prefix("Bearer ")?.trim().as_bytes();
        self.0
            .iter()
            .find(|(_, tok)| ct_eq(tok.as_bytes(), t))
            .map(|(c, _)| c.as_str())
    }
}

/// Comparison time does not depend on where the bytes differ.
fn ct_eq(a: &[u8], b: &[u8]) -> bool {
    a.len() == b.len() && a.iter().zip(b).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    const A: &str = "aaaaaaaaaaaaaaaa";
    const B: &str = "bbbbbbbbbbbbbbbb";

    #[test]
    fn named_and_bare_entries() {
        let t = Tokens::parse(&format!("ci={A}, {B}")).unwrap();
        assert_eq!(t.caller(Some(&format!("Bearer {A}"))), Some("ci"));
        assert_eq!(t.caller(Some(&format!("Bearer {B}"))), Some("caller-2"));
        assert_eq!(t.caller(Some("Bearer nope")), None);
        assert_eq!(t.caller(Some(A)), None, "needs the Bearer scheme");
        assert_eq!(t.caller(None), None);
    }

    #[test]
    fn rejects_weak_or_ambiguous_config() {
        assert!(Tokens::parse("").is_err());
        assert!(Tokens::parse("short").is_err());
        assert!(Tokens::parse(&format!("x={A},x={B}")).is_err());
    }

    #[test]
    fn bare_token_with_equals_is_not_split() {
        let tok = "abc+def/ghi+jkl/mno==";
        let t = Tokens::parse(tok).unwrap();
        assert_eq!(t.caller(Some(&format!("Bearer {tok}"))), Some("caller-1"));
        // A leading `=` or a non-name prefix is part of the token, not a caller.
        let t = Tokens::parse(&format!("={A}")).unwrap();
        assert_eq!(t.caller(Some(&format!("Bearer ={A}"))), Some("caller-1"));
        // Too short a token part: whole entry is a (too short) bare token, text never echoed.
        let err = Tokens::parse("ci=secret").unwrap_err();
        assert!(!err.contains("secret"), "{err}");
    }

    #[test]
    fn debug_hides_tokens() {
        let t = Tokens::parse(&format!("ci={A}")).unwrap();
        assert!(!format!("{t:?}").contains(A));
    }
}
