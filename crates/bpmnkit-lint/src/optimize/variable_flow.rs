//! `optimize/variable-flow.ts`: which variables each element reads and writes,
//! undefined and dead variables, and the variables in scope at each flow.

use super::utils::*;
use crate::{Category, Finding, Severity};
use bpmnkit_bpmn::{BpmnFlowElement, BpmnProcess, BpmnSequenceFlow, XmlElement};
use bpmnkit_feel::ast::{Node, NodeKind};
use indexmap::{IndexMap, IndexSet};
use std::collections::{HashMap, HashSet};
use std::sync::OnceLock;

/// Names that are never variables: the engine's registry, plus the floor TS lists.
fn feel_builtins() -> &'static HashSet<&'static str> {
    static SET: OnceLock<HashSet<&'static str>> = OnceLock::new();
    SET.get_or_init(|| {
        let mut s: HashSet<&'static str> = bpmnkit_feel::builtin_names().collect();
        s.extend([
            "string",
            "string length",
            "substring",
            "substring before",
            "substring after",
            "upper case",
            "lower case",
            "contains",
            "starts with",
            "ends with",
            "matches",
            "replace",
            "split",
            "string join",
            "number",
            "decimal",
            "floor",
            "ceiling",
            "round half up",
            "round half down",
            "round up",
            "round down",
            "abs",
            "modulo",
            "sqrt",
            "log",
            "exp",
            "odd",
            "even",
            "random number",
            "count",
            "list contains",
            "append",
            "concatenate",
            "insert before",
            "remove",
            "reverse",
            "index of",
            "union",
            "distinct values",
            "duplicate values",
            "flatten",
            "product",
            "sum",
            "mean",
            "all",
            "any",
            "sublist",
            "min",
            "max",
            "median",
            "mode",
            "sort",
            "date",
            "time",
            "date and time",
            "duration",
            "years and months duration",
            "now",
            "today",
            "day of week",
            "day of year",
            "week of year",
            "month of year",
            "last day of month",
            "is",
            "is defined",
            "not",
            "true",
            "false",
            "null",
            "and",
            "or",
            "instance of",
            "get value",
            "get entries",
            "put",
            "put all",
            "context",
            "context merge",
            "context put",
            "context get entries",
            "context get value",
        ]);
        s
    })
}

fn collect_names(node: &Node, out: &mut IndexSet<String>) {
    use NodeKind::*;
    fn all(nodes: &[Node], out: &mut IndexSet<std::string::String>) {
        for n in nodes {
            collect_names(n, out);
        }
    }
    match &node.kind {
        Name(n) => {
            if !feel_builtins().contains(n.as_str()) {
                out.insert(n.clone());
            }
        }
        // a.b.c: only the root is a variable reference.
        Path { base, .. } => collect_names(base, out),
        Binary { left, right, .. } => {
            collect_names(left, out);
            collect_names(right, out);
        }
        UnaryMinus(operand) => collect_names(operand, out),
        List(items) => all(items, out),
        Context(entries) => {
            for (_, v) in entries {
                collect_names(v, out);
            }
        }
        Range { low, high, .. } => {
            collect_names(low, out);
            collect_names(high, out);
        }
        Filter { base, condition } => {
            collect_names(base, out);
            collect_names(condition, out);
        }
        Call { args, .. } => all(args, out),
        CallExpr { target, args } => {
            collect_names(target, out);
            all(args, out);
        }
        CallNamed { args, .. } => {
            for (_, v) in args {
                collect_names(v, out);
            }
        }
        If {
            condition,
            then,
            otherwise,
        } => {
            collect_names(condition, out);
            collect_names(then, out);
            collect_names(otherwise, out);
        }
        For { bindings, body } => {
            for b in bindings {
                collect_names(&b.domain, out);
            }
            collect_names(body, out);
        }
        Some {
            bindings,
            satisfies,
        }
        | Every {
            bindings,
            satisfies,
        } => {
            for b in bindings {
                collect_names(&b.domain, out);
            }
            collect_names(satisfies, out);
        }
        Between { value, low, high } => {
            collect_names(value, out);
            collect_names(low, out);
            collect_names(high, out);
        }
        InTest { value, test } => {
            collect_names(value, out);
            collect_names(test, out);
        }
        FunctionDef { body, .. } => collect_names(body, out),
        UnaryTestList(tests) | UnaryNot(tests) => all(tests, out),
        Number(_) | String(_) | Boolean(_) | Null | Temporal(_) | InstanceOf { .. } | AnyInput => {}
    }
}

/// `extractFeelIdentifiers`: variable names an expression reads, first use first.
pub fn extract_feel_identifiers(expression: &str) -> Vec<String> {
    let trimmed = js_trim(expression);
    if trimmed.is_empty() {
        return vec![];
    }
    let expr = match trimmed.strip_prefix('=') {
        Some(rest) => js_trim(rest),
        None => trimmed,
    };
    let parsed = bpmnkit_feel::parse_partial(expr, &bpmnkit_feel::ParseOptions::default());
    let Some(e) = parsed.parsed else {
        return vec![];
    };
    let mut names = IndexSet::new();
    collect_names(e.ast(), &mut names);
    names.into_iter().collect()
}

