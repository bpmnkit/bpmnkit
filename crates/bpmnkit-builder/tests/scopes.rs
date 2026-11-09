//! Oracle tests for `BranchBuilder` and `SubProcessContentBuilder`: the expected models and
//! error messages come from `tests/oracle/scopes.mjs` (TS). They also exercise
//! `ProcessBuilder` and the element factories, so they pass once those are merged.

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_builder::*;
use serde_json::Value;

fn oracle(name: &str) -> Value {
    let all: Value = serde_json::from_str(include_str!("oracle/scopes.json")).expect("scopes.json");
    all[name].clone()
}

/// Numbers compared by value, as JS has only one number type.
fn norm(v: Value) -> Value {
    match v {
        Value::Number(n) => serde_json::json!(n.as_f64()),
        Value::Array(a) => Value::Array(a.into_iter().map(norm).collect()),
        Value::Object(o) => Value::Object(o.into_iter().map(|(k, v)| (k, norm(v))).collect()),
        v => v,
    }
}

fn check(name: &str, built: Result<bpmnkit_bpmn::BpmnDefinitions, BuildError>) {
    let expected = oracle(name);
    match built {
        Ok(defs) => assert_eq!(
            norm(serde_json::to_value(defs).expect("serialize")),
            norm(expected["ok"].clone()),
            "{name}"
        ),
        Err(e) => assert_eq!(
            Some(e.message.as_str()),
            expected["error"].as_str(),
            "{name}"
        ),
    }
}

/// The scenarios pin the scope builders' model shapes, not deployability (scopes.mjs).
fn no_gate() -> Option<BuildOptions> {
    Some(BuildOptions {
        gate: BuildGateOptions {
            validate: Some(false),
            ..BuildGateOptions::default()
        },
        ..BuildOptions::default()
    })
}

fn svc(name: &str) -> ServiceTaskOptions {
    ServiceTaskOptions {
        name: name.to_owned(),
        task_type: "work".to_owned(),
        ..ServiceTaskOptions::default()
    }
}

fn timer(duration: &str) -> BoundaryEventOptions {
    BoundaryEventOptions {
        timer_duration: Some(duration.to_owned()),
        ..BoundaryEventOptions::default()
    }
}

fn timer_start(duration: &str) -> Option<StartEventOptions> {
    Some(StartEventOptions {
        timer_duration: Some(duration.to_owned()),
        ..StartEventOptions::default()
    })
}

fn link(name: &str) -> Option<IntermediateThrowEventOptions> {
    Some(IntermediateThrowEventOptions {
        link_name: Some(name.to_owned()),
        ..IntermediateThrowEventOptions::default()
    })
}

#[test]
fn branches() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .exclusive_gateway("gw", None)
        .branch("yes", |b| {
            b.condition("= x > 1")
                .label("Yes")
                .flow_id("F_yes")
                .service_task("t1", svc("T1"))
                .with_boundary("bd", timer("PT1S"), |x| {
                    x.end_event(Some("e2"), None);
                })
                .exclusive_gateway("inner", None)
                .branch("a", |c| {
                    c.default_flow().task("ta", None).text_annotation("note");
                })
                .branch("b", |c| {
                    c.user_task("tb", None).connect_to("end");
                });
        })
        .branch("no", |b| {
            b.default_flow()
                .intermediate_throw_event(Some("lt"), link("L"))
                .intermediate_catch_event(
                    Some("lc"),
                    Some(IntermediateCatchEventOptions {
                        link_name: Some("L".to_owned()),
                        ..IntermediateCatchEventOptions::default()
                    }),
                )
                .text_annotation("after catch")
                .data_object(
                    "d1",
                    Some(DataElementOptions {
                        name: Some("D".to_owned()),
                        ..DataElementOptions::default()
                    }),
                )
                .data_object_reference("dr", "d1", None)
                .data_association("lc", "dr", DataDirection::Input);
        })
        .end_event(Some("end"), None)
        .build(no_gate());
    check("branches", built);
}

