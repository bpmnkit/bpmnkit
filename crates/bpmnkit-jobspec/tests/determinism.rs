//! I1 (same input, same hash) and I2 (input permutation, same hash) on the IR, plus the
//! BPMN + OpenAPI path end to end.

use bpmnkit_jobspec::{
    analyze, ir_hash, ApiIndex, Catalog, Decision, Inputs, RuleId, WorkerConfig,
};
use proptest::prelude::*;

const HEAD: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="t">"#;

/// One task element per index; tasks `i` and `i + 3` share a job type so jobs get merged.
fn task(i: usize) -> String {
    let ty = format!("job-{}", i % 3);
    let props = match i % 3 {
        0 => r#"<zeebe:properties><zeebe:property name="bpmnkit:operation" value="shop#createOrder"/></zeebe:properties>"#.to_owned(),
        1 => r#"<zeebe:properties><zeebe:property name="bpmnkit:operations" value="shop#createOrder, shop#GET /orders"/></zeebe:properties>"#.to_owned(),
        _ => String::new(),
    };
    format!(
        r#"<bpmn:serviceTask id="t{i}" name="Task {i}"><bpmn:extensionElements><zeebe:taskDefinition type="{ty}" retries="{r}"/><zeebe:ioMapping><zeebe:input source="=a{i}" target="in{i}"/><zeebe:output source="=out{i}" target="o{i}"/></zeebe:ioMapping><zeebe:taskHeaders><zeebe:header key="k{k}" value="v{i}"/></zeebe:taskHeaders>{props}</bpmn:extensionElements></bpmn:serviceTask>
<bpmn:boundaryEvent id="b{i}" attachedToRef="t{i}"><bpmn:errorEventDefinition errorRef="e{k}"/></bpmn:boundaryEvent>"#,
        r = i % 2 + 1,
        k = i % 2,
    )
}

fn file(process: usize, tasks: &[usize]) -> String {
    let body: String = tasks.iter().map(|i| task(*i)).collect();
    format!(
        r#"{HEAD}<bpmn:error id="e0" errorCode="E0"/><bpmn:error id="e1" errorCode="E1"/><bpmn:process id="p{process}" isExecutable="true">{body}</bpmn:process></bpmn:definitions>"#
    )
}

const API: &str = r#"{"id":"shop","name":"Shop","auth":{"type":"bearer"},"operations":[
 {"method":"POST","path":"/orders","id":"createOrder"},
 {"method":"GET","path":"/orders","id":"listOrders","responseKeys":["next"],"responseList":true}]}"#;

/// The same object with keys in another order.
const API_REORDERED: &str = r#"{"operations":[
 {"responseList":true,"id":"listOrders","responseKeys":["next"],"path":"/orders","method":"GET"},
 {"id":"createOrder","path":"/orders","method":"POST"}],"auth":{"type":"bearer"},"name":"Shop","id":"shop"}"#;

fn hash(files: &[String], api: &str) -> String {
    let defs: Vec<_> = files
        .iter()
        .map(|f| bpmnkit_bpmn::parse_bpmn(f).unwrap())
        .collect();
    let mut apis = ApiIndex::default();
    apis.add_json(api).unwrap();
    let (catalog, config) = (Catalog::builtin(), WorkerConfig::default());
    let out = analyze(Inputs {
        name: "w",
        definitions: &defs,
        apis: &apis,
        catalog: &catalog,
        config: &config,
    });
    ir_hash(&out.project)
}

/// Tasks 0..6 split over two processes (files): 0..3 and 3..6.
fn files(order_a: &[usize], order_b: &[usize], swap: bool) -> Vec<String> {
    let mut v = vec![file(1, order_a), file(2, order_b)];
    if swap {
        v.reverse();
    }
    v
}

#[test]
fn same_input_same_hash() {
    let f = files(&[0, 1, 2], &[3, 4, 5], false);
    let h = hash(&f, API);
    assert_eq!(h, hash(&f, API));
    assert_eq!(h.len(), 64);
    assert_eq!(
        h,
        hash(&f, API_REORDERED),
        "JSON key order leaked into the IR"
    );
}

