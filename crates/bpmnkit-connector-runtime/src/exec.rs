//! Executes one REST connector job: secrets → request → HTTP → error/result expressions.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use bpmnkit_worker::{ActivatedJob, Complete, Handler, JobError};
use reqwest::redirect::Policy;
use serde_json::{json, Map, Value};

use crate::expr::{self, ErrorOutcome};
use crate::request::{ApiKeyLocation, Auth, ClientAuthentication, HttpRequest};
use crate::secrets::{resolve, Redactor, Secrets};

/// The job type of Camunda's REST connector.
pub const HTTP_JSON: &str = "io.camunda:http-json:1";

/// Above this the runner warns: the docs state no limit for 8.8, the SaaS guard is ~1.5 MiB.
const WARN_RESPONSE_BYTES: usize = 10 * 1024 * 1024;

#[derive(Clone, Debug, Default)]
pub struct Options {
    /// Responses above this many bytes fail the job; `None` = no limit (plan §7).
    pub max_response_bytes: Option<usize>,
}

/// The response as the expressions see it (`response` in FEEL).
#[derive(Clone, Debug, PartialEq)]
pub struct Response {
    pub status: u16,
    pub headers: Map<String, Value>,
    pub body: Value,
}

impl Response {
    pub fn to_json(&self) -> Value {
        json!({"status": self.status, "headers": self.headers, "body": self.body})
    }
}

type ClientKey = (Option<Duration>, Option<Duration>, bool);

/// The local REST connector: a [`Handler`] for `io.camunda:http-json:1` (and any type bound to it).
#[derive(Clone, Debug)]
pub struct HttpJsonConnector {
    secrets: Secrets,
    options: Options,
    clients: Arc<Mutex<HashMap<ClientKey, reqwest::Client>>>,
}

impl HttpJsonConnector {
    pub fn new(secrets: Secrets) -> Self {
        Self {
            secrets,
            options: Options::default(),
            clients: Arc::default(),
        }
    }

    pub fn options(mut self, options: Options) -> Self {
        self.options = options;
        self
    }

    fn client(&self, r: &HttpRequest) -> Result<reqwest::Client, String> {
        let key = (r.connect_timeout, r.read_timeout, r.follow_redirects);
        let mut clients = self.clients.lock().unwrap_or_else(|e| e.into_inner());
        if let Some(c) = clients.get(&key) {
            return Ok(c.clone());
        }
        let mut b = reqwest::Client::builder().redirect(if r.follow_redirects {
            Policy::limited(10)
        } else {
            Policy::none()
        });
        if let Some(d) = r.connect_timeout {
            b = b.connect_timeout(d);
        }
        if let Some(d) = r.read_timeout {
            b = b.read_timeout(d);
        }
        let c = b.build().map_err(|e| format!("HTTP client: {e}"))?;
        clients.insert(key, c.clone());
        Ok(c)
    }

    /// Runs the job and returns what the worker should send. Every message is redacted.
    pub async fn execute(&self, job: &ActivatedJob) -> Result<Complete, JobError> {
        let mut redactor = Redactor::default();
        let result = self.run(job, &mut redactor).await;
        result.map_err(|e| redact_error(e, &redactor))
    }

    async fn run(&self, job: &ActivatedJob, redactor: &mut Redactor) -> Result<Complete, JobError> {
        let mut vars = Value::Object(job.variables.clone());
        resolve(&mut vars, &self.secrets, redactor).map_err(JobError::fail)?;
        let Value::Object(vars) = vars else {
            unreachable!("resolve keeps the shape")
        };
        let request = HttpRequest::from_variables(&vars).map_err(JobError::fail)?;
        let response = self.send(&request).await.map_err(JobError::fail)?;
        tracing::debug!(job = %job.job_key, status = response.status, "http-json response");

        let header = |k: &str| job.header(k).filter(|s| !s.trim().is_empty());
        let job_ctx = json!({"retries": job.retries, "key": job.job_key, "type": job.job_type});
        let error_expr = header("errorExpression").unwrap_or("");

        if response.status >= 400 {
            let error = json!({
                "code": response.status.to_string(),
                "message": reason(response.status),
                "variables": {"response": {"headers": response.headers, "body": response.body}},
            });
            let scope = [
                ("error", &error),
                ("job", &job_ctx),
                ("response", &Value::Null),
            ];
            return match expr::error_outcome(error_expr, &scope).map_err(JobError::fail)? {
                Some(outcome) => outcome_to_result(outcome),
                None => Err(JobError::fail(reason(response.status))),
            };
        }

        let resp = response.to_json();
        let scope = [
            ("response", &resp),
            ("error", &Value::Null),
            ("job", &job_ctx),
        ];
        if let Some(outcome) = expr::error_outcome(error_expr, &scope).map_err(JobError::fail)? {
            if !matches!(outcome, ErrorOutcome::Ignore(_)) {
                return outcome_to_result(outcome);
            }
        }
        let mut out = Map::new();
        if let Some(name) = header("resultVariable") {
            out.insert(name.trim().to_owned(), resp.clone());
        }
        if let Some(expr) = header("resultExpression") {
            if let Some(vars) =
                expr::result_variables(expr, &[("response", &resp)]).map_err(JobError::fail)?
            {
                out.extend(vars);
            }
        }
        Ok(Complete::from(out))
    }

