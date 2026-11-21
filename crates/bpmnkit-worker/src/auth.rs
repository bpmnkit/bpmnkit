//! Credentials and the request authenticator (OAuth2 tokens cached and shared).

use std::fmt;
#[cfg(feature = "oauth")]
use std::time::Duration;

use crate::error::Error;

/// How requests authenticate.
#[derive(Clone, Default)]
pub enum Credentials {
    /// No `Authorization` header (local engines, reebe, c8run without auth).
    #[default]
    None,
    Basic {
        username: String,
        password: String,
    },
    /// A fixed bearer token.
    Bearer(String),
    /// OAuth2 client credentials; the token is cached and refreshed at 80 % of its lifetime.
    #[cfg(feature = "oauth")]
    OAuth(OAuthConfig),
}

/// OAuth2 client-credentials grant.
#[cfg(feature = "oauth")]
#[derive(Clone)]
pub struct OAuthConfig {
    pub token_url: String,
    pub client_id: String,
    pub client_secret: String,
    pub audience: Option<String>,
    pub scope: Option<String>,
}

// Secrets never reach logs through `{:?}`.
impl fmt::Debug for Credentials {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Credentials::None => f.write_str("None"),
            Credentials::Basic { username, .. } => {
                write!(f, "Basic {{ username: {username:?}, password: <redacted> }}")
            }
            Credentials::Bearer(_) => f.write_str("Bearer(<redacted>)"),
            #[cfg(feature = "oauth")]
            Credentials::OAuth(o) => write!(
                f,
                "OAuth {{ token_url: {:?}, client_id: {:?}, client_secret: <redacted>, audience: {:?}, scope: {:?} }}",
                o.token_url, o.client_id, o.audience, o.scope
            ),
        }
    }
}

impl Credentials {
    /// Picks credentials from Camunda's environment variable names.
    ///
    /// `CAMUNDA_AUTH_STRATEGY` (`NONE` | `BASIC` | `BEARER` | `OAUTH`) forces a mode; without it,
    /// `CAMUNDA_CLIENT_ID` + `CAMUNDA_CLIENT_SECRET` mean OAuth (`CAMUNDA_OAUTH_URL`,
    /// `CAMUNDA_TOKEN_AUDIENCE`, `CAMUNDA_TOKEN_SCOPE`), `CAMUNDA_BASIC_AUTH_USERNAME` +
    /// `CAMUNDA_BASIC_AUTH_PASSWORD` mean Basic, `CAMUNDA_TOKEN` means Bearer, else None.
    pub fn from_lookup(get: impl Fn(&str) -> Option<String>) -> Result<Self, Error> {
        let need = |k: &str| get(k).ok_or_else(|| Error::Config(format!("{k} is not set")));
        let strategy = match get("CAMUNDA_AUTH_STRATEGY") {
            Some(s) => s.to_ascii_uppercase(),
            None if get("CAMUNDA_CLIENT_ID").is_some()
                && get("CAMUNDA_CLIENT_SECRET").is_some() =>
            {
                "OAUTH".into()
            }
            None if get("CAMUNDA_BASIC_AUTH_USERNAME").is_some() => "BASIC".into(),
            None if get("CAMUNDA_TOKEN").is_some() => "BEARER".into(),
            None => "NONE".into(),
        };
        match strategy.as_str() {
            "NONE" => Ok(Credentials::None),
            "BASIC" => Ok(Credentials::Basic {
                username: need("CAMUNDA_BASIC_AUTH_USERNAME")?,
                password: need("CAMUNDA_BASIC_AUTH_PASSWORD")?,
            }),
            "BEARER" => Ok(Credentials::Bearer(need("CAMUNDA_TOKEN")?)),
            #[cfg(feature = "oauth")]
            "OAUTH" => Ok(Credentials::OAuth(OAuthConfig {
                token_url: need("CAMUNDA_OAUTH_URL")?,
                client_id: need("CAMUNDA_CLIENT_ID")?,
                client_secret: need("CAMUNDA_CLIENT_SECRET")?,
                audience: get("CAMUNDA_TOKEN_AUDIENCE"),
                scope: get("CAMUNDA_TOKEN_SCOPE"),
            })),
            #[cfg(not(feature = "oauth"))]
            "OAUTH" => Err(Error::Config(
                "OAuth credentials need the `oauth` feature of bpmnkit-worker".into(),
            )),
            other => Err(Error::Config(format!(
                "CAMUNDA_AUTH_STRATEGY {other:?} is not NONE, BASIC, BEARER or OAUTH"
            ))),
        }
    }
}

