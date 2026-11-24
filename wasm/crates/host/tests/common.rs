//! Components from hand-written core WAT plus the contract's WIT (`worker` world), so the host
//! is tested without the wasm32-wasip2 target.
#![allow(dead_code)]

use std::path::Path;

use bpmnkit_wasm_contract::ValidManifest;
use bpmnkit_wasm_host::{Engine, EngineOptions, Job, Loaded};

/// Return area for `handle`'s `outcome`: discriminant at +0, payload from +8.
pub const RET: u32 = 256;

/// A component whose `handle` body is `body` (core WAT; locals 0..13 are the flattened job,
/// `$a`/`$b` scratch). Static data: "none" at 64, "E" at 80, "boom" at 96, "{}" at 112.
pub fn component(body: &str) -> Vec<u8> {
    let wat = format!(
        r#"(module
  (import "bpmnkit:worker/secrets@0.1.0" "get" (func $secret (param i32 i32 i32)))
  (memory (export "memory") 1)
  (global $hp (mut i32) (i32.const 1024))
  (data (i32.const 64) "none")
  (data (i32.const 80) "E")
  (data (i32.const 96) "boom")
  (data (i32.const 112) "{{}}")
  (func (export "cabi_realloc") (param i32 i32 i32 i32) (result i32)
    (local $p i32)
    (local.set $p (i32.and (i32.add (global.get $hp) (i32.sub (local.get 2) (i32.const 1)))
                           (i32.sub (i32.const 0) (local.get 2))))
    (global.set $hp (i32.add (local.get $p) (local.get 3)))
    (local.get $p))
  (func (export "handle")
    (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)
    (local $a i32) (local $b i32)
    {body})
)"#
    );
    let mut module = wat::parse_str(wat).expect("core wat");
    let mut resolve = wit_parser::Resolve::default();
    let (pkg, _) = resolve
        .push_dir(Path::new(env!("CARGO_MANIFEST_DIR")).join("../contract/wit"))
        .expect("contract wit");
    let world = resolve.select_world(&[pkg], Some("worker")).unwrap();
    wit_component::embed_component_metadata(
        &mut module,
        &resolve,
        world,
        wit_component::StringEncoding::UTF8,
        false,
    )
    .unwrap();
    wit_component::ComponentEncoder::default()
        .module(&module)
        .unwrap()
        .validate(true)
        .encode()
        .expect("component")
}

/// `complete(<variables>)`: echoes the job's variables string.
pub const ECHO: &str = "
  (i32.store8 (i32.const 256) (i32.const 0))
  (i32.store (i32.const 264) (local.get 9))
  (i32.store (i32.const 268) (local.get 10))
  (i32.const 256)";

/// `fail("boom", retries 2, backoff 5000)`.
pub const FAIL: &str = "
  (i32.store8 (i32.const 256) (i32.const 1))
  (i32.store (i32.const 264) (i32.const 96))
  (i32.store (i32.const 268) (i32.const 4))
  (i32.store8 (i32.const 272) (i32.const 1))
  (i32.store (i32.const 276) (i32.const 2))
  (i32.store8 (i32.const 280) (i32.const 1))
  (i64.store (i32.const 288) (i64.const 5000))
  (i32.const 256)";

/// `throw-error("E", "boom", variables "{}")`.
pub const THROW: &str = "
  (i32.store8 (i32.const 256) (i32.const 2))
  (i32.store (i32.const 264) (i32.const 80))
  (i32.store (i32.const 268) (i32.const 1))
  (i32.store (i32.const 272) (i32.const 96))
  (i32.store (i32.const 276) (i32.const 4))
  (i32.store8 (i32.const 280) (i32.const 1))
  (i32.store (i32.const 284) (i32.const 112))
  (i32.store (i32.const 288) (i32.const 2))
  (i32.const 256)";

pub const TRAP: &str = "unreachable";

pub const SPIN: &str = "(loop $l (br $l)) unreachable";

/// Grows memory by 200 pages (12.5 MB), then echoes.
pub fn grow() -> String {
    format!("(drop (memory.grow (i32.const 200))) {ECHO}")
}

/// Looks up the secret named by the job's variables string: `complete(value)` or `fail("none")`.
pub const SECRET: &str = "
  (call $secret (local.get 9) (local.get 10) (i32.const 512))
  (if (i32.load8_u (i32.const 512))
    (then
      (i32.store8 (i32.const 256) (i32.const 0))
      (i32.store (i32.const 264) (i32.load (i32.const 516)))
      (i32.store (i32.const 268) (i32.load (i32.const 520))))
    (else
      (i32.store8 (i32.const 256) (i32.const 1))
      (i32.store (i32.const 264) (i32.const 64))
      (i32.store (i32.const 268) (i32.const 4))
      (i32.store8 (i32.const 272) (i32.const 0))
      (i32.store8 (i32.const 280) (i32.const 0))))
  (i32.const 256)";

pub fn manifest(extra: &str) -> ValidManifest {
    ValidManifest::from_toml(&format!(
        "[worker]\nname=\"t\"\nversion=\"0.1.0\"\njob_types=[\"t\"]\n{extra}"
    ))
    .unwrap()
}

pub fn engine() -> Engine {
    Engine::new(EngineOptions {
        pool_slots: Some(4),
        ..EngineOptions::default()
    })
    .unwrap()
}

pub fn loaded(body: &str, manifest_extra: &str) -> Loaded {
    engine()
        .load_bytes(manifest(manifest_extra), &component(body))
        .unwrap()
}

pub fn job(variables: &str) -> Job {
    Job {
        key: "1".into(),
        job_type: "t".into(),
        process_instance_key: "2".into(),
        element_id: "task".into(),
        retries: 3,
        variables: variables.into(),
        custom_headers: vec![],
    }
}
