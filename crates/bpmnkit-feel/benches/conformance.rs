//! Times parse + evaluate over the context-free conformance expressions.
//! `cargo bench -p bpmnkit-feel`. No criterion: a plain loop is enough to spot
//! regressions and to compare with reebe-feel (see doc/progress.md, 2026-11-06).
//!
//! The cases in `OWN_ROW` cost more than all the others together, so they get rows of
//! their own; otherwise the per-expression average would only track them.

use bpmnkit_feel::{parse, Context, ParseOptions};
use std::hint::black_box;
use std::time::Instant;

/// `count(for x in [67..100000) return ...)`: a 100k-element loop.
const OWN_ROW: &[&str] = &["fuzz/19"];

fn row(label: &str, exprs: &[String], iters: u32) {
    let (ctx, opts) = (Context::new(), ParseOptions::default());
    let start = Instant::now();
    for _ in 0..iters {
        for e in exprs {
            let _ = black_box(parse(e, &opts).map(|x| x.evaluate(&ctx)));
        }
    }
    let both = start.elapsed().as_secs_f64();
    let parsed: Vec<_> = exprs.iter().filter_map(|e| parse(e, &opts).ok()).collect();
    let start = Instant::now();
    for _ in 0..iters {
        for e in &parsed {
            black_box(e.evaluate(&ctx));
        }
    }
    let eval = start.elapsed().as_secs_f64();
    let n = f64::from(iters) * exprs.len() as f64;
    let parsed_n = f64::from(iters) * parsed.len() as f64;
    println!(
        "{:<26} {:>9.2} µs per expr",
        format!("{label} parse+eval"),
        both * 1e6 / n
    );
    println!(
        "{:<26} {:>9.2} µs per expr",
        format!("{label} eval"),
        eval * 1e6 / parsed_n
    );
}

/// `matches()` with one pattern (served by the regex cache) against a new
/// pattern every call (a compile each time, as before the cache).
fn regex_rows(opts: &ParseOptions) {
    let expr = parse("matches(s, p)", opts).expect("matches");
    let pattern = r"^[A-Z]{2}\d{4}-[a-z]+(\.[a-z]+)*@example\.(com|org)$";
    let calls = 20_000;
    let time = |fresh: bool| {
        let start = Instant::now();
        for i in 0..calls {
            let p = if fresh {
                format!("{pattern}|n{i}")
            } else {
                pattern.to_owned()
            };
            let mut ctx = Context::new();
            ctx.insert("s", "AB1234-jo.doe@example.com");
            ctx.insert("p", p.as_str());
            black_box(expr.evaluate(&ctx));
        }
        start.elapsed().as_secs_f64() * 1e6 / f64::from(calls)
    };
    println!(
        "{:<26} {:>9.2} µs per call",
        "matches() cached pattern",
        time(false)
    );
    println!(
        "{:<26} {:>9.2} µs per call",
        "matches() new pattern",
        time(true)
    );
}

fn main() {
    let dir = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/feel");
    let mut files: Vec<_> = std::fs::read_dir(dir)
        .expect("conformance/feel")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .collect();
    files.sort();
    let (mut exprs, mut heavy) = (vec![], vec![]);
    for f in files {
        for line in std::fs::read_to_string(f).unwrap_or_default().lines() {
            let Ok(case) = serde_json::from_str::<serde_json::Value>(line) else {
                continue;
            };
            if !case["context"].as_object().is_some_and(|c| c.is_empty()) {
                continue;
            }
            let (Some(id), Some(expr)) = (case["id"].as_str(), case["expr"].as_str()) else {
                continue;
            };
            match OWN_ROW.contains(&id) {
                true => heavy.push((id.to_owned(), expr.to_owned())),
                false => exprs.push(expr.to_owned()),
            }
        }
    }
    assert_eq!(
        heavy.len(),
        OWN_ROW.len(),
        "an OWN_ROW case left the corpus"
    );
    println!(
        "{} expressions x 200, plus {} on their own rows x 5",
        exprs.len(),
        heavy.len()
    );
    row("all others", &exprs, 200);
    for (id, expr) in &heavy {
        row(id, std::slice::from_ref(expr), 5);
    }
    regex_rows(&ParseOptions::default());
}