    async fn send(&self, r: &HttpRequest) -> Result<Response, String> {
        let client = self.client(r)?;
        let method = reqwest::Method::from_bytes(r.method.as_bytes()).map_err(|e| e.to_string())?;
        let mut query = r.query.clone();
        let mut b = client.request(method, &r.url);
        match &r.auth {
            Auth::None => {}
            Auth::ApiKey {
                location: ApiKeyLocation::Headers,
                name,
                value,
            } => b = b.header(name.as_str(), value.as_str()),
            Auth::ApiKey {
                location: ApiKeyLocation::Query,
                name,
                value,
            } => query.push((name.clone(), value.clone())),
            Auth::Basic { username, password } => b = b.basic_auth(username, Some(password)),
            Auth::Bearer(t) => b = b.bearer_auth(t),
            Auth::OAuthClientCredentials { .. } => {
                b = b.bearer_auth(self.oauth_token(&client, &r.auth).await?)
            }
        }
        for (k, v) in &r.headers {
            b = b.header(k.as_str(), v.as_str());
        }
        if !query.is_empty() {
            b = b.query(&query);
        }
        if let Some(body) = &r.body {
            let body = if r.ignore_null_values {
                drop_nulls(body.clone())
            } else {
                body.clone()
            };
            let ct = r.content_type().unwrap_or("application/json").to_owned();
            if r.content_type().is_none() {
                b = b.header("Content-Type", ct.as_str());
            }
            b = match (&body, ct.to_ascii_lowercase()) {
                (Value::Object(m), ct) if ct.starts_with("application/x-www-form-urlencoded") => {
                    let form: Vec<(String, String)> = m
                        .iter()
                        .filter(|(_, v)| !v.is_null())
                        .map(|(k, v)| (k.clone(), scalar_text(v)))
                        .collect();
                    b.body(form_encode(&form))
                }
                // A string body goes out as given (a pre-rendered payload, or text/plain).
                (Value::String(s), _) => b.body(s.clone()),
                (v, _) => b.body(v.to_string()),
            };
        }
        let resp = b
            .send()
            .await
            // Without the URL: it can carry a literal API key or userinfo the redactor never saw.
            .map_err(|e| format!("HTTP request failed: {}", e.without_url()))?;
        let status = resp.status().as_u16();
        let mut headers = Map::new();
        for (k, v) in resp.headers() {
            let v = String::from_utf8_lossy(v.as_bytes()).into_owned();
            match headers.get_mut(k.as_str()) {
                Some(Value::String(prev)) => {
                    prev.push_str(", ");
                    prev.push_str(&v);
                }
                _ => {
                    headers.insert(k.as_str().to_owned(), Value::String(v));
                }
            }
        }
        // Refuse a declared oversize body before buffering it.
        if let (Some(max), Some(len)) = (self.options.max_response_bytes, resp.content_length()) {
            if len > max as u64 {
                return Err(format!(
                    "response of {len} bytes exceeds max_response_bytes ({max})"
                ));
            }
        }
        let bytes = resp
            .bytes()
            .await
            .map_err(|e| format!("reading the response failed: {}", e.without_url()))?;
        if let Some(max) = self.options.max_response_bytes {
            if bytes.len() > max {
                return Err(format!(
                    "response of {} bytes exceeds max_response_bytes ({max})",
                    bytes.len()
                ));
            }
        }
        if bytes.len() > WARN_RESPONSE_BYTES {
            tracing::warn!(bytes = bytes.len(), "large http-json response");
        }
        Ok(Response {
            status,
            headers,
            body: parse_body(&bytes),
        })
    }

