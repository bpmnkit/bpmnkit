//! The `/v2/jobs` client.

use std::future::Future;
use std::time::Duration;

use reqwest::Method;
use serde::Serialize;

use crate::auth::Authenticator;
use crate::config::ClientConfig;
use crate::error::Error;
use crate::types::{
    ActivateJobsRequest, ActivateJobsResponse, ActivatedJob, CompleteJobRequest, FailJobRequest,
    ThrowErrorRequest, UpdateJobRequest,
};

/// The job commands a worker needs. [`RestClient`] talks to a cluster;
/// `testing::FakeClient` records calls in memory.
pub trait JobClient: Send + Sync + 'static {
    /// `POST /jobs/activation`. The HTTP deadline is the request's `requestTimeout` (the long
    /// poll) plus the client's offset, so the server answers before the client gives up.
    fn activate(
        &self,
        req: &ActivateJobsRequest,
    ) -> impl Future<Output = Result<Vec<ActivatedJob>, Error>> + Send;
    /// `POST /jobs/{jobKey}/completion`.
    fn complete(
        &self,
        job_key: &str,
        req: &CompleteJobRequest,
    ) -> impl Future<Output = Result<(), Error>> + Send;
    /// `POST /jobs/{jobKey}/failure`.
    fn fail(
        &self,
        job_key: &str,
        req: &FailJobRequest,
    ) -> impl Future<Output = Result<(), Error>> + Send;
    /// `POST /jobs/{jobKey}/error`.
    fn throw_error(
        &self,
        job_key: &str,
        req: &ThrowErrorRequest,
    ) -> impl Future<Output = Result<(), Error>> + Send;
    /// `PATCH /jobs/{jobKey}`.
    fn update(
        &self,
        job_key: &str,
        req: &UpdateJobRequest,
    ) -> impl Future<Output = Result<(), Error>> + Send;
}

/// REST client for the Orchestration Cluster API (`/v2`).
pub struct RestClient {
    http: reqwest::Client,
    base: String,
    auth: Authenticator,
    request_timeout: Duration,
    request_timeout_offset: Duration,
    tenant_ids: Vec<String>,
}

impl RestClient {
    pub fn new(config: ClientConfig) -> Result<Self, Error> {
        let base = normalize_base(&config.rest_address)?;
        let mut builder = reqwest::Client::builder()
            .user_agent(concat!("bpmnkit-worker/", env!("CARGO_PKG_VERSION")));
        if let Some(tls) = &config.tls {
            tls.validate()?;
            let bad = |what: &str, e: reqwest::Error| Error::Config(format!("{what}: {e}"));
            if let Some(ca) = &tls.ca_cert_pem {
                let cert =
                    reqwest::Certificate::from_pem(ca).map_err(|e| bad("CA certificate", e))?;
                builder = builder.add_root_certificate(cert);
            }
            if let (Some(cert), Some(key)) = (&tls.client_cert_pem, &tls.client_key_pem) {
                // reqwest's rustls identity is one PEM holding chain and key.
                let mut pem = cert.clone();
                pem.push(b'\n');
                pem.extend_from_slice(key);
                let id =
                    reqwest::Identity::from_pem(&pem).map_err(|e| bad("client identity", e))?;
                builder = builder.identity(id);
            }
        }
        // reqwest accepts a PEM with no certificate in it and only fails here.
        let http = builder.build().map_err(|e| match config.tls {
            Some(_) => Error::Config(format!("TLS setup: {e}")),
            None => Error::Transport(e),
        })?;
        Ok(Self {
            http,
            base,
            auth: Authenticator::new(config.credentials),
            request_timeout: config.request_timeout,
            request_timeout_offset: config.request_timeout_offset,
            tenant_ids: config.tenant_ids,
        })
    }

    pub fn from_env() -> Result<Self, Error> {
        Self::new(ClientConfig::from_env()?)
    }

    /// The API root, ending in `/v2`.
    pub fn base_url(&self) -> &str {
        &self.base
    }

    /// Tenant ids for workers that set none.
    pub fn tenant_ids(&self) -> &[String] {
        &self.tenant_ids
    }

