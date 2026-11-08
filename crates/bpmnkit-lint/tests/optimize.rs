//! Port of `packages/core/tests/optimize.test.ts`. Models are built as TS-shaped
//! JSON, so each test reads like its TS original.

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{BpmnDefinitions, BpmnFlowElement};
use bpmnkit_lint::optimize::variable_flow::{extract_feel_identifiers, levenshtein};
use bpmnkit_lint::optimize::{optimize, OptimizationReport, OptimizeOptions};
use bpmnkit_lint::{Category, Finding, Severity};
use serde_json::{json, Value};

// ── helpers ─────────────────────────────────────────────────────────────────

fn make_process(id: &str, elements: Vec<Value>, flows: Vec<Value>) -> Value {
    json!({
        "id": id, "extensionElements": [], "flowElements": elements, "sequenceFlows": flows,
        "textAnnotations": [], "associations": [], "unknownAttributes": {}
    })
}

fn make_defs(process: Value, diagrams: Vec<Value>) -> BpmnDefinitions {
    reset_id_counter();
    serde_json::from_value(json!({
        "id": "Definitions_1", "targetNamespace": "http://bpmn.io/schema/bpmn",
        "namespaces": {}, "unknownAttributes": {}, "errors": [], "escalations": [],
        "messages": [], "signals": [], "collaborations": [],
        "processes": [process], "diagrams": diagrams
    }))
    .expect("TS-shaped model")
}

fn task_def_ext(ty: &str) -> Value {
    json!({"name": "zeebe:taskDefinition", "attributes": {"type": ty}, "children": []})
}

fn header_ext(headers: &[(&str, &str)]) -> Value {
    let children: Vec<Value> = headers
        .iter()
        .map(|(k, v)| json!({"name": "zeebe:header", "attributes": {"key": k, "value": v}, "children": []}))
        .collect();
    json!({"name": "zeebe:taskHeaders", "attributes": {}, "children": children})
}

fn io_ext(inputs: &[(&str, &str)], outputs: &[(&str, &str)]) -> Value {
    let entry = |name: &str, (s, t): &(&str, &str)| json!({"name": name, "attributes": {"source": s, "target": t}, "children": []});
    let children: Vec<Value> = inputs
        .iter()
        .map(|e| entry("zeebe:input", e))
        .chain(outputs.iter().map(|e| entry("zeebe:output", e)))
        .collect();
    json!({"name": "zeebe:ioMapping", "attributes": {}, "children": children})
}

fn node(ty: &str, id: &str, incoming: &[&str], outgoing: &[&str]) -> Value {
    json!({
        "type": ty, "id": id, "incoming": incoming, "outgoing": outgoing,
        "extensionElements": [], "unknownAttributes": {}
    })
}

fn with(mut v: Value, key: &str, value: Value) -> Value {
    v[key] = value;
    v
}

fn start_el(id: &str) -> Value {
    with(
        node("startEvent", id, &[], &[]),
        "eventDefinitions",
        json!([]),
    )
}

fn end_el(id: &str, incoming: &[&str]) -> Value {
    with(
        node("endEvent", id, incoming, &[]),
        "eventDefinitions",
        json!([]),
    )
}

fn task_el(id: &str, incoming: &[&str], outgoing: &[&str], ext: Vec<Value>) -> Value {
    with(
        node("serviceTask", id, incoming, outgoing),
        "extensionElements",
        json!(ext),
    )
}

fn boundary_el(id: &str, attached_to: &str, outgoing: &[&str]) -> Value {
    let b = with(
        node("boundaryEvent", id, &[], outgoing),
        "eventDefinitions",
        json!([]),
    );
    with(b, "attachedToRef", json!(attached_to))
}

fn flow(id: &str, src: &str, tgt: &str) -> Value {
    json!({"id": id, "sourceRef": src, "targetRef": tgt, "extensionElements": [], "unknownAttributes": {}})
}

