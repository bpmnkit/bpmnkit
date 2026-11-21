//! Job streaming over gRPC (`StreamActivatedJobs`), the `grpc` feature.
//!
//! [`GrpcJobSource`] implements [`JobStreamSource`]; give it to [`crate::Worker::stream`] (or
//! [`crate::Runtime::stream`]) and set `WorkerConfig::stream_enabled`. Only the stream uses gRPC:
//! completion, failure and errors stay on REST, and polling keeps running as the fallback.
//!
//! The wire messages are written by hand (`spec/gateway-streaming.proto` is the reference and a
//! test keeps them in step), so building needs neither `protoc` nor a build script.

use std::sync::Arc;
use std::time::Duration;

use serde_json::{Map, Value};
use tonic::client::Grpc;
use tonic::codec::{ProstCodec, Streaming};
use tonic::codegen::http::uri::PathAndQuery;
use tonic::transport::{Certificate, Channel, ClientTlsConfig, Endpoint, Identity};
use tonic::{Request, Status};

use crate::client::RestClient;
use crate::config::{defaults, ClientConfig};
use crate::error::Error;
use crate::stream::{BoxFuture, JobStream, JobStreamSource, StreamRequest};
use crate::types::{ActivatedJob, JobKind};

const STREAM_PATH: &str = "/gateway_protocol.Gateway/StreamActivatedJobs";

/// `StreamActivatedJobsRequest`.
#[derive(Clone, PartialEq, prost::Message)]
pub struct StreamActivatedJobsRequest {
    #[prost(string, tag = "1")]
    pub r#type: String,
    #[prost(string, tag = "2")]
    pub worker: String,
    #[prost(int64, tag = "3")]
    pub timeout: i64,
    #[prost(string, repeated, tag = "5")]
    pub fetch_variable: Vec<String>,
    #[prost(string, repeated, tag = "6")]
    pub tenant_ids: Vec<String>,
}

/// gRPC `ActivatedJob` (keys are int64; headers and variables are JSON text).
#[derive(Clone, PartialEq, prost::Message)]
pub struct GrpcActivatedJob {
    #[prost(int64, tag = "1")]
    pub key: i64,
    #[prost(string, tag = "2")]
    pub r#type: String,
    #[prost(int64, tag = "3")]
    pub process_instance_key: i64,
    #[prost(string, tag = "4")]
    pub bpmn_process_id: String,
    #[prost(int32, tag = "5")]
    pub process_definition_version: i32,
    #[prost(int64, tag = "6")]
    pub process_definition_key: i64,
    #[prost(string, tag = "7")]
    pub element_id: String,
    #[prost(int64, tag = "8")]
    pub element_instance_key: i64,
    #[prost(string, tag = "9")]
    pub custom_headers: String,
    #[prost(string, tag = "10")]
    pub worker: String,
    #[prost(int32, tag = "11")]
    pub retries: i32,
    #[prost(int64, tag = "12")]
    pub deadline: i64,
    #[prost(string, tag = "13")]
    pub variables: String,
    #[prost(string, tag = "14")]
    pub tenant_id: String,
}

fn json_object(field: &str, text: &str) -> Result<Map<String, Value>, Error> {
    if text.is_empty() {
        return Ok(Map::new());
    }
    match serde_json::from_str(text) {
        Ok(Value::Object(m)) => Ok(m),
        Ok(_) => Err(Error::Decode(format!(
            "streamed job {field} is not a JSON object"
        ))),
        Err(e) => Err(Error::Decode(format!("streamed job {field}: {e}"))),
    }
}

impl TryFrom<GrpcActivatedJob> for ActivatedJob {
    type Error = Error;

    /// The gRPC job has no `kind` or listener data: streamed jobs are plain BPMN-element jobs.
    fn try_from(j: GrpcActivatedJob) -> Result<Self, Error> {
        Ok(ActivatedJob {
            job_key: j.key.to_string(),
            job_type: j.r#type,
            process_definition_id: j.bpmn_process_id,
            process_definition_version: j.process_definition_version,
            process_definition_key: j.process_definition_key.to_string(),
            process_instance_key: j.process_instance_key.to_string(),
            element_id: j.element_id,
            element_instance_key: j.element_instance_key.to_string(),
            custom_headers: json_object("customHeaders", &j.custom_headers)?,
            worker: j.worker,
            retries: j.retries,
            deadline: j.deadline,
            variables: json_object("variables", &j.variables)?,
            tenant_id: j.tenant_id,
            kind: JobKind::BpmnElement,
            ..ActivatedJob::default()
        })
    }
}

