//! Like `conformance.rs`, but names what differs for each failing form case.

use bpmnkit_conformance::*;

#[test]
fn form_cases_say_what_differs() {
    let dir = conformance_dir();
    let pending = load_pending(&dir).expect("pending.json");
    let ids = load_form_case_ids(&dir);
    assert!(!ids.is_empty(), "no form cases found");
    let mut failures = vec![];
    for id in ids {
        let result = std::panic::catch_unwind(|| check_form_case(&dir, &id))
            .unwrap_or_else(|_| Err("panicked".into()));
        match (result, pending.contains_key(&id)) {
            (Err(why), false) => failures.push(format!("{id}: {why}")),
            (Err(why), true) => println!("pending {id}: {why}"),
            (Ok(()), _) => {}
        }
    }
    assert!(failures.is_empty(), "{failures:#?}");
}
