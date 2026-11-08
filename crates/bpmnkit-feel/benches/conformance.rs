//! Times parse + evaluate over the context-free conformance expressions.
//! `cargo bench -p bpmnkit-feel`. No criterion: a plain loop is enough to spot
//! regressions and to compare with reebe-feel (see doc/progress.md, 2026-11-06).

use bpmnkit_feel::{parse, Context, ParseOptions};
use std::hint::black_box;
use std::time::Instant;

fn main() {
    let dir = concat!(env!("CARGO_MANIFEST_DIR"), "/../../conformance/feel");
    let mut files: Vec<_> = std::fs::read_dir(dir)
        .expect("conformance/feel")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .collect();
    files.sort();
    let mut exprs = vec![];
    for f in files {
        for line in std::fs::read_to_string(f).unwrap_or_default().lines() {
            let Ok(case) = serde_json::from_str::<serde_json::Value>(line) else {
                continue;
            };
            if case["context"].as_object().is_some_and(|c| c.is_empty()) {
                exprs.extend(case["expr"].as_str().map(str::to_owned));
            }
        }
    }
    let (ctx, opts, iters) = (Context::new(), ParseOptions::default(), 200);
    let start = Instant::now();
    for _ in 0..iters {
        for e in &exprs {
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
    let n = (iters * exprs.len()) as f64;
    println!("{} expressions x {iters}", exprs.len());
    println!("parse + evaluate: {:.2} us/expr", both * 1e6 / n);
    println!(
        "evaluate only:    {:.2} us/expr",
        eval * 1e6 / (iters * parsed.len()) as f64
    );
    regex_rows(&opts);
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
    println!("matches() cached pattern: {:.2} us/call", time(false));
    println!("matches() new pattern:    {:.2} us/call", time(true));
}
