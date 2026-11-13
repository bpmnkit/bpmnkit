//! `optimize/flow.ts`: reachability, dead ends, joins and redundant gateways.

use super::utils::*;
use super::ResolvedOptions;
use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_bpmn::{
    BpmnBounds, BpmnDiEdge, BpmnDiShape, BpmnEvent, BpmnFlowElement, BpmnFlowNodeBase, BpmnGateway,
    BpmnProcess, BpmnSequenceFlow, BpmnWaypoint,
};
use std::collections::HashMap;

fn shape(id: String, bpmn_element: String, bounds: BpmnBounds) -> BpmnDiShape {
    BpmnDiShape {
        id,
        bpmn_element,
        is_marker_visible: None,
        is_expanded: None,
        is_horizontal: None,
        bounds,
        label: None,
        unknown_attributes: Default::default(),
    }
}

fn wp(x: f64, y: f64) -> BpmnWaypoint {
    BpmnWaypoint {
        x,
        y,
        unknown_attributes: None,
    }
}

fn edge(id: String, bpmn_element: String, waypoints: Vec<BpmnWaypoint>) -> BpmnDiEdge {
    BpmnDiEdge {
        id,
        bpmn_element,
        waypoints,
        ..Default::default()
    }
}

fn seq_flow(id: String, source_ref: String, target_ref: String) -> BpmnSequenceFlow {
    BpmnSequenceFlow {
        id,
        source_ref,
        target_ref,
        ..Default::default()
    }
}

pub fn analyze_flow(p: &BpmnProcess, _opts: &ResolvedOptions) -> Vec<Finding> {
    let mut findings = vec![];
    let process_id = p.id.as_str();
    let idx = build_flow_index(p);
    let elements = &p.contents.flow_elements;

    let start_ids: Vec<&str> = elements
        .iter()
        .filter(|e| e.type_name() == "startEvent")
        .map(|e| e.base().id.as_str())
        .collect();

    if start_ids.is_empty() {
        findings.push(finding(
            "flow/no-start-event",
            Category::Flow,
            Severity::Error,
            format!("Process \"{process_id}\" has no start event."),
            "Add a start event to define where the process begins.",
            process_id,
            vec![],
        ));
    }
    if !elements.iter().any(|e| e.type_name() == "endEvent") {
        findings.push(finding(
            "flow/no-end-event",
            Category::Flow,
            Severity::Warning,
            format!("Process \"{process_id}\" has no end event."),
            "Add an end event to properly terminate the process.",
            process_id,
            vec![],
        ));
    }

    // Boundary events attach by `attachedToRef`, not by a flow: give each host a
    // synthetic edge to them, or every boundary path would read as unreachable.
    let mut successors: HashMap<&str, Vec<&str>> = HashMap::new();
    for flow in &p.contents.sequence_flows {
        successors
            .entry(&flow.source_ref)
            .or_default()
            .push(&flow.target_ref);
    }
    for el in elements {
        if let BpmnFlowElement::BoundaryEvent(b) = el {
            successors
                .entry(&b.attached_to_ref)
                .or_default()
                .push(&b.base.id);
        }
    }
    let reachable = reachable_from(&start_ids, &successors);

    for el in elements {
        let id = el.base().id.as_str();
        let ty = el.type_name();

        // Data elements sit beside the flow: no sequence flow in or out, by design.
        if matches!(
            ty,
            "dataObject" | "dataObjectReference" | "dataStoreReference"
        ) {
            continue;
        }

        if !reachable.contains(id) {
            findings.push(finding(
                "flow/unreachable",
                Category::Flow,
                Severity::Error,
                format!("Element \"{id}\" ({ty}) is not reachable from any start event."),
                "Connect this element to the process flow or remove it.",
                process_id,
                vec![id.to_owned()],
            ));
        }

        let outflows = idx.outgoing(id);
        if ty != "endEvent" && outflows.is_empty() {
            findings.push(
                finding(
                    "flow/dead-end",
                    Category::Flow,
                    Severity::Warning,
                    format!("Element \"{id}\" ({ty}) has no outgoing sequence flows."),
                    "Connect this element to a downstream element or an end event.",
                    process_id,
                    vec![id.to_owned()],
                )
                .with_fix(dead_end_fix(process_id.to_owned(), id.to_owned())),
            );
        }

        let inflows = idx.incoming(id);
        if !is_gateway(ty) && ty != "startEvent" && inflows.len() > 1 {
            findings.push(
                finding(
                    "flow/multi-incoming-task",
                    Category::Flow,
                    Severity::Error,
                    format!(
                        "Element \"{id}\" ({ty}) has {} incoming flows. Non-gateway elements must have at most one incoming flow.",
                        inflows.len()
                    ),
                    "Add an exclusive gateway before this element to join the incoming flows.",
                    process_id,
                    vec![id.to_owned()],
                )
                .with_fix(multi_incoming_fix(process_id.to_owned(), id.to_owned(), inflows.len())),
            );
        }

        if is_gateway(ty) && inflows.len() == 1 && outflows.len() == 1 {
            findings.push(
                finding(
                    "flow/redundant-gateway",
                    Category::Flow,
                    Severity::Info,
                    format!(
                        "Gateway \"{id}\" ({ty}) has only 1 incoming and 1 outgoing flow — it is redundant."
                    ),
                    "Remove this gateway and connect its source directly to its target.",
                    process_id,
                    vec![id.to_owned()],
                )
                .with_fix(redundant_gateway_fix(
                    process_id.to_owned(),
                    id.to_owned(),
                    inflows[0].id.clone(),
                    outflows[0].id.clone(),
                )),
            );
        }

        if is_gateway(ty) && inflows.len() >= 2 && outflows.len() >= 2 {
            findings.push(finding(
                "flow/mixed-gateway",
                Category::Flow,
                Severity::Warning,
                format!(
                    "Gateway \"{id}\" ({ty}) has {} incoming and {} outgoing flows — it acts as both a join and a split simultaneously.",
                    inflows.len(),
                    outflows.len()
                ),
                "Separate into two gateways: one join (merging incoming flows) followed by one split (branching outgoing flows).",
                process_id,
                vec![id.to_owned()],
            ));
        }

        let empty = match el {
            BpmnFlowElement::SubProcess(s) => s.contents.flow_elements.is_empty(),
            BpmnFlowElement::AdHocSubProcess(s) => s.contents.flow_elements.is_empty(),
            BpmnFlowElement::Transaction(s) => s.contents.flow_elements.is_empty(),
            _ => false,
        };
        if empty {
            findings.push(finding(
                "flow/empty-subprocess",
                Category::Flow,
                Severity::Warning,
                format!("Sub-process \"{id}\" ({ty}) contains no flow elements."),
                "Add flow elements inside the sub-process or remove it.",
                process_id,
                vec![id.to_owned()],
            ));
        }
    }

    findings
}

