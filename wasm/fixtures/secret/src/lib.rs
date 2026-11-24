//! Completes with the declared secret `API_KEY` and whether undeclared `OTHER` resolved.
use bpmnkit_wasm_sdk::prelude::*;

struct Secret;

impl Worker for Secret {
    fn handle(_job: Job) -> Outcome {
        Outcome::complete(json!({
            "api_key": secrets::get("API_KEY"),
            "other_visible": secrets::get("OTHER").is_some(),
        }))
    }
}

bpmnkit_wasm_sdk::export!(Secret);
