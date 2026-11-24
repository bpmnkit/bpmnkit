//! Runs BPMN Kit Wasm job workers. Each component gets a fresh `Store` per job, bounded by its
//! manifest's memory and timeout, with no files, env or sockets; `wasi:http` only to the
//! manifest's allow-list. Polling, OAuth, backoff and drain come from `bpmnkit-worker`.

mod bindings {
    wasmtime::component::bindgen!({
        path: "../contract/wit",
        world: "worker",
        exports: { default: async },
        additional_derives: [PartialEq, Eq],
    });
}

pub mod config;
pub mod engine;
pub mod handler;
pub mod http;
pub mod runner;
pub mod secrets;
mod state;

pub use bindings::bpmnkit::worker::types::{BpmnError, Failure, Job, Outcome};
pub use engine::{load, Engine, EngineOptions, LoadError, Loaded};
pub use handler::WasmHandler;
pub use http::{NetPolicy, Resolver, SystemResolver};
pub use runner::{run_job, run_job_blocking};
pub use secrets::{EnvSecrets, FileSecrets, MapSecrets, SecretSource};
