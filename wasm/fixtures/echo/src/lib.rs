//! Completes with the job's variables plus `job_key`.
use bpmnkit_wasm_sdk::prelude::*;

struct Echo;

impl Worker for Echo {
    fn handle(job: Job) -> Outcome {
        let mut vars: Value = match job.variables() {
            Ok(v) => v,
            Err(e) => return Outcome::fail(format!("bad input: {e}")).no_retry(),
        };
        log::info("echo");
        vars["job_key"] = json!(job.key);
        Outcome::complete(vars)
    }
}

bpmnkit_wasm_sdk::export!(Echo);
