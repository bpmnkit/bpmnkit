//! What one job's `Store` holds.

use std::collections::HashMap;
use std::fmt;

use wasmtime::component::ResourceTable;
use wasmtime::ResourceLimiter;
use wasmtime_wasi::{WasiCtx, WasiCtxView, WasiView};
use wasmtime_wasi_http::{WasiHttpCtx, WasiHttpCtxView, WasiHttpView};

use crate::bindings::bpmnkit::worker::{log, secrets, types};
use crate::http::Hooks;

pub(crate) struct State {
    pub table: ResourceTable,
    pub wasi: WasiCtx,
    pub http: WasiHttpCtx,
    pub hooks: Hooks,
    pub secrets: HashMap<String, String>,
    pub limiter: Limiter,
    pub worker: String,
}

impl WasiView for State {
    fn ctx(&mut self) -> WasiCtxView<'_> {
        WasiCtxView {
            ctx: &mut self.wasi,
            table: &mut self.table,
        }
    }
}

impl WasiHttpView for State {
    fn http(&mut self) -> WasiHttpCtxView<'_> {
        WasiHttpCtxView {
            ctx: &mut self.http,
            table: &mut self.table,
            hooks: &mut self.hooks,
        }
    }
}

impl types::Host for State {}

impl secrets::Host for State {
    fn get(&mut self, name: String) -> Option<String> {
        self.secrets.get(&name).cloned()
    }
}

impl log::Host for State {
    fn emit(&mut self, level: log::Level, msg: String) {
        let w = &self.worker;
        match level {
            log::Level::Debug => tracing::debug!(worker = %w, "{msg}"),
            log::Level::Info => tracing::info!(worker = %w, "{msg}"),
            log::Level::Warn => tracing::warn!(worker = %w, "{msg}"),
            log::Level::Error => tracing::error!(worker = %w, "{msg}"),
        }
    }
}

/// The error a trap carries when the guest asks for more memory than its manifest allows.
#[derive(Debug)]
pub(crate) struct MemoryLimit(pub u32);
impl fmt::Display for MemoryLimit {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "worker exceeded its memory limit of {} MB", self.0)
    }
}
impl std::error::Error for MemoryLimit {}

/// Linear memory capped at the manifest's `memory_mb` (summed over the component's memories);
/// growing past it traps with [`MemoryLimit`] instead of returning -1, so the cause is clear.
pub(crate) struct Limiter {
    pub memory_mb: u32,
    used: usize,
}
impl Limiter {
    pub fn new(memory_mb: u32) -> Self {
        Self { memory_mb, used: 0 }
    }
}
const MAX_TABLE_ELEMENTS: usize = 100_000;
impl ResourceLimiter for Limiter {
    fn memory_growing(
        &mut self,
        current: usize,
        desired: usize,
        _maximum: Option<usize>,
    ) -> wasmtime::Result<bool> {
        let total = self.used - current.min(self.used) + desired;
        if total > (self.memory_mb as usize) << 20 {
            return Err(MemoryLimit(self.memory_mb).into());
        }
        self.used = total;
        Ok(true)
    }
    fn table_growing(
        &mut self,
        _current: usize,
        desired: usize,
        _maximum: Option<usize>,
    ) -> wasmtime::Result<bool> {
        Ok(desired <= MAX_TABLE_ELEMENTS)
    }
}
