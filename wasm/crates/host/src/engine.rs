//! The shared Wasmtime engine and loading a worker directory.

use std::collections::HashMap;
use std::fmt;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use bpmnkit_wasm_contract::{
    inspect, verify, world_for, Digest, ManifestError, PlatformCeilings, ValidManifest, Violation,
    World,
};
use wasmtime::component::{Component, HasSelf, Linker};
use wasmtime::{Config, InstanceAllocationStrategy, PoolingAllocationConfig};

use crate::bindings::Worker;
use crate::http::NetPolicy;
use crate::state::State;

/// Epoch tick; the timeout is enforced to about this granularity.
pub(crate) const TICK: Duration = Duration::from_millis(10);

#[derive(Clone)]
pub struct EngineOptions {
    /// Concurrent job stores the pooling allocator reserves slots for; `None` uses on-demand
    /// allocation (no up-front virtual memory, slower instantiation).
    pub pool_slots: Option<u32>,
    pub net: NetPolicy,
}
impl Default for EngineOptions {
    fn default() -> Self {
        Self {
            pool_slots: Some(64),
            net: NetPolicy::default(),
        }
    }
}

/// Compiles components (cached by digest), owns the per-world linkers and the epoch ticker.
#[derive(Clone)]
pub struct Engine(pub(crate) Arc<Inner>);

pub(crate) struct Inner {
    pub wasm: wasmtime::Engine,
    pub linker_plain: Linker<State>,
    pub linker_http: Linker<State>,
    pub net: NetPolicy,
    cache: Mutex<HashMap<Digest, Component>>,
}

impl Engine {
    pub fn new(opts: EngineOptions) -> wasmtime::Result<Self> {
        let mut cfg = Config::new();
        cfg.epoch_interruption(true);
        if let Some(n) = opts.pool_slots {
            let ceiling = PlatformCeilings::default().memory_mb as usize;
            let mut pool = PoolingAllocationConfig::default();
            // A Rust wasip2 component has a handful of core instances (adapter, shims).
            pool.total_component_instances(n)
                .total_core_instances(n * 16)
                .total_memories(n * 2)
                .total_tables(n * 16)
                .total_stacks(n)
                .max_memory_size(ceiling << 20);
            cfg.allocation_strategy(InstanceAllocationStrategy::Pooling(pool));
        }
        let wasm = wasmtime::Engine::new(&cfg)?;

        let mut plain = Linker::<State>::new(&wasm);
        wasmtime_wasi::p2::add_to_linker_async(&mut plain)?;
        Worker::add_to_linker::<State, HasSelf<State>>(&mut plain, |s| s)?;
        let mut http = plain.clone();
        wasmtime_wasi_http::p2::add_only_http_to_linker_async(&mut http)?;

        let weak = wasm.weak();
        std::thread::Builder::new()
            .name("bpmnkit-wasm-epoch".into())
            .spawn(move || {
                while let Some(e) = weak.upgrade() {
                    e.increment_epoch();
                    drop(e);
                    std::thread::sleep(TICK);
                }
            })?;

        Ok(Self(Arc::new(Inner {
            wasm,
            linker_plain: plain,
            linker_http: http,
            net: opts.net,
            cache: Mutex::new(HashMap::new()),
        })))
    }

    /// Compiles `bytes`, or returns the component compiled earlier for the same digest.
    pub fn compile(&self, bytes: &[u8]) -> wasmtime::Result<Component> {
        let d = Digest::of(bytes);
        if let Some(c) = lock(&self.0.cache).get(&d) {
            return Ok(c.clone());
        }
        let c = Component::new(&self.0.wasm, bytes)?;
        lock(&self.0.cache).insert(d, c.clone());
        Ok(c)
    }

    /// Whether a component with this digest is compiled already.
    pub fn cached(&self, d: &Digest) -> bool {
        lock(&self.0.cache).contains_key(d)
    }

    /// A worker from its manifest and component bytes; the component is inspected and verified
    /// against the manifest here, whatever the builder said.
    pub fn load_bytes(&self, manifest: ValidManifest, wasm: &[u8]) -> Result<Loaded, LoadError> {
        let info = inspect(wasm).map_err(|e| LoadError::Inspect(e.to_string()))?;
        verify(&info, &manifest).map_err(LoadError::Verify)?;
        let component = self
            .compile(wasm)
            .map_err(|e| LoadError::Compile(format!("{e:#}")))?;
        let world = world_for(&manifest);
        Ok(Loaded {
            manifest,
            component,
            world,
            digest: Digest::of(wasm),
            engine: self.clone(),
        })
    }
}

fn lock<T>(m: &Mutex<T>) -> std::sync::MutexGuard<'_, T> {
    m.lock().unwrap_or_else(|e| e.into_inner())
}

/// A verified, compiled worker.
#[derive(Clone)]
pub struct Loaded {
    pub manifest: ValidManifest,
    pub component: Component,
    pub world: World,
    pub digest: Digest,
    pub(crate) engine: Engine,
}

impl fmt::Debug for Loaded {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Loaded")
            .field("worker", &self.manifest.worker.name)
            .field("world", &self.world)
            .field("digest", &self.digest)
            .finish()
    }
}

#[derive(Debug)]
pub enum LoadError {
    Io(PathBuf, std::io::Error),
    Manifest(PathBuf, Vec<ManifestError>),
    Inspect(String),
    Verify(Vec<Violation>),
    Compile(String),
}
impl fmt::Display for LoadError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let join = |v: &[String]| v.join("; ");
        match self {
            Self::Io(p, e) => write!(f, "{}: {e}", p.display()),
            Self::Manifest(p, e) => write!(
                f,
                "{}: {}",
                p.display(),
                join(&e.iter().map(ToString::to_string).collect::<Vec<_>>())
            ),
            Self::Inspect(e) => f.write_str(e),
            Self::Verify(v) => f.write_str(&join(
                &v.iter().map(ToString::to_string).collect::<Vec<_>>(),
            )),
            Self::Compile(e) => write!(f, "cannot compile component: {e}"),
        }
    }
}
impl std::error::Error for LoadError {}

/// Reads `<dir>/worker.toml` and `<dir>/worker.wasm`.
pub fn load(engine: &Engine, dir: &Path) -> Result<Loaded, LoadError> {
    let read = |name: &str| {
        let p = dir.join(name);
        std::fs::read(&p).map_err(|e| LoadError::Io(p, e))
    };
    let toml_path = dir.join("worker.toml");
    let toml = String::from_utf8_lossy(&read("worker.toml")?).into_owned();
    let manifest =
        ValidManifest::from_toml(&toml).map_err(|e| LoadError::Manifest(toml_path, e))?;
    engine.load_bytes(manifest, &read("worker.wasm")?)
}
