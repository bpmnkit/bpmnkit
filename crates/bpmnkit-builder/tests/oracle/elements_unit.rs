//! Oracle tests for `elements.rs`, compiled as its child module (the module is crate-private,
//! so an integration test cannot reach it). Expected values come from `elements.mjs`, which
//! drives TS's `ProcessBuilder`; each step is replayed here with the factories, then the scope
//! is finalised and message subscriptions are hoisted as `build()` does.

use super::*;
use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{BpmnProcess, BpmnProcessContents};
use serde::Deserialize;

#[derive(Deserialize)]
struct Fixture {
    cases: Vec<Case>,
    nested: Nested,
}

#[derive(Deserialize)]
struct Case {
    name: String,
    steps: Vec<Step>,
    ok: Option<Expected>,
    error: Option<String>,
}

#[derive(Deserialize)]
struct Step {
    method: String,
    id: String,
    args: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Expected {
    flow_elements: String,
    sequence_flows: String,
    extension_elements: String,
    messages: String,
    errors: String,
    signals: String,
    escalations: String,
}

#[derive(Deserialize)]
struct Nested {
    joins: String,
    parallel: String,
    #[serde(rename = "eventBased")]
    event_based: String,
    sub: NestedSub,
}

#[derive(Deserialize)]
struct NestedSub {
    process: String,
    messages: String,
}

fn fixture() -> Fixture {
    serde_json::from_str(include_str!("elements.json")).expect("elements.json")
}

fn opts<T: serde::de::DeserializeOwned>(step: &Step, at: usize) -> Option<T> {
    let text = step.args.get(at)?;
    if text == "null" {
        return None;
    }
    Some(serde_json::from_str(text).expect("options"))
}

fn parse<T: serde::de::DeserializeOwned>(text: &str) -> T {
    serde_json::from_str(text).expect("expected json")
}

/// `Debug` shows IndexMap entries in order, which `PartialEq` ignores; attribute order is
/// part of the XML output, so compare both.
fn same<T: std::fmt::Debug + PartialEq>(what: &str, actual: &T, expected: &T) {
    assert_eq!(actual, expected, "{what}");
    assert_eq!(
        format!("{actual:#?}"),
        format!("{expected:#?}"),
        "{what}: order"
    );
}

/// The scope state `ProcessBuilder` keeps while chaining (`lastNodeId` and the flows it adds).
#[derive(Default)]
struct Scope {
    shared: Shared,
    elements: Vec<BpmnFlowElement>,
    flows: Vec<BpmnSequenceFlow>,
    last: Option<String>,
}

impl Scope {
    fn flow(&mut self, from: &str, to: &str) {
        self.flows.push(BpmnSequenceFlow {
            id: generate_id("Flow"),
            source_ref: from.to_owned(),
            target_ref: to.to_owned(),
            ..BpmnSequenceFlow::default()
        });
    }

    /// `addFlowElement` (compensation handlers aside: the cases only put one first).
    fn chain(&mut self, el: BpmnFlowElement) {
        let id = el.base().id.clone();
        let link_catch = is_link_event(&el, BpmnElementType::IntermediateCatchEvent);
        let link_throw = is_link_event(&el, BpmnElementType::IntermediateThrowEvent);
        let compensation = el.base().is_for_compensation == Some(true);
        self.elements.push(el);
        if compensation {
            self.last = None;
            return;
        }
        if link_catch {
            self.last = Some(id);
            return;
        }
        if let Some(last) = self.last.clone() {
            self.flow(&last, &id);
        }
        self.last = if link_throw { None } else { Some(id) };
    }

