//! Port of `diffBpmn` (`bpmn-diff.ts`), which composes `diffSemantics` and `diffDiagram`.

use crate::js::{cmp_utf16, f64_to_js, sorted_entries, stringify};
use crate::projection::{hash_projection, project_semantics};
use bpmnkit_bpmn::model::BpmnDefinitions;
use indexmap::{IndexMap, IndexSet};
use serde::Serialize;
use serde_json::{Map, Value};
use std::collections::{BTreeMap, HashMap};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ChangeKind {
    Added,
    Removed,
    Changed,
    /// Same model, different picture.
    Moved,
}

/// One property that differs inside a changed element. `path` is a JSON-pointer-like route into
/// the element's projection (`/` and `~` escaped as `~1` / `~0`), e.g.
/// `extensionElements/zeebe:taskDefinition/@type`. A side without the property is `None`.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct FieldChange {
    pub path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub before: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub after: Option<Value>,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

/// Where an element is drawn, rounded to two decimals: a shape has a box, an edge a route.
#[derive(Debug, Clone, Default, PartialEq, Serialize)]
pub struct Geometry {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub x: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub y: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub waypoints: Option<Vec<Point>>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementChange {
    pub id: String,
    pub kind: ChangeKind,
    /// `type` of the element, or the singular of the list it sits in (`participant`, …).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub element_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_before: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name_after: Option<String>,
    /// Only for [`ChangeKind::Changed`]; empty otherwise.
    pub fields: Vec<FieldChange>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub geometry_before: Option<Geometry>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub geometry_after: Option<Geometry>,
}

/// How many differences fall on one diagram plane (the process, or a collapsed sub-process).
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct PlaneSummary {
    pub id: String,
    pub added: usize,
    pub removed: usize,
    pub changed: usize,
    pub moved: usize,
    pub total: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct DiffSummary {
    pub added: usize,
    pub removed: usize,
    pub changed: usize,
    pub moved: usize,
    pub total: usize,
}

/// A full diff of two models.
///
/// `changes` lists every semantic difference, including elements with nothing to draw (a process
/// attribute, a message definition); `planes` counts only the drawable ones, as `diffDiagram`
/// does. `before_hash == after_hash` means the models are semantically identical.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BpmnDiff {
    pub changes: Vec<ElementChange>,
    pub planes: Vec<PlaneSummary>,
    pub summary: DiffSummary,
    pub before_hash: String,
    pub after_hash: String,
}

// ---------------------------------------------------------------------------
// Field-level diff
// ---------------------------------------------------------------------------

fn escape(segment: &str) -> String {
    segment.replace('~', "~0").replace('/', "~1")
}

fn join(path: &str, segment: &str) -> String {
    let s = escape(segment);
    if path.is_empty() {
        s
    } else {
        format!("{path}/{s}")
    }
}

fn singular(key: &str) -> String {
    if let Some(stem) = key.strip_suffix("ies") {
        format!("{stem}y")
    } else if let Some(stem) = key.strip_suffix("ses") {
        format!("{stem}s")
    } else {
        key.strip_suffix('s').unwrap_or(key).to_string()
    }
}

fn item_key(v: &Value) -> Option<&str> {
    match v {
        Value::String(s) => Some(s),
        Value::Object(_) => v
            .get("id")
            .and_then(Value::as_str)
            .or_else(|| v.get("name").and_then(Value::as_str)),
        _ => None,
    }
}

/// Keys for matching two lists entry by entry; `None` when an entry has none or they repeat.
fn keys_of(list: &[Value]) -> Option<Vec<&str>> {
    let keys: Option<Vec<&str>> = list.iter().map(item_key).collect();
    let keys = keys?;
    let unique: IndexSet<&str> = keys.iter().copied().collect();
    (unique.len() == keys.len()).then_some(keys)
}

// Empty `attributes` / `children` are dropped by the projection, so either one marks an XML node.
fn is_xml_element(v: &Value) -> bool {
    v.get("name").is_some_and(Value::is_string)
        && (v.get("attributes").is_some_and(Value::is_object)
            || v.get("children").is_some_and(Value::is_array))
}

fn change(path: &str, before: Option<&Value>, after: Option<&Value>) -> FieldChange {
    FieldChange {
        path: path.to_string(),
        before: before.cloned(),
        after: after.cloned(),
    }
}

/// The recursive diff of two projections. Arrays of entries that carry an `id` (or a `name`) are
/// matched by it, other arrays by index.
fn json_changes(
    before: Option<&Value>,
    after: Option<&Value>,
    path: &str,
    out: &mut Vec<FieldChange>,
) {
    let (Some(b), Some(a)) = (before, after) else {
        if before != after {
            out.push(change(path, before, after));
        }
        return;
    };
    match (b, a) {
        (Value::Object(bm), Value::Object(am)) => {
            let xml = is_xml_element(b) || is_xml_element(a);
            let keys: IndexSet<&String> = bm.keys().chain(am.keys()).collect();
            let mut keys: Vec<&String> = keys.into_iter().collect();
            keys.sort_by(|x, y| cmp_utf16(x, y));
            for key in keys {
                let (l, r) = (bm.get(key), am.get(key));
                if xml && key == "attributes" {
                    // An attribute reads as `@name`, the way XPath writes it.
                    let empty = Map::new();
                    let lo = l.and_then(Value::as_object).unwrap_or(&empty);
                    let ro = r.and_then(Value::as_object).unwrap_or(&empty);
                    let names: IndexSet<&String> = lo.keys().chain(ro.keys()).collect();
                    let mut names: Vec<&String> = names.into_iter().collect();
                    names.sort_by(|x, y| cmp_utf16(x, y));
                    for n in names {
                        json_changes(lo.get(n), ro.get(n), &join(path, &format!("@{n}")), out);
                    }
                } else {
                    // `children` is the XML tree's own nesting, not a name worth a path segment.
                    let next = if xml && key == "children" {
                        path.to_string()
                    } else {
                        join(path, key)
                    };
                    json_changes(l, r, &next, out);
                }
            }
        }
        (Value::Array(bl), Value::Array(al)) => {
            if let (Some(lk), Some(rk)) = (keys_of(bl), keys_of(al)) {
                let l: HashMap<&str, &Value> = lk.iter().copied().zip(bl).collect();
                let r: HashMap<&str, &Value> = rk.iter().copied().zip(al).collect();
                let all: IndexSet<&str> = lk.iter().chain(&rk).copied().collect();
                let mut all: Vec<&str> = all.into_iter().collect();
                all.sort_by(|x, y| cmp_utf16(x, y));
                for k in all {
                    json_changes(l.get(k).copied(), r.get(k).copied(), &join(path, k), out);
                }
            } else {
                for i in 0..bl.len().max(al.len()) {
                    json_changes(bl.get(i), al.get(i), &join(path, &format!("[{i}]")), out);
                }
            }
        }
        _ => {
            if stringify(b) != stringify(a) {
                out.push(change(path, Some(b), Some(a)));
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/// `Math.round(v * 100) / 100`: rounds half up, so re-serialising cannot register as a move.
fn round(v: f64) -> f64 {
    (v * 100.0 + 0.5).floor() / 100.0
}

fn opt_bool(b: Option<bool>) -> String {
    b.map(|b| b.to_string()).unwrap_or_default()
}

struct Placement {
    plane: String,
    /// Geometry that decides whether the element moved.
    key: String,
    geometry: Geometry,
}

fn label_key(label: Option<&bpmnkit_bpmn::model::BpmnDiLabel>) -> String {
    label
        .and_then(|l| l.bounds.as_ref())
        .map(|b| format!("{},{}", f64_to_js(round(b.x)), f64_to_js(round(b.y))))
        .unwrap_or_default()
}

fn index_layout(defs: &BpmnDefinitions) -> IndexMap<String, Placement> {
    let mut index = IndexMap::new();
    for diagram in &defs.diagrams {
        let plane = &diagram.plane.bpmn_element;
        for shape in &diagram.plane.shapes {
            let b = &shape.bounds;
            let key = [
                f64_to_js(round(b.x)),
                f64_to_js(round(b.y)),
                f64_to_js(round(b.width)),
                f64_to_js(round(b.height)),
                opt_bool(shape.is_expanded),
                opt_bool(shape.is_marker_visible),
                opt_bool(shape.is_horizontal),
                label_key(shape.label.as_ref()),
            ]
            .join("|");
            let geometry = Geometry {
                x: Some(round(b.x)),
                y: Some(round(b.y)),
                width: Some(round(b.width)),
                height: Some(round(b.height)),
                waypoints: None,
            };
            index.insert(
                shape.bpmn_element.clone(),
                Placement {
                    plane: plane.clone(),
                    key,
                    geometry,
                },
            );
        }
        for edge in &diagram.plane.edges {
            let route: Vec<String> = edge
                .waypoints
                .iter()
                .map(|p| format!("{},{}", f64_to_js(round(p.x)), f64_to_js(round(p.y))))
                .collect();
            let key = format!("{}|{}", route.join(" "), label_key(edge.label.as_ref()));
            let geometry = Geometry {
                waypoints: Some(
                    edge.waypoints
                        .iter()
                        .map(|p| Point {
                            x: round(p.x),
                            y: round(p.y),
                        })
                        .collect(),
                ),
                ..Geometry::default()
            };
            index.insert(
                edge.bpmn_element.clone(),
                Placement {
                    plane: plane.clone(),
                    key,
                    geometry,
                },
            );
        }
    }
    index
}

/// Same walk as the semantic index, so every indexed id gets a type.
fn collect_types(value: &Value, key: &str, into: &mut HashMap<String, String>) {
    match value {
        Value::Array(items) => items.iter().for_each(|e| collect_types(e, key, into)),
        Value::Object(map) => {
            if let Some(id) = value.get("id").and_then(Value::as_str) {
                let t = value
                    .get("type")
                    .and_then(Value::as_str)
                    .map(str::to_string)
                    .unwrap_or_else(|| singular(key));
                into.insert(id.to_string(), t);
            }
            for (k, entry) in sorted_entries(map) {
                collect_types(entry, k, into);
            }
        }
        _ => {}
    }
}

fn name_of(v: Option<&Value>) -> Option<String> {
    v?.get("name")?.as_str().map(str::to_string)
}

// ---------------------------------------------------------------------------
// diff_bpmn
// ---------------------------------------------------------------------------

/// Diffs two models: what changed field by field, what only moved, and a hash of each side.
pub fn diff_bpmn(before: &BpmnDefinitions, after: &BpmnDefinitions) -> BpmnDiff {
    let left = project_semantics(before);
    let right = project_semantics(after);
    let before_layout = index_layout(before);
    let after_layout = index_layout(after);

    let mut added: Vec<&String> = right
        .elements
        .keys()
        .filter(|id| !left.elements.contains_key(*id))
        .collect();
    let mut removed: Vec<&String> = left
        .elements
        .keys()
        .filter(|id| !right.elements.contains_key(*id))
        .collect();
    let mut changed: Vec<&String> = right
        .elements
        .iter()
        .filter(|(id, v)| {
            left.elements
                .get(*id)
                .is_some_and(|l| stringify(l) != stringify(v))
        })
        .map(|(id, _)| id)
        .collect();
    for list in [&mut added, &mut removed, &mut changed] {
        list.sort_by(|a, b| cmp_utf16(a, b));
    }

    // `diffDiagram`: only what a canvas can draw counts towards planes and moves.
    let drawable = |id: &str| before_layout.contains_key(id) || after_layout.contains_key(id);
    let changed_drawable: Vec<&String> = changed.iter().copied().filter(|i| drawable(i)).collect();
    let changed_set: IndexSet<&str> = changed_drawable.iter().map(|s| s.as_str()).collect();
    let mut moved: Vec<&String> = after_layout
        .iter()
        .filter(|(id, p)| {
            !changed_set.contains(id.as_str())
                && before_layout.get(*id).is_some_and(|prev| prev.key != p.key)
        })
        .map(|(id, _)| id)
        .collect();
    moved.sort_by(|a, b| cmp_utf16(a, b));

    let mut counts: BTreeMap<Vec<u16>, (String, [usize; 4])> = BTreeMap::new();
    let assignments = [
        (0, added.iter().filter(|i| drawable(i)).collect::<Vec<_>>()),
        (1, removed.iter().filter(|i| drawable(i)).collect()),
        (2, changed_drawable.iter().collect()),
        (3, moved.iter().collect()),
    ];
    for (slot, ids) in assignments {
        for id in ids {
            let placement = after_layout
                .get(id.as_str())
                .or(before_layout.get(id.as_str()));
            if let Some(p) = placement {
                // Keyed by UTF-16 units so the order is JavaScript's.
                let entry = counts
                    .entry(p.plane.encode_utf16().collect())
                    .or_insert_with(|| (p.plane.clone(), [0; 4]));
                entry.1[slot] += 1;
            }
        }
    }
    let planes: Vec<PlaneSummary> = counts
        .into_values()
        .map(|(id, c)| PlaneSummary {
            id,
            added: c[0],
            removed: c[1],
            changed: c[2],
            moved: c[3],
            total: c.iter().sum(),
        })
        .collect();

    let mut types = HashMap::new();
    collect_types(&left.value, "definitions", &mut types);
    collect_types(&right.value, "definitions", &mut types);

    let make = |id: &str, kind: ChangeKind| {
        let (b, a) = (left.elements.get(id), right.elements.get(id));
        let mut fields = vec![];
        if kind == ChangeKind::Changed {
            json_changes(b, a, "", &mut fields);
        }
        ElementChange {
            id: id.to_string(),
            kind,
            element_type: types.get(id).cloned(),
            name_before: name_of(b),
            name_after: name_of(a),
            fields,
            geometry_before: before_layout.get(id).map(|p| p.geometry.clone()),
            geometry_after: after_layout.get(id).map(|p| p.geometry.clone()),
        }
    };

    let mut changes: Vec<ElementChange> = vec![];
    changes.extend(added.iter().map(|id| make(id, ChangeKind::Added)));
    changes.extend(removed.iter().map(|id| make(id, ChangeKind::Removed)));
    // A parent whose child list was merely reordered by the canonical sort differs in
    // `diffSemantics` but in no field; there is nothing to show for it.
    changes.extend(
        changed
            .iter()
            .map(|id| make(id, ChangeKind::Changed))
            .filter(|c| !c.fields.is_empty()),
    );
    changes.extend(moved.iter().map(|id| make(id, ChangeKind::Moved)));
    changes.sort_by(|a, b| a.kind.cmp(&b.kind).then_with(|| cmp_utf16(&a.id, &b.id)));

    let count = |k: ChangeKind| changes.iter().filter(|c| c.kind == k).count();
    let summary = DiffSummary {
        added: count(ChangeKind::Added),
        removed: count(ChangeKind::Removed),
        changed: count(ChangeKind::Changed),
        moved: count(ChangeKind::Moved),
        total: changes.len(),
    };
    BpmnDiff {
        changes,
        planes,
        summary,
        before_hash: hash_projection(&left),
        after_hash: hash_projection(&right),
    }
}