proptest! {
    #[test]
    fn permutations_keep_the_hash(
        a in Just(vec![0usize, 1, 2]).prop_shuffle(),
        b in Just(vec![3usize, 4, 5]).prop_shuffle(),
        swap in any::<bool>(),
        reordered in any::<bool>(),
    ) {
        let want = hash(&files(&[0, 1, 2], &[3, 4, 5], false), API);
        let api = if reordered { API_REORDERED } else { API };
        prop_assert_eq!(want, hash(&files(&a, &b, swap), api));
    }
}

#[test]
fn bpmn_and_openapi_end_to_end() {
    let xml = format!(
        r#"{HEAD}<bpmn:process id="p" isExecutable="true">
<bpmn:serviceTask id="a" name="Create order"><bpmn:extensionElements><zeebe:taskDefinition type="create"/><zeebe:properties><zeebe:property name="bpmnkit:operation" value="shop#createOrder"/></zeebe:properties></bpmn:extensionElements></bpmn:serviceTask>
<bpmn:serviceTask id="b" name="List orders"><bpmn:extensionElements><zeebe:taskDefinition type="list"/><zeebe:properties><zeebe:property name="bpmnkit:operation" value="shop#get /orders"/></zeebe:properties></bpmn:extensionElements></bpmn:serviceTask>
<bpmn:serviceTask id="c" name="Missing op"><bpmn:extensionElements><zeebe:taskDefinition type="missing"/><zeebe:properties><zeebe:property name="bpmnkit:operation" value="shop#nope"/></zeebe:properties></bpmn:extensionElements></bpmn:serviceTask>
<bpmn:serviceTask id="d" name="Ping" zeebe:modelerTemplate="io.camunda.connectors.HttpJson.v2"><bpmn:extensionElements><zeebe:taskDefinition type="io.camunda:http-json:1"/></bpmn:extensionElements></bpmn:serviceTask>
<bpmn:serviceTask id="e" name="Ping raw"><bpmn:extensionElements><zeebe:taskDefinition type="io.camunda:http-json:1"/><zeebe:ioMapping><zeebe:input source="https://example.com/ping" target="url"/></zeebe:ioMapping></bpmn:extensionElements></bpmn:serviceTask>
<bpmn:serviceTask id="f" name="Forced"><bpmn:extensionElements><zeebe:taskDefinition type="forced"/><zeebe:properties><zeebe:property name="bpmnkit:mode" value="rest"/></zeebe:properties></bpmn:extensionElements></bpmn:serviceTask>
</bpmn:process></bpmn:definitions>"#
    );
    let defs = vec![bpmnkit_bpmn::parse_bpmn(&xml).unwrap()];
    let mut apis = ApiIndex::default();
    apis.add_json(&format!("[{API}]")).unwrap();
    let (catalog, config) = (Catalog::builtin(), WorkerConfig::default());
    let out = analyze(Inputs {
        name: "w",
        definitions: &defs,
        apis: &apis,
        catalog: &catalog,
        config: &config,
    });
    let got = |t: &str| out.project.jobs[t].classified.clone().unwrap();
    assert_eq!(
        (got("create").decision, got("create").rule),
        (Decision::Rest, RuleId::R12)
    );
    assert_eq!(got("list").rule, RuleId::R7);
    assert_eq!(got("missing").rule, RuleId::R4);
    assert!(got("missing").reason.contains("shop#nope"));
    // Tasks `d` and `e` share the http-json type: the template on `d` keeps it.
    assert_eq!(got("io.camunda:http-json:1").decision, Decision::Keep);
    assert_eq!(got("forced").rule, RuleId::R1);
    assert_eq!(
        out.project.jobs["io.camunda:http-json:1"].urls,
        ["https://example.com/ping"]
    );
}