/// Edit distance over UTF-16 code units, as TS indexes strings.
pub fn levenshtein(a: &str, b: &str) -> usize {
    let a: Vec<u16> = a.encode_utf16().collect();
    let b: Vec<u16> = b.encode_utf16().collect();
    let n = b.len();
    let mut prev: Vec<usize> = (0..=n).collect();
    let mut curr = vec![0; n + 1];
    for i in 1..=a.len() {
        curr[0] = i;
        for j in 1..=n {
            curr[j] = if a[i - 1] == b[j - 1] {
                prev[j - 1]
            } else {
                1 + prev[j].min(curr[j - 1]).min(prev[j - 1])
            };
        }
        std::mem::swap(&mut prev, &mut curr);
    }
    prev[n]
}

fn find_closest<'a>(name: &str, candidates: &[&'a String]) -> Option<&'a str> {
    let mut best = None;
    let mut best_dist = 3; // only suggest within distance 2
    for c in candidates {
        if c.as_str() == name {
            continue;
        }
        let d = levenshtein(name, c);
        if d < best_dist {
            best_dist = d;
            best = Some(c.as_str());
        }
    }
    best
}

fn read_result_variable(ext: &[XmlElement]) -> Option<&str> {
    ext.iter()
        .filter(|e| e.name == "zeebe:calledDecision")
        .find_map(|e| e.attr("resultVariable").filter(|v| !v.is_empty()))
}

/// For every node in the flows, the variables produced by it or by any node with a
/// path to it: a worklist fixed point, so cycles cost no more than a DAG.
fn reaching_produces<'a>(
    flows: &'a [BpmnSequenceFlow],
    produces: &IndexMap<String, Vec<String>>,
) -> HashMap<&'a str, IndexSet<String>> {
    let mut successors: HashMap<&str, Vec<&str>> = HashMap::new();
    let mut scope: IndexMap<&str, IndexSet<String>> = IndexMap::new();
    let own = |id: &str| -> IndexSet<String> {
        produces.get(id).into_iter().flatten().cloned().collect()
    };
    for flow in flows {
        successors
            .entry(&flow.source_ref)
            .or_default()
            .push(&flow.target_ref);
        for id in [flow.source_ref.as_str(), flow.target_ref.as_str()] {
            if !scope.contains_key(id) {
                scope.insert(id, own(id));
            }
        }
    }

    let mut queue: Vec<&str> = scope.keys().copied().collect();
    let mut queued: HashSet<&str> = queue.iter().copied().collect();
    let mut head = 0;
    while head < queue.len() {
        let id = queue[head];
        head += 1;
        queued.remove(id);
        let Some(next) = successors.get(id) else {
            continue;
        };
        let own: Vec<String> = scope[id].iter().cloned().collect();
        if own.is_empty() {
            continue;
        }
        for &target in next {
            let Some(target_scope) = scope.get_mut(target) else {
                continue;
            };
            let mut grew = false;
            for v in &own {
                grew |= target_scope.insert(v.clone());
            }
            if grew && queued.insert(target) {
                queue.push(target);
            }
        }
    }
    scope.into_iter().collect()
}

fn edge_scope_finding(process_id: &str, flow_id: &str, mut vars: Vec<String>) -> Finding {
    js_sort(&mut vars);
    let mut f = finding(
        format!("data-flow/edge-scope:{flow_id}"),
        Category::DataFlow,
        Severity::Info,
        format!(
            "Variables in scope at flow \"{flow_id}\": {}.",
            vars.join(", ")
        ),
        "",
        process_id,
        vec![flow_id.to_owned()],
    );
    f.data.produces = Some(vars);
    f
}

#[derive(Default)]
struct Roles {
    /// Variable → elements, in first-seen order.
    by_var: IndexMap<String, Vec<String>>,
    /// Element → variables, in first-seen order.
    by_element: IndexMap<String, Vec<String>>,
}

impl Roles {
    fn add(&mut self, var: &str, element_id: &str) {
        if js_trim(var).is_empty() {
            return;
        }
        let els = self.by_var.entry(var.to_owned()).or_default();
        if !els.iter().any(|e| e == element_id) {
            els.push(element_id.to_owned());
        }
        let vars = self.by_element.entry(element_id.to_owned()).or_default();
        if !vars.iter().any(|v| v == var) {
            vars.push(var.to_owned());
        }
    }
}

