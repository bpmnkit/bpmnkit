# Writing a BPMN Kit Wasm worker

You write `src/lib.rs` and `worker.toml`. The platform writes `Cargo.toml`; you cannot add crates.
Available: `bpmnkit_wasm_sdk` and `serde` (with `derive`). No files, no env, no threads, no clocks
you can rely on. Code is blocking.

```rust
use bpmnkit_wasm_sdk::prelude::*;

#[derive(Deserialize)]
struct Input { customer_id: String, amount_cents: u64 }

struct ChargeCard;

impl Worker for ChargeCard {
    fn handle(job: Job) -> Outcome {
        let input: Input = match job.variables() {
            Ok(v) => v,
            Err(e) => return Outcome::fail(format!("bad input: {e}")).no_retry(),
        };
        let Some(key) = secrets::get("STRIPE_KEY") else {
            return Outcome::fail("secret STRIPE_KEY missing").no_retry();
        };

        let res = http::post("https://api.stripe.com/v1/charges")
            .bearer(&key)
            .form(&[("customer", input.customer_id.as_str()),
                    ("amount", &input.amount_cents.to_string()),
                    ("currency", "eur")])
            .send();

        match res {
            Ok(r) if r.status() == 200 => Outcome::complete(json!({ "charged": true })),
            Ok(r) if r.status() == 402 => Outcome::throw_error("PAYMENT_DECLINED", "card declined"),
            Ok(r) => Outcome::fail(format!("stripe returned {}", r.status())),
            Err(e) => Outcome::fail(e.to_string()).backoff_ms(5_000),
        }
    }
}

bpmnkit_wasm_sdk::export!(ChargeCard);
```

```toml
[worker]
name      = "charge-card"
version   = "0.1.0"
job_types = ["charge-card"]

[limits]
memory_mb      = 64
timeout_ms     = 10_000
max_concurrent = 8

[network]
allow = ["api.stripe.com:443"]   # omit when the worker makes no HTTP calls

[secrets]
names = ["STRIPE_KEY"]
```

## API (`use bpmnkit_wasm_sdk::prelude::*;`)

| Item | Use |
|---|---|
| `Worker` | `impl Worker for T { fn handle(job: Job) -> Outcome }`, then `bpmnkit_wasm_sdk::export!(T);` once |
| `Job` | `key`, `job_type`, `process_instance_key`, `element_id` (all `String`), `retries: u32`, `custom_headers` |
| `job.variables::<T>()` | `Result<T, serde_json::Error>`; `T` is a `#[derive(Deserialize)]` struct or `Value` |
| `job.header("name")` | `Option<&str>`, a task header |
| `Outcome::complete(json!({..}))` | done; the object is merged into process variables (`Value::Null` = none) |
| `Outcome::fail(msg)` | retry later; chain `.no_retry()` (incident now), `.retries(n)`, `.backoff_ms(ms)` |
| `Outcome::throw_error(code, msg)` | BPMN error for a boundary event; chain `.with_variables(json!({..}))` |
| `secrets::get("NAME")` | `Option<String>`; only names in `[secrets] names` resolve |
| `log::{debug, info, warn, error}(msg)` | log line attached to the job |
| `http::{get, head, post, put, patch, delete}(url)` | builder: `.header(k, v)`, `.bearer(t)`, `.json(&v)`, `.form(&[(k, v)])`, `.body(bytes)`, then `.send()` |
| `Response` | `.status() -> u16`, `.is_success()`, `.header(k)`, `.text()`, `.json::<T>()`, `.bytes()` |
| `http::Error` | `InvalidUrl`, `InvalidHeader`, `Body`, `Transport` (includes a host not in the allow-list), `TooLarge` (> 16 MiB) |

## Rules

- Variables you complete with must be a JSON **object**; anything else becomes a fail without retry.
- Only `https://host` (or `host:port`) listed in `[network] allow` is reachable. Calling `http` without
  an allow-list is rejected at build time.
- A panic or a timeout fails the job with the message; prefer returning `Outcome::fail`.
- Do not use `unwrap()` on input or responses; map errors to `Outcome::fail(...)`.
