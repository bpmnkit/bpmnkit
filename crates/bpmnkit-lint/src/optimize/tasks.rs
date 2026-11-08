//! `optimize/tasks.ts`: similar service tasks that could become one call activity.

use super::utils::*;
use super::ResolvedOptions;
use crate::{ApplyFixResult, Category, Finding, Severity};
use bpmnkit_bpmn::ids::generate_id;
use bpmnkit_bpmn::{
    BpmnActivity, BpmnBounds, BpmnDefinitions, BpmnDiEdge, BpmnDiPlane, BpmnDiShape, BpmnDiagram,
    BpmnEvent, BpmnFlowElement, BpmnFlowNodeBase, BpmnProcess, BpmnProcessContents,
    BpmnSequenceFlow, BpmnStartEvent, BpmnWaypoint, XmlElement,
};
use indexmap::IndexMap;
use std::collections::HashSet;

fn header_keys(ext: &[XmlElement]) -> HashSet<String> {
    read_zeebe_task_headers(ext)
        .map(|h| h.headers.into_iter().map(|h| h.key).collect())
        .unwrap_or_default()
}

fn sorted_targets(ext: &[XmlElement], outputs: bool) -> Vec<String> {
    let mut t: Vec<String> = read_zeebe_io_mapping(ext)
        .map(|io| if outputs { io.outputs } else { io.inputs })
        .unwrap_or_default()
        .into_iter()
        .map(|e| e.target)
        .collect();
    js_sort(&mut t);
    t
}

/// Score in [0, 1], or `None` when the job types differ.
fn compute_similarity(a: &BpmnActivity, b: &BpmnActivity) -> Option<f64> {
    let (ea, eb) = (&a.base.extension_elements, &b.base.extension_elements);
    let ta = read_zeebe_task_type(ea)?;
    if Some(ta) != read_zeebe_task_type(eb) {
        return None;
    }
    let mut score = 0.5;
    if header_keys(ea) == header_keys(eb) {
        score += 0.2;
    }
    if sorted_targets(ea, false) == sorted_targets(eb, false) {
        score += 0.15;
    }
    if sorted_targets(ea, true) == sorted_targets(eb, true) {
        score += 0.15;
    }
    Some(score)
}

/// Connected components above `threshold`, bucketed by job type first since
/// similarity needs an identical one; reported in order of their first member.
fn cluster(tasks: &[&BpmnActivity], threshold: f64) -> Vec<Vec<usize>> {
    let mut by_type: IndexMap<String, Vec<usize>> = IndexMap::new();
    let mut clusters: Vec<Vec<usize>> = vec![];
    for (i, t) in tasks.iter().enumerate() {
        match read_zeebe_task_type(&t.base.extension_elements) {
            None => clusters.push(vec![i]),
            Some(ty) => by_type.entry(ty).or_default().push(i),
        }
    }
    for bucket in by_type.values() {
        let n = bucket.len();
        let mut visited = vec![false; n];
        for i in 0..n {
            if visited[i] {
                continue;
            }
            visited[i] = true;
            let mut queue = vec![i];
            let mut head = 0;
            while head < queue.len() {
                let curr = queue[head];
                head += 1;
                for j in 0..n {
                    if visited[j] {
                        continue;
                    }
                    let s = compute_similarity(tasks[bucket[curr]], tasks[bucket[j]]);
                    if s.is_some_and(|s| s >= threshold) {
                        visited[j] = true;
                        queue.push(j);
                    }
                }
            }
            clusters.push(queue.into_iter().map(|q| bucket[q]).collect());
        }
    }
    clusters.sort_by_key(|c| c[0]);
    clusters
}

fn shape(id: &str, x: f64, y: f64, width: f64, height: f64) -> BpmnDiShape {
    BpmnDiShape {
        id: format!("{id}_di"),
        bpmn_element: id.to_owned(),
        is_marker_visible: None,
        is_expanded: None,
        is_horizontal: None,
        bounds: BpmnBounds {
            x,
            y,
            width,
            height,
        },
        label: None,
        unknown_attributes: Default::default(),
    }
}

fn edge(id: &str, points: [(f64, f64); 2]) -> BpmnDiEdge {
    BpmnDiEdge {
        id: format!("{id}_di"),
        bpmn_element: id.to_owned(),
        waypoints: points
            .iter()
            .map(|&(x, y)| BpmnWaypoint {
                x,
                y,
                unknown_attributes: None,
            })
            .collect(),
        ..Default::default()
    }
}

fn flow(id: &str, source: &str, target: &str) -> BpmnSequenceFlow {
    BpmnSequenceFlow {
        id: id.to_owned(),
        source_ref: source.to_owned(),
        target_ref: target.to_owned(),
        ..Default::default()
    }
}

