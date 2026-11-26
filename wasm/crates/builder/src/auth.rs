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
            let (caller, token) = match e.split_once('=') {
                Some((c, t)) => (c.trim().to_owned(), t.trim().to_owned()),
                None => (format!("caller-{}", i + 1), e.to_owned()),
            };
            if caller.is_empty() {
                return Err(format!("entry {}: empty caller name", i + 1));
            }
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
        assert!(Tokens::parse(&format!("={A}")).is_err());
    }

    #[test]
    fn debug_hides_tokens() {
        let t = Tokens::parse(&format!("ci={A}")).unwrap();
        assert!(!format!("{t:?}").contains(A));
    }
}
