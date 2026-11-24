//! Never returns: the host's epoch deadline must stop it.
use bpmnkit_wasm_sdk::prelude::*;

struct Spin;

impl Worker for Spin {
    fn handle(_job: Job) -> Outcome {
        loop {
            std::hint::black_box(());
        }
    }
}

bpmnkit_wasm_sdk::export!(Spin);