pub fn analyze_variable_flow(p: &BpmnProcess) -> Vec<Finding> {
    let mut findings = vec![];
    let process_id = p.id.as_str();
    let mut produced = Roles::default();
    let mut consumed = Roles::default();

    for el in &p.contents.flow_elements {
        let base = el.base();
        let ext = &base.extension_elements;
        if let Some(io) = read_zeebe_io_mapping(ext) {
            // Inputs write the task's local scope; outputs write back to the process.
            for entry in io.inputs.iter().chain(&io.outputs) {
                let target = js_trim(&entry.target);
                if !target.is_empty() {
                    produced.add(target, &base.id);
                }
                for name in extract_feel_identifiers(&entry.source) {
                    consumed.add(&name, &base.id);
                }
            }
        }
        if let Some(v) = read_result_variable(ext) {
            produced.add(v, &base.id);
        }
    }

    // A condition reads the process scope; it counts against the flow's source.
    for flow in &p.contents.sequence_flows {
        let Some(cond) = flow.condition_expression.as_ref().map(|c| js_trim(&c.text)) else {
            continue;
        };
        if cond.is_empty() {
            continue;
        }
        for name in extract_feel_identifiers(cond) {
            consumed.add(&name, &flow.source_ref);
        }
    }

    let all_produced: Vec<&String> = produced.by_var.keys().collect();
    for (var, element_ids) in &consumed.by_var {
        if produced.by_var.contains_key(var) {
            continue;
        }
        let suggestion = match find_closest(var, &all_produced) {
            Some(c) => format!("\"{var}\" is never set. Did you mean \"{c}\"?"),
            None => format!("\"{var}\" is never set on any path through this process."),
        };
        let mut f = finding(
            format!("data-flow/undefined-variable:{var}"),
            Category::DataFlow,
            Severity::Warning,
            format!("Variable \"{var}\" is referenced but never set in this process."),
            suggestion,
            process_id,
            element_ids.clone(),
        );
        f.data.consumes = Some(vec![var.clone()]);
        findings.push(f);
    }

    for (var, element_ids) in &produced.by_var {
        if consumed.by_var.contains_key(var) {
            continue;
        }
        let mut f = finding(
            format!("data-flow/dead-output:{var}"),
            Category::DataFlow,
            Severity::Info,
            format!("Variable \"{var}\" is set but never read by any downstream element."),
            format!("Remove the output mapping for \"{var}\" or add a task that consumes it."),
            process_id,
            element_ids.clone(),
        );
        f.data.produces = Some(vec![var.clone()]);
        findings.push(f);
    }

    // Per-element roles, for the overlay plugin.
    let role_elements: IndexSet<&String> = produced
        .by_element
        .keys()
        .chain(consumed.by_element.keys())
        .collect();
    for element_id in role_elements {
        let prod = produced
            .by_element
            .get(element_id)
            .cloned()
            .unwrap_or_default();
        let cons = consumed
            .by_element
            .get(element_id)
            .cloned()
            .unwrap_or_default();
        if prod.is_empty() && cons.is_empty() {
            continue;
        }
        let mut message = format!("Element \"{element_id}\" ");
        if !prod.is_empty() {
            message += &format!("produces: {}", prod.join(", "));
        }
        if !prod.is_empty() && !cons.is_empty() {
            message += "; ";
        }
        if !cons.is_empty() {
            message += &format!("consumes: {}", cons.join(", "));
        }
        message += ".";
        let mut f = finding(
            format!("data-flow/role:{element_id}"),
            Category::DataFlow,
            Severity::Info,
            message,
            "",
            process_id,
            vec![element_id.clone()],
        );
        f.data.produces = (!prod.is_empty()).then_some(prod);
        f.data.consumes = (!cons.is_empty()).then_some(cons);
        findings.push(f);
    }

    let scope_at = reaching_produces(&p.contents.sequence_flows, &produced.by_element);
    for flow in &p.contents.sequence_flows {
        let Some(in_scope) = scope_at.get(flow.source_ref.as_str()) else {
            continue;
        };
        if in_scope.is_empty() {
            continue;
        }
        findings.push(edge_scope_finding(
            process_id,
            &flow.id,
            in_scope.iter().cloned().collect(),
        ));
    }

    // Multi-instance sub-processes: inner flows see the iteration variable too.
    for el in &p.contents.flow_elements {
        let BpmnFlowElement::SubProcess(sp) = el else {
            continue;
        };
        let Some(lc) = &sp.loop_characteristics else {
            continue;
        };
        let input_element = lc
            .extension_elements
            .iter()
            .find(|e| e.name == "zeebe:loopCharacteristics")
            .and_then(|e| e.attr("inputElement"))
            .map(js_trim)
            .filter(|s| !s.is_empty());
        let Some(input_element) = input_element else {
            continue;
        };

        let mut inner: IndexMap<String, Vec<String>> = IndexMap::new();
        for e in &sp.contents.flow_elements {
            let Some(io) = read_zeebe_io_mapping(&e.base().extension_elements) else {
                continue;
            };
            for out in &io.outputs {
                let t = js_trim(&out.target);
                if t.is_empty() {
                    continue;
                }
                let list = inner.entry(e.base().id.clone()).or_default();
                if !list.iter().any(|v| v == t) {
                    list.push(t.to_owned());
                }
            }
        }
        let inner_scope = reaching_produces(&sp.contents.sequence_flows, &inner);
        for flow in &sp.contents.sequence_flows {
            let mut vars: IndexSet<String> = IndexSet::from([input_element.to_owned()]);
            if let Some(s) = inner_scope.get(flow.source_ref.as_str()) {
                vars.extend(s.iter().cloned());
            }
            findings.push(edge_scope_finding(
                process_id,
                &flow.id,
                vars.into_iter().collect(),
            ));
        }
    }

    findings
}
