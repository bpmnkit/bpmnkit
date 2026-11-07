//! Times lint, optimize and the compatibility check over conformance/bpmn/<case>/input.bpmn,
//! the files `scripts/bench-lint.mjs` times for TS. Plain loop, no harness.

use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_compat::compat::analyze_camunda_compat;
use bpmnkit_lint::lint::{lint_diagram, LintOptions};
use bpmnkit_lint::optimize::{optimize, OptimizeOptions};
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
    let models: Vec<_> = cases
        .iter()
        .map(|p| parse_bpmn(&std::fs::read_to_string(p).expect("input.bpmn")).expect("parses"))
        .collect();
    let iterations = 100;
    println!("{} models, {iterations} passes", models.len());
    time("lint (forced)", iterations, || {
        for m in &models {
            let options = LintOptions {
                force_engine_rules: true,
                ..LintOptions::default()
            };
            black_box(lint_diagram(black_box(m), options));
        }
    });
    time("optimize", iterations, || {
        for m in &models {
            black_box(optimize(black_box(m), &OptimizeOptions::default()));
        }
    });
    time("compat 8.6", iterations, || {
        for m in &models {
            black_box(analyze_camunda_compat(black_box(m), Some("8.6")));
        }
    });
}
