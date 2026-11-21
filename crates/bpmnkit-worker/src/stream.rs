//! Job streaming: the server pushes jobs as they become available instead of waiting for a poll.
//! The transport is behind two small traits so the worker loop is tested without a network;
//! `grpc::GrpcJobStream` (feature `grpc`) is the implementation for Zeebe's `StreamActivatedJobs`.

use std::future::Future;
use std::pin::Pin;

use crate::error::Error;
use crate::types::ActivatedJob;

pub type BoxFuture<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>;

/// What a worker asks the stream to push. There is no batch size: the worker holds a pushed
/// job until a slot is free.
#[derive(Clone, Debug, PartialEq)]
pub struct StreamRequest {
    pub job_type: String,
    pub worker: String,
    /// Milliseconds a job stays locked to this worker.
    pub timeout: i64,
    pub fetch_variable: Vec<String>,
    pub tenant_ids: Vec<String>,
}

/// One open stream.
pub trait JobStream: Send {
    /// The next pushed job; `Ok(None)` when the server closed the stream. Safe to drop mid-await.
    fn next(&mut self) -> BoxFuture<'_, Result<Option<ActivatedJob>, Error>>;
}

/// Opens streams; called again after each disconnect.
pub trait JobStreamSource: Send + Sync + 'static {
    fn open(&self, req: StreamRequest) -> BoxFuture<'_, Result<Box<dyn JobStream>, Error>>;
}
