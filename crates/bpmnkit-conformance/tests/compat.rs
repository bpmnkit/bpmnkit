//! Like `conformance.rs`, but names what differs for each failing `compat/` run.
//! `BPMNKIT_CONFORMANCE_DIR` points it at another case tree (e.g. one recorded locally).

use bpmnkit_conformance::*;
use std::path::PathBuf;

#[test]
fn compat_cases_say_what_differs() {
    let dir = std::env::var_os("BPMNKIT_CONFORMANCE_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(conformance_dir);
    let pending = load_pending(&dir).expect("pending.json");
    let mut failures = vec![];
    let ids = compat::case_ids(&dir);
    for id in &ids {
        let result = std::panic::catch_unwind(|| compat::check_case(&dir, id))
            .unwrap_or_else(|_| Err("panicked".into()));
        match (result, pending.contains_key(id)) {
            (Err(why), false) => failures.push(format!("{id}: {why}")),
            (Err(why), true) => println!("pending {id}: {why}"),
            (Ok(()), _) => {}
        }
    }
    println!("compat: {} runs, {} failing", ids.len(), failures.len());
    assert!(failures.is_empty(), "{failures:#?}");
}
