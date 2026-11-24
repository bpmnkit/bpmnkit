use bpmnkit_wasm_contract::*;

fn worker(name: &str, types: &[&str]) -> ValidManifest {
    let t = types
        .iter()
        .map(|t| format!("\"{t}\""))
        .collect::<Vec<_>>()
        .join(",");
    ValidManifest::from_toml(&format!(
        "[worker]\nname=\"{name}\"\nversion=\"0.1.0\"\njob_types=[{t}]"
    ))
    .unwrap()
}

const BPMN: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="t">
<bpmn:process id="p" isExecutable="true">
<bpmn:serviceTask id="a"><bpmn:extensionElements><zeebe:taskDefinition type="charge-card"/></bpmn:extensionElements></bpmn:serviceTask>
<bpmn:serviceTask id="b"><bpmn:extensionElements><zeebe:taskDefinition type="send-mail"/></bpmn:extensionElements></bpmn:serviceTask>
<bpmn:serviceTask id="c"><bpmn:extensionElements><zeebe:taskDefinition type="=kind"/></bpmn:extensionElements></bpmn:serviceTask>
</bpmn:process></bpmn:definitions>"#;

#[test]
fn missing_unused_duplicated_dynamic() {
    let b = Bundle {
        bpmn: vec![BPMN.into()],
        workers: vec![
            worker("w1", &["charge-card", "extra"]),
            worker("w2", &["charge-card"]),
        ],
    };
    let r = check_bundle(&b).unwrap();
    assert_eq!(r.missing, ["send-mail"]);
    assert_eq!(r.unused, ["extra"]);
    assert_eq!(r.duplicated, ["charge-card"]);
    assert_eq!(r.dynamic, ["p#c"]);
    assert!(!r.is_ok());
}

#[test]
fn complete_bundle_ok() {
    let b = Bundle {
        bpmn: vec![BPMN.into()],
        workers: vec![worker("w", &["charge-card", "send-mail"])],
    };
    assert!(check_bundle(&b).unwrap().is_ok());
}

#[test]
fn bad_xml_is_an_error() {
    let b = Bundle {
        bpmn: vec!["<nope".into()],
        workers: vec![],
    };
    assert_eq!(check_bundle(&b).unwrap_err().index, 0);
}
