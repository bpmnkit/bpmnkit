//! One job in a fresh store.

use std::sync::Arc;
use std::time::Duration;

use bpmnkit_wasm_contract::World;
use wasmtime::{Store, UpdateDeadline};
use wasmtime_wasi::WasiCtxBuilder;
use wasmtime_wasi_http::WasiHttpCtx;

use crate::bindings::Worker;
use crate::engine::Loaded;
use crate::http::Hooks;
use crate::secrets::{scoped, SecretSource};
use crate::state::{Limiter, MemoryLimit, State};
use crate::{Failure, Job, Outcome};

/// Runs `job` under the manifest's limits. Never errors: a trap, a timeout or an instantiation
/// failure becomes `Outcome::Fail` with a message that says which.
pub async fn run_job(loaded: &Loaded, job: Job, secrets: &dyn SecretSource) -> Outcome {
    let limits = loaded.manifest.limits;
    let timeout = Duration::from_millis(limits.timeout_ms);
    let secrets = scoped(&loaded.manifest, secrets);
    match tokio::time::timeout(timeout, call(loaded, job, secrets)).await {
        Ok(Ok(o)) => o,
        Ok(Err(e)) => fail(describe(&e, limits.memory_mb)),
        Err(_) => fail(format!(
            "worker exceeded its timeout of {} ms",
            limits.timeout_ms
        )),
    }
}

/// [`run_job`] for callers without a Tokio runtime (one is created for the call).
pub fn run_job_blocking(loaded: &Loaded, job: Job, secrets: &dyn SecretSource) -> Outcome {
    match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    {
        Ok(rt) => rt.block_on(run_job(loaded, job, secrets)),
        Err(e) => fail(format!("cannot start a runtime: {e}")),
    }
}

async fn call(
    loaded: &Loaded,
    job: Job,
    secrets: std::collections::HashMap<String, String>,
) -> wasmtime::Result<Outcome> {
    let inner = &loaded.engine.0;
    let m = &loaded.manifest;
    // No preopens, env, args or stdin; sockets off. Guest stdout/stderr go nowhere.
    let wasi = WasiCtxBuilder::new()
        .allow_tcp(false)
        .allow_udp(false)
        .allow_ip_name_lookup(false)
        .build();
    let state = State {
        table: Default::default(),
        wasi,
        http: WasiHttpCtx::new(),
        hooks: Hooks {
            allow: Arc::from(m.network.allow.as_slice()),
            policy: inner.net.clone(),
        },
        secrets,
        limiter: Limiter::new(m.limits.memory_mb),
        worker: m.worker.name.clone(),
    };
    let mut store = Store::new(&inner.wasm, state);
    store.limiter(|s| &mut s.limiter);
    // Yield to the executor on every tick so the outer timeout can fire even mid-loop.
    store.set_epoch_deadline(1);
    store.epoch_deadline_callback(|_| Ok(UpdateDeadline::Yield(1)));
    let linker = match loaded.world {
        World::Worker => &inner.linker_plain,
        World::WorkerHttp => &inner.linker_http,
    };
    let w = Worker::instantiate_async(&mut store, &loaded.component, linker).await?;
    w.call_handle(&mut store, &job).await
}

fn describe(e: &wasmtime::Error, memory_mb: u32) -> String {
    if e.downcast_ref::<MemoryLimit>().is_some() {
        return MemoryLimit(memory_mb).to_string();
    }
    match e.downcast_ref::<wasmtime::Trap>() {
        Some(t) => format!("worker trapped: {t}"),
        None => format!("worker failed: {e:#}"),
    }
}

fn fail(message: String) -> Outcome {
    Outcome::Fail(Failure {
        message,
        retries: None,
        retry_backoff_ms: None,
    })
}