    fn step(&mut self, step: &Step) -> Result<(), String> {
        let id = step.id.as_str();
        let s = &mut self.shared;
        let el = match step.method.as_str() {
            "serviceTask" => make_service_task_el(id, &opts(step, 0).unwrap_or_default())?,
            "scriptTask" => make_script_task_el(id, &opts(step, 0).unwrap_or_default())?,
            "userTask" => make_user_task_el(id, opts(step, 0).as_ref(), s)?,
            "businessRuleTask" => make_business_rule_task_el(id, opts(step, 0).as_ref())?,
            "callActivity" => make_call_activity_el(id, &opts(step, 0).unwrap_or_default())?,
            "sendTask" => make_send_task_el(id, opts(step, 0).as_ref(), s)?,
            "receiveTask" => make_receive_task_el(id, opts(step, 0).as_ref(), s)?,
            "manualTask" => {
                make_plain_task_el(id, BpmnElementType::ManualTask, opts(step, 0).as_ref())?
            }
            "task" => make_plain_task_el(id, BpmnElementType::Task, opts(step, 0).as_ref())?,
            "exclusiveGateway" => make_defaultable_gateway_el(
                id,
                BpmnElementType::ExclusiveGateway,
                opts(step, 0).as_ref(),
            )?,
            "inclusiveGateway" => make_defaultable_gateway_el(
                id,
                BpmnElementType::InclusiveGateway,
                opts(step, 0).as_ref(),
            )?,
            "complexGateway" => make_defaultable_gateway_el(
                id,
                BpmnElementType::ComplexGateway,
                opts(step, 0).as_ref(),
            )?,
            "parallelGateway" => make_flow_element(
                id,
                BpmnElementType::ParallelGateway,
                opts::<ElementOptions>(step, 0)
                    .as_ref()
                    .map(FlowElementOptions::from)
                    .unwrap_or_default(),
            )?,
            "eventBasedGateway" => make_flow_element(
                id,
                BpmnElementType::EventBasedGateway,
                opts::<ElementOptions>(step, 0)
                    .as_ref()
                    .map(FlowElementOptions::from)
                    .unwrap_or_default(),
            )?,
            "startEvent" => {
                let options: Option<StartEventOptions> = opts(step, 0);
                let mut el = make_start_event_el(id, options.as_ref())?;
                if let (Some(o), BpmnFlowElement::StartEvent(start)) = (&options, &mut el) {
                    start.event_definitions =
                        build_event_definitions(&EventDefinitionOptions::from(o), s);
                    if o.is_interrupting == Some(false) {
                        start.is_interrupting = Some(false);
                    }
                }
                el
            }
            "endEvent" => make_end_event_el(id, opts(step, 0).as_ref(), s)?,
            "intermediateThrowEvent" => {
                make_intermediate_throw_event_el(id, opts(step, 0).as_ref(), s)?
            }
            "intermediateCatchEvent" => {
                make_intermediate_catch_event_el(id, opts(step, 0).as_ref(), s)?
            }
            "boundaryEvent" => {
                let el = make_boundary_event_el(id, &opts(step, 0).unwrap_or_default(), s)?;
                self.elements.push(el);
                self.last = Some(id.to_owned());
                return Ok(());
            }
            "dataObject" => {
                let el = make_data_element(
                    id,
                    BpmnElementType::DataObject,
                    None,
                    opts(step, 0).as_ref(),
                );
                self.elements.push(el);
                return Ok(());
            }
            "dataObjectReference" | "dataStoreReference" => {
                let target: String = opts(step, 0).expect("ref");
                let ty = if step.method == "dataObjectReference" {
                    BpmnElementType::DataObjectReference
                } else {
                    BpmnElementType::DataStoreReference
                };
                let el = make_data_element(id, ty, Some(&target), opts(step, 1).as_ref());
                self.elements.push(el);
                return Ok(());
            }
            "adHocSubProcess" => {
                return record_tool_grid(s, id, opts(step, 0).as_ref());
            }
            other => panic!("unhandled method {other}"),
        };
        self.chain(el);
        Ok(())
    }

