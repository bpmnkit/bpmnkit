//! `cargo run -p bpmnkit-fuzz --release -- [--target <name>|all] [--seconds N] [--seed N]
//! [--out DIR] [--node PATH] [--max-mismatches N]`
//!
//! Runs each target for `--seconds` (default 60), comparing the Rust crates with the TS oracle
//! on every generated input. Proptest shrinks each disagreement; the minimal input, both answers
//! and the seed go to `<out>/<target>-<n>.json` (default `target/fuzz-mismatches`). Exits 1 when
//! anything mismatched, 2 on bad arguments or a dead oracle.
//!
//! `--slow N` (default 20) saves an input either side takes longer than N s on and stops.
//! `--replay FILE` re-runs one saved mismatch (or any `{"target", "input"}` file) and prints both
//! answers, to check a fix.

use bpmnkit_fuzz::oracle::{default_script, Oracle};
use bpmnkit_fuzz::{compare, gen, run, Target};
use proptest::test_runner::{Config, RngAlgorithm, TestCaseError, TestError, TestRng, TestRunner};
use serde_json::json;
use std::cell::RefCell;
use std::path::PathBuf;
use std::time::{Duration, Instant};

struct Args {
    targets: Vec<Target>,
    seconds: u64,
    seed: u64,
    out: PathBuf,
    node: String,
    max_mismatches: usize,
    replay: Option<PathBuf>,
    /// One input taking longer than this (either side) is saved as a finding.
    slow: u64,
}

/// The input being answered right now, and since when; the watchdog reads it.
type Current = std::sync::Arc<std::sync::Mutex<Option<(Instant, Target, serde_json::Value)>>>;

/// Saves an input that has run longer than `limit` seconds and ends the process: a hang in
/// either implementation cannot be interrupted from here, and it is a finding of its own.
fn watchdog(current: Current, limit: u64, out: PathBuf) {
    std::thread::spawn(move || loop {
        std::thread::sleep(Duration::from_millis(500));
        let guard = current.lock().unwrap_or_else(|e| e.into_inner());
        if let Some((since, target, req)) = guard.as_ref() {
            if since.elapsed() > Duration::from_secs(limit) {
                let _ = std::fs::create_dir_all(&out);
                let file = out.join(format!("{}-slow.json", target.name()));
                let record = json!({
                    "target": target.name(),
                    "reason": format!("one input ran longer than {limit} s"),
                    "input": req,
                });
                let _ = std::fs::write(
                    &file,
                    serde_json::to_string_pretty(&record).unwrap_or_default() + "\n",
                );
                eprintln!("  {}: slow input → {}", target.name(), file.display());
                std::process::exit(1);
            }
        }
    });
}

fn parse_args() -> Result<Args, String> {
    let mut a = Args {
        targets: Target::ALL.to_vec(),
        seconds: 60,
        seed: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0),
        out: PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../target/fuzz-mismatches"),
        node: "node".into(),
        max_mismatches: 10,
        replay: None,
        slow: 20,
    };
    let mut it = std::env::args().skip(1);
    while let Some(flag) = it.next() {
        let mut value = || it.next().ok_or(format!("{flag} needs a value"));
        match flag.as_str() {
            "--target" => {
                let v = value()?;
                a.targets = match v.as_str() {
                    "all" => Target::ALL.to_vec(),
                    names => names
                        .split(',')
                        .map(|n| Target::from_name(n).ok_or(format!("unknown target {n}")))
                        .collect::<Result<_, _>>()?,
                };
            }
            "--seconds" => a.seconds = value()?.parse().map_err(|e| format!("--seconds: {e}"))?,
            "--seed" => a.seed = value()?.parse().map_err(|e| format!("--seed: {e}"))?,
            "--out" => a.out = PathBuf::from(value()?),
            "--node" => a.node = value()?,
            "--max-mismatches" => {
                a.max_mismatches = value()?
                    .parse()
                    .map_err(|e| format!("--max-mismatches: {e}"))?
            }
            "--slow" => a.slow = value()?.parse().map_err(|e| format!("--slow: {e}"))?,
            "--replay" => a.replay = Some(PathBuf::from(value()?)),
            other => return Err(format!("unknown argument {other}")),
        }
    }
    Ok(a)
}

fn rng(seed: u64) -> TestRng {
    let mut bytes = [0u8; 32];
    bytes[..8].copy_from_slice(&seed.to_le_bytes());
    TestRng::from_seed(RngAlgorithm::ChaCha, &bytes)
}