    /// The `Authorization` header value the REST calls would carry, for other transports (gRPC)
    /// to share this client's credentials and cached OAuth token.
    #[cfg(feature = "grpc")]
    pub(crate) async fn authorization(&self) -> Result<Option<String>, Error> {
        self.auth.authorization(&self.http).await
    }

    async fn send(
        &self,
        method: Method,
        path: &str,
        body: &impl Serialize,
        timeout: Duration,
    ) -> Result<reqwest::Response, Error> {
        let url = format!("{}{path}", self.base);
        let mut retried = false;
        loop {
            let rb = self
                .http
                .request(method.clone(), &url)
                .json(body)
                .timeout(timeout);
            let resp = self.auth.apply(&self.http, rb).await?.send().await?;
            let status = resp.status().as_u16();
            // An expired or revoked OAuth token: fetch a fresh one once.
            if status == 401 && !retried && self.auth.invalidate().await {
                retried = true;
                continue;
            }
            if !resp.status().is_success() {
                let body = resp.text().await.unwrap_or_default();
                return Err(Error::Http { status, body });
            }
            return Ok(resp);
        }
    }

    async fn command(
        &self,
        method: Method,
        path: &str,
        body: &impl Serialize,
    ) -> Result<(), Error> {
        self.send(method, path, body, self.request_timeout)
            .await
            .map(drop)
    }
}

impl JobClient for RestClient {
    async fn activate(&self, req: &ActivateJobsRequest) -> Result<Vec<ActivatedJob>, Error> {
        let long_poll = Duration::from_millis(req.request_timeout.max(0) as u64);
        let deadline = long_poll + self.request_timeout_offset;
        let resp = self
            .send(Method::POST, "/jobs/activation", req, deadline)
            .await?;
        let body = resp.bytes().await?;
        let parsed: ActivateJobsResponse = serde_json::from_slice(&body)
            .map_err(|e| Error::Decode(format!("activation response: {e}")))?;
        Ok(parsed.jobs)
    }

    async fn complete(&self, key: &str, req: &CompleteJobRequest) -> Result<(), Error> {
        self.command(Method::POST, &format!("/jobs/{}/completion", enc(key)), req)
            .await
    }

    async fn fail(&self, key: &str, req: &FailJobRequest) -> Result<(), Error> {
        self.command(Method::POST, &format!("/jobs/{}/failure", enc(key)), req)
            .await
    }

    async fn throw_error(&self, key: &str, req: &ThrowErrorRequest) -> Result<(), Error> {
        self.command(Method::POST, &format!("/jobs/{}/error", enc(key)), req)
            .await
    }

    async fn update(&self, key: &str, req: &UpdateJobRequest) -> Result<(), Error> {
        self.command(Method::PATCH, &format!("/jobs/{}", enc(key)), req)
            .await
    }
}

/// Job keys are digit strings; anything else is percent-encoded rather than allowed to change
/// the path.
fn enc(key: &str) -> String {
    key.bytes()
        .map(|b| match b {
            b'0'..=b'9' | b'a'..=b'z' | b'A'..=b'Z' | b'-' | b'_' => (b as char).to_string(),
            _ => format!("%{b:02X}"),
        })
        .collect()
}

fn normalize_base(address: &str) -> Result<String, Error> {
    let a = address.trim().trim_end_matches('/');
    if !(a.starts_with("http://") || a.starts_with("https://")) {
        return Err(Error::Config(format!(
            "REST address {address:?} must start with http:// or https://"
        )));
    }
    Ok(if a.ends_with("/v2") {
        a.to_owned()
    } else {
        format!("{a}/v2")
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn base_url_gets_v2_once() {
        assert_eq!(normalize_base("http://h:8080").unwrap(), "http://h:8080/v2");
        assert_eq!(
            normalize_base("http://h:8080/").unwrap(),
            "http://h:8080/v2"
        );
        assert_eq!(normalize_base("https://h/v2/").unwrap(), "https://h/v2");
        assert!(normalize_base("h:8080").is_err());
    }

    #[test]
    fn keys_cannot_escape_the_path() {
        assert_eq!(enc("2251799813653498"), "2251799813653498");
        assert_eq!(enc("../x"), "%2E%2E%2Fx");
    }
}
