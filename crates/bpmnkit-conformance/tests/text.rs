//! Like `conformance.rs`, but names what differs for each failing `text/` case.
//! `BPMNKIT_CONFORMANCE_DIR` points it at another case tree (e.g. one recorded locally).

use bpmnkit_conformance::*;
use std::path::PathBuf;

#[test]
fn text_cases_say_what_differs() {
    let dir = std::env::var_os("BPMNKIT_CONFORMANCE_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(conformance_dir);
    let pending = load_pending(&dir).expect("pending.json");
    let ids = text::case_ids(&dir);
    let mut failures = vec![];
    for id in &ids {
        let result = std::panic::catch_unwind(|| text::check_case(&dir, id))
            .unwrap_or_else(|p| Err(format!("panicked: {}", panic_message(&*p))));
        match (result, pending.contains_key(id)) {
            (Err(why), false) => failures.push(format!("{id}: {why}")),
            (Err(why), true) => println!("pending {id}: {why}"),
            (Ok(()), _) => {}
        }
    }
    println!("text: {} cases, {} failing", ids.len(), failures.len());
    assert!(failures.is_empty(), "{failures:#?}");
}