    async fn oauth_token(&self, client: &reqwest::Client, auth: &Auth) -> Result<String, String> {
        let Auth::OAuthClientCredentials {
            token_endpoint,
            client_id,
            client_secret,
            audience,
            scopes,
            client_authentication,
        } = auth
        else {
            unreachable!()
        };
        let mut form = vec![("grant_type".to_owned(), "client_credentials".to_owned())];
        if let Some(a) = audience {
            form.push(("audience".into(), a.clone()));
        }
        if let Some(s) = scopes {
            form.push(("scope".into(), s.clone()));
        }
        let mut b = client
            .post(token_endpoint)
            .header("Content-Type", "application/x-www-form-urlencoded");
        match client_authentication {
            ClientAuthentication::BasicAuthHeader => {
                b = b.basic_auth(client_id, Some(client_secret))
            }
            ClientAuthentication::CredentialsBody => {
                form.push(("client_id".into(), client_id.clone()));
                form.push(("client_secret".into(), client_secret.clone()));
            }
        }
        let resp = b
            .body(form_encode(&form))
            .send()
            .await
            .map_err(|e| format!("OAuth token request failed: {}", e.without_url()))?;
        let status = resp.status().as_u16();
        let body = resp.bytes().await.map_err(|e| e.to_string())?;
        if status >= 400 {
            return Err(format!("OAuth token request failed with status {status}"));
        }
        match parse_body(&body).get("access_token") {
            Some(Value::String(t)) => Ok(t.clone()),
            _ => Err("OAuth token response has no access_token".into()),
        }
    }
}

impl Handler for HttpJsonConnector {
    fn handle(
        &self,
        job: ActivatedJob,
    ) -> impl std::future::Future<Output = Result<Complete, JobError>> + Send {
        let this = self.clone();
        async move { this.execute(&job).await }
    }
}

// JobError is the worker's Handler contract; boxing it here would only move the size elsewhere.
#[allow(clippy::result_large_err)]
fn outcome_to_result(o: ErrorOutcome) -> Result<Complete, JobError> {
    match o {
        ErrorOutcome::Bpmn {
            code,
            message,
            variables,
        } => Err(JobError::Bpmn {
            code,
            message,
            variables,
        }),
        ErrorOutcome::Job {
            message,
            variables,
            retries,
            retry_backoff,
        } => Err(JobError::Fail {
            message,
            retries,
            retry_backoff,
            variables,
        }),
        ErrorOutcome::Ignore(vars) => Ok(Complete::from(vars.unwrap_or_default())),
    }
}

fn redact_error(e: JobError, r: &Redactor) -> JobError {
    if r.is_empty() {
        return e;
    }
    match e {
        JobError::Fail {
            message,
            retries,
            retry_backoff,
            variables,
        } => JobError::Fail {
            message: r.redact(&message),
            retries,
            retry_backoff,
            variables: variables.map(|v| redact_map(v, r)),
        },
        // Error variables often carry the response, which may echo a credential back.
        JobError::Bpmn {
            code,
            message,
            variables,
        } => JobError::Bpmn {
            code: r.redact(&code),
            message: message.map(|m| r.redact(&m)),
            variables: variables.map(|v| redact_map(v, r)),
        },
    }
}

fn redact_map(m: Map<String, Value>, r: &Redactor) -> Map<String, Value> {
    m.into_iter()
        .map(|(k, v)| (k, redact_value(v, r)))
        .collect()
}

fn redact_value(v: Value, r: &Redactor) -> Value {
    match v {
        Value::String(s) => Value::String(r.redact(&s)),
        Value::Array(a) => Value::Array(a.into_iter().map(|v| redact_value(v, r)).collect()),
        Value::Object(m) => Value::Object(redact_map(m, r)),
        other => other,
    }
}

/// The reason phrase the runtime reports for an HTTP error status.
fn reason(status: u16) -> String {
    reqwest::StatusCode::from_u16(status)
        .ok()
        .and_then(|s| s.canonical_reason())
        .map_or_else(|| format!("HTTP {status}"), str::to_owned)
}

