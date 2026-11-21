//! Plan §3: `bpmnkit-jobspec` must stay WASM-safe, so neither it nor any of its normal
//! (non-dev) dependencies may pull in tokio.

use std::collections::BTreeMap;
use std::process::Command;

use serde_json::Value;

#[test]
fn jobspec_does_not_depend_on_tokio() {
    let cargo = std::env::var("CARGO").unwrap_or_else(|_| "cargo".into());
    let out = Command::new(cargo)
        .args(["metadata", "--format-version", "1", "--locked"])
        .current_dir(env!("CARGO_MANIFEST_DIR"))
        .output()
        .expect("cargo metadata runs");
    assert!(
        out.status.success(),
        "{}",
        String::from_utf8_lossy(&out.stderr)
    );
    let meta: Value = serde_json::from_slice(&out.stdout).unwrap();
    let nodes: BTreeMap<&str, &Value> = meta["resolve"]["nodes"]
        .as_array()
        .unwrap()
        .iter()
        .map(|n| (n["id"].as_str().unwrap(), n))
        .collect();
    let name_of = |id: &str| -> String {
        meta["packages"]
            .as_array()
            .unwrap()
            .iter()
            .find(|p| p["id"] == id)
            .map(|p| p["name"].as_str().unwrap().to_owned())
            .unwrap()
    };
    let root = nodes
        .keys()
        .find(|id| name_of(id) == "bpmnkit-jobspec")
        .copied()
        .unwrap();
    let mut stack = vec![root];
    let mut seen = std::collections::BTreeSet::new();
    while let Some(id) = stack.pop() {
        if !seen.insert(id) {
            continue;
        }
        let name = name_of(id);
        assert!(
            !name.starts_with("tokio"),
            "bpmnkit-jobspec pulls in {name}"
        );
        for dep in nodes[id]["deps"].as_array().unwrap() {
            let normal = dep["dep_kinds"]
                .as_array()
                .unwrap()
                .iter()
                .any(|k| k["kind"].is_null());
            if normal {
                stack.push(dep["pkg"].as_str().unwrap());
            }
        }
    }
    assert!(seen.len() > 3);
}
