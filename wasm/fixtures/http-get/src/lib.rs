//! GETs variable `url` and completes with `{ status, body }`; transport errors fail.
use bpmnkit_wasm_sdk::prelude::*;

#[derive(Deserialize)]
struct Input {
    url: String,
}

struct HttpGet;

impl Worker for HttpGet {
    fn handle(job: Job) -> Outcome {
        let input: Input = match job.variables() {
            Ok(v) => v,
            Err(e) => return Outcome::fail(format!("bad input: {e}")).no_retry(),
        };
        match http::get(&input.url).send() {
            Ok(r) => Outcome::complete(json!({
                "status": r.status(),
                "body": r.text().unwrap_or_default(),
            })),
            Err(e) => Outcome::fail(e.to_string()),
        }
    }
}

bpmnkit_wasm_sdk::export!(HttpGet);
