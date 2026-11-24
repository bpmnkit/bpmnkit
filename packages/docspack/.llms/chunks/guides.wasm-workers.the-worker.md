# Wasm Job Workers — The worker

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

The SDK API (`Job`, `Outcome`, `secrets`, `log`, `http`) is listed in
`wasm/crates/sdk/AGENT_GUIDE.md`.

---
Source: https://bpmnkit.com/docs/guides/wasm-workers
