//! Regressions for TS builder defects found while porting (the triage letters in the test
//! names); `packages/core/tests/builder-parity-fixes.test.ts` pins the same behaviour in TS.

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{BpmnDefinitions, BpmnFlowElement};
use bpmnkit_builder::*;

fn flow_pairs(defs: &BpmnDefinitions) -> Vec<String> {
    defs.processes[0]
        .contents
        .sequence_flows
        .iter()
        .map(|f| format!("{}->{}", f.source_ref, f.target_ref))
        .collect()
}

fn element_ids(defs: &BpmnDefinitions) -> Vec<String> {
    defs.processes[0]
        .contents
        .flow_elements
        .iter()
        .map(|e| e.base().id.clone())
        .collect()
}

fn error(built: Result<BpmnDefinitions, BuildError>) -> String {
    built.expect_err("build should fail").message
}

fn timer(duration: &str) -> BoundaryEventOptions {
    BoundaryEventOptions {
        timer_duration: Some(duration.to_owned()),
        ..BoundaryEventOptions::default()
    }
}

fn svc(name: &str) -> ServiceTaskOptions {
    ServiceTaskOptions {
        name: name.to_owned(),
        task_type: "t".to_owned(),
        ..ServiceTaskOptions::default()
    }
}

#[test]
fn c_with_boundary_refuses_a_start_event_host() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .with_boundary("b", timer("PT1H"), |x| {
            x.end_event(Some("x"), None);
        })
        .build(None);
    assert_eq!(
        error(built),
        "withBoundary() cannot attach to startEvent \"s\". It must follow a task or activity element."
    );
}

#[test]
fn c_with_boundary_refuses_a_boundary_host_in_every_builder() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .service_task("h", svc("h"))
        .boundary_event(
            "b1",
            BoundaryEventOptions {
                attached_to: "h".to_owned(),
                ..timer("PT1H")
            },
        )
        .with_boundary("b2", timer("PT2H"), |x| {
            x.end_event(Some("x"), None);
        })
        .build(None);
    assert_eq!(
        error(built),
        "withBoundary() cannot attach to a boundary event. It must follow a task or activity element."
    );

    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .sub_process(
            "sp",
            |b| {
                b.start_event(Some("ss"), None)
                    .with_boundary("b", timer("PT1H"), |x| {
                        x.end_event(Some("x"), None);
                    });
            },
            None,
        )
        .build(None);
    assert_eq!(
        error(built),
        "withBoundary() cannot attach to startEvent \"ss\". It must follow a task or activity element."
    );
}

#[test]
fn c_with_boundary_still_attaches_to_an_activity() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .service_task("h", svc("h"))
        .with_boundary("b", timer("PT1H"), |x| {
            x.end_event(Some("x"), None);
        })
        .end_event(Some("e"), None)
        .build(None)
        .expect("build");
    assert_eq!(flow_pairs(&built), ["s->h", "b->x", "h->e"]);
}

#[test]
fn d_ids_are_unique_across_scopes() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .ad_hoc_sub_process(
            "ah",
            |x| {
                x.service_task("e", svc("e"));
            },
            None,
        )
        .end_event(Some("e"), None)
        .build(None);
    assert_eq!(error(built), "Duplicate element ID \"e\" in process \"p\"");
}

#[test]
fn e_branch_start_event_honours_non_interrupting() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .exclusive_gateway("g", None)
        .branch("a", |b| {
            b.start_event(
                Some("s2"),
                Some(StartEventOptions {
                    is_interrupting: Some(false),
                    ..StartEventOptions::default()
                }),
            );
        })
        .build(None)
        .expect("build");
    let s2 = built.processes[0]
        .contents
        .flow_elements
        .iter()
        .find(|e| e.base().id == "s2");
    assert!(matches!(
        s2,
        Some(BpmnFlowElement::StartEvent(ev)) if ev.is_interrupting == Some(false)
    ));
}

#[test]
fn f_branch_connect_to_after_nested_branch_joins_the_open_ends() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .exclusive_gateway("g", None)
        .branch("a", |b| {
            b.exclusive_gateway("g2", None)
                .branch("x", |c| {
                    c.service_task("t1", svc("t1"));
                })
                .branch("y", |c| {
                    c.service_task("t2", svc("t2"));
                })
                .connect_to("end");
        })
        .branch("b", |b| {
            b.connect_to("end");
        })
        .end_event(Some("end"), None)
        .build(None)
        .expect("build");
    let pairs = flow_pairs(&built);
    assert!(pairs.iter().all(|p| !p.starts_with("->")), "{pairs:?}");
    assert!(pairs.contains(&"t1->g2_join".to_owned()), "{pairs:?}");
    assert!(pairs.contains(&"t2->g2_join".to_owned()), "{pairs:?}");
}

#[test]
fn f_branch_text_annotation_without_cursor_fails() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .exclusive_gateway("g", None)
        .branch("a", |b| {
            b.exclusive_gateway("g2", None)
                .branch("x", |c| {
                    c.end_event(Some("e1"), None);
                })
                .text_annotation("hi");
        })
        .build(None);
    assert_eq!(error(built), "textAnnotation() must follow a flow element");
}

