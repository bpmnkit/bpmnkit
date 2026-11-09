//! Every case passes or is listed in conformance/pending.json.
//! CONFORMANCE_BLESS=1 appends currently failing, unlisted ids to pending.json.

use bpmnkit_conformance::*;

/// pending.json may only shrink: lower this when a case leaves it, never raise it to make room.
const MAX_PENDING: usize = 1;

#[test]
fn pending_does_not_grow() {
    let pending = load_pending(&conformance_dir()).expect("pending.json");
    assert!(
        pending.len() <= MAX_PENDING,
        "pending.json has {} cases, the cap is {MAX_PENDING}: fix the new failures instead",
        pending.len()
    );
}

#[test]
fn conformance() {
    let dir = conformance_dir();
    let mut pending = load_pending(&dir).expect("pending.json");
    let outcomes = run_all(&dir).expect("load cases");
    let report = classify(&outcomes, &pending);

    if std::env::var("CONFORMANCE_BLESS").is_ok_and(|v| v == "1") {
        if !report.failed.is_empty() {
            for id in &report.failed {
                pending.insert(id.clone(), "blessed: failing, needs triage".into());
            }
            std::fs::create_dir_all(&dir).expect("conformance dir");
            save_pending(&dir, &pending).expect("write pending.json");
            println!("blessed {} case(s) into pending.json", report.failed.len());
        }
        return;
    }

    println!(
        "conformance: {} passed, {} pending, {} failed",
        report.passed,
        report.pending,
        report.failed.len()
    );
    assert!(
        report.removable.is_empty(),
        "pending cases now pass; delete them from pending.json and lower MAX_PENDING: {:#?}",
        report.removable
    );
    assert!(
        report.failed.is_empty(),
        "failing cases (fix, or CONFORMANCE_BLESS=1 to mark pending): {:#?}",
        report.failed
    );
}
