//! `assert_deployable` on the gate's conformance inputs, pinning the same messages as
//! `packages/core/tests/zeebe-gate.test.ts`.

use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn, BpmnDefinitions};
use bpmnkit_compat::zeebe::{
    assert_deployable, is_deployable, validate_deployable_xml, AssertOptions, DeployabilityError,
    PlaceholderField, ValidateOptions, PLACEHOLDERS,
};
use std::borrow::Cow;
use std::collections::BTreeSet;

fn fixture(name: &str) -> BpmnDefinitions {
    let path = format!(
        "{}/../../conformance/gate/{name}/input.bpmn",
        env!("CARGO_MANIFEST_DIR")
    );
    parse_bpmn(&std::fs::read_to_string(path).expect("fixture")).expect("parses")
}

const TWO_ERRORS: &str = "Not deployable on Camunda 8.8: 2 error(s)\n- charge: Must have exactly one 'zeebe:taskDefinition' extension element (zeebe/service-task-definition)\n- notify: Must have either one 'zeebe:publishMessage' or one 'zeebe:taskDefinition' extension element (zeebe/send-task-implementation)";

fn refused(defs: &BpmnDefinitions, options: &AssertOptions) -> DeployabilityError {
    match assert_deployable(defs, options) {
        Err(e) => e,
        Ok(_) => panic!("expected a DeployabilityError"),
    }
}

#[test]
fn returns_a_deployable_model_as_it_is() {
    let defs = fixture("deployable");
    let result = assert_deployable(&defs, &AssertOptions::default()).expect("deployable");
    assert!(matches!(result.definitions, Cow::Borrowed(_)));
    assert!(result.placeholders.is_empty());
    assert!(result.warnings.is_empty());
}

#[test]
fn refuses_a_model_with_two_errors_naming_both() {
    let err = refused(
        &fixture("two-errors"),
        &AssertOptions {
            camunda_version: Some("8.8".into()),
            ..AssertOptions::default()
        },
    );
    assert_eq!(err.message(), TWO_ERRORS);
    assert_eq!(err.to_string(), TWO_ERRORS);
    assert_eq!(DeployabilityError::CODE, "deployability-error");
    assert_eq!(err.camunda_version, "8.8");
    let ids: Vec<(String, Vec<String>)> = err
        .findings
        .iter()
        .map(|f| (f.id.clone(), f.element_ids.clone()))
        .collect();
    assert_eq!(
        ids,
        vec![
            (
                "zeebe/service-task-definition".to_string(),
                vec!["charge".to_string()]
            ),
            (
                "zeebe/send-task-implementation".to_string(),
                vec!["notify".to_string()]
            ),
        ]
    );
    let _: &dyn std::error::Error = &err;
}

#[test]
fn checks_the_newest_version_unless_told_otherwise() {
    let err = refused(&fixture("two-errors"), &AssertOptions::default());
    assert_eq!(err.camunda_version, "8.10");
    assert_eq!(
        err.message().lines().next(),
        Some("Not deployable on Camunda 8.10: 2 error(s)")
    );
}

#[test]
fn fills_every_placeholder_field_and_the_result_deploys() {
    let mut fields = BTreeSet::new();
    for name in [
        "every-placeholder",
        "every-placeholder-attribute",
        "two-errors",
    ] {
        let defs = fixture(name);
        let result = assert_deployable(
            &defs,
            &AssertOptions {
                placeholders: true,
                ..AssertOptions::default()
            },
        )
        .expect("filled");
        for p in &result.placeholders {
            fields.insert(p.field.as_str());
            let template = PLACEHOLDERS
                .iter()
                .find(|row| row.field == p.field)
                .expect("documented")
                .value;
            assert_eq!(p.value, template.replace("<elementId>", &p.element_id));
            assert!(p.rule.starts_with("zeebe/"));
        }
        let xml = serialize_bpmn(&result.definitions);
        assert!(is_deployable(&validate_deployable_xml(
            &xml,
            &ValidateOptions::default()
        )));
        assert_eq!(defs, fixture(name), "input not mutated");
    }
    let all: BTreeSet<&str> = PLACEHOLDERS.iter().map(|p| p.field.as_str()).collect();
    assert_eq!(fields, all);
    assert_eq!(PlaceholderField::JobType.as_str(), "jobType");
}

#[test]
fn still_refuses_what_no_placeholder_can_fix() {
    let err = refused(
        &fixture("not-fillable"),
        &AssertOptions {
            placeholders: true,
            ..AssertOptions::default()
        },
    );
    assert_eq!(
        err.message(),
        "Not deployable on Camunda 8.10: 1 error(s)\n- order: Multiple none start events are not allowed (zeebe/multiple-none-start)"
    );
}
