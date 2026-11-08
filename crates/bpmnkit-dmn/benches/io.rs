//! Times parse and serialize over conformance/dmn/<case>/input.dmn (the cases that parse), the
//! files `scripts/bench-dmn-io.mjs` times for TS, and evaluation of every evaluate.json entry
//! whose context is plain JSON (no temporal values). Plain loop, no harness.

use bpmnkit_dmn::{evaluate_decision_graph, parse_dmn, serialize_dmn};
use bpmnkit_feel::{Context, Value};
use std::hint::black_box;
use std::time::Instant;

fn time(label: &str, iterations: u32, mut run: impl FnMut()) {
    for _ in 0..iterations / 10 {
        run();
    }
    let start = Instant::now();
    for _ in 0..iterations {
        run();
    }
    let us = start.elapsed().as_secs_f64() * 1e6 / f64::from(iterations);
    println!("{label:<18} {us:>9.1} µs per pass");
}

/// A case-file value (`{"t": ..., "v": ...}`), or `None` for temporal values.
fn decode(v: &serde_json::Value) -> Option<Value> {
    Some(match v["t"].as_str()? {
        "null" => Value::Null,
        "boolean" => Value::Boolean(v["v"].as_bool()?),
        "number" => Value::Number(v["v"].as_str()?.parse().ok()?),
        "string" => Value::String(v["v"].as_str()?.to_string()),
        "list" => Value::List(
            v["v"]
                .as_array()?
                .iter()
                .map(decode)
                .collect::<Option<_>>()?,
        ),
        "context" => Value::Context(context(v["v"].as_object()?)?),
        _ => return None,
    })
}

fn context(m: &serde_json::Map<String, serde_json::Value>) -> Option<Context> {
    let mut c = Context::new();
    for (k, v) in m {
        c.insert(k.clone(), decode(v)?);
    }
    Some(c)
}

fn main() {
    let dir = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/dmn");
    let mut cases: Vec<_> = std::fs::read_dir(dir)
        .expect("conformance/dmn")
        .filter_map(|e| e.ok().map(|e| e.path().join("input.dmn")))
        .collect();
    cases.sort();
    // Error cases have nothing to serialize; the TS bench skips them the same way.
    let inputs: Vec<String> = cases
        .iter()
        .map(|p| std::fs::read_to_string(p).expect("input.dmn"))
        .filter(|x| parse_dmn(x).is_ok())
        .collect();
    let models: Vec<_> = inputs
        .iter()
        .map(|x| parse_dmn(x).expect("parses"))
        .collect();
    let bytes: usize = inputs.iter().map(String::len).sum();
    let iterations = 300;
    println!("{} files, {bytes} bytes, {iterations} passes", inputs.len());
    time("parse", iterations, || {
        for x in &inputs {
            black_box(parse_dmn(black_box(x)).ok());
        }
    });
    time("serialize", iterations, || {
        for m in &models {
            black_box(serialize_dmn(black_box(m)));
        }
    });
    time("parse+serialize", iterations, || {
        for x in &inputs {
            black_box(parse_dmn(black_box(x)).map(|m| serialize_dmn(&m)).ok());
        }
    });

    // Evaluation: (model, decision, context) for every plain-JSON evaluate.json entry.
    let mut evals = vec![];
    for case in &cases {
        let Some(dir) = case.parent() else { continue };
        let Ok(text) = std::fs::read_to_string(dir.join("evaluate.json")) else {
            continue;
        };
        let model = parse_dmn(&std::fs::read_to_string(case).expect("input")).expect("parses");
        let entries: Vec<serde_json::Value> = serde_json::from_str(&text).expect("evaluate.json");
        for e in entries {
            if let Some(ctx) = e["context"].as_object().and_then(context) {
                evals.push((
                    model.clone(),
                    e["decision"].as_str().unwrap_or("").to_string(),
                    ctx,
                ));
            }
        }
    }
    println!("{} evaluations", evals.len());
    time("evaluate", iterations, || {
        for (m, d, c) in &evals {
            black_box(evaluate_decision_graph(m, d, c).ok());
        }
    });
}