#[test]
fn g_link_catch_in_a_branch_leaves_open_ends_for_the_next_element() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .exclusive_gateway("g", None)
        .branch("a", |b| {
            b.exclusive_gateway("g2", None)
                .branch("x", |c| {
                    c.service_task("t1", svc("t1"));
                })
                .branch("y", |c| {
                    c.service_task("t2", svc("t2"));
                })
                .intermediate_catch_event(
                    Some("lc"),
                    Some(IntermediateCatchEventOptions {
                        link_name: Some("L".to_owned()),
                        ..IntermediateCatchEventOptions::default()
                    }),
                )
                .service_task("t3", svc("t3"));
        })
        .end_event(Some("end"), None)
        .build(None)
        .expect("build");
    let pairs = flow_pairs(&built);
    assert!(!pairs.iter().any(|p| p.ends_with("->lc")), "{pairs:?}");
    assert!(pairs.contains(&"lc->t3".to_owned()));
    assert!(pairs.contains(&"g2_join->t3".to_owned()));
}

#[test]
fn k_start_event_chains_from_the_cursor() {
    reset_id_counter();
    let built = Bpmn::create_process("p")
        .task("t", None)
        .start_event(Some("s"), None)
        .end_event(Some("e"), None)
        .build(None)
        .expect("build");
    assert_eq!(flow_pairs(&built), ["t->s", "s->e"]);
}

fn splice_source() -> BpmnDefinitions {
    reset_id_counter();
    Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .task("a", None)
        .exclusive_gateway("g", None)
        .branch("x", |b| {
            b.task("b", None).end_event(Some("e1"), None);
        })
        .branch("y", |b| {
            b.end_event(Some("e2"), None);
        })
        .build(None)
        .expect("source")
}

#[test]
fn m_at_after_insert_after_keeps_the_splice() {
    let source = splice_source();
    let built = Bpmn::continue_process(&source, "p")
        .insert_after("a")
        .task("n", None)
        .at("g")
        .task("m", None)
        .end_event(Some("e3"), None)
        .build(None)
        .expect("build");
    let pairs = flow_pairs(&built);
    assert!(pairs.contains(&"a->n".to_owned()), "{pairs:?}");
    assert!(pairs.contains(&"n->g".to_owned()), "{pairs:?}");
}

#[test]
fn m_element_after_insert_after_keeps_the_splice() {
    let source = splice_source();
    let built = Bpmn::continue_process(&source, "p")
        .insert_after("a")
        .task("n", None)
        .element("g")
        .task("m", None)
        .end_event(Some("e3"), None)
        .build(None)
        .expect("build");
    let pairs = flow_pairs(&built);
    assert!(pairs.contains(&"a->n".to_owned()), "{pairs:?}");
    assert!(pairs.contains(&"n->g".to_owned()), "{pairs:?}");
}

#[test]
fn n_build_leaves_the_builder_untouched() {
    reset_id_counter();
    let mut b = Bpmn::create_process("p");
    b.start_event(Some("s"), None)
        .parallel_gateway("g", None)
        .branch("a", |x| {
            x.task("a", None);
        })
        .branch("b", |x| {
            x.task("b", None);
        })
        .end_event(Some("e"), None);
    let first = b.build(None).expect("first");
    assert_eq!(b.build(None).expect("second"), first);

    // The second build starts from the builder's state, not the first build's joins.
    b.at("g").branch("c", |x| {
        x.task("c", None).connect_to("e");
    });
    let third = b.build(None).expect("third");
    assert_eq!(
        flow_pairs(&third),
        [
            "s->g",
            "g->a",
            "g->b",
            "a->g_join",
            "b->g_join",
            "g->c",
            "c->g_join",
            "g_join->e"
        ]
    );
    assert_eq!(element_ids(&first), ["s", "g", "a", "b", "e", "g_join"]);
}

#[test]
fn n_refused_explicit_joins_build_leaves_no_join_behind() {
    reset_id_counter();
    let mut b = Bpmn::create_process("p");
    b.start_event(Some("s"), None)
        .parallel_gateway("g", None)
        .branch("a", |x| {
            x.task("a", None);
        })
        .branch("b", |x| {
            x.task("b", None);
        })
        .end_event(Some("e"), None);
    let explicit = Some(BuildOptions {
        explicit_joins: Some(true),
    });
    for _ in 0..2 {
        assert!(error(b.build(explicit.clone())).starts_with("Inferred join gateways: g_join."));
    }
}

#[test]
fn o_ids_with_an_arrow_are_read_whole() {
    reset_id_counter();
    let source = Bpmn::create_process("p")
        .start_event(Some("s"), None)
        .task("a→b", None)
        .end_event(Some("e"), None)
        .build(None)
        .expect("source");
    let built = Bpmn::continue_process(&source, "p")
        .insert_after("a→b")
        .task("n", None)
        .build(None)
        .expect("build");
    assert_eq!(flow_pairs(&built), ["s->a→b", "n->e", "a→b->n"]);
}