fn cond_flow(id: &str, src: &str, tgt: &str, condition: &str) -> Value {
    with(
        flow(id, src, tgt),
        "conditionExpression",
        json!({"text": condition, "attributes": {}}),
    )
}

fn named_flow(id: &str, src: &str, tgt: &str, name: &str) -> Value {
    with(flow(id, src, tgt), "name", json!(name))
}

fn gw_el(id: &str, incoming: &[&str], outgoing: &[&str]) -> Value {
    node("exclusiveGateway", id, incoming, outgoing)
}

fn xgw_el(id: &str, incoming: &[&str], outgoing: &[&str], default: &str) -> Value {
    with(gw_el(id, incoming, outgoing), "default", json!(default))
}

fn named_el(id: &str, ty: &str, name: &str, incoming: &[&str], outgoing: &[&str]) -> Value {
    let mut v = with(node(ty, id, incoming, outgoing), "name", json!(name));
    if ty.ends_with("Event") {
        v["eventDefinitions"] = json!([]);
    }
    v
}

fn run(defs: &BpmnDefinitions) -> OptimizationReport {
    optimize(defs, &OptimizeOptions::default())
}

fn only(categories: &[Category]) -> OptimizeOptions {
    OptimizeOptions {
        categories: Some(categories.to_vec()),
        ..Default::default()
    }
}

fn find<'a>(r: &'a OptimizationReport, id: &str) -> Option<&'a Finding> {
    r.findings.iter().find(|f| f.data.id == id)
}

fn has(r: &OptimizationReport, id: &str) -> bool {
    find(r, id).is_some()
}

fn has_on(r: &OptimizationReport, id: &str, element: &str) -> bool {
    r.findings
        .iter()
        .any(|f| f.data.id == id && f.data.element_ids.iter().any(|e| e == element))
}

/// Applies the first `id` finding's fix to `defs`.
fn apply(defs: &mut BpmnDefinitions, id: &str) -> bpmnkit_lint::ApplyFixResult {
    let report = run(defs);
    let fix = find(&report, id)
        .and_then(|f| f.apply_fix.as_ref())
        .expect("fixable finding");
    fix(defs)
}

fn elements(defs: &BpmnDefinitions) -> &[BpmnFlowElement] {
    &defs.processes[0].contents.flow_elements
}

fn element<'a>(defs: &'a BpmnDefinitions, id: &str) -> Option<&'a BpmnFlowElement> {
    elements(defs).iter().find(|e| e.base().id == id)
}

fn two_condition_gateway() -> BpmnDefinitions {
    make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                gw_el("gw1", &["f0"], &["f1", "f2"]),
                end_el("e", &["f1"]),
                end_el("e2", &["f2"]),
            ],
            vec![
                flow("f0", "s", "gw1"),
                cond_flow("f1", "gw1", "e", "= x > 0"),
                cond_flow("f2", "gw1", "e2", "= x <= 0"),
            ],
        ),
        vec![],
    )
}

fn joined_tasks() -> Value {
    make_process(
        "proc",
        vec![
            start_el("s"),
            task_el("task_a", &["f0"], &["f1"], vec![]),
            task_el("task_c", &["f0b"], &["f2"], vec![]),
            task_el("task_b", &["f1", "f2"], &["f3"], vec![]),
            end_el("e", &["f3"]),
        ],
        vec![
            flow("f0", "s", "task_a"),
            flow("f0b", "s", "task_c"),
            flow("f1", "task_a", "task_b"),
            flow("f2", "task_c", "task_b"),
            flow("f3", "task_b", "e"),
        ],
    )
}

fn identical_tasks() -> BpmnDefinitions {
    let ext = vec![
        task_def_ext("my-connector"),
        header_ext(&[("apiKey", "123")]),
    ];
    make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                task_el("t1", &["f1"], &["f2"], ext.clone()),
                task_el("t2", &["f3"], &["f4"], ext),
                end_el("e", &[]),
            ],
            vec![
                flow("f1", "s", "t1"),
                flow("f2", "t1", "e"),
                flow("f3", "s", "t2"),
                flow("f4", "t2", "e"),
            ],
        ),
        vec![],
    )
}

