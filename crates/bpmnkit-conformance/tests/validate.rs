//! Names what differs for each failing `validate/` run, and checks the validator
//! agrees with real Zeebe on every BPMN in conformance/ (`validate/zeebe-verdicts.json`).

use bpmnkit_conformance::*;

#[test]
fn validate_cases_say_what_differs() {
    let dir = conformance_dir();
    let pending = load_pending(&dir).expect("pending.json");
    // `VALIDATE_ONLY=z61-,z62-` runs only the cases whose name starts with one of the prefixes.
    let only = std::env::var("VALIDATE_ONLY").ok();
    let ids: Vec<String> = validate::case_ids(&dir)
        .into_iter()
        .filter(|id| {
            only.as_deref().is_none_or(|o| {
                let name = id.trim_start_matches("validate/");
                o.split(',').any(|p| name.starts_with(p))
            })
        })
        .collect();
    let mut failures = vec![];
    for id in &ids {
        let result = std::panic::catch_unwind(|| validate::check_case(&dir, id))
            .unwrap_or_else(|_| Err("panicked".into()));
        match (result, pending.contains_key(id)) {
            (Err(why), false) => failures.push(format!("{id}: {why}")),
            (Err(why), true) => println!("pending {id}: {why}"),
            (Ok(()), _) => {}
        }
    }
    println!("validate: {} runs, {} failing", ids.len(), failures.len());
    assert!(failures.is_empty(), "{failures:#?}");
}

#[test]
fn agrees_with_zeebe_on_the_corpus() {
    let a = validate::agreement(&conformance_dir()).expect("verdicts");
    println!(
        "zeebe agreement: {}/{} files, {} stale verdicts",
        a.compared - a.disagree.len(),
        a.compared,
        a.stale
    );
    assert!(a.disagree.is_empty(), "{:#?}", a.disagree);
}
