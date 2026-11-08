//! Names what differs for each failing `gate/` run.

use bpmnkit_conformance::*;

#[test]
fn gate_cases_say_what_differs() {
    let dir = conformance_dir();
    let ids = gate::case_ids(&dir);
    assert!(!ids.is_empty(), "no gate cases");
    let failures: Vec<String> = ids
        .iter()
        .filter_map(|id| {
            gate::check_case(&dir, id)
                .err()
                .map(|e| format!("{id}: {e}"))
        })
        .collect();
    println!("gate: {} runs, {} failing", ids.len(), failures.len());
    assert!(failures.is_empty(), "{failures:#?}");
}
