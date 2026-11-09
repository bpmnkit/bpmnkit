//! The deploy gate on `convert_camunda7`: the same messages and fills as TS's
//! `camunda7-migrate.test.ts` "deploy gate".

use bpmnkit_bpmn::{parse_bpmn, BpmnDefinitions};
use bpmnkit_compat::camunda7::migrate::{
    analyze_camunda7, convert_camunda7, Camunda7ConvertOptions,
};
use bpmnkit_compat::zeebe::gate::{assert_deployable, AssertOptions, PlaceholderField};

fn input(case: &str) -> BpmnDefinitions {
    let path = format!(
        "{}/../../conformance/bpmn/{case}/input.bpmn",
        env!("CARGO_MANIFEST_DIR")
    );
    parse_bpmn(&std::fs::read_to_string(path).expect("reads")).expect("parses")
}

#[test]
fn returns_a_model_zeebe_accepts() {
    let c = convert_camunda7(
        &input("c7-invoice-approval"),
        &Camunda7ConvertOptions::default(),
    )
    .expect("deploys");
    assert!(c.placeholders.is_empty());
    assert!(assert_deployable(&c.definitions, &AssertOptions::default()).is_ok());
}

#[test]
fn refuses_a_result_zeebe_would_reject_naming_every_reason() {
    let defs = input("camunda7-order-fulfillment");
    let err = convert_camunda7(&defs, &Camunda7ConvertOptions::default()).expect_err("refused");
    assert_eq!(
        err.to_string(),
        [
            "Not deployable on Camunda 8.10: 2 error(s)",
            "- Message_PaymentConfirmed: Must have exactly one zeebe:subscription extension element (zeebe/message-subscription)",
            "- Task_summary: Must have either one 'zeebe:script' or one 'zeebe:taskDefinition' extension element (zeebe/script-task-implementation)",
        ]
        .join("\n")
    );
    let gate = err.deployability.expect("a gate refusal");
    assert_eq!(gate.camunda_version, "8.10");
    assert_eq!(gate.findings.len(), 2);
    // The report of the refused model is still there.
    assert_eq!(analyze_camunda7(&defs).expect("analyzes").counts.manual, 8);
}

#[test]
fn checks_the_version_it_targets_or_camunda_version() {
    let head = |options: Camunda7ConvertOptions| {
        convert_camunda7(&input("c7-claim-handling"), &options)
            .expect_err("refused")
            .to_string()
            .lines()
            .next()
            .unwrap_or_default()
            .to_string()
    };
    assert_eq!(
        head(Camunda7ConvertOptions {
            execution_platform_version: Some("8.6.0".into()),
            ..Default::default()
        }),
        "Not deployable on Camunda 8.6: 1 error(s)"
    );
    assert_eq!(
        head(Camunda7ConvertOptions {
            camunda_version: Some("8.8".into()),
            ..Default::default()
        }),
        "Not deployable on Camunda 8.8: 1 error(s)"
    );
}

#[test]
fn fills_placeholders_and_lists_each_fill_in_the_report() {
    let c = convert_camunda7(
        &input("c7-claim-handling"),
        &Camunda7ConvertOptions {
            placeholders: true,
            ..Default::default()
        },
    )
    .expect("filled");
    assert_eq!(c.placeholders.len(), 1);
    assert_eq!(c.placeholders[0].field, PlaceholderField::JobType);
    let last = c.report.findings.last().expect("a finding");
    assert_eq!(last.construct, "placeholder jobType");
    assert_eq!(last.element_type, "serviceTask");
    assert_eq!(last.process_id, "claim-handling");
    assert_eq!(
        last.message,
        "Placeholder jobType \"placeholder-Task_payout\" written so the model deploys (zeebe/service-task-definition)."
    );
    assert!(assert_deployable(&c.definitions, &AssertOptions::default()).is_ok());
}

#[test]
fn ungated_returns_the_conversion_as_it_is() {
    let c = convert_camunda7(
        &input("camunda7-order-fulfillment"),
        &Camunda7ConvertOptions::ungated(),
    )
    .expect("converts");
    assert!(assert_deployable(&c.definitions, &AssertOptions::default()).is_err());
}
