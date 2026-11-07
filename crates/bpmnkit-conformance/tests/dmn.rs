//! Like `conformance.rs`, but names what differs for each failing DMN case.

use bpmnkit_conformance::*;

#[test]
fn dmn_cases_say_what_differs() {
    let dir = conformance_dir();
    let pending = load_pending(&dir).expect("pending.json");
    let ids = load_dmn_case_ids(&dir);
    assert!(!ids.is_empty(), "no DMN cases");
    let mut failures = vec![];
    for id in ids {
        let result = std::panic::catch_unwind(|| check_dmn_case(&dir, &id))
            .unwrap_or_else(|_| Err("panicked".into()));
        match (result, pending.contains_key(&id)) {
            (Err(why), false) => failures.push(format!("{id}: {why}")),
            (Err(why), true) => println!("pending {id}: {why}"),
            (Ok(()), _) => {}
        }
    }
    assert!(failures.is_empty(), "{failures:#?}");
}

#[test]
fn dmn_evaluation_cases_say_what_differs() {
    let dir = conformance_dir();
    let pending = load_pending(&dir).expect("pending.json");
    let ids = eval_case_ids(&dir);
    assert!(!ids.is_empty(), "no DMN evaluation cases");
    let mut failures = vec![];
    for id in ids {
        let result = std::panic::catch_unwind(|| check_dmn_eval_case(&dir, &id))
            .unwrap_or_else(|_| Err("panicked".into()));
        match (result, pending.contains_key(&id)) {
            (Err(why), false) => failures.push(format!("{id}: {why}")),
            (Err(why), true) => println!("pending {id}: {why}"),
            (Ok(()), _) => {}
        }
    }
    assert!(failures.is_empty(), "{failures:#?}");
}
