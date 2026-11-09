// The default feature set: each module resolves to its crate under the facade path.
#![cfg(all(feature = "feel", feature = "bpmn", feature = "dmn", feature = "form"))]

use bpmnkit::feel::{evaluate, Context, Value};

#[test]
fn feel_is_reexported() {
    assert_eq!(evaluate("1 + 2", &Context::new()).unwrap(), Value::from(3));
}

#[test]
fn form_is_reexported() {
    let form = bpmnkit::form::parse_form(r#"{"id":"f","type":"default","components":[]}"#).unwrap();
    assert_eq!(form.id, "f");
}

#[test]
fn dmn_and_bpmn_share_the_xml_layer() {
    // The facade's modules are the same crates, so their types interoperate.
    let _: fn(&str) -> Result<bpmnkit::bpmn::model::BpmnDefinitions, _> = bpmnkit::bpmn::parse_bpmn;
    let _: fn(&str) -> Result<bpmnkit::dmn::DmnDefinitions, _> = bpmnkit::dmn::parse_dmn;
}
