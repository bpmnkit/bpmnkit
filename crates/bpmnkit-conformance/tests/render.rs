//! Every `render/` case renders byte-equal to its TS-recorded SVG, or is listed in pending.json.
//! `RENDER_CASES_DIR` points the runner at another corpus with the same layout.

use bpmnkit_conformance::render::{case_ids, check_case};
use bpmnkit_conformance::*;
use std::path::PathBuf;

#[test]
fn render_cases_match_ts() {
    let dir = std::env::var_os("RENDER_CASES_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(conformance_dir);
    let pending = load_pending(&conformance_dir()).expect("pending.json");
    let mut passed = 0;
    let mut failures = vec![];
    for id in case_ids(&dir) {
        let result = std::panic::catch_unwind(|| check_case(&dir, &id))
            .unwrap_or_else(|_| Err("panicked".into()));
        match (result, pending.contains_key(&id)) {
            (Ok(()), true) => failures.push(format!("{id}: passes, remove it from pending.json")),
            (Ok(()), false) => passed += 1,
            (Err(why), false) => failures.push(format!("{id}: {why}")),
            (Err(why), true) => println!("pending {id}: {why}"),
        }
    }
    println!("render: {passed} passed, {} failed", failures.len());
    assert!(
        failures.is_empty(),
        "{} failing:\n{}",
        failures.len(),
        failures.join("\n")
    );
}
