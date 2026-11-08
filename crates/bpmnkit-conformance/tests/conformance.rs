//! Every case passes or is listed in conformance/pending.json.
//! CONFORMANCE_BLESS=1 appends currently failing, unlisted ids to pending.json.

use bpmnkit_conformance::*;

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
    for id in &report.removable {
        println!("can be removed from pending.json: {id}");
    }
    assert!(
        report.failed.is_empty(),
        "failing cases (fix, or CONFORMANCE_BLESS=1 to mark pending): {:#?}",
        report.failed
    );
}
