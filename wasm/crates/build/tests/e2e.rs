//! `init` → `build` → `test` on the scaffolded worker, through the real binary and cargo.
//! Needs the wasm32-wasip2 target and crates.io (first run compiles the SDK's dependencies into a
//! shared target dir, later runs reuse it). Prints per-stage timings; run with `--nocapture`.

use std::path::Path;
use std::process::Command;

fn bin(cache: &Path) -> Command {
    let mut c = Command::new(env!("CARGO_BIN_EXE_bpmnkit-wasm"));
    c.env("BPMNKIT_WASM_TARGET_DIR", cache);
    c
}

fn run(c: &mut Command) -> serde_json::Value {
    let o = c.output().unwrap();
    assert!(
        o.status.success(),
        "{}\n{}",
        String::from_utf8_lossy(&o.stdout),
        String::from_utf8_lossy(&o.stderr)
    );
    serde_json::from_slice(&o.stdout)
        .unwrap_or_else(|e| panic!("{e}: {}", String::from_utf8_lossy(&o.stdout)))
}

fn timings(label: &str, r: &serde_json::Value) -> u64 {
    let t: Vec<String> = r["timings"]
        .as_array()
        .unwrap()
        .iter()
        .map(|s| format!("{}={}ms", s["stage"].as_str().unwrap(), s["ms"]))
        .collect();
    let total: u64 = r["timings"]
        .as_array()
        .unwrap()
        .iter()
        .map(|s| s["ms"].as_u64().unwrap())
        .sum();
    println!("[{label}] {} total={total}ms", t.join(" "));
    total
}

#[test]
#[ignore = "needs wasm32-wasip2 and network"]
fn init_build_test_on_the_scaffold() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../target/e2e");
    let cache = root.join("cache");
    let work = root.join(format!("work-{}", std::process::id()));
    std::fs::create_dir_all(&work).unwrap();
    let dir = work.join("hello");

    let o = Command::new(env!("CARGO_BIN_EXE_bpmnkit-wasm"))
        .args(["init", "hello", "--dir"])
        .arg(&dir)
        .output()
        .unwrap();
    assert!(o.status.success(), "{}", String::from_utf8_lossy(&o.stderr));

    let out = dir.join("dist");
    let r = run(bin(&cache)
        .args(["build", "--format", "json", "--out"])
        .arg(&out)
        .arg(&dir));
    assert_eq!(r["ok"], true, "{r}");
    let first = timings("build", &r);
    assert!(out.join("worker.wasm").is_file() && out.join("metadata.json").is_file());
    assert_eq!(r["tests"][0]["passed"], true, "{r}");
    assert!(r["tests"][0]["message"]
        .as_str()
        .unwrap()
        .contains("hello Ada"));
    assert!(r["artifact"]["component_digest"].is_string());

    // Second run: dependencies and the project's own crate are warm.
    let r = run(bin(&cache).args(["test", "--format", "json"]).arg(&dir));
    assert_eq!(r["ok"], true, "{r}");
    let warm = timings("test (warm)", &r);

    let r = run(bin(&cache).args(["check", "--format", "json"]).arg(&dir));
    let check = timings("check (warm)", &r);

    // A compile error comes back as a diagnostic with a position, and stops the pipeline.
    let lib = dir.join("src/lib.rs");
    let src = std::fs::read_to_string(&lib).unwrap();
    std::fs::write(&lib, src.replace("let name", "let nam")).unwrap();
    let o = bin(&cache)
        .args(["check", "--format", "json"])
        .arg(&dir)
        .output()
        .unwrap();
    assert!(!o.status.success());
    let r: serde_json::Value = serde_json::from_slice(&o.stdout).unwrap();
    assert_eq!(r["ok"], false);
    assert_eq!(r["diagnostics"][0]["file"], "src/lib.rs");
    assert!(r["diagnostics"][0]["line"].as_u64().unwrap() > 0, "{r}");

    // The budget is generous for a cold CI runner; the printed numbers are the measurement.
    assert!(first < 180_000, "first build {first} ms");
    assert!(warm < 60_000, "warm test {warm} ms");
    assert!(check < 30_000, "warm check {check} ms");
    let _ = std::fs::remove_dir_all(&work);
}
