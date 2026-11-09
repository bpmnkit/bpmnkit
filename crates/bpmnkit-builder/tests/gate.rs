//! The builder's deploy gate (TS `tests/builder-gate.test.ts`): `build()` applies the
//! Camunda 8 builder rules, then `assert_deployable`. Every rule message is pinned by a
//! `conformance/builder` error case; this covers the options and the error shape.

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_builder::*;

fn gate(validate: Option<bool>, placeholders: Option<bool>) -> Option<BuildOptions> {
    Some(BuildOptions {
        gate: BuildGateOptions {
            validate,
            placeholders,
            ..BuildGateOptions::default()
        },
        ..BuildOptions::default()
    })
}

fn unconditioned() -> ProcessBuilder {
    let mut b = Bpmn::create_process("p");
    b.start_event(Some("s"), None)
        .exclusive_gateway("g", None)
        .branch("a", |b| {
            b.condition("=a").end_event(Some("e1"), None);
        })
        .branch("b", |b| {
            b.end_event(Some("e2"), None);
        });
    b
}

#[test]
fn a_builder_rule_is_not_a_deployability_error() {
    reset_id_counter();
    let err = unconditioned().build(None).unwrap_err();
    assert!(err.deployability.is_none());
    assert!(err
        .message
        .starts_with("Flow \"Flow_g_e2\" leaves exclusive gateway \"g\""));
}

#[test]
fn the_deploy_check_wraps_the_deployability_error_and_does_not_stick() {
    reset_id_counter();
    let mut b = Bpmn::create_process("p");
    b.start_event(Some("s"), None)
        .intermediate_catch_event(Some("c"), None)
        .end_event(Some("e"), None);
    let err = b.build(None).unwrap_err();
    let inner = err.deployability.as_deref().expect("deployability error");
    assert_eq!(err.message, inner.to_string());
    assert_eq!(
        err.message,
        "Not deployable on Camunda 8.10: 1 error(s)\n- c: Must have exactly one event definition (zeebe/intermediate-catch-definitions)"
    );
    // A refusal of the gate is not recorded: the same builder builds without it.
    assert!(b.build(gate(Some(false), None)).is_ok());
}

#[test]
fn placeholders_fill_what_the_rules_leave_to_the_gate() {
    reset_id_counter();
    let defs = unconditioned()
        .build(gate(None, Some(true)))
        .expect("filled");
    let flow = defs.processes[0]
        .contents
        .sequence_flows
        .iter()
        .find(|f| f.id == "Flow_g_e2")
        .expect("flow");
    assert_eq!(
        flow.condition_expression.as_ref().map(|c| c.text.as_str()),
        Some("=false")
    );
}

#[test]
fn the_diagram_is_gated_as_a_whole() {
    reset_id_counter();
    let diagram = || {
        let mut d = Bpmn::create_diagram(Some("D"));
        d.process("a", |p| {
            p.start_event(Some("s"), None)
                .send_task(
                    "send",
                    Some(SendTaskOptions {
                        message: MessageTaskOptions {
                            message_name: Some("m".to_owned()),
                            ..MessageTaskOptions::default()
                        },
                        ..SendTaskOptions::default()
                    }),
                )
                .end_event(Some("e"), None);
        });
        d
    };
    assert!(diagram()
        .build(None)
        .unwrap_err()
        .message
        .starts_with("Send task \"send\" needs a taskType"));
    let off = BuildGateOptions {
        validate: Some(false),
        ..BuildGateOptions::default()
    };
    assert_eq!(
        diagram().build(Some(off)).expect("ungated").processes.len(),
        1
    );
}