fn dead_end() -> BpmnDefinitions {
    make_defs(
        make_process(
            "proc",
            vec![start_el("s"), task_el("t1", &["f1"], &[], vec![])],
            vec![flow("f1", "s", "t1")],
        ),
        vec![],
    )
}

// ── FEEL analysis ───────────────────────────────────────────────────────────

#[test]
fn feel_empty_condition_for_ungated_exclusive_branch() {
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                xgw_el("gw1", &["f0"], &["f1", "f2"], "f1"),
                end_el("e", &["f1"]),
                end_el("e2", &["f2"]),
            ],
            vec![
                flow("f0", "s", "gw1"),
                flow("f1", "gw1", "e"),
                flow("f2", "gw1", "e2"),
            ],
        ),
        vec![],
    );
    let r = run(&defs);
    assert!(has_on(&r, "feel/empty-condition", "f2"));
    assert!(!has_on(&r, "feel/empty-condition", "f1"));
}

#[test]
fn feel_missing_default_flow_and_its_fix() {
    let mut defs = two_condition_gateway();
    assert!(has(&run(&defs), "feel/missing-default-flow"));
    let result = apply(&mut defs, "feel/missing-default-flow");
    assert_eq!(
        result.description,
        "Set default flow to \"f2\" on gateway \"gw1\""
    );
    let Some(BpmnFlowElement::ExclusiveGateway(g)) = element(&defs, "gw1") else {
        panic!("gateway");
    };
    assert_eq!(g.default.as_deref(), Some("f2"));
}

#[test]
fn feel_complex_condition_over_length_threshold() {
    let long = "= someVariable > anotherLongVariableName and thirdVar != fourthVar or fifthVar <= sixthValue";
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                gw_el("gw1", &["f0"], &["f1", "f2"]),
                end_el("e", &["f1"]),
                end_el("e2", &["f2"]),
            ],
            vec![
                flow("f0", "s", "gw1"),
                cond_flow("f1", "gw1", "e", long),
                cond_flow("f2", "gw1", "e2", "= true"),
            ],
        ),
        vec![],
    );
    let r = run(&defs);
    let f = find(&r, "feel/complex-condition").expect("complex");
    assert_eq!(
        f.data.message,
        "Condition on flow \"f1\" is complex (length=92, nesting=0, operators=6, variables=6)."
    );
}

#[test]
fn feel_duplicate_expression() {
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                gw_el("gw1", &["f0"], &["f1", "f2"]),
                end_el("e1", &["f1"]),
                end_el("e2", &["f2"]),
                gw_el("gw2", &["f3"], &["f4", "f5"]),
                end_el("e3", &["f4"]),
                end_el("e4", &["f5"]),
            ],
            vec![
                flow("f0", "s", "gw1"),
                cond_flow("f1", "gw1", "e1", "= x > 0"),
                cond_flow("f2", "gw1", "e2", "= x <= 0"),
                flow("f3", "s", "gw2"),
                cond_flow("f4", "gw2", "e3", "= x > 0"),
                cond_flow("f5", "gw2", "e4", "= x <= 0"),
            ],
        ),
        vec![],
    );
    let r = run(&defs);
    let dups: Vec<_> = r
        .findings
        .iter()
        .filter(|f| f.data.id == "feel/duplicate-expression")
        .map(|f| f.data.element_ids.clone())
        .collect();
    assert_eq!(dups, vec![vec!["f1", "f4"], vec!["f2", "f5"]]);
}

#[test]
fn feel_simple_expression_is_not_complex() {
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                xgw_el("gw1", &["f0"], &["f1", "f2"], "f2"),
                end_el("e", &["f1"]),
                end_el("e2", &["f2"]),
            ],
            vec![
                flow("f0", "s", "gw1"),
                cond_flow("f1", "gw1", "e", "= x > 0"),
                flow("f2", "gw1", "e2"),
            ],
        ),
        vec![],
    );
    assert!(!has(&run(&defs), "feel/complex-condition"));
}

