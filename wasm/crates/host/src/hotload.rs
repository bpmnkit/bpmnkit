//! Workers served from a signed registry and swapped when its `CURRENT` moves. A new version is
//! used only once its digest, signature, manifest and component all check out; otherwise it is
//! reported and the running version keeps serving.

use std::fmt;
use std::path::Path;
use std::sync::Arc;

use bpmnkit_wasm_contract::{
    verify_signature, Digest, RegistryError, RegistryStore, SignError, VerifyingKey,
};

use crate::engine::{Engine, LoadError, Loaded};
use crate::handler::WasmHandler;
use crate::secrets::SecretSource;

#[derive(Debug)]
pub enum HotLoadError {
    Registry(RegistryError),
    /// The stored component does not hash to the digest it is filed under.
    Digest {
        want: Digest,
        got: Digest,
    },
    /// Stored metadata or manifest disagree with the entry.
    Metadata(String),
    Signature(SignError),
    Load(LoadError),
    /// Job types are registered with the engine at start-up and cannot change while running.
    JobTypes {
        running: Vec<String>,
        new: Vec<String>,
    },
}
impl fmt::Display for HotLoadError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Registry(e) => e.fmt(f),
            Self::Digest { want, got } => {
                write!(f, "worker.wasm hashes to {got}, not its digest {want}")
            }
            Self::Metadata(m) => f.write_str(m),
            Self::Signature(e) => write!(f, "untrusted: {e}"),
            Self::Load(e) => e.fmt(f),
            Self::JobTypes { running, new } => write!(
                f,
                "job types changed from {running:?} to {new:?}; restart the host to serve them"
            ),
        }
    }
}
impl std::error::Error for HotLoadError {}

/// Loads `name@digest` and checks it: the wasm hashes to `digest`, the metadata agrees, the
/// signature over (digest, manifest) is by `key`, and the component passes inspect + verify.
pub fn load_signed(
    engine: &Engine,
    store: &dyn RegistryStore,
    key: &VerifyingKey,
    name: &str,
    digest: &Digest,
) -> Result<Loaded, HotLoadError> {
    let e = store.load(name, digest).map_err(HotLoadError::Registry)?;
    let got = Digest::of(&e.wasm);
    if &got != digest {
        return Err(HotLoadError::Digest {
            want: digest.clone(),
            got,
        });
    }
    if &e.metadata.component_digest != digest || e.metadata.manifest != e.manifest {
        return Err(HotLoadError::Metadata(
            "metadata.json does not match the stored component and manifest".into(),
        ));
    }
    if e.manifest.worker.name != name {
        return Err(HotLoadError::Metadata(format!(
            "manifest names worker `{}`, filed under `{name}`",
            e.manifest.worker.name
        )));
    }
    verify_signature(key, digest, &e.manifest, &e.signature).map_err(HotLoadError::Signature)?;
    engine
        .load_bytes(e.manifest, &e.wasm)
        .map_err(HotLoadError::Load)
}

#[derive(Debug)]
pub enum Event {
    Loaded {
        name: String,
        digest: Digest,
    },
    Swapped {
        name: String,
        from: Digest,
        to: Digest,
    },
    Rejected {
        name: String,
        digest: Option<Digest>,
        error: HotLoadError,
    },
}
impl fmt::Display for Event {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Loaded { name, digest } => write!(f, "loaded {name} {digest}"),
            Self::Swapped { name, from, to } => write!(f, "swapped {name} {from} -> {to}"),
            Self::Rejected {
                name,
                digest: Some(d),
                error,
            } => write!(
                f,
                "rejected {name} {d}: {error}; previous version keeps serving"
            ),
            Self::Rejected {
                name,
                digest: None,
                error,
            } => write!(f, "rejected {name}: {error}"),
        }
    }
}

struct Watched {
    name: String,
    handler: WasmHandler,
    /// Last digest tried, good or bad, so a bad version is reported once, not every poll.
    tried: Digest,
}

/// Owns one handler per worker and moves each to its registry's `CURRENT` on [`Watcher::poll`].
pub struct Watcher<R> {
    engine: Engine,
    store: R,
    key: VerifyingKey,
    workers: Vec<Watched>,
}

impl<R: RegistryStore> Watcher<R> {
    /// Loads the current version of each of `names`. One that is missing or fails its checks is
    /// reported and left out: with no previous version there is nothing to keep serving.
    pub fn start(
        engine: Engine,
        store: R,
        key: VerifyingKey,
        names: &[String],
        secrets: Arc<dyn SecretSource>,
    ) -> (Self, Vec<Event>) {
        let mut w = Self {
            engine,
            store,
            key,
            workers: Vec::new(),
        };
        let mut events = Vec::new();
        for name in names {
            let current = match w.store.current(name) {
                Ok(Some(d)) => d,
                Ok(None) => {
                    let error =
                        HotLoadError::Registry(RegistryError::NotFound(format!("{name}/CURRENT")));
                    events.push(rejected(name, None, error));
                    continue;
                }
                Err(e) => {
                    events.push(rejected(name, None, HotLoadError::Registry(e)));
                    continue;
                }
            };
            match load_signed(&w.engine, &w.store, &w.key, name, &current) {
                Ok(l) => {
                    events.push(Event::Loaded {
                        name: name.clone(),
                        digest: current.clone(),
                    });
                    w.workers.push(Watched {
                        name: name.clone(),
                        handler: WasmHandler::new(l, Arc::clone(&secrets)),
                        tried: current,
                    });
                }
                Err(e) => events.push(rejected(name, Some(current), e)),
            }
        }
        (w, events)
    }

    pub fn handlers(&self) -> Vec<WasmHandler> {
        self.workers.iter().map(|w| w.handler.clone()).collect()
    }

    /// Checks every worker's `CURRENT` once and swaps those that moved to a version that checks
    /// out. Compiles new components, so call it off the async executor.
    pub fn poll(&mut self) -> Vec<Event> {
        let mut events = Vec::new();
        for w in &mut self.workers {
            let d = match self.store.current(&w.name) {
                Ok(Some(d)) if d != w.tried => d,
                Ok(_) => continue,
                Err(e) => {
                    events.push(rejected(&w.name, None, HotLoadError::Registry(e)));
                    continue;
                }
            };
            w.tried = d.clone();
            let running = w.handler.loaded();
            let next =
                load_signed(&self.engine, &self.store, &self.key, &w.name, &d).and_then(|l| {
                    if l.manifest.worker.job_types == running.manifest.worker.job_types {
                        Ok(l)
                    } else {
                        Err(HotLoadError::JobTypes {
                            running: running.manifest.worker.job_types.clone(),
                            new: l.manifest.worker.job_types.clone(),
                        })
                    }
                });
            match next {
                Ok(l) => {
                    let from = w.handler.swap(l).digest.clone();
                    events.push(Event::Swapped {
                        name: w.name.clone(),
                        from,
                        to: d,
                    });
                }
                Err(e) => events.push(rejected(&w.name, Some(d), e)),
            }
        }
        events
    }
}

fn rejected(name: &str, digest: Option<Digest>, error: HotLoadError) -> Event {
    Event::Rejected {
        name: name.into(),
        digest,
        error,
    }
}

/// Worker names in a directory registry: subdirectories that have a `CURRENT`.
pub fn registry_workers(root: &Path) -> std::io::Result<Vec<String>> {
    let mut v: Vec<String> = std::fs::read_dir(root)?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().join("CURRENT").is_file())
        .filter_map(|e| e.file_name().into_string().ok())
        .collect();
    v.sort();
    Ok(v)
}
