//! Plan §8: one positive and one negative fixture per rule, and a precedence test per adjacent
//! pair of the evaluation order (both triggers applied, the earlier rule must win).

use bpmnkit_jobspec::config::JobConfig;
use bpmnkit_jobspec::ir::{ElementRef, Header, Mapping};
use bpmnkit_jobspec::rules::{rule, ORDER};
use bpmnkit_jobspec::{
    classify, BoundOperation, Catalog, Ctx, Decision, JobSpec, RuleId, WorkerConfig,
};

struct Fixture {
    job: JobSpec,
    config: WorkerConfig,
}

fn op(reference: &str) -> BoundOperation {
    BoundOperation {
        reference: reference.into(),
        method: "POST".into(),
        path: "/orders".into(),
        auth: "bearer".into(),
        request_media_types: vec!["application/json".into()],
        response_media_types: vec!["application/json".into()],
        response_keys: vec!["id".into()],
        response_list: false,
        link_header: false,
        paginate: false,
        required_headers: vec![],
    }
}

/// A task bound to one plain JSON operation: REST (R12).
fn base() -> Fixture {
    let mut job = JobSpec::new("create-order");
    job.elements.push(ElementRef {
        process_id: "p".into(),
        element_id: "t".into(),
        element_type: "serviceTask".into(),
        name: Some("Create order".into()),
    });
    job.operations = vec!["shop#createOrder".into()];
    job.bound_operations = vec![op("shop#createOrder")];
    job.outputs = vec![Mapping {
        target: "orderId".into(),
        source: "=response.body.id".into(),
    }];
    Fixture {
        job,
        config: WorkerConfig::default(),
    }
}

fn unbind(f: &mut Fixture) {
    f.job.operations.clear();
    f.job.bound_operations.clear();
    f.job.urls.clear();
}

fn set_name(f: &mut Fixture, name: &str) {
    f.job.elements[0].name = Some(name.into());
}

/// Makes `id` match (on top of whatever the fixture already is).
fn trigger(id: RuleId, f: &mut Fixture) {
    match id {
        RuleId::R1 => {
            f.job
                .properties
                .insert("bpmnkit:mode".into(), vec!["worker".into()]);
        }
        RuleId::R2 => f.job.modeler_templates = vec!["io.camunda.connectors.Slack.v1".into()],
        RuleId::R3 => {
            unbind(f);
            f.job.job_type = "io.camunda.connectors.ServiceNow.v1".into();
        }
        RuleId::R13 => {
            unbind(f);
            set_name(f, "Post to Slack channel");
        }
        RuleId::R4 => {
            unbind(f);
            f.job.job_type = "compute-score".into();
            set_name(f, "Compute score");
        }
        RuleId::R5 => f.job.bound_operations[0].auth = "aws-sigv4".into(),
        RuleId::R6 => {
            f.job.bound_operations[0].response_media_types = vec!["application/octet-stream".into()]
        }
        RuleId::R7 => {
            let o = &mut f.job.bound_operations[0];
            o.response_keys = vec!["items".into(), "nextCursor".into()];
            o.response_list = true;
        }
        RuleId::R8 => f.job.operations.push("shop#chargeOrder".into()),
        RuleId::R9 => f.job.outputs.push(Mapping {
            target: "total".into(),
            source: "= a +".into(),
        }),
        RuleId::R10 => {
            let t = f.job.job_type.clone();
            f.config.jobs.insert(
                t,
                JobConfig {
                    rps: Some(80),
                    ..JobConfig::default()
                },
            );
        }
        RuleId::R11 => f.job.bound_operations[0].required_headers = vec!["Idempotency-Key".into()],
        RuleId::R12 => {}
    }
}

fn decision(id: RuleId) -> &'static str {
    match id {
        RuleId::R2 => "keep",
        RuleId::R3 | RuleId::R13 => "connector",
        RuleId::R12 => "rest",
        _ => "worker",
    }
}

fn run(f: &Fixture) -> bpmnkit_jobspec::Classified {
    let catalog = Catalog::builtin();
    classify(
        &f.job,
        &Ctx {
            catalog: &catalog,
            config: &f.config,
        },
    )
}

fn single(id: RuleId, f: &Fixture) -> bool {
    let catalog = Catalog::builtin();
    rule(
        id,
        &f.job,
        &Ctx {
            catalog: &catalog,
            config: &f.config,
        },
    )
    .is_some()
}

#[test]
fn every_rule_has_a_positive_fixture() {
    for id in ORDER {
        let mut f = base();
        trigger(id, &mut f);
        let c = run(&f);
        assert_eq!(c.rule, id, "{id:?}: {c:?}");
        assert_eq!(c.decision.label(), decision(id), "{id:?}");
    }
}

#[test]
fn every_rule_has_a_negative_fixture() {
    // The base fixture is plain REST: no rule but R12 fires on it.
    let f = base();
    for id in ORDER.iter().filter(|id| **id != RuleId::R12) {
        assert!(!single(*id, &f), "{id:?} fired on the base fixture");
    }
    // R12 never loses to nothing, so its negative is any earlier rule taking over.
    let mut f = base();
    trigger(RuleId::R11, &mut f);
    assert_ne!(run(&f).rule, RuleId::R12);
}

#[test]
fn earlier_rule_wins_each_adjacent_pair() {
    for pair in ORDER.windows(2) {
        let (first, second) = (pair[0], pair[1]);
        let mut f = base();
        trigger(second, &mut f);
        trigger(first, &mut f);
        assert_eq!(run(&f).rule, first, "{first:?} vs {second:?}");
    }
}

