//! Charges the customer's card through the payment API; a 402 becomes the BPMN error
//! `PAYMENT_DECLINED`, which the order process catches on a boundary event.
use bpmnkit_wasm_sdk::prelude::*;

#[derive(Deserialize)]
struct Input {
    #[serde(rename = "customerId")]
    customer_id: String,
    #[serde(rename = "amountCents")]
    amount_cents: u64,
}

struct ChargeCard;

impl Worker for ChargeCard {
    fn handle(job: Job) -> Outcome {
        let input: Input = match job.variables() {
            Ok(v) => v,
            Err(e) => return Outcome::fail(format!("bad input: {e}")).no_retry(),
        };
        let Some(key) = secrets::get("PAYMENT_API_KEY") else {
            return Outcome::fail("secret PAYMENT_API_KEY missing").no_retry();
        };
        let res = http::post("https://api.payments.example/v1/charges")
            .bearer(&key)
            .json(&json!({ "customer": input.customer_id, "amount": input.amount_cents }))
            .send();
        match res {
            Ok(r) if r.status() == 200 => {
                let id = r
                    .json::<Value>()
                    .ok()
                    .and_then(|v| v["id"].as_str().map(str::to_owned));
                Outcome::complete(json!({ "charged": true, "chargeId": id }))
            }
            Ok(r) if r.status() == 402 => Outcome::throw_error("PAYMENT_DECLINED", "card declined"),
            Ok(r) => Outcome::fail(format!("payment api returned {}", r.status())),
            Err(e) => Outcome::fail(e.to_string()).backoff_ms(5_000),
        }
    }
}

bpmnkit_wasm_sdk::export!(ChargeCard);