// ── flow analysis ───────────────────────────────────────────────────────────

#[test]
fn flow_unreachable_isolated_element() {
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                end_el("e", &["f1"]),
                task_el("isolated", &[], &[], vec![]),
            ],
            vec![flow("f1", "s", "e")],
        ),
        vec![],
    );
    assert!(has_on(&run(&defs), "flow/unreachable", "isolated"));
}

#[test]
fn flow_boundary_path_is_reachable() {
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                task_el("t1", &["f1"], &["f2"], vec![]),
                boundary_el("t1_error", "t1", &["f3"]),
                end_el("error_end", &["f3"]),
                end_el("e", &["f2"]),
            ],
            vec![
                flow("f1", "s", "t1"),
                flow("f2", "t1", "e"),
                flow("f3", "t1_error", "error_end"),
            ],
        ),
        vec![],
    );
    let r = run(&defs);
    assert!(!has_on(&r, "flow/unreachable", "t1_error"));
    assert!(!has_on(&r, "flow/unreachable", "error_end"));
}

#[test]
fn flow_dead_end_and_its_fix() {
    let mut defs = dead_end();
    assert!(has_on(&run(&defs), "flow/dead-end", "t1"));
    let result = apply(&mut defs, "flow/dead-end");
    assert_eq!(
        result.description,
        "Added end event \"EndEvent_0000001\" connected from \"t1\""
    );
    let p = &defs.processes[0].contents;
    assert!(p.flow_elements.iter().any(|e| e.type_name() == "endEvent"));
    assert!(p.sequence_flows.iter().any(|f| f.source_ref == "t1"));
    assert_eq!(
        element(&defs, "t1").unwrap().base().outgoing,
        vec!["Flow_0000002"]
    );
}

#[test]
fn flow_no_end_event() {
    assert!(has(&run(&dead_end()), "flow/no-end-event"));
}

fn pass_through_gateway() -> BpmnDefinitions {
    make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                gw_el("gw1", &["f1"], &["f2"]),
                end_el("e", &["f2"]),
            ],
            vec![flow("f1", "s", "gw1"), flow("f2", "gw1", "e")],
        ),
        vec![],
    )
}

#[test]
fn flow_redundant_gateway_and_its_fix() {
    let mut defs = pass_through_gateway();
    assert!(has(&run(&defs), "flow/redundant-gateway"));
    apply(&mut defs, "flow/redundant-gateway");
    let p = &defs.processes[0].contents;
    assert!(element(&defs, "gw1").is_none());
    assert!(!p
        .sequence_flows
        .iter()
        .any(|f| f.id == "f1" || f.id == "f2"));
    assert!(p
        .sequence_flows
        .iter()
        .any(|f| f.source_ref == "s" && f.target_ref == "e"));
}

#[test]
fn flow_multi_incoming_task() {
    let defs = make_defs(joined_tasks(), vec![]);
    let r = run(&defs);
    let f = find(&r, "flow/multi-incoming-task").expect("finding");
    assert_eq!(f.data.element_ids, vec!["task_b"]);
    assert_eq!(f.data.severity, Severity::Error);
}

#[test]
fn flow_multi_incoming_gateway_is_fine() {
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                task_el("task_a", &["f0"], &["f1"], vec![]),
                task_el("task_c", &["f0b"], &["f2"], vec![]),
                gw_el("gw1", &["f1", "f2"], &["f3"]),
                end_el("e", &["f3"]),
            ],
            vec![
                flow("f0", "s", "task_a"),
                flow("f0b", "s", "task_c"),
                flow("f1", "task_a", "gw1"),
                flow("f2", "task_c", "gw1"),
                flow("f3", "gw1", "e"),
            ],
        ),
        vec![],
    );
    assert!(!has(&run(&defs), "flow/multi-incoming-task"));
}

