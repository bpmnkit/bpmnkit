//! Build library for BPMN Kit Wasm job workers: render the project, check the source, compile for
//! `wasm32-wasip2`, verify against the manifest, smoke-test in Wasmtime, package. Processes run
//! through an injected [`exec::Executor`]; nothing here decides where code runs.

pub mod cargo;
pub mod exec;
pub mod package;
pub mod pipeline;
pub mod render;
pub mod smoke;
pub mod source;
pub mod toolchain;

pub use cargo::{build, check, verify_built, BuildFailure, Built, CheckReport};
pub use exec::{Cmd, ExecError, ExecLimits, ExecOutput, Executor, LocalExecutor};
pub use package::{package, Artifact};
pub use pipeline::{
    run_pipeline, run_pipeline_observed, run_pipeline_until, Pipeline, Stage, StageEvent,
};
pub use render::{render, BuildInput, Project};
pub use smoke::smoke_test;
pub use source::check_source;
pub use toolchain::Toolchain;