#[test]
fn near_misses_stay_negative() {
    let neg = |id: RuleId, mutate: &dyn Fn(&mut Fixture)| {
        let mut f = base();
        mutate(&mut f);
        assert!(!single(id, &f), "{id:?}");
    };
    // R1: an unknown mode is ignored.
    neg(RuleId::R1, &|f| {
        f.job
            .properties
            .insert("bpmnkit:mode".into(), vec!["magic".into()]);
    });
    // R2: the generic REST connector type is not a catalog connector.
    neg(RuleId::R2, &|f| {
        f.job.job_type = "io.camunda:http-json:1".into()
    });
    // R3 and R13: a bound operation wins over a catalog match.
    neg(RuleId::R3, &|f| {
        f.job.job_type = "io.camunda.connectors.ServiceNow.v1".into()
    });
    neg(RuleId::R13, &|f| set_name(f, "Post to Slack channel"));
    // R13: a word inside another word does not match (`slacking` is not Slack).
    neg(RuleId::R13, &|f| {
        unbind(f);
        set_name(f, "Stop slacking");
    });
    // R4: a URL counts as bound.
    neg(RuleId::R4, &|f| {
        unbind(f);
        f.job.job_type = "io.camunda:http-json:1".into();
        f.job.urls = vec!["https://api.example.com/x".into()];
    });
    // R5–R7, R11 read operations only.
    neg(RuleId::R5, &|f| {
        f.job.bound_operations[0].auth = "oauth-client-credentials-flow".into()
    });
    neg(RuleId::R6, &|f| {
        f.job.bound_operations[0].response_media_types = vec![
            "application/problem+json; charset=utf-8".into(),
            "text/plain".into(),
        ]
    });
    neg(RuleId::R7, &|f| {
        f.job.bound_operations[0].response_keys = vec!["nextCursor".into()]; // not a list
    });
    neg(RuleId::R8, &|f| {
        f.job.operations = vec!["shop#createOrder".into()]
    });
    neg(RuleId::R9, &|f| {
        f.job.outputs.push(Mapping {
            target: "static".into(),
            source: "not FEEL + (".into(),
        })
    });
    // R10: absent values never fire; below the limit does not either.
    neg(RuleId::R10, &|f| {
        f.config.jobs.insert(
            "create-order".into(),
            JobConfig {
                rps: Some(49),
                slo_ms: Some(50),
                ..JobConfig::default()
            },
        );
    });
    neg(RuleId::R11, &|f| {
        f.job.bound_operations[0].required_headers = vec!["X-Request-Id".into()]
    });
}

#[test]
fn rule_details() {
    // R1 from worker.toml beats the BPMN property.
    let mut f = base();
    f.job
        .properties
        .insert("bpmnkit:mode".into(), vec!["worker".into()]);
    f.config.jobs.insert(
        "create-order".into(),
        JobConfig {
            mode: Some(bpmnkit_jobspec::Mode::Rest),
            ..JobConfig::default()
        },
    );
    assert_eq!(run(&f).decision, Decision::Rest);

    // R2 by catalog type, R3 by another version of a catalog type.
    let mut f = base();
    unbind(&mut f);
    f.job.job_type = "io.camunda:slack:1".into();
    assert_eq!(run(&f).rule, RuleId::R2);
    f.job.job_type = "io.camunda:slack:2".into();
    let c = run(&f);
    assert_eq!(c.rule, RuleId::R3);
    assert_eq!(
        c.decision,
        Decision::Connector {
            template: Some("io.camunda.connectors.Slack.v1".into())
        }
    );

    // R7 also fires on page + total, a Link header, and x-bpmnkit-paginate.
    for set in [
        (|o: &mut BoundOperation| {
            o.response_keys = vec!["page".into(), "total".into()];
            o.response_list = true;
        }) as fn(&mut BoundOperation),
        |o| {
            o.link_header = true;
            o.paginate = true;
        },
    ] {
        let mut f = base();
        set(&mut f.job.bound_operations[0]);
        assert_eq!(run(&f).rule, RuleId::R7);
    }

    // R9 also reads the resultExpression header.
    let mut f = base();
    f.job.headers.push(Header {
        key: "resultExpression".into(),
        values: vec!["={x: }".into()],
        required: true,
    });
    assert_eq!(run(&f).rule, RuleId::R9);

    // R10 on a declared latency budget.
    let mut f = base();
    f.config.jobs.insert(
        "create-order".into(),
        JobConfig {
            slo_ms: Some(10),
            ..JobConfig::default()
        },
    );
    assert_eq!(run(&f).rule, RuleId::R10);
}

#[test]
fn name_heuristic_is_deterministic_and_ranked() {
    let c = Catalog::builtin();
    let id = |name: &str| c.by_name(name).map(|m| m.entry.id.clone());
    assert_eq!(
        id("Send Slack message").as_deref(),
        Some("io.camunda.connectors.Slack.v1")
    );
    assert_eq!(
        id("Ask OpenAI").as_deref(),
        Some("io.camunda.connectors.OpenAI.v1")
    );
    assert_eq!(
        id("Ask Azure OpenAI").as_deref(),
        Some("io.camunda.connectors.AzureOpenAI.outbound.v1")
    );
    assert_eq!(
        id("Send email with SendGrid").as_deref(),
        Some("io.camunda.connectors.SendGrid.v2")
    );
    assert_eq!(
        id("Send email").as_deref(),
        Some("io.camunda.connectors.email.v1")
    );
    assert_eq!(id("Calculate the invoice total"), None);
    // Deprecated templates never match by name.
    assert!(c
        .by_name("AI agent")
        .is_some_and(|m| !m.entry.name.contains("Deprecated")));
}
