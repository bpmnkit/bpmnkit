//! Times parse and serialize over conformance/bpmn/<case>/input.bpmn, the files
//! `scripts/bench-bpmn-io.mjs` times for TS. Plain loop, no harness.

use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};
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

fn main() {
    let dir = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/bpmn");
    let mut cases: Vec<_> = std::fs::read_dir(dir)
        .expect("conformance/bpmn")
        .filter_map(|e| e.ok().map(|e| e.path().join("input.bpmn")))
        .collect();
    cases.sort();
    let inputs: Vec<String> = cases
        .iter()
        .map(|p| std::fs::read_to_string(p).expect("input.bpmn"))
        .collect();
    let models: Vec<_> = inputs
        .iter()
        .map(|x| parse_bpmn(x).expect("parses"))
        .collect();
    let bytes: usize = inputs.iter().map(String::len).sum();
    let iterations = 300;
    println!("{} files, {bytes} bytes, {iterations} passes", inputs.len());
    time("parse", iterations, || {
        for x in &inputs {
            black_box(parse_bpmn(black_box(x)).ok());
        }
    });
    time("serialize", iterations, || {
        for m in &models {
            black_box(serialize_bpmn(black_box(m)));
        }
    });
    time("parse+serialize", iterations, || {
        for x in &inputs {
            black_box(parse_bpmn(black_box(x)).map(|m| serialize_bpmn(&m)).ok());
        }
    });
}
