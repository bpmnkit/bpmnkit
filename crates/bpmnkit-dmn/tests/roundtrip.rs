//! parse(serialize(parse(x))) == parse(x) over every conformance input that parses, and the
//! quirks of the TS parser/serializer that the conformance cases pin, spelled out.

use bpmnkit_dmn::{parse_dmn, serialize_dmn};
use std::path::PathBuf;

/// Cases whose model changes on a second pass. This is a bug in the TS serializer, replicated
/// on purpose (the Rust twin must write what TS writes): a reference that parsed to nothing is
/// written as `href="#undefined"` and reads back as the id "undefined"; and whitespace between
/// the children of kept extension content is text of their parent, which is written back
/// indented again, so each pass adds a line of whitespace.
const UNSTABLE: &[&str] = &[
    "empty-and-missing",
    "extension-elements",
    "reebe-literal-greeting",
];

fn to_json(m: &bpmnkit_dmn::DmnDefinitions) -> serde_json::Value {
    serde_json::to_value(m).expect("serializes")
}

fn cases() -> Vec<(String, String)> {
    let dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../conformance/dmn");
    let mut out: Vec<_> = std::fs::read_dir(dir)
        .expect("conformance/dmn")
        .filter_map(|e| e.ok())
        .map(|e| {
            let name = e.file_name().to_string_lossy().into_owned();
            let xml = std::fs::read_to_string(e.path().join("input.dmn")).expect("input.dmn");
            (name, xml)
        })
        .collect();
    out.sort();
    out
}

#[test]
fn serialize_then_parse_is_stable() {
    let mut checked = 0;
    for (name, xml) in cases() {
        let Ok(once) = parse_dmn(&xml) else { continue };
        let twice = parse_dmn(&serialize_dmn(&once)).expect("serialized DMN parses");
        // Through JSON, where NaN (from a bad coordinate) is null and equal to itself.
        let (once, twice) = (to_json(&once), to_json(&twice));
        if UNSTABLE.contains(&name.as_str()) {
            assert_ne!(once, twice, "{name} is stable now: remove it from UNSTABLE");
        } else {
            assert_eq!(once, twice, "{name}");
        }
        checked += 1;
    }
    assert!(checked >= 15, "only {checked} cases parsed");
}

#[test]
fn serializing_twice_gives_the_same_text() {
    for (name, xml) in cases() {
        let Ok(once) = parse_dmn(&xml) else { continue };
        let a = serialize_dmn(&once);
        let b = serialize_dmn(&parse_dmn(&a).expect("parses"));
        // Past the first pass the text is a fixed point, except where the model itself moves.
        if !UNSTABLE.contains(&name.as_str()) {
            assert_eq!(a, b, "{name}");
        }
    }
}

const HEAD: &str = r#"<definitions id="d" name="n">"#;

fn parse(body: &str) -> bpmnkit_dmn::DmnDefinitions {
    parse_dmn(&format!("{HEAD}{body}</definitions>")).expect("parses")
}

#[test]
fn prefixed_attribute_is_found_by_local_name() {
    let m = parse(r#"<decision x:id="a" y:name="b" xmlns:x="u" xmlns:y="u"/>"#);
    assert_eq!(m.decisions[0].id, "a");
    assert_eq!(m.decisions[0].name.as_deref(), Some("b"));
}

#[test]
fn unqualified_attribute_wins_over_prefixed() {
    let m = parse(r#"<decision x:id="prefixed" id="plain"/>"#);
    assert_eq!(m.decisions[0].id, "plain");
}

#[test]
fn unknown_children_become_extension_elements_unless_there_is_one() {
    let m = parse(
        r#"<decision id="a"><literalExpression><text>1</text></literalExpression></decision>
           <decision id="b"><extensionElements><x/></extensionElements><literalExpression/></decision>"#,
    );
    let a = m.decisions[0].extension_elements.as_ref().unwrap();
    assert_eq!(a[0].name, "literalExpression");
    let b = m.decisions[1].extension_elements.as_ref().unwrap();
    assert_eq!(b.len(), 1);
    assert_eq!(b[0].name, "x");
    let out = serialize_dmn(&m);
    assert!(out.contains("<extensionElements>\n      <literalExpression>"));
}

#[test]
fn empty_attribute_values() {
    let m = parse(
        r#"<decision id="a"><decisionTable id="t" hitPolicy="" aggregation="">
             <input id="i"><inputExpression id="e" typeRef=""/></input>
           </decisionTable></decision>"#,
    );
    let t = m.decisions[0].decision_table.as_ref().unwrap();
    assert_eq!(t.hit_policy, None);
    assert_eq!(t.aggregation.as_deref(), Some(""));
    assert_eq!(t.inputs[0].input_expression.type_ref, None);
    // An empty aggregation is falsy for the serializer, so it is not written back.
    assert!(!serialize_dmn(&m).contains("aggregation"));
}

#[test]
fn references_lose_their_hash() {
    let m = parse(
        r##"<decision id="a"><informationRequirement id="r"><requiredInput href="#x"/></informationRequirement>
            <knowledgeRequirement id="k"/></decision>
           <association id="s" sourceRef="#p" targetRef="q"/>"##,
    );
    let d = &m.decisions[0];
    assert_eq!(
        d.information_requirements[0].required_input.as_deref(),
        Some("x")
    );
    assert_eq!(d.knowledge_requirements[0].required_knowledge, "");
    assert_eq!(m.associations[0].source_ref, "p");
    assert_eq!(m.associations[0].target_ref, "q");
}

#[test]
fn diagram_numbers_follow_js() {
    let m = parse(
        r#"<DMNDI><DMNDiagram><DMNShape dmnElementRef="a"><Bounds x=" 0x10 " y="1e3" width="" height="x"/></DMNShape></DMNDiagram></DMNDI>"#,
    );
    let b = &m.diagram.as_ref().unwrap().shapes[0].bounds;
    assert_eq!((b.x, b.y, b.width), (16.0, 1000.0, 0.0));
    assert!(b.height.is_nan());
    let out = serialize_dmn(&m);
    assert!(
        out.contains(r#"height="NaN" width="0" x="16" y="1000""#),
        "{out}"
    );
}

#[test]
fn error_messages() {
    let e = |xml: &str| parse_dmn(xml).unwrap_err().0;
    assert_eq!(
        e("<foo id='1'/>"),
        "Expected <definitions> root element, got <foo>"
    );
    assert_eq!(
        e(r#"<definitions name="n"/>"#),
        r#"Missing required attribute "id" on element <definitions>"#
    );
    assert_eq!(
        e(r#"<d:definitions xmlns:d="u" id="1"/>"#),
        r#"Missing required attribute "name" on element <d:definitions>"#
    );
    assert_eq!(
        e(&format!("{HEAD}<decision id='a'><decisionTable id='t'><input/></decisionTable></decision></definitions>")),
        r#"Missing <inputExpression> in input "undefined""#
    );
}

#[test]
fn model_json_shape() {
    let m = parse(r#"<decision id="a"/>"#);
    let v = serde_json::to_value(&m).unwrap();
    assert_eq!(
        v,
        serde_json::json!({
            "id": "d", "name": "n", "namespace": "https://www.omg.org/spec/DMN/20191111/MODEL/",
            "namespaces": {}, "modelerAttributes": {},
            "decisions": [{"id": "a", "informationRequirements": [], "knowledgeRequirements": [], "authorityRequirements": []}],
            "inputData": [], "knowledgeSources": [], "businessKnowledgeModels": [],
            "textAnnotations": [], "associations": []
        })
    );
}
