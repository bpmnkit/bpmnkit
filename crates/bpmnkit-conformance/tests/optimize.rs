//! Like `conformance.rs`, but names what differs for each failing `optimize/` run.

use bpmnkit_conformance::*;

#[test]
fn optimize_cases_say_what_differs() {
    let dir = conformance_dir();
    let pending = load_pending(&dir).expect("pending.json");
    let mut failures = vec![];
    for id in optimize::case_ids(&dir) {
        let result = std::panic::catch_unwind(|| optimize::check_case(&dir, &id))
            .unwrap_or_else(|_| Err("panicked".into()));
        match (result, pending.contains_key(&id)) {
            (Err(why), false) => failures.push(format!("{id}: {why}")),
            (Err(why), true) => println!("pending {id}: {why}"),
            (Ok(()), _) => {}
        }
    }
    assert!(
        failures.is_empty(),
        "{} failing: {failures:#?}",
        failures.len()
    );
}