#[test]
fn flow_multi_incoming_fix_inserts_a_join() {
    let mut defs = make_defs(joined_tasks(), vec![]);
    apply(&mut defs, "flow/multi-incoming-task");
    let p = &defs.processes[0].contents;
    assert!(p
        .flow_elements
        .iter()
        .any(|e| e.type_name() == "exclusiveGateway"));
    assert_eq!(element(&defs, "task_b").unwrap().base().incoming.len(), 1);
    let target = |id: &str| {
        &p.sequence_flows
            .iter()
            .find(|f| f.id == id)
            .unwrap()
            .target_ref
    };
    assert_ne!(target("f1"), "task_b");
    assert_eq!(target("f1"), target("f2"));
    assert!(p
        .sequence_flows
        .iter()
        .any(|f| f.target_ref == "task_b" && f.source_ref != "task_a" && f.source_ref != "task_c"));
}

#[test]
fn flow_multi_incoming_fix_marks_the_gateway_shape() {
    let diagram = json!({
        "id": "d",
        "plane": {
            "id": "p", "bpmnElement": "proc", "edges": [],
            "shapes": [{
                "id": "task_b_di", "bpmnElement": "task_b",
                "bounds": {"x": 400, "y": 100, "width": 100, "height": 80},
                "unknownAttributes": {}
            }]
        }
    });
    let mut defs = make_defs(joined_tasks(), vec![diagram]);
    apply(&mut defs, "flow/multi-incoming-task");
    let gw = elements(&defs)
        .iter()
        .find(|e| e.type_name() == "exclusiveGateway")
        .expect("gateway");
    let shape = defs.diagrams[0]
        .plane
        .shapes
        .iter()
        .find(|s| s.bpmn_element == gw.base().id)
        .expect("shape");
    assert_eq!(shape.is_marker_visible, Some(true));
    assert_eq!(
        (shape.bounds.x, shape.bounds.y),
        (300.0, 115.0),
        "100 left of the target, vertically centred"
    );
}

#[test]
fn flow_empty_subprocess() {
    let sub = json!({
        "type": "subProcess", "id": "sub1", "incoming": ["f1"], "outgoing": ["f2"],
        "extensionElements": [], "unknownAttributes": {}, "flowElements": [],
        "sequenceFlows": [], "textAnnotations": [], "associations": []
    });
    let defs = make_defs(
        make_process(
            "proc",
            vec![start_el("s"), sub, end_el("e", &["f2"])],
            vec![flow("f1", "s", "sub1"), flow("f2", "sub1", "e")],
        ),
        vec![],
    );
    assert!(has(&run(&defs), "flow/empty-subprocess"));
}

// ── task reuse ──────────────────────────────────────────────────────────────

#[test]
fn task_reusable_group_and_its_fix() {
    let mut defs = identical_tasks();
    let r = run(&defs);
    let f = find(&r, "task/reusable-group").expect("group");
    assert_eq!(f.data.element_ids, vec!["t1", "t2"]);
    let result = apply(&mut defs, "task/reusable-group");
    for id in ["t1", "t2"] {
        assert_eq!(element(&defs, id).unwrap().type_name(), "callActivity");
    }
    let generated = result.generated.expect("generated");
    assert_eq!(generated.processes.len(), 1);
    let has_task_def = generated.processes[0]
        .contents
        .flow_elements
        .iter()
        .any(|el| {
            el.base()
                .extension_elements
                .iter()
                .any(|x| x.name == "zeebe:taskDefinition" && x.attr("type") == Some("my-connector"))
        });
    assert!(has_task_def);
    assert_eq!(
        result.description,
        "Extracted 2 service tasks to call activity referencing \"Reusable_my-connector_proc_0000001\""
    );
}