    fn finish(&mut self) -> Result<Vec<XmlElement>, String> {
        finalize_scope(&mut self.elements, &mut self.flows, &mut self.shared)?;
        embedded_form_elements(&self.elements, &self.shared)
    }
}

fn definitions(scope: &Scope, process: BpmnProcess) -> BpmnDefinitions {
    BpmnDefinitions {
        errors: scope.shared.errors.clone(),
        escalations: scope.shared.escalations.clone(),
        messages: scope.shared.messages.clone(),
        signals: scope.shared.signals.clone(),
        processes: vec![process],
        ..BpmnDefinitions::default()
    }
}

fn run_case(case: &Case) -> Result<(BpmnDefinitions, Vec<XmlElement>), String> {
    reset_id_counter();
    let mut scope = Scope::default();
    for step in &case.steps {
        scope.step(step)?;
    }
    let ext = scope.finish()?;
    let process = BpmnProcess {
        id: "p".to_owned(),
        contents: BpmnProcessContents {
            flow_elements: scope.elements.clone(),
            sequence_flows: scope.flows.clone(),
            ..BpmnProcessContents::default()
        },
        ..BpmnProcess::default()
    };
    Ok((
        hoist_message_subscriptions(definitions(&scope, process)),
        ext,
    ))
}

#[test]
fn factories_match_ts_builder() {
    for case in fixture().cases {
        let actual = run_case(&case);
        match (&case.error, &case.ok, actual) {
            (Some(message), _, Err(got)) => assert_eq!(&got, message, "{}", case.name),
            (Some(message), _, Ok(_)) => panic!("{}: expected error {message}", case.name),
            (None, _, Err(got)) => panic!("{}: unexpected error {got}", case.name),
            (None, Some(expected), Ok((defs, ext))) => {
                let name = &case.name;
                let process = &defs.processes[0];
                same(
                    &format!("{name}: flowElements"),
                    &process.contents.flow_elements,
                    &parse::<Vec<BpmnFlowElement>>(&expected.flow_elements),
                );
                same(
                    &format!("{name}: sequenceFlows"),
                    &process.contents.sequence_flows,
                    &parse::<Vec<BpmnSequenceFlow>>(&expected.sequence_flows),
                );
                same(
                    &format!("{name}: process extensionElements"),
                    &ext,
                    &parse::<Vec<XmlElement>>(&expected.extension_elements),
                );
                same(
                    &format!("{name}: messages"),
                    &defs.messages,
                    &parse::<Vec<BpmnMessage>>(&expected.messages),
                );
                same(
                    &format!("{name}: errors"),
                    &defs.errors,
                    &parse::<Vec<BpmnError>>(&expected.errors),
                );
                same(
                    &format!("{name}: signals"),
                    &defs.signals,
                    &parse::<Vec<BpmnSignal>>(&expected.signals),
                );
                same(
                    &format!("{name}: escalations"),
                    &defs.escalations,
                    &parse::<Vec<BpmnEscalation>>(&expected.escalations),
                );
            }
            (None, None, Ok(_)) => panic!("{}: fixture has neither ok nor error", case.name),
        }
    }
}

fn task(id: &str) -> BpmnFlowElement {
    make_plain_task_el(id, BpmnElementType::Task, None).expect("task")
}

fn flow(from: &str, to: &str) -> BpmnSequenceFlow {
    BpmnSequenceFlow {
        id: generate_id("Flow"),
        source_ref: from.to_owned(),
        target_ref: to.to_owned(),
        ..BpmnSequenceFlow::default()
    }
}

fn process_of(
    id: &str,
    elements: Vec<BpmnFlowElement>,
    flows: Vec<BpmnSequenceFlow>,
    ext: Vec<XmlElement>,
) -> BpmnProcess {
    BpmnProcess {
        id: id.to_owned(),
        is_executable: Some(true),
        extension_elements: ext,
        contents: BpmnProcessContents {
            flow_elements: elements,
            sequence_flows: flows,
            ..BpmnProcessContents::default()
        },
        ..BpmnProcess::default()
    }
}

fn gateway(id: &str, ty: BpmnElementType) -> BpmnFlowElement {
    make_flow_element(id, ty, FlowElementOptions::default()).expect("gateway")
}

#[test]
fn join_gateways_are_inferred_like_ts() {
    let nested = fixture().nested;

    // exclusive split, two branches, converging on E: an exclusive join is added.
    reset_id_counter();
    let mut shared = Shared::default();
    let mut a = flow("gw", "A");
    a.name = Some("a".to_owned());
    a.condition_expression = Some(make_condition_expression("x"));
    let mut b = flow("gw", "B");
    b.name = Some("b".to_owned());
    let mut elements = vec![
        gateway("gw", BpmnElementType::ExclusiveGateway),
        task("A"),
        task("B"),
        task("E"),
    ];
    let mut flows = vec![a, b, flow("A", "E"), flow("B", "E")];
    finalize_scope(&mut elements, &mut flows, &mut shared).expect("finalize");
    same(
        "joins",
        &process_of("j", elements, flows, vec![]),
        &parse::<BpmnProcess>(&nested.joins),
    );

    // The converging element is already a parallel gateway: no join is added.
    reset_id_counter();
    let mut elements = vec![
        gateway("fork", BpmnElementType::ParallelGateway),
        task("A"),
        task("B"),
        gateway("join", BpmnElementType::ParallelGateway),
    ];
    let mut flows = vec![
        flow("fork", "A"),
        flow("fork", "B"),
        flow("A", "join"),
        flow("B", "join"),
    ];
    flows[0].name = Some("a".to_owned());
    flows[1].name = Some("b".to_owned());
    finalize_scope(&mut elements, &mut flows, &mut shared).expect("finalize");
    same(
        "parallel",
        &process_of("j2", elements, flows, vec![]),
        &parse::<BpmnProcess>(&nested.parallel),
    );

    // Event-based gateway: traced back through the catch events, joined with an XOR.
    reset_id_counter();
    let mut shared = Shared::default();
    let c1 = make_intermediate_catch_event_el(
        "C1",
        Some(&IntermediateCatchEventOptions {
            timer_duration: Some("PT1M".to_owned()),
            ..IntermediateCatchEventOptions::default()
        }),
        &mut shared,
    )
    .expect("c1");
    let c2 = make_intermediate_catch_event_el(
        "C2",
        Some(&IntermediateCatchEventOptions {
            message_name: Some("m".to_owned()),
            correlation_key: Some("=k".to_owned()),
            ..IntermediateCatchEventOptions::default()
        }),
        &mut shared,
    )
    .expect("c2");
    let mut elements = vec![
        gateway("eb", BpmnElementType::EventBasedGateway),
        c1,
        task("A"),
        c2,
        task("B"),
        task("Z"),
    ];
    let mut flows = vec![
        flow("eb", "C1"),
        flow("C1", "A"),
        flow("eb", "C2"),
        flow("C2", "B"),
        flow("A", "Z"),
        flow("B", "Z"),
    ];
    flows[0].name = Some("a".to_owned());
    flows[2].name = Some("b".to_owned());
    finalize_scope(&mut elements, &mut flows, &mut shared).expect("finalize");
    // The build hoists C2's subscription onto its message, so the expected process has none.
    let hoisted = hoist_message_subscriptions(BpmnDefinitions {
        messages: shared.messages.clone(),
        processes: vec![process_of("j3", elements, flows, vec![])],
        ..BpmnDefinitions::default()
    });
    same(
        "event based",
        &hoisted.processes[0],
        &parse::<BpmnProcess>(&nested.event_based),
    );
}

#[test]
fn nested_forms_and_subscriptions_are_hoisted_from_containers() {
    let nested = fixture().nested.sub;
    reset_id_counter();
    let mut shared = Shared::default();
    let user = make_user_task_el(
        "u",
        Some(&UserTaskOptions {
            embedded_form: Some(EmbeddedForm {
                id: "nf".to_owned(),
                schema: "SCHEMA".to_owned(),
            }),
            ..UserTaskOptions::default()
        }),
        &mut shared,
    )
    .expect("user");
    let receive = make_receive_task_el(
        "r",
        Some(&MessageTaskOptions {
            message_name: Some("Nested".to_owned()),
            correlation_key: Some("=k".to_owned()),
            ..MessageTaskOptions::default()
        }),
        &mut shared,
    )
    .expect("receive");
    let mut inner = vec![user, receive];
    let mut inner_flows = vec![flow("u", "r")];
    finalize_scope(&mut inner, &mut inner_flows, &mut shared).expect("inner");

    let mut sp = create_flow_element(
        "sp",
        BpmnElementType::SubProcess,
        CreateFlowElementOptions::default(),
    );
    if let Some(contents) = sp.contents_mut() {
        contents.flow_elements = inner;
        contents.sequence_flows = inner_flows;
    }
    let mut outer = vec![sp];
    let mut outer_flows = vec![];
    finalize_scope(&mut outer, &mut outer_flows, &mut shared).expect("outer");
    let ext = embedded_form_elements(&outer, &shared).expect("forms");
    let defs = BpmnDefinitions {
        messages: shared.messages.clone(),
        processes: vec![process_of("n", outer, outer_flows, ext)],
        ..BpmnDefinitions::default()
    };
    let defs = hoist_message_subscriptions(defs);
    same(
        "nested process",
        &defs.processes[0],
        &parse::<BpmnProcess>(&nested.process),
    );
    same(
        "nested messages",
        &defs.messages,
        &parse::<Vec<BpmnMessage>>(&nested.messages),
    );
}

#[test]
fn root_declarations_follow_ts_rules() {
    let ids = ["Message_a", "Message_b"];
    assert_eq!(
        can_declare_root("Message", "a", "Message_a", Some("Message_a"), ids),
        Ok(false)
    );
    assert_eq!(
        can_declare_root("Message", "a", "Message_x", Some("Message_a"), ids),
        Err("Message \"a\" is already declared as \"Message_a\". Declare it before the events that use it, or name that id instead.".to_owned())
    );
    assert_eq!(
        can_declare_root("Message", "z", "Message_b", None, ids),
        Err("Duplicate Message id \"Message_b\".".to_owned())
    );
    assert_eq!(
        can_declare_root("Message", "z", "Message_z", None, ids),
        Ok(true)
    );
}

#[test]
fn merge_root_definitions_skips_known_ids() {
    let mut into = vec![BpmnSignal {
        id: "a".to_owned(),
        ..BpmnSignal::default()
    }];
    let incoming: Vec<BpmnSignal> = ["b", "a", "b", "c"]
        .iter()
        .map(|id| BpmnSignal {
            id: (*id).to_owned(),
            ..BpmnSignal::default()
        })
        .collect();
    merge_root_definitions(&mut into, &incoming, |s| s.id.as_str());
    let ids: Vec<&str> = into.iter().map(|s| s.id.as_str()).collect();
    assert_eq!(ids, ["a", "b", "c"]);
}

#[test]
fn trace_back_stops_on_cycles_and_merges() {
    let splits: IndexSet<String> = ["s".to_owned()].into_iter().collect();
    let flows = vec![flow("x", "y"), flow("y", "x")];
    assert_eq!(trace_back_to_split("x", &splits, &flows), None);
    let flows = vec![flow("s", "a"), flow("a", "b")];
    assert_eq!(
        trace_back_to_split("b", &splits, &flows),
        Some("s".to_owned())
    );
    let flows = vec![flow("s", "a"), flow("t", "a"), flow("a", "b")];
    assert_eq!(trace_back_to_split("b", &splits, &flows), None);
    assert_eq!(trace_back_to_split("", &splits, &flows), None);
}

#[test]
fn tool_grid_is_recorded_when_valid() {
    let mut shared = Shared::default();
    let options = AdHocSubProcessOptions {
        tool_grid: Some(ToolGridOptions {
            columns: Some(3.0),
            fill: Some(ToolGridFill::Column),
        }),
        ..AdHocSubProcessOptions::default()
    };
    record_tool_grid(&mut shared, "ah", Some(&options)).expect("valid");
    assert_eq!(shared.grids.get("ah").and_then(|g| g.columns), Some(3));
    assert_eq!(record_tool_grid(&mut shared, "x", None), Ok(()));
    assert_eq!(shared.grids.len(), 1);
}

#[test]
fn recompute_prefers_the_last_duplicate_id() {
    let mut elements = vec![task("a"), task("a"), task("b")];
    let flows = vec![flow("a", "b"), flow("b", "zz")];
    recompute_incoming_outgoing(&mut elements, &flows);
    assert!(elements[0].base().outgoing.is_empty());
    assert_eq!(elements[1].base().outgoing, [flows[0].id.clone()]);
    assert_eq!(elements[2].base().incoming, [flows[0].id.clone()]);
    assert_eq!(elements[2].base().outgoing, [flows[1].id.clone()]);
}