/// JSON when it parses, else the text; an empty body is null.
fn parse_body(bytes: &[u8]) -> Value {
    if bytes.iter().all(u8::is_ascii_whitespace) {
        return Value::Null;
    }
    serde_json::from_slice(bytes)
        .unwrap_or_else(|_| Value::String(String::from_utf8_lossy(bytes).into_owned()))
}

fn drop_nulls(v: Value) -> Value {
    match v {
        Value::Object(m) => Value::Object(
            m.into_iter()
                .filter(|(_, v)| !v.is_null())
                .map(|(k, v)| (k, drop_nulls(v)))
                .collect(),
        ),
        Value::Array(a) => Value::Array(a.into_iter().map(drop_nulls).collect()),
        other => other,
    }
}

fn scalar_text(v: &Value) -> String {
    match v {
        Value::String(s) => s.clone(),
        other => other.to_string(),
    }
}

fn form_encode(pairs: &[(String, String)]) -> String {
    fn enc(s: &str, out: &mut String) {
        for b in s.bytes() {
            match b {
                b' ' => out.push('+'),
                b if b.is_ascii_alphanumeric() || b"-._*".contains(&b) => out.push(b as char),
                b => out.push_str(&format!("%{b:02X}")),
            }
        }
    }
    let mut out = String::new();
    for (i, (k, v)) in pairs.iter().enumerate() {
        if i > 0 {
            out.push('&');
        }
        enc(k, &mut out);
        out.push('=');
        enc(v, &mut out);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    // Regression: only `message` was scrubbed, so a secret echoed in the response reached the
    // engine through `error.variables` or the error code.
    #[test]
    fn error_variables_and_code_are_redacted() {
        let secrets = Secrets::from_lookup("", |n| (n == "T").then(|| "tok3n".to_owned()));
        let mut r = Redactor::default();
        resolve(&mut json!("{{secrets.T}}"), &secrets, &mut r).unwrap();
        let vars = json!({"response": {"headers": {"echo": "Bearer tok3n"}, "list": ["tok3n", 1]}});
        let Value::Object(vars) = vars else {
            unreachable!()
        };
        let bpmn = JobError::Bpmn {
            code: "E_tok3n".into(),
            message: Some("bad tok3n".into()),
            variables: Some(vars.clone()),
        };
        let JobError::Bpmn {
            code,
            message,
            variables,
        } = redact_error(bpmn, &r)
        else {
            unreachable!()
        };
        assert_eq!(code, "E_***");
        assert_eq!(message.as_deref(), Some("bad ***"));
        assert_eq!(
            Value::Object(variables.unwrap()),
            json!({"response": {"headers": {"echo": "Bearer ***"}, "list": ["***", 1]}})
        );
        let fail = JobError::Fail {
            message: "m".into(),
            retries: None,
            retry_backoff: None,
            variables: Some(vars),
        };
        let JobError::Fail { variables, .. } = redact_error(fail, &r) else {
            unreachable!()
        };
        assert!(!Value::Object(variables.unwrap())
            .to_string()
            .contains("tok3n"));
    }

    // Regression: reqwest's error text includes the full URL, which can hold a literal
    // (non-`{{secrets}}`) API key in the query.
    #[tokio::test]
    async fn transport_error_does_not_echo_the_url() {
        let e = reqwest::Client::new()
            .get("http://127.0.0.1:1/x?key=LITERALKEY")
            .send()
            .await
            .unwrap_err();
        assert!(!e.without_url().to_string().contains("LITERALKEY"));
    }

    #[test]
    fn body_parsing() {
        assert_eq!(parse_body(b""), Value::Null);
        assert_eq!(parse_body(b" \n"), Value::Null);
        assert_eq!(parse_body(b"{\"a\":1}"), json!({"a": 1}));
        assert_eq!(parse_body(b"plain"), json!("plain"));
    }

    #[test]
    fn nulls_dropped_recursively() {
        assert_eq!(
            drop_nulls(json!({"a": null, "b": {"c": null, "d": 1}, "e": [{"f": null}]})),
            json!({"b": {"d": 1}, "e": [{}]})
        );
    }

    #[test]
    fn form_encoding() {
        assert_eq!(
            form_encode(&[("a b".into(), "x&y=z".into()), ("k".into(), "é".into())]),
            "a+b=x%26y%3Dz&k=%C3%A9"
        );
    }

    #[test]
    fn reasons() {
        assert_eq!(reason(404), "Not Found");
        assert_eq!(reason(599), "HTTP 599");
    }
}