/// Regression: a job type with ":" made the extracted process id an invalid NCName.
#[test]
fn task_extracted_process_id_is_a_valid_bpmn_id() {
    let ext = vec![task_def_ext("io.camunda:http-json:1")];
    let mut defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                task_el("t1", &["f1"], &["f2"], ext.clone()),
                task_el("t2", &["f3"], &["f4"], ext),
                end_el("e", &[]),
            ],
            vec![
                flow("f1", "s", "t1"),
                flow("f2", "t1", "e"),
                flow("f3", "s", "t2"),
                flow("f4", "t2", "e"),
            ],
        ),
        vec![],
    );
    let generated = apply(&mut defs, "task/reusable-group").generated.unwrap();
    assert_eq!(
        generated.processes[0].id,
        "Reusable_io.camunda_http-json_1_proc_0000001"
    );
}

#[test]
fn task_single_task_is_not_a_group() {
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                task_el(
                    "t1",
                    &["f1"],
                    &["f2"],
                    vec![task_def_ext("my-connector"), header_ext(&[("k", "v")])],
                ),
                end_el("e", &["f2"]),
            ],
            vec![flow("f1", "s", "t1"), flow("f2", "t1", "e")],
        ),
        vec![],
    );
    assert!(!has(&run(&defs), "task/reusable-group"));
}

#[test]
fn task_similarity_below_threshold() {
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                task_el(
                    "t1",
                    &["f1"],
                    &["f2"],
                    vec![
                        task_def_ext("my-connector"),
                        header_ext(&[("keyA", "v")]),
                        io_ext(&[("= x", "inputVar")], &[]),
                    ],
                ),
                task_el(
                    "t2",
                    &["f3"],
                    &["f4"],
                    vec![task_def_ext("my-connector"), header_ext(&[("keyB", "v")])],
                ),
                end_el("e", &[]),
            ],
            vec![
                flow("f1", "s", "t1"),
                flow("f2", "t1", "e"),
                flow("f3", "s", "t2"),
                flow("f4", "t2", "e"),
            ],
        ),
        vec![],
    );
    assert!(!has(&run(&defs), "task/reusable-group"));
}

// ── options and summary ─────────────────────────────────────────────────────

#[test]
fn categories_limit_the_findings() {
    let r = optimize(&dead_end(), &only(&[Category::Flow]));
    assert!(!r.findings.is_empty());
    assert!(r.findings.iter().all(|f| f.data.category == Category::Flow));
}

#[test]
fn feel_thresholds_are_options() {
    let expr = "= someVar > anotherLongVar and thirdVar != fourthVar or fifthVar <= sixth";
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                gw_el("gw1", &["f0"], &["f1", "f2"]),
                end_el("e", &["f1"]),
                end_el("e2", &["f2"]),
            ],
            vec![
                flow("f0", "s", "gw1"),
                cond_flow("f1", "gw1", "e", expr),
                cond_flow("f2", "gw1", "e2", "= true"),
            ],
        ),
        vec![],
    );
    let opts = OptimizeOptions {
        feel_length_threshold: Some(200),
        feel_operator_threshold: Some(50),
        feel_variable_threshold: Some(50),
        feel_nesting_threshold: Some(50),
        ..Default::default()
    };
    assert!(has(&run(&defs), "feel/complex-condition"));
    assert!(!has(&optimize(&defs, &opts), "feel/complex-condition"));
}

#[test]
fn reuse_threshold_is_an_option() {
    let opts = OptimizeOptions {
        reuse_threshold: Some(3),
        ..Default::default()
    };
    assert!(!has(
        &optimize(&identical_tasks(), &opts),
        "task/reusable-group"
    ));
}

#[test]
fn summary_counts_match_the_findings() {
    let r = run(&dead_end());
    assert_eq!(r.summary.total, r.findings.len());
    for c in Category::ALL {
        let n = r.findings.iter().filter(|f| f.data.category == c).count();
        assert_eq!(r.summary.by_category[&c], n);
    }
    for s in [Severity::Info, Severity::Warning, Severity::Error] {
        let n = r.findings.iter().filter(|f| f.data.severity == s).count();
        assert_eq!(r.summary.by_severity[&s], n);
    }
    let json = serde_json::to_value(&r.summary).unwrap();
    assert!(json["byCategory"]["task-reuse"].is_number());
}

