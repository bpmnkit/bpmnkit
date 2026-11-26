//! Converts EUR invoice lines into the target currency with the rates the REST connector
//! fetched. Each unit price is rounded to the currency's minor unit first, so line totals and
//! the invoice total add up exactly. A currency without a rate is the BPMN error
//! `UNSUPPORTED_CURRENCY`, caught by a boundary event.
use std::collections::BTreeMap;

use bpmnkit_wasm_sdk::prelude::*;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Line {
    description: String,
    quantity: u32,
    unit_price: f64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Input {
    target_currency: String,
    #[serde(default)]
    rates: BTreeMap<String, f64>,
    lines: Vec<Line>,
}

// ISO 4217 currencies in the ECB set that have no minor unit.
const ZERO_DECIMALS: [&str; 3] = ["JPY", "KRW", "ISK"];

struct ConvertInvoice;

impl Worker for ConvertInvoice {
    fn handle(job: Job) -> Outcome {
        let input: Input = match job.variables() {
            Ok(v) => v,
            Err(e) => return Outcome::fail(format!("bad input: {e}")).no_retry(),
        };
        let currency = input.target_currency.to_ascii_uppercase();
        let rate = if currency == "EUR" {
            1.0
        } else {
            match input.rates.get(&currency) {
                Some(r) if r.is_finite() && *r > 0.0 => *r,
                _ => {
                    return Outcome::throw_error(
                        "UNSUPPORTED_CURRENCY",
                        format!("no EUR rate for {currency}"),
                    )
                    .with_variables(json!({ "unsupportedCurrency": currency }))
                }
            }
        };
        let scale = if ZERO_DECIMALS.contains(&currency.as_str()) {
            1.0
        } else {
            100.0
        };
        let mut lines = Vec::with_capacity(input.lines.len());
        let mut total_minor: i64 = 0;
        for l in input.lines {
            if !l.unit_price.is_finite() || l.unit_price < 0.0 {
                return Outcome::fail(format!("bad unit price for {}", l.description)).no_retry();
            }
            let unit_minor = (l.unit_price * rate * scale).round() as i64;
            let line_minor = unit_minor * i64::from(l.quantity);
            total_minor += line_minor;
            lines.push(json!({
                "description": l.description,
                "quantity": l.quantity,
                "unitPrice": unit_minor as f64 / scale,
                "lineTotal": line_minor as f64 / scale,
            }));
        }
        Outcome::complete(json!({
            "convertedLines": lines,
            "invoiceTotal": total_minor as f64 / scale,
            "currency": currency,
            "rate": rate,
        }))
    }
}

bpmnkit_wasm_sdk::export!(ConvertInvoice);
