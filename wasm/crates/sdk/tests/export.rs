//! `export!` must expand on the host target too (clippy runs on the whole workspace).
use bpmnkit_wasm_sdk::prelude::*;

struct Echo;

impl Worker for Echo {
    fn handle(job: Job) -> Outcome {
        Outcome::complete(job.variables().unwrap_or(Value::Null))
    }
}

bpmnkit_wasm_sdk::export!(Echo);

#[test]
fn export_implements_the_guest_trait() {
    use bpmnkit_wasm_sdk::bindings::{bpmnkit::worker::types as wit, Guest};
    let out = <Echo as Guest>::handle(wit::Job {
        key: "1".into(),
        job_type: "echo".into(),
        process_instance_key: "2".into(),
        element_id: "e".into(),
        retries: 1,
        variables: r#"{"a":1}"#.into(),
        custom_headers: vec![],
    });
    assert_eq!(format!("{out:?}"), r#"Outcome::Complete("{\"a\":1}")"#);
}