// ── naming ──────────────────────────────────────────────────────────────────

fn naming(defs: &BpmnDefinitions) -> OptimizationReport {
    optimize(defs, &only(&[Category::Naming]))
}

fn split(gw: Value, f2: Value, f3: Value) -> BpmnDefinitions {
    make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                gw,
                end_el("e1", &["f2"]),
                end_el("e2", &["f3"]),
            ],
            vec![flow("f1", "s", "gw"), f2, f3],
        ),
        vec![],
    )
}

#[test]
fn naming_unlabeled_task_and_events() {
    let unnamed = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                task_el("t", &["f1"], &["f2"], vec![]),
                end_el("e", &["f2"]),
            ],
            vec![flow("f1", "s", "t"), flow("f2", "t", "e")],
        ),
        vec![],
    );
    let r = naming(&unnamed);
    assert!(has(&r, "naming/unlabeled-task"));
    assert!(has(&r, "naming/unlabeled-start-event"));

    let named = make_defs(
        make_process(
            "proc",
            vec![
                named_el("s", "startEvent", "Order Received", &[], &[]),
                named_el("t", "serviceTask", "Process Order", &["f1"], &["f2"]),
                named_el("e", "endEvent", "Order Fulfilled", &["f2"], &[]),
            ],
            vec![flow("f1", "s", "t"), flow("f2", "t", "e")],
        ),
        vec![],
    );
    assert!(naming(&named).findings.is_empty());
}

#[test]
fn naming_split_gateways() {
    let labels = || {
        (
            named_flow("f2", "gw", "e1", "Yes"),
            named_flow("f3", "gw", "e2", "No"),
        )
    };
    let (a, b) = labels();
    assert!(has(
        &naming(&split(gw_el("gw", &["f1"], &["f2", "f3"]), a, b)),
        "naming/split-gateway-no-label"
    ));

    let (a, b) = labels();
    let question = named_el(
        "gw",
        "exclusiveGateway",
        "Invoice valid?",
        &["f1"],
        &["f2", "f3"],
    );
    let r = naming(&split(question.clone(), a, b));
    assert!(!has(&r, "naming/split-gateway-no-label"));
    assert!(!has(&r, "naming/gateway-not-a-question"));

    let (a, b) = labels();
    let statement = named_el(
        "gw",
        "exclusiveGateway",
        "Invoice valid",
        &["f1"],
        &["f2", "f3"],
    );
    let r = naming(&split(statement, a, b));
    let f = find(&r, "naming/gateway-not-a-question").expect("finding");
    assert_eq!(
        f.data.suggestion,
        "Rephrase as a question, e.g. \"Invoice valid?\""
    );

    let r = naming(&split(
        question,
        flow("f2", "gw", "e1"),
        flow("f3", "gw", "e2"),
    ));
    let unlabeled: Vec<_> = r
        .findings
        .iter()
        .filter(|f| f.data.id == "naming/missing-flow-condition")
        .map(|f| f.data.element_ids.clone())
        .collect();
    assert_eq!(unlabeled, vec![vec!["gw", "f2"], vec!["gw", "f3"]]);
}

#[test]
fn naming_join_gateways() {
    let join = |gw: Value| {
        make_defs(
            make_process(
                "proc",
                vec![start_el("s"), gw, end_el("e", &["f3"])],
                vec![
                    flow("f1", "s", "gw"),
                    flow("f2", "s", "gw"),
                    flow("f3", "gw", "e"),
                ],
            ),
            vec![],
        )
    };
    let labeled = named_el(
        "gw",
        "exclusiveGateway",
        "Join here",
        &["f1", "f2"],
        &["f3"],
    );
    assert!(has(&naming(&join(labeled)), "naming/join-gateway-labeled"));
    assert!(!has(
        &naming(&join(gw_el("gw", &["f1", "f2"], &["f3"]))),
        "naming/join-gateway-labeled"
    ));
}