fn dead_end_fix(
    process_id: String,
    dead_end_id: String,
) -> impl Fn(&mut bpmnkit_bpmn::BpmnDefinitions) -> crate::ApplyFixResult + Send + Sync {
    move |defs| {
        let Some(proc) = find_process(defs, &process_id) else {
            return fix_result("Process not found");
        };
        let end_event_id = generate_id("EndEvent");
        let flow_id = generate_id("Flow");

        let end_event = BpmnFlowElement::EndEvent(BpmnEvent {
            base: BpmnFlowNodeBase {
                id: end_event_id.clone(),
                incoming: vec![flow_id.clone()],
                ..Default::default()
            },
            event_definitions: vec![],
        });
        if let Some(dead) = find_element(proc, &dead_end_id) {
            base_mut(dead).outgoing.push(flow_id.clone());
        }
        proc.contents.flow_elements.push(end_event);
        proc.contents.sequence_flows.push(seq_flow(
            flow_id.clone(),
            dead_end_id.clone(),
            end_event_id.clone(),
        ));

        if let Some(plane) = find_di_plane(defs, &process_id) {
            let src = plane
                .shapes
                .iter()
                .find(|s| s.bpmn_element == dead_end_id)
                .map(|s| s.bounds.clone());
            let (src_right, src_mid_y, end_x) = match &src {
                Some(b) => (b.x + b.width, b.y + b.height / 2.0, b.x + b.width + 150.0),
                None => (300.0, 220.0, 450.0),
            };
            let end_y = src_mid_y - 18.0;
            plane.shapes.push(shape(
                format!("{end_event_id}_di"),
                end_event_id.clone(),
                BpmnBounds {
                    x: end_x,
                    y: end_y,
                    width: 36.0,
                    height: 36.0,
                },
            ));
            plane.edges.push(edge(
                format!("{flow_id}_di"),
                flow_id.clone(),
                vec![wp(src_right, src_mid_y), wp(end_x, src_mid_y)],
            ));
        }

        fix_result(format!(
            "Added end event \"{end_event_id}\" connected from \"{dead_end_id}\""
        ))
    }
}

