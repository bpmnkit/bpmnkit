//! `expand`'s deploy gate (TS `tests/expand-gate.test.ts`): the options and the error
//! shape. Every message is pinned by a `conformance/compact` or `conformance/text` case.

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_text::compact::{compactify, expand, CompactDiagram, ExpandOptions};
use bpmnkit_text::process_text::{parse_process_text, write_process_text, ProcessTextStream};

fn diagram(elements: &str, version: Option<&str>) -> CompactDiagram {
    let first = serde_json::from_str::<serde_json::Value>(elements).unwrap()[0]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let version = version.map_or(String::new(), |v| {
        format!(r#""executionPlatformVersion":"{v}","#)
    });
    let json = format!(
        r#"{{"id":"D",{version}"processes":[{{"id":"P","elements":[{{"id":"s","type":"startEvent"}},{},{{"id":"e","type":"endEvent"}}],
        "flows":[{{"id":"f1","from":"s","to":"{first}"}},{{"id":"f2","from":"{first}","to":"e"}}]}}]}}"#,
        &elements[1..elements.len() - 1]
    );
    serde_json::from_str(&json).unwrap()
}

fn unkeyed() -> CompactDiagram {
    diagram(
        r#"[{"id":"w","type":"intermediateCatchEvent","eventType":"message","messageName":"m"}]"#,
        None,
    )
}

#[test]
fn refuses_with_a_deployability_error() {
    reset_id_counter();
    let err = expand(&unkeyed(), &ExpandOptions::default()).unwrap_err();
    let deployability = err.deployability.as_ref().expect("a deployability error");
    assert_eq!(deployability.findings[0].id, "zeebe/message-subscription");
    assert_eq!(
        err.message,
        "Not deployable on Camunda 8.10: 1 error(s)\n- Message_m: Must have exactly one zeebe:subscription extension element (zeebe/message-subscription)"
    );
    assert!(std::error::Error::source(&err).is_some());
}

#[test]
fn gated_output_is_marked_camunda_8() {
    reset_id_counter();
    let defs = expand(
        &diagram(
            r#"[{"id":"w","type":"intermediateCatchEvent","eventType":"message","messageName":"m","correlationKey":"=id"}]"#,
            None,
        ),
        &ExpandOptions::default(),
    )
    .unwrap();
    assert_eq!(
        defs.unknown_attributes
            .get("modeler:executionPlatform")
            .map(String::as_str),
        Some("Camunda Cloud")
    );
}

#[test]
fn validate_false_skips_the_gate_and_the_platform() {
    reset_id_counter();
    let defs = expand(&unkeyed(), &ExpandOptions::ungated()).unwrap();
    assert!(defs.unknown_attributes.is_empty());
}

#[test]
fn placeholders_fill_the_key() {
    reset_id_counter();
    let options = ExpandOptions {
        placeholders: true,
        ..ExpandOptions::default()
    };
    let defs = expand(&unkeyed(), &options).unwrap();
    let key = defs.messages[0].extension_elements.as_ref().unwrap()[0]
        .attributes
        .get("correlationKey")
        .cloned();
    assert_eq!(key.as_deref(), Some("=\"placeholder-Message_m\""));
}

#[test]
fn checks_the_version_asked_for_else_the_diagrams() {
    let agent = diagram(
        r#"[{"id":"agent","type":"adHocSubProcess"}]"#,
        Some("8.6.0"),
    );
    reset_id_counter();
    assert!(expand(&agent, &ExpandOptions::default()).is_ok());
    let options = ExpandOptions {
        camunda_version: Some("8.7".into()),
        ..ExpandOptions::default()
    };
    reset_id_counter();
    let err = expand(&agent, &options).unwrap_err();
    assert!(err.message.starts_with("Not deployable on Camunda 8.7"));
}

#[test]
fn process_text_previews_are_ungated() {
    reset_id_counter();
    let mut stream = ProcessTextStream::new();
    assert!(stream
        .push("s[start] > w[catch:message Paid]\n")
        .unwrap()
        .is_some());
}

#[test]
fn names_round_trip_through_compactify_and_the_writer() {
    reset_id_counter();
    let text = "s[start:timer Daily | every=R/P1D] > w[catch:message Paid | msg=paid key=orderId] > c[call Child | called=child] > e[end:error Failed | error=FAILED]";
    let parsed = parse_process_text(text);
    assert!(parsed.problems.is_empty(), "{:?}", parsed.problems);
    let defs = expand(&parsed.diagram, &ExpandOptions::default()).unwrap();
    let compact = compactify(&defs);
    let w = compact.processes[0]
        .elements
        .iter()
        .find(|e| e.id == "w")
        .unwrap();
    assert_eq!(w.correlation_key.as_deref(), Some("=orderId"));
    let written = write_process_text(&defs, Default::default()).text;
    for part in [
        "msg=paid key=orderId",
        "every=R/P1D",
        "called=child",
        "error=FAILED",
    ] {
        assert!(written.contains(part), "{written}");
    }
}
