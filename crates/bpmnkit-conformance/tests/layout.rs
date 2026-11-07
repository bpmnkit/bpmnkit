//! Like `conformance.rs`, but names what differs for each failing `layout/` run, and reports how
//! many runs match exactly and how many only within `LAYOUT_TOLERANCE`.

use bpmnkit_conformance::layout::{check_run, Match, LAYOUT_TOLERANCE};
use bpmnkit_conformance::*;

#[test]
fn layout_cases_say_what_differs() {
    let dir = conformance_dir();
    let pending = load_pending(&dir).expect("pending.json");
    let (mut exact, mut tolerant) = (0, 0);
    let mut failures = vec![];
    for id in layout::case_ids(&dir) {
        let result = std::panic::catch_unwind(|| check_run(&dir, &id))
            .unwrap_or_else(|_| Err("panicked".into()));
        match (result, pending.contains_key(&id)) {
            (Ok(Match::Exact), _) => exact += 1,
            (Ok(Match::WithinTolerance), _) => tolerant += 1,
            (Err(why), false) => failures.push(format!("{id}: {why}")),
            (Err(why), true) => println!("pending {id}: {why}"),
        }
    }
    println!(
        "layout: {exact} exact, {tolerant} within {LAYOUT_TOLERANCE} px, {} failed",
        failures.len()
    );
    assert!(
        failures.is_empty(),
        "{} failing: {failures:#?}",
        failures.len()
    );
}