#[test]
fn flow_no_start_event_and_mixed_gateway() {
    let flows = |defs: &BpmnDefinitions| optimize(defs, &only(&[Category::Flow]));
    let no_start = make_defs(
        make_process(
            "proc",
            vec![task_el("t", &[], &["f1"], vec![]), end_el("e", &["f1"])],
            vec![flow("f1", "t", "e")],
        ),
        vec![],
    );
    assert!(has(&flows(&no_start), "flow/no-start-event"));

    let mixed = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                gw_el("gw", &["f1", "f2"], &["f3", "f4"]),
                end_el("e1", &["f3"]),
                end_el("e2", &["f4"]),
            ],
            vec![
                flow("f1", "s", "gw"),
                flow("f2", "s", "gw"),
                flow("f3", "gw", "e1"),
                flow("f4", "gw", "e2"),
            ],
        ),
        vec![],
    );
    let r = flows(&mixed);
    assert!(has(&r, "flow/mixed-gateway"));
    assert!(!has(&r, "flow/no-start-event"));

    let pure_split = split(
        gw_el("gw", &["f1"], &["f2", "f3"]),
        flow("f2", "gw", "e1"),
        flow("f3", "gw", "e2"),
    );
    assert!(!has(&flows(&pure_split), "flow/mixed-gateway"));
}

// ── variable flow (variable-flow.test.ts) ───────────────────────────────────

#[test]
fn feel_identifiers() {
    assert!(extract_feel_identifiers("").is_empty());
    assert_eq!(
        extract_feel_identifiers(
            "is empty(items) and partition(xs, 2) != null and fromAi(toolCall.a)"
        ),
        vec!["items", "xs", "toolCall"]
    );
    assert_eq!(extract_feel_identifiers("= foo"), vec!["foo"]);
    assert_eq!(extract_feel_identifiers("a + b"), vec!["a", "b"]);
    assert_eq!(extract_feel_identifiers("order.status"), vec!["order"]);
    assert_eq!(extract_feel_identifiers("count(items)"), vec!["items"]);
    assert!(extract_feel_identifiers("true").is_empty());
}

#[test]
fn levenshtein_counts_edits() {
    assert_eq!(levenshtein("kitten", "sitting"), 3);
    assert_eq!(levenshtein("orderId", "orderID"), 1);
    assert_eq!(levenshtein("", "abc"), 3);
}

#[test]
fn undefined_variable_suggests_a_typo_fix() {
    let defs = make_defs(
        make_process(
            "proc",
            vec![
                start_el("s"),
                task_el(
                    "t1",
                    &["f1"],
                    &["f2"],
                    vec![
                        task_def_ext("a"),
                        io_ext(&[], &[("= result", "orderTotal")]),
                    ],
                ),
                task_el(
                    "t2",
                    &["f2"],
                    &["f3"],
                    vec![task_def_ext("b"), io_ext(&[("= orderTotl", "x")], &[])],
                ),
                end_el("e", &["f3"]),
            ],
            vec![
                flow("f1", "s", "t1"),
                flow("f2", "t1", "t2"),
                flow("f3", "t2", "e"),
            ],
        ),
        vec![],
    );
    let r = optimize(&defs, &only(&[Category::DataFlow]));
    let f = find(&r, "data-flow/undefined-variable:orderTotl").expect("undefined");
    assert_eq!(
        f.data.suggestion,
        "\"orderTotl\" is never set. Did you mean \"orderTotal\"?"
    );
    let scope = find(&r, "data-flow/edge-scope:f2").expect("scope");
    assert_eq!(
        scope.data.produces.as_deref(),
        Some(&["orderTotal".to_owned()][..])
    );
}
