//! `{{secrets.X}}` placeholders, resolved like the 8.8 connector runtime's environment secret
//! provider (plan D8), and the redactor that keeps resolved values out of messages.

use std::fmt;
use std::sync::Arc;

use serde_json::Value;

/// The environment variable naming the prefix every secret lookup gets.
pub const PREFIX_VAR: &str = "CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_PREFIX";

type Lookup = dyn Fn(&str) -> Option<String> + Send + Sync;

/// Where secret values come from: `{{secrets.X}}` reads `<prefix>X`.
#[derive(Clone)]
pub struct Secrets {
    prefix: String,
    lookup: Arc<Lookup>,
}

// Values never reach logs through `{:?}`.
impl fmt::Debug for Secrets {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Secrets {{ prefix: {:?} }}", self.prefix)
    }
}

impl Secrets {
    /// The process environment. 8.8 has no default prefix (8.9 defaults to `SECRET_`), so an
    /// unset prefix exposes every variable, as the 8.8 runtime does.
    pub fn from_env() -> Self {
        Self::from_lookup(std::env::var(PREFIX_VAR).unwrap_or_default(), |name| {
            std::env::var(name).ok()
        })
    }

    /// Any lookup (tests, fixtures); `prefix` is prepended to every name before `get` runs.
    pub fn from_lookup(
        prefix: impl Into<String>,
        get: impl Fn(&str) -> Option<String> + Send + Sync + 'static,
    ) -> Self {
        Self {
            prefix: prefix.into(),
            lookup: Arc::new(get),
        }
    }

    pub fn get(&self, name: &str) -> Option<String> {
        (self.lookup)(&format!("{}{name}", self.prefix))
    }
}

/// Collects every resolved secret value so messages can be scrubbed before they leave the
/// runtime (fail messages, logs, transport errors that echo a URL).
#[derive(Clone, Default)]
pub struct Redactor {
    values: Vec<String>,
}

impl fmt::Debug for Redactor {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Redactor({} values)", self.values.len())
    }
}

pub const REDACTED: &str = "***";

impl Redactor {
    fn add(&mut self, value: &str) {
        if value.is_empty() {
            return;
        }
        // Encoded forms too: a secret in a query string shows up as `%20` or (form style) `+`.
        let encoded = percent_encode(value);
        for v in [value.to_owned(), encoded.replace("%20", "+"), encoded] {
            if !self.values.contains(&v) {
                self.values.push(v);
            }
        }
        // Longest first, so a secret that contains another is replaced whole.
        self.values.sort_by_key(|v| std::cmp::Reverse(v.len()));
    }

    pub fn redact(&self, text: &str) -> String {
        let mut out = text.to_owned();
        for v in &self.values {
            out = out.replace(v.as_str(), REDACTED);
        }
        out
    }

    pub fn is_empty(&self) -> bool {
        self.values.is_empty()
    }
}

fn percent_encode(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for b in s.bytes() {
        if b.is_ascii_alphanumeric() || b"-._~".contains(&b) {
            out.push(b as char);
        } else {
            out.push_str(&format!("%{b:02X}"));
        }
    }
    out
}

/// Replaces placeholders in every string of `value` (keys stay as they are). Fails on the first
/// unknown secret, with the runtime's wording.
pub fn resolve(value: &mut Value, secrets: &Secrets, used: &mut Redactor) -> Result<(), String> {
    match value {
        Value::String(s) => {
            if let Some(next) = resolve_str(s, secrets, used)? {
                *s = next;
            }
            Ok(())
        }
        Value::Array(items) => items.iter_mut().try_for_each(|v| resolve(v, secrets, used)),
        Value::Object(map) => map.values_mut().try_for_each(|v| resolve(v, secrets, used)),
        _ => Ok(()),
    }
}

fn lookup(name: &str, secrets: &Secrets, used: &mut Redactor) -> Result<String, String> {
    match secrets.get(name) {
        Some(v) => {
            used.add(&v);
            Ok(v)
        }
        None => Err(format!("Secret with name '{name}' is not available")),
    }
}

