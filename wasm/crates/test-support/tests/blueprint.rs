//! Builds and smoke-tests the example workers: the `wasm/examples/order-fulfilment` blueprint
//! and the playground's Wasm workers.
use std::path::Path;
use std::process::Command;

#[test]
#[ignore = "needs wasm32-wasip2 (and the HTTP stub runtime for charge-card)"]
fn blueprint_workers_pass_their_samples() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
    for w in [
        "order-fulfilment/check-stock",
        "order-fulfilment/charge-card",
        "playground/fx-invoice/convert-invoice",
        "playground/country-check/check-country",
    ] {
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
            .arg(root.join("examples").join(w))
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
