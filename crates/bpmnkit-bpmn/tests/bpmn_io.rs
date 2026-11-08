use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn, BpmnFlowElement};
use std::path::{Path, PathBuf};

fn conformance_bpmn() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance/bpmn")
}

fn case_dirs() -> Vec<PathBuf> {
    let mut dirs: Vec<_> = std::fs::read_dir(conformance_bpmn())
        .expect("conformance/bpmn")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.is_dir())
        .collect();
    dirs.sort();
    dirs
}

fn err(xml: &str) -> String {
    parse_bpmn(xml).expect_err("should not parse").to_string()
}

#[test]
fn missing_required_attribute_names_attribute_and_element() {
    assert_eq!(
        err(r#"<bpmn:definitions targetNamespace="t"/>"#),
        r#"Missing required attribute "id" on <bpmn:definitions>"#
    );
    assert_eq!(
        err(r#"<definitions id="d"/>"#),
        r#"Missing required attribute "targetNamespace" on <definitions>"#
    );
    assert_eq!(
        err(
            r#"<bpmn:definitions id="d" targetNamespace="t"><bpmn:process id="p"><bpmn:task/></bpmn:process></bpmn:definitions>"#
        ),
        r#"Missing required attribute "id" on <bpmn:task>"#
    );
    // Checked at the end tag, so the shape's own message wins over nothing else.
    assert_eq!(
        err(
            r#"<definitions id="d" targetNamespace="t"><BPMNDiagram><BPMNPlane><BPMNShape id="s"/></BPMNPlane></BPMNDiagram></definitions>"#
        ),
        r#"Missing <dc:Bounds> in shape "s""#
    );
}

#[test]
fn rejects_other_roots_and_empty_documents() {
    assert_eq!(
        err("<foo:bar/>"),
        "Expected <definitions> root element, got <foo:bar>"
    );
    assert_eq!(err("  "), "Failed to parse XML: no root element found");
}

#[test]
fn semantic_error_wins_over_later_xml_error() {
    // TS throws at the first problem, so the broken tail is never reached.
    let xml = r#"<definitions id="d" targetNamespace="t"><process/><oops></definitions>"#;
    assert_eq!(err(xml), r#"Missing required attribute "id" on <process>"#);
}

#[test]
fn flow_node_json_keeps_always_set_fields() {
    let defs = parse_bpmn(
        r#"<definitions id="d" targetNamespace="t"><process id="p"><startEvent id="s" isInterrupting="true"/></process></definitions>"#,
    )
    .expect("parses");
    let json = serde_json::to_value(&defs.processes[0].contents.flow_elements[0]).expect("json");
    assert_eq!(
        json,
        serde_json::json!({
            "type": "startEvent", "id": "s", "incoming": [], "outgoing": [],
            "extensionElements": [], "unknownAttributes": {"isInterrupting": "true"},
            "eventDefinitions": []
        })
    );
}

#[test]
fn gateway_default_moves_out_of_unknown_attributes() {
    let defs = parse_bpmn(
        r#"<definitions id="d" targetNamespace="t"><process id="p"><exclusiveGateway id="g" default="f"/><task id="t" default="f"/></process></definitions>"#,
    )
    .expect("parses");
    let [BpmnFlowElement::ExclusiveGateway(g), BpmnFlowElement::Task(t)] =
        defs.processes[0].contents.flow_elements.as_slice()
    else {
        panic!("unexpected elements");
    };
    assert_eq!(g.default.as_deref(), Some("f"));
    assert!(g.base.unknown_attributes.is_empty());
    assert!(t.base.unknown_attributes.contains_key("default"));
}

#[test]
fn parse_serialize_parse_is_stable_for_every_case() {
    for dir in case_dirs() {
        let input = std::fs::read_to_string(dir.join("input.bpmn")).expect("input");
        let first = parse_bpmn(&input).expect("parses");
        let xml = serialize_bpmn(&first);
        let second = parse_bpmn(&xml).expect("reparses");
        assert_eq!(serialize_bpmn(&second), xml, "{}", dir.display());
        assert_eq!(
            first.processes.len(),
            second.processes.len(),
            "{}",
            dir.display()
        );
    }
}

#[test]
fn serializing_a_roundtrip_file_is_a_fixed_point() {
    for dir in case_dirs() {
        let expected =
            std::fs::read_to_string(dir.join("expected/roundtrip.bpmn")).expect("roundtrip");
        let defs = parse_bpmn(&expected).expect("parses");
        assert_eq!(serialize_bpmn(&defs), expected, "{}", dir.display());
    }
}

#[test]
fn model_survives_a_json_round_trip() {
    for dir in case_dirs() {
        let input = std::fs::read_to_string(dir.join("input.bpmn")).expect("input");
        let defs = parse_bpmn(&input).expect("parses");
        let json = serde_json::to_string(&defs).expect("serialize");
        let back: bpmnkit_bpmn::BpmnDefinitions = serde_json::from_str(&json).expect("deserialize");
        assert_eq!(
            serialize_bpmn(&back),
            serialize_bpmn(&defs),
            "{}",
            dir.display()
        );
    }
}

fn process_xml(attrs: &str, body: &str) -> String {
    format!(
        r#"<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="t"><bpmn:process id="p"{attrs}>{body}</bpmn:process></bpmn:definitions>"#
    )
}

#[test]
fn is_executable_keeps_absent_true_and_false_apart() {
    for (attrs, expected) in [
        ("", None),
        (r#" isExecutable="true""#, Some(true)),
        (r#" isExecutable="false""#, Some(false)),
    ] {
        let defs = parse_bpmn(&process_xml(attrs, "")).unwrap();
        assert_eq!(defs.processes[0].is_executable, expected, "{attrs}");
        let out = serialize_bpmn(&defs);
        let again = parse_bpmn(&out).unwrap();
        assert_eq!(again.processes[0].is_executable, expected, "{attrs}");
        assert_eq!(
            out.contains("isExecutable=\"false\""),
            expected == Some(false)
        );
    }
}

#[test]
fn is_for_compensation_is_kept_on_every_sub_process_kind() {
    for tag in [
        "subProcess",
        "adHocSubProcess",
        "transaction",
        "eventSubProcess",
    ] {
        let xml = process_xml(
            "",
            &format!(r#"<bpmn:{tag} id="s" isForCompensation="true"/>"#),
        );
        let defs = parse_bpmn(&xml).unwrap();
        let el = &defs.processes[0].contents.flow_elements[0];
        assert_eq!(el.base().is_for_compensation, Some(true), "{tag}");
        assert!(
            serialize_bpmn(&defs).contains("isForCompensation=\"true\""),
            "{tag}"
        );
    }
}
