//! Several workers on one client, stopped together.

use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;

use tokio::sync::watch;

use crate::client::{JobClient, RestClient};
use crate::config::WorkerConfig;
use crate::error::Error;
use crate::metrics::{Metrics, NoopMetrics};
use crate::worker::{Handler, ShutdownReport, Worker};

type BoxFuture<T> = Pin<Box<dyn Future<Output = T> + Send>>;
type Start<C> = Box<
    dyn FnOnce(Arc<C>, Arc<dyn Metrics>, watch::Receiver<bool>) -> BoxFuture<ShutdownReport> + Send,
>;

/// Workers sharing one client (one connection pool, one OAuth token).
pub struct Runtime<C: JobClient = RestClient> {
    client: Arc<C>,
    metrics: Arc<dyn Metrics>,
    workers: Vec<Start<C>>,
    default_tenants: Vec<String>,
}

impl Runtime<RestClient> {
    /// A [`RestClient`] from `CAMUNDA_*` environment variables.
    pub fn from_env() -> Result<Self, Error> {
        let client = RestClient::from_env()?;
        let tenants = client.tenant_ids().to_vec();
        Ok(Self::new(Arc::new(client)).default_tenant_ids(tenants))
    }
}

impl<C: JobClient> Runtime<C> {
    pub fn new(client: Arc<C>) -> Self {
        Self {
            client,
            metrics: Arc::new(NoopMetrics),
            workers: Vec::new(),
            default_tenants: Vec::new(),
        }
    }

    pub fn metrics(mut self, metrics: Arc<dyn Metrics>) -> Self {
        self.metrics = metrics;
        self
    }

    /// Tenant ids for workers whose config names none.
    pub fn default_tenant_ids(mut self, ids: Vec<String>) -> Self {
        self.default_tenants = ids;
        self
    }

    /// Adds a worker for `config.job_type`.
    pub fn register<H: Handler>(mut self, config: WorkerConfig, handler: H) -> Self {
        let tenants = self.default_tenants.clone();
        self.workers
            .push(Box::new(move |client, metrics, mut stop| {
                Box::pin(async move {
                    Worker::new(client, config, handler)
                        .metrics(metrics)
                        .default_tenant_ids(&tenants)
                        .run(async move {
                            let _ = stop.wait_for(|s| *s).await;
                        })
                        .await
                })
            }));
        self
    }

    /// Runs until Ctrl-C (SIGINT), then drains every worker.
    pub async fn run(self) -> Vec<ShutdownReport> {
        self.run_until(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await
    }

    /// Runs until `shutdown` resolves, then drains every worker; one report per worker, in
    /// registration order.
    pub async fn run_until(self, shutdown: impl Future<Output = ()> + Send) -> Vec<ShutdownReport> {
        let (tx, rx) = watch::channel(false);
        let handles: Vec<_> = self
            .workers
            .into_iter()
            .map(|start| {
                tokio::spawn(start(
                    Arc::clone(&self.client),
                    Arc::clone(&self.metrics),
                    rx.clone(),
                ))
            })
            .collect();
        shutdown.await;
        let _ = tx.send(true);
        let mut reports = Vec::with_capacity(handles.len());
        for h in handles {
            if let Ok(r) = h.await {
                reports.push(r);
            }
        }
        reports
    }
}