#[test]
fn sub_processes() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .sub_process(
            "sp",
            |sub| {
                sub.start_event(
                    Some("ss"),
                    Some(StartEventOptions {
                        is_interrupting: Some(false),
                        ..StartEventOptions::default()
                    }),
                )
                .task("a", None)
                .with_boundary("sb", timer("PT5S"), |x| {
                    x.task("onTimeout", None);
                })
                .exclusive_gateway("g", None)
                .branch("one", |b| {
                    b.task("b1", None);
                })
                .branch("two", |b| {
                    b.default_flow().task("b2", None);
                })
                .task("join", None)
                .element("a")
                .connect_to("join")
                .end_event(Some("se"), None)
                .event_sub_process(
                    "esp",
                    |e| {
                        e.start_event(Some("es"), timer_start("PT1H"))
                            .end_event(Some("ee"), None);
                    },
                    None,
                );
            },
            Some(SubProcessOptions {
                multi_instance: Some(MultiInstanceOptions {
                    collection: Some("= items".to_owned()),
                    element_variable: Some("item".to_owned()),
                    ..MultiInstanceOptions::default()
                }),
                ..SubProcessOptions::default()
            }),
        )
        .transaction(
            "tx",
            |t| {
                t.task("x1", None).task("x2", None);
            },
            None,
        )
        .ad_hoc_sub_process(
            "ah",
            |h| {
                h.service_task("tool1", svc("Tool 1"))
                    .service_task("tool2", svc("Tool 2"))
                    .connect_to("tool1");
            },
            Some(AdHocSubProcessOptions {
                tool_grid: Some(ToolGridOptions {
                    columns: Some(2.0),
                    fill: None,
                }),
                ..AdHocSubProcessOptions::default()
            }),
        )
        .exclusive_gateway("gw", None)
        .branch("x", |b| {
            b.event_sub_process(
                "ev",
                |e| {
                    e.start_event(Some("evs"), None)
                        .end_event(Some("eve"), None);
                },
                None,
            )
            .end_event(Some("xe"), None);
        })
        .build(no_gate());
    check("subProcesses", built);
}

#[test]
fn dup_in_sub() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .sub_process(
            "sp",
            |sub| {
                sub.task("a", None).task("a", None);
            },
            None,
        )
        .build(no_gate());
    check("dupInSub", built);
}

#[test]
fn element_missing() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .sub_process(
            "sp",
            |sub| {
                sub.element("nope");
            },
            None,
        )
        .build(no_gate());
    check("elementMissing", built);
}

#[test]
fn annotation_without_cursor() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .sub_process(
            "sp",
            |sub| {
                sub.text_annotation("x");
            },
            None,
        )
        .build(no_gate());
    check("annotationNoCursor", built);
}

#[test]
fn boundary_without_task() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .sub_process(
            "sp",
            |sub| {
                sub.with_boundary("b", timer("PT1S"), |_| {});
            },
            None,
        )
        .build(no_gate());
    check("boundaryNoTask", built);
}

#[test]
fn branch_without_gateway() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .sub_process(
            "sp",
            |sub| {
                sub.task("a", None).branch("x", |_| {});
            },
            None,
        )
        .build(no_gate());
    check("branchWithoutGateway", built);
}

#[test]
fn boundary_at_gateway() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .exclusive_gateway("gw", None)
        .branch("x", |b| {
            b.with_boundary("b", timer("PT1S"), |_| {});
        })
        .build(no_gate());
    check("boundaryAtGateway", built);
}

#[test]
fn duplicate_event_sub_process_in_branch() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .exclusive_gateway("gw", None)
        .branch("x", |b| {
            b.task("t", None)
                .event_sub_process(
                    "t",
                    |e| {
                        e.start_event(Some("a"), timer_start("PT1H"));
                    },
                    None,
                )
                .end_event(Some("e"), None);
        })
        .build(no_gate());
    check("dupEventSubInBranch", built);
}

#[test]
fn duplicate_across_branches() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .exclusive_gateway("gw", None)
        .branch("x", |b| {
            b.task("t", None);
        })
        .branch("y", |b| {
            b.task("t", None);
        })
        .build(no_gate());
    check("dupAcrossBranches", built);
}