fn multi_incoming_fix(
    process_id: String,
    el_id: String,
    inflow_count: usize,
) -> impl Fn(&mut bpmnkit_bpmn::BpmnDefinitions) -> crate::ApplyFixResult + Send + Sync {
    move |defs| {
        let Some(proc) = find_process(defs, &process_id) else {
            return fix_result("Process not found");
        };
        let Some(target) = find_element(proc, &el_id) else {
            return fix_result("Element not found");
        };
        let old_incoming_ids = target.base().incoming.clone();
        let gateway_id = generate_id("Gateway");
        let join_flow_id = generate_id("Flow");
        base_mut(target).incoming = vec![join_flow_id.clone()];

        for flow_id in &old_incoming_ids {
            if let Some(f) = proc
                .contents
                .sequence_flows
                .iter_mut()
                .find(|f| &f.id == flow_id)
            {
                f.target_ref = gateway_id.clone();
            }
        }
        proc.contents
            .flow_elements
            .push(BpmnFlowElement::ExclusiveGateway(BpmnGateway {
                base: BpmnFlowNodeBase {
                    id: gateway_id.clone(),
                    incoming: old_incoming_ids.clone(),
                    outgoing: vec![join_flow_id.clone()],
                    ..Default::default()
                },
                default: None,
            }));
        proc.contents.sequence_flows.push(seq_flow(
            join_flow_id.clone(),
            gateway_id.clone(),
            el_id.clone(),
        ));

        if let Some(plane) = find_di_plane(defs, &process_id) {
            if let Some(tgt) = plane
                .shapes
                .iter()
                .find(|s| s.bpmn_element == el_id)
                .map(|s| s.bounds.clone())
            {
                let (gw_w, gw_h) = (50.0, 50.0);
                let gw_x = tgt.x - 100.0;
                let gw_y = tgt.y + (tgt.height - gw_h) / 2.0;
                let mut gw_shape = shape(
                    format!("{gateway_id}_di"),
                    gateway_id.clone(),
                    BpmnBounds {
                        x: gw_x,
                        y: gw_y,
                        width: gw_w,
                        height: gw_h,
                    },
                );
                // The bpmn-js Viewer draws the "X" only when the shape says so.
                gw_shape.is_marker_visible = Some(true);
                plane.shapes.push(gw_shape);
                for in_flow_id in &old_incoming_ids {
                    if let Some(last) = plane
                        .edges
                        .iter_mut()
                        .find(|e| &e.bpmn_element == in_flow_id)
                        .and_then(|e| e.waypoints.last_mut())
                    {
                        last.x = gw_x + gw_w / 2.0;
                        last.y = gw_y + gw_h / 2.0;
                    }
                }
                plane.edges.push(edge(
                    format!("{join_flow_id}_di"),
                    join_flow_id.clone(),
                    vec![
                        wp(gw_x + gw_w, gw_y + gw_h / 2.0),
                        wp(tgt.x, tgt.y + tgt.height / 2.0),
                    ],
                ));
            }
        }

        fix_result(format!(
            "Inserted exclusive gateway \"{gateway_id}\" before \"{el_id}\" to join {inflow_count} incoming flows"
        ))
    }
}

fn redundant_gateway_fix(
    process_id: String,
    gw_id: String,
    in_flow_id: String,
    out_flow_id: String,
) -> impl Fn(&mut bpmnkit_bpmn::BpmnDefinitions) -> crate::ApplyFixResult + Send + Sync {
    move |defs| {
        let Some(proc) = find_process(defs, &process_id) else {
            return fix_result("Process not found");
        };
        let flows = &proc.contents.sequence_flows;
        let (Some(in_flow), Some(out_flow)) = (
            flows.iter().find(|f| f.id == in_flow_id),
            flows.iter().find(|f| f.id == out_flow_id),
        ) else {
            return fix_result("Flows not found");
        };
        let src_id = in_flow.source_ref.clone();
        let tgt_id = out_flow.target_ref.clone();
        let new_flow_id = generate_id("Flow");

        proc.contents.flow_elements.retain(|e| e.base().id != gw_id);
        proc.contents
            .sequence_flows
            .retain(|f| f.id != in_flow_id && f.id != out_flow_id);

        if let Some(src) = find_element(proc, &src_id) {
            let b = base_mut(src);
            b.outgoing.retain(|id| id != &in_flow_id);
            b.outgoing.push(new_flow_id.clone());
        }
        if let Some(tgt) = find_element(proc, &tgt_id) {
            let b = base_mut(tgt);
            b.incoming.retain(|id| id != &out_flow_id);
            b.incoming.push(new_flow_id.clone());
        }
        proc.contents.sequence_flows.push(seq_flow(
            new_flow_id.clone(),
            src_id.clone(),
            tgt_id.clone(),
        ));

        if let Some(plane) = find_di_plane(defs, &process_id) {
            plane.shapes.retain(|s| s.bpmn_element != gw_id);
            plane
                .edges
                .retain(|e| e.bpmn_element != in_flow_id && e.bpmn_element != out_flow_id);
            let find = |id: &str| {
                plane
                    .shapes
                    .iter()
                    .find(|s| s.bpmn_element == id)
                    .map(|s| s.bounds.clone())
            };
            if let (Some(s), Some(t)) = (find(&src_id), find(&tgt_id)) {
                plane.edges.push(edge(
                    format!("{new_flow_id}_di"),
                    new_flow_id.clone(),
                    vec![
                        wp(s.x + s.width, s.y + s.height / 2.0),
                        wp(t.x, t.y + t.height / 2.0),
                    ],
                ));
            }
        }

        fix_result(format!(
            "Removed redundant gateway \"{gw_id}\" and connected \"{src_id}\" → \"{tgt_id}\""
        ))
    }
}