#[cfg(feature = "oauth")]
struct CachedToken {
    token: String,
    refresh_at: tokio::time::Instant,
}

/// Adds the `Authorization` header; shared by every worker of a client.
pub(crate) struct Authenticator {
    credentials: Credentials,
    #[cfg(feature = "oauth")]
    // An async mutex held across the token request: concurrent callers wait for the one fetch
    // instead of each asking the token endpoint (single flight).
    cache: tokio::sync::Mutex<Option<CachedToken>>,
}

impl Authenticator {
    pub(crate) fn new(credentials: Credentials) -> Self {
        Self {
            credentials,
            #[cfg(feature = "oauth")]
            cache: tokio::sync::Mutex::new(None),
        }
    }

    // `http` fetches OAuth tokens; without the feature there is nothing to fetch.
    #[cfg_attr(not(feature = "oauth"), allow(unused_variables))]
    pub(crate) async fn apply(
        &self,
        http: &reqwest::Client,
        rb: reqwest::RequestBuilder,
    ) -> Result<reqwest::RequestBuilder, Error> {
        Ok(match &self.credentials {
            Credentials::None => rb,
            Credentials::Basic { username, password } => rb.basic_auth(username, Some(password)),
            Credentials::Bearer(t) => rb.bearer_auth(t),
            #[cfg(feature = "oauth")]
            Credentials::OAuth(o) => rb.bearer_auth(self.token(http, o).await?),
        })
    }

    /// The header value `apply` would set, if any. Built through a throwaway request so Basic
    /// encoding stays in one place.
    #[cfg(feature = "grpc")]
    pub(crate) async fn authorization(
        &self,
        http: &reqwest::Client,
    ) -> Result<Option<String>, Error> {
        if matches!(self.credentials, Credentials::None) {
            return Ok(None);
        }
        let req = self
            .apply(http, http.get("http://localhost/"))
            .await?
            .build()?;
        Ok(req
            .headers()
            .get(reqwest::header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .map(str::to_owned))
    }

    /// Drops a cached token the server rejected; returns whether a retry can help.
    pub(crate) async fn invalidate(&self) -> bool {
        #[cfg(feature = "oauth")]
        if matches!(self.credentials, Credentials::OAuth(_)) {
            *self.cache.lock().await = None;
            return true;
        }
        false
    }

    #[cfg(feature = "oauth")]
    async fn token(&self, http: &reqwest::Client, o: &OAuthConfig) -> Result<String, Error> {
        let mut cache = self.cache.lock().await;
        let now = tokio::time::Instant::now();
        if let Some(c) = cache.as_ref().filter(|c| now < c.refresh_at) {
            return Ok(c.token.clone());
        }
        let mut form = vec![
            ("grant_type", "client_credentials"),
            ("client_id", o.client_id.as_str()),
            ("client_secret", o.client_secret.as_str()),
        ];
        if let Some(a) = &o.audience {
            form.push(("audience", a));
        }
        if let Some(s) = &o.scope {
            form.push(("scope", s));
        }
        let resp = http.post(&o.token_url).form(&form).send().await?;
        let status = resp.status();
        let body = resp.text().await?;
        if !status.is_success() {
            return Err(Error::Auth(format!(
                "token endpoint answered {status}: {body}"
            )));
        }
        let v: serde_json::Value = serde_json::from_str(&body)
            .map_err(|e| Error::Auth(format!("token response is not JSON: {e}")))?;
        let token = v["access_token"]
            .as_str()
            .ok_or_else(|| Error::Auth("token response has no access_token".into()))?
            .to_owned();
        // Some providers send expires_in as a string; absent means an assumed 5 minutes.
        let lifetime = v["expires_in"]
            .as_u64()
            .or_else(|| v["expires_in"].as_str().and_then(|s| s.parse().ok()))
            .unwrap_or(300);
        let refresh_at = now + Duration::from_millis(lifetime * 800);
        *cache = Some(CachedToken {
            token: token.clone(),
            refresh_at,
        });
        Ok(token)
    }
}
