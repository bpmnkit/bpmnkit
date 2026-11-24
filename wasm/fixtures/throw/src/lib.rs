//! Throws BPMN error `ECHO_ERROR` with the variables attached.
use bpmnkit_wasm_sdk::prelude::*;

struct Throw;

impl Worker for Throw {
    fn handle(job: Job) -> Outcome {
        let vars: Value = job.variables().unwrap_or(Value::Null);
        Outcome::throw_error("ECHO_ERROR", "thrown on purpose")
            .with_variables(json!({ "input": vars }))
    }
}

bpmnkit_wasm_sdk::export!(Throw);
