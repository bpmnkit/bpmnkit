//! Times `apply_auto_layout` (both engines) over conformance/bpmn/<case>/input.bpmn and
//! `layout_dmn` over conformance/dmn/<case>/input.dmn, the files `scripts/bench-layout.mjs`
//! times for TS. Plain loop, no harness. The `owned` rows time `*_owned` on models
//! copied before the clock starts, as a caller that already owns its model would.

use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_dmn::parse_dmn;
use bpmnkit_layout::{
    apply_auto_layout, apply_auto_layout_owned, layout_dmn, layout_dmn_owned, LayoutEngine,
};
use std::hint::black_box;
use std::path::PathBuf;
use std::time::{Duration, Instant};

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

/// Like [`time`], but each pass consumes its own copy of `models`, made untimed just
/// before the pass so it is as warm in cache as the borrowed rows' inputs.
fn time_owned<T: Clone>(label: &str, iterations: u32, models: &[T], mut run: impl FnMut(T)) {
    let mut pass = || {
        let copy = models.to_vec();
        let start = Instant::now();
        for m in copy {
            run(m);
        }
        start.elapsed()
    };
    for _ in 0..iterations / 10 {
        pass();
    }
    let total: Duration = (0..iterations).map(|_| pass()).sum();
    let us = total.as_secs_f64() * 1e6 / f64::from(iterations);
    println!("{label:<18} {us:>9.1} µs per pass");
}

fn inputs(kind: &str, file: &str) -> Vec<String> {
    let dir = PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance")).join(kind);
    let mut paths: Vec<_> = std::fs::read_dir(dir)
        .expect("conformance dir")
        .filter_map(|e| e.ok().map(|e| e.path().join(file)))
        .filter(|p| p.exists())
        .collect();
    paths.sort();
    paths
        .iter()
        .map(|p| std::fs::read_to_string(p).expect("input"))
        .collect()
}

fn main() {
    let bpmn: Vec<_> = inputs("bpmn", "input.bpmn")
        .iter()
        .map(|x| parse_bpmn(x).expect("parses"))
        .collect();
    let dmn: Vec<_> = inputs("dmn", "input.dmn")
        .iter()
        .filter_map(|x| parse_dmn(x).ok())
        .collect();
    let iterations = 50;
    println!(
        "{} BPMN models, {} DMN models, {iterations} passes",
        bpmn.len(),
        dmn.len()
    );
    time("layout semantic", iterations, || {
        for m in &bpmn {
            black_box(apply_auto_layout(
                black_box(m),
                LayoutEngine::Semantic,
                None,
            ));
        }
    });
    time("layout grid", iterations, || {
        for m in &bpmn {
            black_box(apply_auto_layout(black_box(m), LayoutEngine::Grid, None));
        }
    });
    time("layout dmn", iterations, || {
        for m in &dmn {
            black_box(layout_dmn(black_box(m)));
        }
    });
    time_owned("owned semantic", iterations, &bpmn, |m| {
        black_box(apply_auto_layout_owned(
            black_box(m),
            LayoutEngine::Semantic,
            None,
        ));
    });
    time_owned("owned grid", iterations, &bpmn, |m| {
        black_box(apply_auto_layout_owned(
            black_box(m),
            LayoutEngine::Grid,
            None,
        ));
    });
    time_owned("owned dmn", iterations, &dmn, |m| {
        black_box(layout_dmn_owned(black_box(m)));
    });
}