fn build_extracted_defs(
    name: Option<String>,
    extension_elements: Vec<XmlElement>,
    new_process_id: &str,
) -> BpmnDefinitions {
    let start_id = generate_id("StartEvent");
    let task_id = generate_id("ServiceTask");
    let end_id = generate_id("EndEvent");
    let flow1 = generate_id("Flow");
    let flow2 = generate_id("Flow");

    let node = |id: &str, incoming: &[&String], outgoing: &[&String]| BpmnFlowNodeBase {
        id: id.to_owned(),
        incoming: incoming.iter().map(|s| (*s).clone()).collect(),
        outgoing: outgoing.iter().map(|s| (*s).clone()).collect(),
        ..Default::default()
    };
    let start = BpmnFlowElement::StartEvent(BpmnStartEvent {
        base: node(&start_id, &[], &[&flow1]),
        ..Default::default()
    });
    let task = BpmnFlowElement::ServiceTask(BpmnActivity {
        base: BpmnFlowNodeBase {
            name,
            extension_elements,
            ..node(&task_id, &[&flow1], &[&flow2])
        },
        loop_characteristics: None,
    });
    let end = BpmnFlowElement::EndEvent(BpmnEvent {
        base: node(&end_id, &[&flow2], &[]),
        event_definitions: vec![],
    });

    let process = BpmnProcess {
        id: new_process_id.to_owned(),
        is_executable: Some(false),
        contents: BpmnProcessContents {
            flow_elements: vec![start, task, end],
            sequence_flows: vec![
                flow(&flow1, &start_id, &task_id),
                flow(&flow2, &task_id, &end_id),
            ],
            ..Default::default()
        },
        ..Default::default()
    };

    let diagram = BpmnDiagram {
        id: generate_id("BPMNDiagram"),
        plane: BpmnDiPlane {
            id: generate_id("BPMNPlane"),
            bpmn_element: new_process_id.to_owned(),
            shapes: vec![
                shape(&start_id, 152.0, 100.0, 36.0, 36.0),
                shape(&task_id, 260.0, 100.0, 100.0, 80.0),
                shape(&end_id, 432.0, 100.0, 36.0, 36.0),
            ],
            edges: vec![
                edge(&flow1, [(188.0, 118.0), (260.0, 118.0)]),
                edge(&flow2, [(360.0, 118.0), (432.0, 118.0)]),
            ],
            unknown_attributes: None,
        },
        unknown_attributes: None,
        unknown_children: vec![],
    };

    BpmnDefinitions {
        id: generate_id("Definitions"),
        target_namespace: "http://bpmn.io/schema/bpmn".into(),
        processes: vec![process],
        diagrams: vec![diagram],
        ..Default::default()
    }
}

/// Job types often hold ":" (connectors), which a BPMN id (an NCName) cannot: TS's
/// `replace(/[^\w.-]/g, "_")`, one `_` per UTF-16 unit.
fn id_safe(s: &str) -> String {
    s.chars()
        .flat_map(|c| {
            let keep = c.is_ascii_alphanumeric() || matches!(c, '_' | '.' | '-');
            let n = if keep { 0 } else { c.len_utf16() };
            std::iter::once(c)
                .filter(move |_| keep)
                .chain(std::iter::repeat_n('_', n))
        })
        .collect()
}

pub fn analyze_tasks(p: &BpmnProcess, opts: &ResolvedOptions) -> Vec<Finding> {
    let mut findings = vec![];
    let process_id = p.id.as_str();
    let service_tasks: Vec<&BpmnActivity> = p
        .contents
        .flow_elements
        .iter()
        .filter_map(|e| match e {
            BpmnFlowElement::ServiceTask(t) => Some(t),
            _ => None,
        })
        .collect();
    if service_tasks.len() < 2 {
        return findings;
    }

    for group in cluster(&service_tasks, 0.7) {
        if group.len() < opts.reuse_threshold {
            continue;
        }
        let rep = service_tasks[group[0]];
        let task_type =
            read_zeebe_task_type(&rep.base.extension_elements).unwrap_or_else(|| "Unknown".into());
        let element_ids: Vec<String> = group
            .iter()
            .map(|&i| service_tasks[i].base.id.clone())
            .collect();
        let count = group.len();
        let rep_name = rep.base.name.clone();
        let rep_ext = rep.base.extension_elements.clone();
        let pid = process_id.to_owned();
        let ids = element_ids.clone();
        let ty = task_type.clone();

        findings.push(
            finding(
                "task/reusable-group",
                Category::TaskReuse,
                Severity::Warning,
                format!(
                    "{count} service tasks share a similar configuration (taskType=\"{task_type}\") and could be reused via a call activity."
                ),
                "Extract the repeated service task into a reusable sub-process and replace occurrences with call activities.",
                process_id,
                element_ids,
            )
            .with_fix(move |defs| {
                let Some(proc) = find_process(defs, &pid) else {
                    return fix_result("Process not found");
                };
                let new_process_id =
                    format!("Reusable_{}_{}", id_safe(&ty), generate_id("proc"));
                let generated =
                    build_extracted_defs(rep_name.clone(), rep_ext.clone(), &new_process_id);

                for task_id in &ids {
                    let Some(BpmnFlowElement::ServiceTask(orig)) = find_element(proc, task_id)
                    else {
                        continue;
                    };
                    let mut called = XmlElement::new("zeebe:calledElement");
                    called
                        .attributes
                        .insert("processId".into(), new_process_id.clone());
                    let call = BpmnFlowElement::CallActivity(BpmnActivity {
                        base: BpmnFlowNodeBase {
                            id: orig.base.id.clone(),
                            name: orig.base.name.clone(),
                            incoming: orig.base.incoming.clone(),
                            outgoing: orig.base.outgoing.clone(),
                            extension_elements: vec![called],
                            ..Default::default()
                        },
                        loop_characteristics: None,
                    });
                    // TS maps every element with this id, not only the first.
                    for e in proc.contents.flow_elements.iter_mut() {
                        if &e.base().id == task_id {
                            *e = call.clone();
                        }
                    }
                }

                ApplyFixResult {
                    description: format!(
                        "Extracted {count} service tasks to call activity referencing \"{new_process_id}\""
                    ),
                    generated: Some(generated),
                }
            }),
        );
    }

    findings
}
