//! Builds and smoke-tests the blueprint workers in `wasm/examples/order-fulfilment`.
use std::path::Path;
use std::process::Command;

#[test]
#[ignore = "needs wasm32-wasip2 (and the HTTP stub runtime for charge-card)"]
fn blueprint_workers_pass_their_samples() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
    for w in ["check-stock", "charge-card"] {
        let out = Command::new(env!("CARGO"))
            .args([
                "run",
                "-q",
                "--locked",
                "-p",
                "bpmnkit-wasm-build",
                "--bin",
                "bpmnkit-wasm",
                "--",
                "test",
            ])
            .arg(root.join("examples/order-fulfilment").join(w))
            .current_dir(&root)
            .output()
            .expect("run bpmnkit-wasm");
        assert!(
            out.status.success(),
            "{w}:\n{}{}",
            String::from_utf8_lossy(&out.stdout),
            String::from_utf8_lossy(&out.stderr)
        );
    }
}
