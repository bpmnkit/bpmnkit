//! `diff_to_text` snapshots over the shared `conformance/diff` pairs, plus invariants of the hash.
//! `UPDATE_SNAPSHOTS=1 cargo test -p bpmnkit-diff` rewrites the snapshots.

use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_diff::{diff_bpmn, diff_to_text, semantic_hash, DiffTextOptions};
use std::path::PathBuf;

fn case(name: &str, file: &str) -> bpmnkit_bpmn::model::BpmnDefinitions {
    let p = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../conformance/diff")
        .join(name)
        .join(file);
    parse_bpmn(&std::fs::read_to_string(&p).unwrap_or_else(|e| panic!("{}: {e}", p.display())))
        .unwrap()
}

fn snapshot(file: &str, actual: &str) {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests/snapshots")
        .join(file);
    if std::env::var_os("UPDATE_SNAPSHOTS").is_some() {
        std::fs::write(&path, actual).unwrap();
    }
    let expected = std::fs::read_to_string(&path).unwrap_or_else(|e| panic!("{file}: {e}"));
    assert_eq!(actual, expected, "{file}");
}

#[test]
fn text_snapshots() {
    let md = DiffTextOptions {
        markdown: true,
        ..Default::default()
    };
    for name in [
        "rename",
        "zeebe-header-change",
        "lane-add",
        "move-only",
        "ids-only-change",
        "noop-reformat",
    ] {
        let d = diff_bpmn(&case(name, "before.bpmn"), &case(name, "after.bpmn"));
        snapshot(
            &format!("{name}.txt"),
            &diff_to_text(&d, &Default::default()),
        );
        snapshot(&format!("{name}.md"), &diff_to_text(&d, &md));
    }
}

#[test]
fn hash_ignores_layout_and_formatting_but_not_the_model() {
    let hash = |n: &str, f: &str| semantic_hash(&case(n, f));
    assert_eq!(
        hash("noop-reformat", "before.bpmn"),
        hash("noop-reformat", "after.bpmn")
    );
    assert_eq!(
        hash("move-only", "before.bpmn"),
        hash("move-only", "after.bpmn")
    );
    assert_ne!(hash("rename", "before.bpmn"), hash("rename", "after.bpmn"));
    assert_eq!(hash("rename", "before.bpmn").len(), 64);
}

#[test]
fn a_model_diffed_with_itself_is_empty() {
    let m = case("lane-add", "after.bpmn");
    let d = diff_bpmn(&m, &m);
    assert!(d.changes.is_empty() && d.planes.is_empty());
    assert_eq!(d.before_hash, d.after_hash);
}
