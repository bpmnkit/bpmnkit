//! `ProcessBuilder` behaviour the conformance corpus does not record. The recorded builder
//! scripts (`conformance/builder`) are replayed by `bpmnkit-conformance` (`builder.rs`).

use bpmnkit_bpmn::BpmnDefinitions;
use bpmnkit_builder::ProcessBuilder;

#[test]
fn missing_process_lists_the_document_or_says_none() {
    let defs = BpmnDefinitions::default();
    let err = ProcessBuilder::from(&defs, "p").build(None).unwrap_err();
    assert_eq!(
        err.message,
        "Process \"p\" is not in this document. It contains: no processes"
    );
}
