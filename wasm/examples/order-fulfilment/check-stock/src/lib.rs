//! Reserves stock for an order from a fixed in-code catalogue (a real shop would query a DB).
use bpmnkit_wasm_sdk::prelude::*;

#[derive(Deserialize)]
struct Input {
    sku: String,
    quantity: u64,
}

// Demo catalogue: (sku, units on hand, unit price in cents).
const CATALOGUE: [(&str, u64, u64); 3] = [
    ("widget", 100, 1_250),
    ("gadget", 5, 4_900),
    ("gizmo", 0, 990),
];

struct CheckStock;

impl Worker for CheckStock {
    fn handle(job: Job) -> Outcome {
        let input: Input = match job.variables() {
            Ok(v) => v,
            Err(e) => return Outcome::fail(format!("bad input: {e}")).no_retry(),
        };
        let Some(&(_, on_hand, price)) = CATALOGUE.iter().find(|(s, _, _)| *s == input.sku) else {
            return Outcome::throw_error("UNKNOWN_SKU", format!("no such sku: {}", input.sku));
        };
        if input.quantity == 0 || input.quantity > on_hand {
            return Outcome::throw_error(
                "OUT_OF_STOCK",
                format!("{} left of {}", on_hand, input.sku),
            );
        }
        Outcome::complete(json!({
            "inStock": true,
            "amountCents": price * input.quantity,
        }))
    }
}

bpmnkit_wasm_sdk::export!(CheckStock);
