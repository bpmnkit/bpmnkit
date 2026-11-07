//! Times the text formats over the corpus files `scripts/bench-text.mjs` times for TS:
//! `parse_process_text` over `conformance/text/parse-*/input.txt`, `write_process_text`
//! over the documents of the `write-*` cases, `compactify` / `expand` over the
//! `conformance/compact/bpmn-*` inputs, and `compactify_dmn` / `expand_dmn` over the
//! `dmn-*` ones that start from a `.dmn`. Plain loop, no harness. Inputs are parsed
//! before the clock starts; `expand` rows take the diagrams `compactify` produced.

use std::hint::black_box;
use std::path::{Path, PathBuf};
use std::time::Instant;

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_dmn::parse_dmn;
use bpmnkit_text::compact::{compactify, expand};
use bpmnkit_text::dmn_compact::{compactify_dmn, expand_dmn};
use bpmnkit_text::process_text::{parse_process_text, write_process_text, WriteProcessTextOptions};
use serde_json::Value;

fn corpus() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance")
}

fn cases(kind: &str, prefix: &str) -> Vec<PathBuf> {
    let mut dirs: Vec<_> = std::fs::read_dir(corpus().join(kind))
        .expect("corpus dir")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| {
            p.file_name()
                .is_some_and(|n| n.to_string_lossy().starts_with(prefix))
        })
        .collect();
    dirs.sort();
    dirs
}

/// The case's input document: `input.<ext>`, else `case.json`'s `input`, relative to the
/// case folder or to `conformance/`.
fn input_text(dir: &Path, file: &str) -> Option<String> {
    let direct = dir.join(file);
    if direct.exists() {
        return std::fs::read_to_string(direct).ok();
    }
    let case: Value =
        serde_json::from_str(&std::fs::read_to_string(dir.join("case.json")).ok()?).ok()?;
    let rel = case.get("input")?.as_str()?;
    let local = dir.join(rel);
    std::fs::read_to_string(if local.exists() {
        local
    } else {
        corpus().join(rel)
    })
    .ok()
}

fn time(label: &str, iterations: u32, mut run: impl FnMut()) {
    for _ in 0..iterations / 10 {
        run();
    }
    let start = Instant::now();
    for _ in 0..iterations {
        run();
    }
    let ms = start.elapsed().as_secs_f64() * 1e3 / f64::from(iterations);
    println!("{label:<18} {ms:>9.3} ms per pass");
}

fn main() {
    let iterations: u32 = std::env::args()
        .skip(1)
        .find_map(|a| a.parse().ok())
        .unwrap_or(30);

    let texts: Vec<String> = cases("text", "parse-")
        .iter()
        .filter_map(|d| std::fs::read_to_string(d.join("input.txt")).ok())
        .collect();
    let written: Vec<_> = cases("text", "write-")
        .iter()
        .filter(|d| !d.join("expected/error.txt").exists())
        .filter_map(|d| input_text(d, "input.bpmn"))
        .map(|x| parse_bpmn(&x).expect("parses"))
        .collect();
    let bpmn: Vec<_> = cases("compact", "bpmn-")
        .iter()
        .filter_map(|d| input_text(d, "input.bpmn"))
        .map(|x| parse_bpmn(&x).expect("parses"))
        .collect();
    let diagrams: Vec<_> = bpmn
        .iter()
        .map(compactify)
        .filter(|d| expand(d).is_ok())
        .collect();
    let dmn: Vec<_> = cases("compact", "dmn-")
        .iter()
        .filter_map(|d| input_text(d, "input.dmn"))
        .filter_map(|x| parse_dmn(&x).ok())
        .collect();
    let compact_dmn: Vec<_> = dmn
        .iter()
        .map(compactify_dmn)
        .filter(|d| expand_dmn(d).is_ok())
        .collect();
    println!(
        "{} parse, {} write, {} BPMN compact ({} expand), {} DMN compact ({} expand), {iterations} passes",
        texts.len(),
        written.len(),
        bpmn.len(),
        diagrams.len(),
        dmn.len(),
        compact_dmn.len()
    );

    time("parse text", iterations, || {
        reset_id_counter();
        for t in &texts {
            black_box(parse_process_text(black_box(t)));
        }
    });
    time("write text", iterations, || {
        for m in &written {
            black_box(write_process_text(
                black_box(m),
                WriteProcessTextOptions::default(),
            ));
        }
    });
    time("compactify", iterations, || {
        for m in &bpmn {
            black_box(compactify(black_box(m)));
        }
    });
    time("expand", iterations, || {
        reset_id_counter();
        for d in &diagrams {
            black_box(expand(black_box(d)).ok());
        }
    });
    time("compactify dmn", iterations, || {
        for m in &dmn {
            black_box(compactify_dmn(black_box(m)));
        }
    });
    time("expand dmn", iterations, || {
        reset_id_counter();
        for d in &compact_dmn {
            black_box(expand_dmn(black_box(d)).ok());
        }
    });
}
