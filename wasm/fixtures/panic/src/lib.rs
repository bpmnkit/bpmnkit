//! Panics: on wasm32-wasip2 (panic=abort) this traps after logging the message.
use bpmnkit_wasm_sdk::prelude::*;

struct Panic;

impl Worker for Panic {
    fn handle(_job: Job) -> Outcome {
        panic!("fixture panic")
    }
}

bpmnkit_wasm_sdk::export!(Panic);