/// `None` when `s` has no placeholder.
fn resolve_str(s: &str, secrets: &Secrets, used: &mut Redactor) -> Result<Option<String>, String> {
    // Deprecated bare form: only a whole value counts, so a host like `secrets.example.com`
    // inside a URL is left alone.
    if let Some(name) = s.trim().strip_prefix("secrets.") {
        if !name.is_empty() && name.bytes().all(is_name_byte) {
            tracing::warn!(
                secret = name,
                "bare `secrets.{name}` is deprecated; use {{{{secrets.{name}}}}}"
            );
            return lookup(name, secrets, used).map(Some);
        }
    }
    if !s.contains("{{") {
        return Ok(None);
    }
    let mut out = String::with_capacity(s.len());
    let mut rest = s;
    let mut changed = false;
    while let Some(start) = rest.find("{{") {
        let after = &rest[start + 2..];
        let Some(end) = after.find("}}") else { break };
        let inner = after[..end].trim();
        match inner.strip_prefix("secrets.") {
            Some(name) if !name.is_empty() && name.bytes().all(is_name_byte) => {
                out.push_str(&rest[..start]);
                out.push_str(&lookup(name, secrets, used)?);
                changed = true;
            }
            _ => out.push_str(&rest[..start + 2 + end + 2]),
        }
        rest = &after[end + 2..];
    }
    out.push_str(rest);
    Ok(changed.then_some(out))
}

fn is_name_byte(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b"_-./".contains(&b)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn secrets() -> Secrets {
        Secrets::from_lookup("", |n| match n {
            "TOKEN" => Some("s3cr3t".into()),
            "P_KEY" => Some("prefixed".into()),
            "KEY" => Some("plain".into()),
            "Q" => Some("a b&c".into()),
            _ => None,
        })
    }

    #[test]
    fn replaces_placeholders_in_nested_strings() {
        let mut v = json!({"h": {"Authorization": "Bearer {{secrets.TOKEN}}"}, "l": ["{{ secrets.KEY }}", 1]});
        let mut used = Redactor::default();
        resolve(&mut v, &secrets(), &mut used).unwrap();
        assert_eq!(
            v,
            json!({"h": {"Authorization": "Bearer s3cr3t"}, "l": ["plain", 1]})
        );
        assert_eq!(used.redact("x s3cr3t plain"), "x *** ***");
    }

    #[test]
    fn prefix_hides_unprefixed_variables() {
        let s = Secrets::from_lookup("P_", |n| (n == "P_KEY").then(|| "prefixed".to_owned()));
        let mut used = Redactor::default();
        let mut v = json!("{{secrets.KEY}}");
        resolve(&mut v, &s, &mut used).unwrap();
        assert_eq!(v, json!("prefixed"));
        let mut v = json!("{{secrets.P_KEY}}");
        assert_eq!(
            resolve(&mut v, &s, &mut used).unwrap_err(),
            "Secret with name 'P_KEY' is not available"
        );
    }

    #[test]
    fn bare_form_only_as_whole_value() {
        let mut used = Redactor::default();
        let mut v = json!({"a": "secrets.TOKEN", "b": "https://secrets.example.com"});
        resolve(&mut v, &secrets(), &mut used).unwrap();
        assert_eq!(
            v,
            json!({"a": "s3cr3t", "b": "https://secrets.example.com"})
        );
    }

    #[test]
    fn non_secret_braces_are_kept() {
        let mut used = Redactor::default();
        let mut v = json!("{{name}} and {{secrets.TOKEN}} and {{");
        resolve(&mut v, &secrets(), &mut used).unwrap();
        assert_eq!(v, json!("{{name}} and s3cr3t and {{"));
    }

    #[test]
    fn redacts_percent_encoded_form() {
        let mut used = Redactor::default();
        let mut v = json!("{{secrets.Q}}");
        resolve(&mut v, &secrets(), &mut used).unwrap();
        assert_eq!(used.redact("url?q=a%20b%26c"), "url?q=***");
    }

    #[test]
    fn debug_never_prints_values() {
        let mut used = Redactor::default();
        let mut v = json!("{{secrets.TOKEN}}");
        resolve(&mut v, &secrets(), &mut used).unwrap();
        assert!(!format!("{used:?} {:?}", secrets()).contains("s3cr3t"));
    }
}
