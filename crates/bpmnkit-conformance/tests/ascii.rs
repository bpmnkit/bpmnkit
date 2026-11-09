//! Every `ascii/` case renders byte-equal to its TS-recorded text, or is listed in pending.json.

use bpmnkit_conformance::*;

#[test]
fn ascii_cases_match_ts() {
    let dir = conformance_dir();
    let pending = load_pending(&dir).expect("pending.json");
    let ids = ascii::case_ids(&dir);
    assert!(!ids.is_empty(), "no ascii cases");
    let mut failures = vec![];
    for id in &ids {
        let result = std::panic::catch_unwind(|| ascii::check_case(&dir, id))
            .unwrap_or_else(|_| Err("panicked".into()));
        match (result, pending.contains_key(id)) {
            (Ok(()), true) => failures.push(format!("{id}: passes, remove it from pending.json")),
            (Ok(()), false) => {}
            (Err(why), false) => failures.push(format!("{id}: {why}")),
            (Err(why), true) => println!("pending {id}: {why}"),
        }
    }
    println!("ascii: {} cases, {} failing", ids.len(), failures.len());
    assert!(
        failures.is_empty(),
        "{} failing:\n{}",
        failures.len(),
        failures.join("\n")
    );
}
