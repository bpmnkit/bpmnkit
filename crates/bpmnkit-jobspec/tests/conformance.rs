//! The job list equals `bpmnkit gen types` (`extractProcessContract`, recorded by
//! `packages/core/tests/conformance-jobspec.test.ts`) on every `conformance/bpmn` case.

use std::path::Path;

use bpmnkit_jobspec::extract;
use serde_json::{json, Value};

#[test]
fn job_list_matches_typescript() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance");
    let expected: Value =
        serde_json::from_str(&std::fs::read_to_string(root.join("jobspec/jobs.json")).unwrap())
            .unwrap();
    let cases = expected.as_object().unwrap();
    assert!(cases.len() > 50, "the corpus went missing");
    let mut failures = Vec::new();
    for (name, want) in cases {
        let xml = std::fs::read_to_string(root.join("bpmn").join(name).join("input.bpmn")).unwrap();
        let defs = bpmnkit_bpmn::parse_bpmn(&xml).unwrap();
        let out = extract(name, &[defs]);
        let jobs: Vec<Value> = out
            .project
            .jobs
            .values()
            .map(|j| {
                json!({
                    "type": j.job_type,
                    "elements": j.elements.iter()
                        .map(|e| format!("{}#{}#{}", e.process_id, e.element_id, e.element_type))
                        .collect::<Vec<_>>(),
                    "headers": j.headers.iter()
                        .map(|h| json!({"key": h.key, "values": h.values, "required": h.required}))
                        .collect::<Vec<_>>(),
                    "errors": if j.catch_all_errors { json!("any") } else { json!(j.errors) },
                })
            })
            .collect();
        let have = json!({ "jobs": jobs, "dynamic": out.dynamic });
        if &have != want {
            failures.push(format!("{name}:\n  want {want}\n  have {have}"));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