/// Fuzzes one target until the deadline; returns (inputs tried, mismatches saved).
fn fuzz(
    target: Target,
    args: &Args,
    oracle: &RefCell<Oracle>,
    current: &Current,
) -> Result<(u64, usize), String> {
    let deadline = Instant::now() + Duration::from_secs(args.seconds);
    let strategy = gen::strategy(target);
    let (mut tried, mut found) = (0u64, 0usize);
    let mut seen = std::collections::HashSet::new();
    let mut batch = 0u64;
    while Instant::now() < deadline && found < args.max_mismatches {
        let seed = args.seed.wrapping_add(batch);
        batch += 1;
        let config = Config {
            cases: 128,
            failure_persistence: None,
            max_shrink_iters: 2048,
            ..Config::default()
        };
        let mut runner = TestRunner::new_with_rng(config, rng(seed));
        let count = RefCell::new(0u64);
        let dead = RefCell::new(None::<String>);
        let result = runner.run(&strategy, |req| {
            if Instant::now() >= deadline || dead.borrow().is_some() {
                return Ok(());
            }
            *count.borrow_mut() += 1;
            *current.lock().unwrap_or_else(|e| e.into_inner()) =
                Some((Instant::now(), target, req.clone()));
            let rust = run(target, &req);
            let ts = oracle.borrow_mut().call(target, &req).map_err(|e| {
                *dead.borrow_mut() = Some(e.clone());
                TestCaseError::fail(e)
            });
            *current.lock().unwrap_or_else(|e| e.into_inner()) = None;
            let ts = ts?;
            compare(target, &rust, &ts).map_err(TestCaseError::fail)
        });
        tried += *count.borrow();
        if let Some(e) = dead.borrow().clone() {
            return Err(e);
        }
        if let Err(TestError::Fail(reason, req)) = result {
            // One file per distinct first line of the reason, so a common bug does not flood.
            let key = reason.message().lines().next().unwrap_or("").to_owned();
            if !seen.insert(key) {
                continue;
            }
            let rust = run(target, &req);
            let ts = oracle.borrow_mut().call(target, &req)?;
            found += 1;
            std::fs::create_dir_all(&args.out).map_err(|e| e.to_string())?;
            let file = args.out.join(format!("{}-{seed}.json", target.name()));
            let record = json!({
                "target": target.name(),
                "seed": seed,
                "reason": reason.message(),
                "input": req,
                "rust": rust,
                "ts": ts,
            });
            let text = serde_json::to_string_pretty(&record).map_err(|e| e.to_string())?;
            std::fs::write(&file, text + "\n").map_err(|e| e.to_string())?;
            eprintln!(
                "  {}: mismatch → {} ({})",
                target.name(),
                file.display(),
                reason.message()
            );
        }
    }
    Ok((tried, found))
}

fn replay(path: &std::path::Path, oracle: &RefCell<Oracle>) -> i32 {
    let record: serde_json::Value = match std::fs::read_to_string(path)
        .map_err(|e| e.to_string())
        .and_then(|t| serde_json::from_str(&t).map_err(|e| e.to_string()))
    {
        Ok(r) => r,
        Err(e) => {
            eprintln!("bpmnkit-fuzz: {}: {e}", path.display());
            return 2;
        }
    };
    let Some(target) = record["target"].as_str().and_then(Target::from_name) else {
        eprintln!("bpmnkit-fuzz: {}: no known \"target\"", path.display());
        return 2;
    };
    let req = &record["input"];
    let rust = run(target, req);
    let ts = match oracle.borrow_mut().call(target, req) {
        Ok(t) => t,
        Err(e) => {
            eprintln!("bpmnkit-fuzz: oracle failed: {e}");
            return 2;
        }
    };
    let pretty = |v: &serde_json::Value| serde_json::to_string_pretty(v).unwrap_or_default();
    println!("rust: {}\nts: {}", pretty(&rust), pretty(&ts));
    match compare(target, &rust, &ts) {
        Ok(()) => {
            println!("agree");
            0
        }
        Err(e) => {
            println!("differ: {e}");
            1
        }
    }
}

fn main() {
    let args = match parse_args() {
        Ok(a) => a,
        Err(e) => {
            eprintln!("bpmnkit-fuzz: {e}");
            std::process::exit(2);
        }
    };
    // Panics are caught and reported as mismatches; the default hook would only add noise.
    std::panic::set_hook(Box::new(|_| {}));
    let oracle = match Oracle::spawn(&args.node, &default_script()) {
        Ok(o) => RefCell::new(o),
        Err(e) => {
            eprintln!("bpmnkit-fuzz: cannot start the oracle: {e}");
            std::process::exit(2);
        }
    };
    if let Some(path) = &args.replay {
        std::process::exit(replay(path, &oracle));
    }
    let current: Current = Default::default();
    watchdog(current.clone(), args.slow, args.out.clone());
    println!("seed {} · {} s per target", args.seed, args.seconds);
    let mut total = 0;
    for target in &args.targets {
        match fuzz(*target, &args, &oracle, &current) {
            Ok((tried, found)) => {
                println!("{:<9} {tried:>8} inputs, {found} mismatches", target.name());
                total += found;
            }
            Err(e) => {
                eprintln!("bpmnkit-fuzz: {}: oracle failed: {e}", target.name());
                std::process::exit(2);
            }
        }
    }
    std::process::exit(if total > 0 { 1 } else { 0 });
}
