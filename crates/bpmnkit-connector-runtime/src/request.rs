//! The REST connector's input (`io.camunda:http-json:1` job variables after input mappings and
//! secret resolution) as a typed request. Names follow the bundled `HttpJson.v2` template and
//! connector-gen's generated templates (`authentication.apiKeyName` / `apiKeyValue` are
//! connector-gen's spelling of the catalog's `name` / `value`).

use std::time::Duration;

use serde_json::{Map, Value};

/// Default for both timeouts when the variable is absent (docs: 20 s; `0` = no limit).
pub const DEFAULT_TIMEOUT: Duration = Duration::from_secs(20);

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ApiKeyLocation {
    Headers,
    Query,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ClientAuthentication {
    /// `client_id` / `client_secret` in the form body (the default).
    CredentialsBody,
    /// HTTP Basic with the client credentials.
    BasicAuthHeader,
}

/// `authentication.*`. Values are secret-resolved; `Debug` is not derived so they never print.
#[derive(Clone, PartialEq, Eq)]
pub enum Auth {
    None,
    ApiKey {
        location: ApiKeyLocation,
        name: String,
        value: String,
    },
    Basic {
        username: String,
        password: String,
    },
    Bearer(String),
    OAuthClientCredentials {
        token_endpoint: String,
        client_id: String,
        client_secret: String,
        audience: Option<String>,
        scopes: Option<String>,
        client_authentication: ClientAuthentication,
    },
}

impl std::fmt::Debug for Auth {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(match self {
            Auth::None => "None",
            Auth::ApiKey { .. } => "ApiKey(<redacted>)",
            Auth::Basic { .. } => "Basic(<redacted>)",
            Auth::Bearer(_) => "Bearer(<redacted>)",
            Auth::OAuthClientCredentials { .. } => "OAuthClientCredentials(<redacted>)",
        })
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<(String, String)>,
    pub query: Vec<(String, String)>,
    pub body: Option<Value>,
    pub auth: Auth,
    /// `None` = no limit.
    pub connect_timeout: Option<Duration>,
    pub read_timeout: Option<Duration>,
    pub follow_redirects: bool,
    pub ignore_null_values: bool,
}

const METHODS: [&str; 7] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

impl HttpRequest {
    pub fn from_variables(vars: &Map<String, Value>) -> Result<Self, String> {
        let method = text(vars.get("method"))
            .unwrap_or_else(|| "GET".into())
            .to_ascii_uppercase();
        if !METHODS.contains(&method.as_str()) {
            return Err(format!("unsupported HTTP method '{method}'"));
        }
        let url = text(vars.get("url")).ok_or("missing required property 'url'")?;
        let url = url.trim().to_owned();
        if !(url.starts_with("http://") || url.starts_with("https://")) {
            return Err(format!(
                "url must start with http:// or https://, got '{url}'"
            ));
        }
        let body = match vars.get("body") {
            None | Some(Value::Null) => None,
            Some(Value::String(s)) if s.is_empty() => None,
            Some(v) => Some(v.clone()),
        };
        Ok(Self {
            method,
            url,
            headers: pairs(vars.get("headers"), "headers")?,
            query: pairs(vars.get("queryParameters"), "queryParameters")?,
            body,
            auth: auth(vars.get("authentication"))?,
            connect_timeout: timeout(vars.get("connectionTimeoutInSeconds"))?,
            read_timeout: timeout(vars.get("readTimeoutInSeconds"))?,
            follow_redirects: flag(vars.get("followRedirects")),
            ignore_null_values: flag(vars.get("ignoreNullValues")),
        })
    }

    /// The `Content-Type` the caller set, if any.
    pub fn content_type(&self) -> Option<&str> {
        self.headers
            .iter()
            .find(|(k, _)| k.eq_ignore_ascii_case("content-type"))
            .map(|(_, v)| v.as_str())
    }
}

/// A scalar as text (Zeebe passes literal input values as strings, FEEL ones typed).
fn text(v: Option<&Value>) -> Option<String> {
    match v? {
        Value::Null => None,
        Value::String(s) => Some(s.clone()),
        Value::Bool(b) => Some(b.to_string()),
        Value::Number(n) => Some(n.to_string()),
        other => Some(other.to_string()),
    }
}

fn flag(v: Option<&Value>) -> bool {
    match v {
        Some(Value::Bool(b)) => *b,
        Some(Value::String(s)) => s.eq_ignore_ascii_case("true"),
        _ => false,
    }
}

fn timeout(v: Option<&Value>) -> Result<Option<Duration>, String> {
    let secs = match v {
        None | Some(Value::Null) => return Ok(Some(DEFAULT_TIMEOUT)),
        Some(Value::String(s)) if s.trim().is_empty() => return Ok(Some(DEFAULT_TIMEOUT)),
        Some(Value::Number(n)) => n.as_f64(),
        Some(Value::String(s)) => s.trim().parse::<f64>().ok(),
        _ => None,
    };
    match secs {
        Some(0.0) => Ok(None),
        Some(s) if s > 0.0 && s.is_finite() => Ok(Some(Duration::from_secs_f64(s))),
        _ => Err(format!(
            "invalid timeout {}",
            v.map_or_else(String::new, Value::to_string)
        )),
    }
}

/// A FEEL context (an object), or a JSON object as text, to name/value pairs; nulls are left out.
fn pairs(v: Option<&Value>, field: &str) -> Result<Vec<(String, String)>, String> {
    let parsed;
    let map = match v {
        None | Some(Value::Null) => return Ok(Vec::new()),
        Some(Value::String(s)) if s.trim().is_empty() => return Ok(Vec::new()),
        Some(Value::String(s)) => {
            parsed = serde_json::from_str::<Value>(s)
                .map_err(|_| format!("'{field}' must be a map, got a string"))?;
            match &parsed {
                Value::Object(m) => m,
                _ => return Err(format!("'{field}' must be a map")),
            }
        }
        Some(Value::Object(m)) => m,
        Some(_) => return Err(format!("'{field}' must be a map")),
    };
    Ok(map
        .iter()
        .filter_map(|(k, v)| text(Some(v)).map(|t| (k.clone(), t)))
        .collect())
}

fn auth(v: Option<&Value>) -> Result<Auth, String> {
    let Some(Value::Object(a)) = v else {
        return Ok(Auth::None);
    };
    let get = |k: &str| text(a.get(k)).filter(|s| !s.is_empty());
    let need =
        |k: &str| get(k).ok_or_else(|| format!("missing required property 'authentication.{k}'"));
    match get("type").as_deref() {
        None | Some("noAuth") => Ok(Auth::None),
        Some("apiKey") => Ok(Auth::ApiKey {
            location: match get("apiKeyLocation").as_deref() {
                Some("query") => ApiKeyLocation::Query,
                _ => ApiKeyLocation::Headers,
            },
            name: get("name")
                .or_else(|| get("apiKeyName"))
                .ok_or("missing required property 'authentication.name'")?,
            value: get("value")
                .or_else(|| get("apiKeyValue"))
                .ok_or("missing required property 'authentication.value'")?,
        }),
        Some("basic") => Ok(Auth::Basic {
            username: need("username")?,
            password: get("password").unwrap_or_default(),
        }),
        Some("bearer") => Ok(Auth::Bearer(need("token")?)),
        Some("oauth-client-credentials-flow") => Ok(Auth::OAuthClientCredentials {
            token_endpoint: need("oauthTokenEndpoint")?,
            client_id: need("clientId")?,
            client_secret: need("clientSecret")?,
            audience: get("audience"),
            scopes: get("scopes"),
            client_authentication: match get("clientAuthentication").as_deref() {
                Some("basicAuthHeader") => ClientAuthentication::BasicAuthHeader,
                _ => ClientAuthentication::CredentialsBody,
            },
        }),
        Some(other) => Err(format!(
            "authentication type '{other}' is not supported by the local runner (use none, apiKey, basic, bearer or oauth-client-credentials-flow)"
        )),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn req(v: Value) -> Result<HttpRequest, String> {
        HttpRequest::from_variables(v.as_object().unwrap())
    }

    #[test]
    fn defaults() {
        let r = req(json!({"url": "https://x.test/a"})).unwrap();
        assert_eq!(r.method, "GET");
        assert_eq!(r.connect_timeout, Some(DEFAULT_TIMEOUT));
        assert_eq!(r.read_timeout, Some(DEFAULT_TIMEOUT));
        assert_eq!(r.auth, Auth::None);
        assert!(!r.follow_redirects);
    }

    #[test]
    fn zero_timeout_is_unlimited_and_strings_parse() {
        let r = req(json!({"url": "http://x", "connectionTimeoutInSeconds": "0", "readTimeoutInSeconds": 5})).unwrap();
        assert_eq!(r.connect_timeout, None);
        assert_eq!(r.read_timeout, Some(Duration::from_secs(5)));
        assert!(req(json!({"url": "http://x", "readTimeoutInSeconds": "soon"})).is_err());
    }

    #[test]
    fn maps_from_context_or_json_text() {
        let r = req(json!({"url": "http://x", "headers": "{\"A\":\"1\"}", "queryParameters": {"q": 2, "n": null}})).unwrap();
        assert_eq!(r.headers, vec![("A".into(), "1".into())]);
        assert_eq!(r.query, vec![("q".into(), "2".into())]);
        assert!(req(json!({"url": "http://x", "headers": "nope"})).is_err());
    }

    #[test]
    fn rejects_missing_url_and_bad_scheme() {
        assert!(req(json!({})).unwrap_err().contains("'url'"));
        assert!(req(json!({"url": "ftp://x"})).is_err());
        assert!(req(json!({"url": "http://x", "method": "TRACE"})).is_err());
    }

    #[test]
    fn auth_variants() {
        let a = |v: Value| req(json!({"url": "http://x", "authentication": v})).map(|r| r.auth);
        assert_eq!(a(json!({"type": "noAuth"})).unwrap(), Auth::None);
        assert_eq!(
            a(json!({"type": "bearer", "token": "t"})).unwrap(),
            Auth::Bearer("t".into())
        );
        assert_eq!(
            a(json!({"type": "apiKey", "apiKeyLocation": "query", "apiKeyName": "k", "apiKeyValue": "v"})).unwrap(),
            Auth::ApiKey { location: ApiKeyLocation::Query, name: "k".into(), value: "v".into() }
        );
        assert_eq!(
            a(json!({"type": "apiKey", "name": "X-Key", "value": "v"})).unwrap(),
            Auth::ApiKey {
                location: ApiKeyLocation::Headers,
                name: "X-Key".into(),
                value: "v".into()
            }
        );
        assert!(matches!(
            a(json!({"type": "oauth-client-credentials-flow", "oauthTokenEndpoint": "http://t", "clientId": "c", "clientSecret": "s", "clientAuthentication": "basicAuthHeader"})).unwrap(),
            Auth::OAuthClientCredentials { client_authentication: ClientAuthentication::BasicAuthHeader, .. }
        ));
        assert!(a(json!({"type": "bearer"}))
            .unwrap_err()
            .contains("authentication.token"));
        assert!(a(json!({"type": "oauth-refresh-token"}))
            .unwrap_err()
            .contains("not supported"));
        assert_eq!(
            format!(
                "{:?}",
                a(json!({"type": "bearer", "token": "t0p"})).unwrap()
            ),
            "Bearer(<redacted>)"
        );
    }
}