fn status(s: Status) -> Error {
    Error::Stream(format!("{}: {}", s.code(), s.message()))
}

/// Opens job streams on the gateway. Shares the REST client's credentials, so one OAuth token
/// cache serves both transports.
pub struct GrpcJobSource {
    channel: Channel,
    rest: Arc<RestClient>,
}

impl GrpcJobSource {
    /// Connects lazily to `config.grpc_address` (`https://` turns TLS on, using
    /// `config.tls` for a private CA and mutual TLS). No I/O happens until a stream opens.
    pub fn new(rest: Arc<RestClient>, config: &ClientConfig) -> Result<Self, Error> {
        let bad = |e: tonic::transport::Error| Error::Config(format!("gRPC address: {e}"));
        let mut ep = Endpoint::from_shared(config.grpc_address.clone())
            .map_err(bad)?
            // An idle stream is the normal case; pings notice a dead peer so we reconnect.
            .http2_keep_alive_interval(Duration::from_secs(30))
            .keep_alive_timeout(Duration::from_secs(10))
            .keep_alive_while_idle(true)
            .connect_timeout(defaults::REQUEST_TIMEOUT);
        if config.grpc_address.starts_with("https://") {
            let mut tls = ClientTlsConfig::new().with_native_roots();
            if let Some(t) = &config.tls {
                t.validate()?;
                if let Some(ca) = &t.ca_cert_pem {
                    tls = tls.ca_certificate(Certificate::from_pem(ca));
                }
                if let (Some(c), Some(k)) = (&t.client_cert_pem, &t.client_key_pem) {
                    tls = tls.identity(Identity::from_pem(c, k));
                }
            }
            ep = ep.tls_config(tls).map_err(bad)?;
        }
        Ok(Self {
            channel: ep.connect_lazy(),
            rest,
        })
    }
}

impl JobStreamSource for GrpcJobSource {
    fn open(&self, req: StreamRequest) -> BoxFuture<'_, Result<Box<dyn JobStream>, Error>> {
        Box::pin(async move {
            let mut request = Request::new(StreamActivatedJobsRequest {
                r#type: req.job_type,
                worker: req.worker,
                timeout: req.timeout,
                fetch_variable: req.fetch_variable,
                tenant_ids: req.tenant_ids,
            });
            // The token is fetched here, not in a tonic interceptor: interceptors are
            // synchronous and the OAuth fetch is not. A stream lives long, so the next
            // reconnect (which the server forces when the token expires) gets a fresh one.
            if let Some(v) = self.rest.authorization().await? {
                let v = v
                    .parse()
                    .map_err(|_| Error::Auth("credentials are not a valid header value".into()))?;
                request.metadata_mut().insert("authorization", v);
            }
            let mut grpc = Grpc::new(self.channel.clone());
            grpc.ready()
                .await
                .map_err(|e| Error::Stream(format!("connect: {e}")))?;
            let resp = grpc
                .server_streaming(
                    request,
                    PathAndQuery::from_static(STREAM_PATH),
                    ProstCodec::<StreamActivatedJobsRequest, GrpcActivatedJob>::default(),
                )
                .await
                .map_err(status)?;
            Ok(Box::new(GrpcJobStream(resp.into_inner())) as Box<dyn JobStream>)
        })
    }
}

struct GrpcJobStream(Streaming<GrpcActivatedJob>);

impl JobStream for GrpcJobStream {
    fn next(&mut self) -> BoxFuture<'_, Result<Option<ActivatedJob>, Error>> {
        Box::pin(async move {
            match self.0.message().await.map_err(status)? {
                Some(j) => j.try_into().map(Some),
                None => Ok(None),
            }
        })
    }
}

#[cfg(test)]
#[path = "grpc_tests.rs"]
mod tests;
