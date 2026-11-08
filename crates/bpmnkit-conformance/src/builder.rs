//! `builder/` cases (conformance/README.md, "Builder"): replays each recorded script of
//! method calls against `bpmnkit-builder` (`ProcessBuilder` and the branch / sub-process
//! builders it hands to callbacks, `DiagramBuilder`, `DecisionTableBuilder`, `DrdBuilder`).
//!
//! Option bags are typed straight from the case's JSON text (not through
//! `serde_json::Value`, which sorts keys): `taskHeaders` keep their order.

use crate::bpmn::first_diff_line;
use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn, BpmnDefinitions};
use bpmnkit_builder::drd::{drg_id, DrdBuilder, DrdDecisionOptions, DrgRef};
use bpmnkit_builder::{
    BoundaryEventOptions, Bpmn, BranchBuilder, BuildError, DecisionTableBuilder, DiagramBuilder,
    Dmn, ProcessBuilder, SubProcessContentBuilder,
};
use bpmnkit_dmn::{serialize_dmn, DmnDefinitions};
use bpmnkit_lint::{export_bpmn, ExportOptions, ExportValidate};
use serde::de::DeserializeOwned;
use serde_json::Value;
use std::collections::HashMap;
use std::path::Path;

// ── A JSON reader that keeps each value's source text ───────────────────────

#[derive(Debug)]
struct J<'a> {
    raw: &'a str,
    node: Node<'a>,
}

#[derive(Debug)]
enum Node<'a> {
    Arr(Vec<J<'a>>),
    Obj(Vec<(String, J<'a>)>),
    Str(String),
    Other,
}

struct Reader<'a> {
    src: &'a str,
    at: usize,
}

impl<'a> Reader<'a> {
    fn ws(&mut self) {
        while self.src[self.at..].starts_with([' ', '\t', '\n', '\r']) {
            self.at += 1;
        }
    }

    fn peek(&self) -> u8 {
        self.src.as_bytes()[self.at]
    }

    fn string_end(&self, start: usize) -> usize {
        let bytes = self.src.as_bytes();
        let mut i = start + 1;
        while bytes[i] != b'"' {
            i += if bytes[i] == b'\\' { 2 } else { 1 };
        }
        i + 1
    }

    fn value(&mut self) -> J<'a> {
        self.ws();
        let start = self.at;
        let node = match self.peek() {
            b'[' => {
                self.at += 1;
                let mut items = Vec::new();
                loop {
                    self.ws();
                    if self.peek() == b']' {
                        self.at += 1;
                        break;
                    }
                    items.push(self.value());
                    self.ws();
                    if self.peek() == b',' {
                        self.at += 1;
                    }
                }
                Node::Arr(items)
            }
            b'{' => {
                self.at += 1;
                let mut entries = Vec::new();
                loop {
                    self.ws();
                    if self.peek() == b'}' {
                        self.at += 1;
                        break;
                    }
                    let key_end = self.string_end(self.at);
                    let key: String = serde_json::from_str(&self.src[self.at..key_end]).unwrap();
                    self.at = key_end;
                    self.ws();
                    assert_eq!(self.peek(), b':');
                    self.at += 1;
                    entries.push((key, self.value()));
                    self.ws();
                    if self.peek() == b',' {
                        self.at += 1;
                    }
                }
                Node::Obj(entries)
            }
            b'"' => {
                self.at = self.string_end(self.at);
                Node::Str(serde_json::from_str(&self.src[start..self.at]).unwrap())
            }
            _ => {
                while !self.src[self.at..].starts_with([',', ']', '}', ' ', '\n', '\r', '\t']) {
                    self.at += 1;
                }
                Node::Other
            }
        };
        J {
            raw: &self.src[start..self.at],
            node,
        }
    }
}

fn read_source(src: &str) -> J<'_> {
    Reader { src, at: 0 }.value()
}

impl<'a> J<'a> {
    fn get(&self, key: &str) -> Option<&J<'a>> {
        match &self.node {
            Node::Obj(entries) => entries.iter().find(|(k, _)| k == key).map(|(_, v)| v),
            _ => None,
        }
    }

    fn items(&self) -> &[J<'a>] {
        match &self.node {
            Node::Arr(items) => items,
            _ => panic!("not an array: {}", self.raw),
        }
    }

    fn str(&self) -> &str {
        match &self.node {
            Node::Str(s) => s,
            _ => panic!("not a string: {}", self.raw),
        }
    }

    fn as_str(&self) -> Option<&str> {
        match &self.node {
            Node::Str(s) => Some(s),
            _ => None,
        }
    }

    /// The ops of a `{"$ops": [...]}` callback argument.
    fn ops(&self) -> Option<&[J<'a>]> {
        self.get("$ops").map(J::items)
    }

    fn to<T: DeserializeOwned>(&self) -> T {
        serde_json::from_str(self.raw).unwrap_or_else(|e| panic!("{e}: {}", self.raw))
    }
}

fn opt<T: DeserializeOwned>(arg: Option<&J>) -> Option<T> {
    arg.map(J::to)
}

/// `(content, options)` of a sub-process call, in either argument order.
fn content_and_options<'j, 'a>(args: &'j [J<'a>]) -> (&'j [J<'a>], Option<&'j J<'a>>) {
    match args[1].ops() {
        Some(ops) => (ops, args.get(2)),
        None => (args[2].ops().expect("content callback"), Some(&args[1])),
    }
}

/// `boundaryEvent(id, hostId, options?)` or `boundaryEvent(id, options)`.
fn boundary_options(args: &[J]) -> BoundaryEventOptions {
    match args[1].as_str() {
        Some(host) => BoundaryEventOptions {
            attached_to: host.to_owned(),
            ..opt(args.get(2)).unwrap_or_default()
        },
        None => args[1].to(),
    }
}

/// An optional leading id (`startEvent(id?, options?)`).
fn id_and_options<'j, 'a>(args: &'j [J<'a>]) -> (Option<&'j str>, Option<&'j J<'a>>) {
    match args.first().and_then(J::as_str) {
        Some(id) => (Some(id), args.get(1)),
        None => (None, args.first()),
    }
}

/// The methods the three flow builders share; `$replay` replays a callback on `$b`'s kind.
macro_rules! common_ops {
    ($b:expr, $method:expr, $args:expr) => {{
        let b = $b;
        let a = $args;
        match $method {
            "dataObject" => done(b.data_object(a[0].str(), opt(a.get(1)))),
            "dataObjectReference" => {
                done(b.data_object_reference(a[0].str(), a[1].str(), opt(a.get(2))))
            }
            "dataStoreReference" => {
                done(b.data_store_reference(a[0].str(), a[1].str(), opt(a.get(2))))
            }
            "dataAssociation" => done(b.data_association(a[0].str(), a[1].str(), a[2].to())),
            "textAnnotation" => done(b.text_annotation(a[0].str())),
            "annotate" => done(b.annotate(a[0].str(), a[1].str(), opt(a.get(2)))),
            "serviceTask" => done(b.service_task(a[0].str(), a[1].to())),
            "userTask" => done(b.user_task(a[0].str(), opt(a.get(1)))),
            "scriptTask" => done(b.script_task(a[0].str(), a[1].to())),
            "sendTask" => done(b.send_task(a[0].str(), opt(a.get(1)))),
            "receiveTask" => done(b.receive_task(a[0].str(), opt(a.get(1)))),
            "businessRuleTask" => done(b.business_rule_task(a[0].str(), opt(a.get(1)))),
            "callActivity" => done(b.call_activity(a[0].str(), a[1].to())),
            "manualTask" => done(b.manual_task(a[0].str(), opt(a.get(1)))),
            "task" => done(b.task(a[0].str(), opt(a.get(1)))),
            "startEvent" => {
                let (id, o) = id_and_options(a);
                done(b.start_event(id, opt(o)))
            }
            "endEvent" => {
                let (id, o) = id_and_options(a);
                done(b.end_event(id, opt(o)))
            }
            "intermediateThrowEvent" => {
                let (id, o) = id_and_options(a);
                done(b.intermediate_throw_event(id, opt(o)))
            }
            "intermediateCatchEvent" => {
                let (id, o) = id_and_options(a);
                done(b.intermediate_catch_event(id, opt(o)))
            }
            "exclusiveGateway" => done(b.exclusive_gateway(a[0].str(), opt(a.get(1)))),
            "parallelGateway" => done(b.parallel_gateway(a[0].str(), opt(a.get(1)))),
            "inclusiveGateway" => done(b.inclusive_gateway(a[0].str(), opt(a.get(1)))),
            "eventBasedGateway" => done(b.event_based_gateway(a[0].str(), opt(a.get(1)))),
            "complexGateway" => done(b.complex_gateway(a[0].str(), opt(a.get(1)))),
            "boundaryEvent" => done(b.boundary_event(a[0].str(), boundary_options(a))),
            "subProcess" => {
                let (ops, o) = content_and_options(a);
                done(b.sub_process(a[0].str(), |s| replay_sub(s, ops), opt(o)))
            }
            "transaction" => {
                let (ops, o) = content_and_options(a);
                done(b.transaction(a[0].str(), |s| replay_sub(s, ops), opt(o)))
            }
            "adHocSubProcess" => {
                let (ops, o) = content_and_options(a);
                done(b.ad_hoc_sub_process(a[0].str(), |s| replay_sub(s, ops), opt(o)))
            }
            "eventSubProcess" => {
                let (ops, o) = content_and_options(a);
                done(b.event_sub_process(a[0].str(), |s| replay_sub(s, ops), opt(o)))
            }
            "branch" => {
                let ops = a[1].ops().expect("branch callback");
                done(b.branch(a[0].str(), |br| replay_branch(br, ops)))
            }
            "connectTo" => done(b.connect_to(a[0].str())),
            other => panic!("unknown op {other}"),
        }
    }};
}

/// Discards the `&mut Self` a chained call returns.
fn done<T: ?Sized>(_: &mut T) {}

fn split<'j, 'a>(op: &'j J<'a>) -> (&'j str, &'j [J<'a>]) {
    let items = op.items();
    (items[0].str(), &items[1..])
}

fn replay_branch(b: &mut BranchBuilder, ops: &[J]) {
    for op in ops {
        match split(op) {
            ("condition", a) => done(b.condition(a[0].str())),
            ("label", a) => done(b.label(a[0].str())),
            ("flowId", a) => done(b.flow_id(a[0].str())),
            ("defaultFlow", _) => done(b.default_flow()),
            ("withBoundary", a) => {
                let ops = a[2].ops().expect("withBoundary handler");
                done(b.with_boundary(a[0].str(), a[1].to(), |x| replay_branch(x, ops)))
            }
            (method, a) => common_ops!(&mut *b, method, a),
        }
    }
}

fn replay_sub(b: &mut SubProcessContentBuilder, ops: &[J]) {
    for op in ops {
        match split(op) {
            ("element", a) => done(b.element(a[0].str())),
            ("withBoundary", a) => {
                let ops = a[2].ops().expect("withBoundary handler");
                done(b.with_boundary(a[0].str(), a[1].to(), |x| replay_sub(x, ops)))
            }
            (method, a) => common_ops!(&mut *b, method, a),
        }
    }
}

/// Replays process ops; `build` ends the script.
fn replay_process(
    b: &mut ProcessBuilder,
    ops: &[J],
) -> Option<Result<BpmnDefinitions, BuildError>> {
    for op in ops {
        let items = op.items();
        // `["$let", name, "build", opts?]`: an intermediate build; only the last is compared.
        if items[0].str() == "$let" && items[2].str() == "build" {
            let _ = b.build(opt(items.get(3)));
            continue;
        }
        match split(op) {
            ("build", a) => return Some(b.build(opt(a.first()))),
            ("at", a) => done(b.at(a[0].str())),
            ("insertAfter", a) => done(b.insert_after(a[0].str())),
            ("withAutoLayout", _) => done(b.with_auto_layout()),
            ("executionPlatformVersion", a) => done(b.execution_platform_version(a[0].str())),
            ("defaults", a) => done(b.defaults(a[0].to())),
            ("name", a) => done(b.name(a[0].str())),
            ("executable", a) => done(b.executable(a[0].to())),
            ("versionTag", a) => done(b.version_tag(a[0].str())),
            ("message", a) => done(b.message(a[0].str(), a[1].to())),
            ("error", a) => done(b.error(a[0].str(), a[1].to())),
            ("signal", a) => done(b.signal(a[0].str(), a[1].to())),
            ("escalation", a) => done(b.escalation(a[0].str(), a[1].to())),
            ("addStartEvent", a) => {
                let (id, o) = id_and_options(a);
                done(b.add_start_event(id, opt(o)))
            }
            ("disconnectedStartEvent", a) => {
                let (id, o) = id_and_options(a);
                done(b.disconnected_start_event(id, opt(o)))
            }
            ("restConnector", a) => done(b.rest_connector(a[0].str(), a[1].to())),
            ("element", a) => done(b.element(a[0].str())),
            ("withBoundary", a) => {
                let ops = a[2].ops().expect("withBoundary handler");
                done(b.with_boundary(a[0].str(), a[1].to(), |x| {
                    replay_process(x, ops);
                }))
            }
            (method, a) => common_ops!(&mut *b, method, a),
        }
    }
    None
}

fn replay_diagram(
    b: &mut DiagramBuilder,
    ops: &[J],
) -> Option<Result<BpmnDefinitions, BuildError>> {
    for op in ops {
        match split(op) {
            ("build", _) => return Some(b.build()),
            ("executionPlatformVersion", a) => done(b.execution_platform_version(a[0].str())),
            ("process", a) => {
                let ops = a[1].ops().expect("process callback");
                done(b.process(a[0].str(), |p| {
                    replay_process(p, ops);
                }))
            }
            ("collaborationId", a) => done(b.collaboration_id(a[0].str())),
            ("participant", a) => done(b.participant(a[0].str(), opt(a.get(1)))),
            ("message", a) => done(b.message(a[0].str(), opt(a.get(1)))),
            ("messageFlow", a) => done(b.message_flow(a[0].str(), a[1].to())),
            (other, _) => panic!("unknown diagram op {other}"),
        }
    }
    None
}

/// Replays decision-table ops; `build` ends a top-level script (a DRD's table has none).
fn replay_table(
    b: &mut DecisionTableBuilder,
    ops: &[J],
) -> Option<Result<DmnDefinitions, BuildError>> {
    for op in ops {
        match split(op) {
            ("build", _) => return Some(b.build()),
            ("name", a) => done(b.name(a[0].str())),
            ("hitPolicy", a) => done(b.hit_policy(a[0].to())),
            ("input", a) => done(b.input(a[0].to())),
            ("output", a) => done(b.output(a[0].to())),
            ("rule", a) => done(b.rule(a[0].to())),
            (other, _) => panic!("unknown decision table op {other}"),
        }
    }
    None
}

/// A `requires` entry: `{"$ref": name}`, `{"$drgId": id}` or a plain id.
fn drg_ref(j: &J, handles: &HashMap<String, DrgRef>) -> DrgRef {
    if let Some(name) = j.get("$ref") {
        return handles
            .get(name.str())
            .unwrap_or_else(|| panic!("no $let {}", name.str()))
            .clone();
    }
    match j.get("$drgId") {
        Some(id) => drg_id(id.str()).into(),
        None => drg_id(j.str()).into(),
    }
}

fn replay_drd(b: &mut DrdBuilder, ops: &[J]) -> Option<Result<DmnDefinitions, BuildError>> {
    let mut handles: HashMap<String, DrgRef> = HashMap::new();
    for op in ops {
        let items = op.items();
        let (name, call) = match items[0].str() {
            "$let" => (Some(items[1].str()), &items[2..]),
            _ => (None, items),
        };
        let a = &call[1..];
        let handle: DrgRef = match call[0].str() {
            "build" => return Some(b.build()),
            "inputData" => b.input_data(a[0].str(), a.get(1).map(J::str)).into(),
            "decision" => {
                let table = a[1].ops().expect("decision table callback");
                let requires = a
                    .get(2)
                    .and_then(|o| o.get("requires"))
                    .map(|r| r.items().iter().map(|j| drg_ref(j, &handles)).collect())
                    .unwrap_or_default();
                b.decision(
                    a[0].str(),
                    |t| {
                        replay_table(t, table);
                    },
                    DrdDecisionOptions { requires },
                )
                .into()
            }
            other => panic!("unknown drd op {other}"),
        };
        if let Some(name) = name {
            handles.insert(name.to_owned(), handle);
        }
    }
    None
}

/// The first container call without a content callback, anywhere in the script. TS throws
/// at it; in Rust the callback is a required closure, so the script cannot be written.
fn missing_callback(ops: &[J]) -> Option<String> {
    const CONTAINERS: [&str; 4] = [
        "subProcess",
        "transaction",
        "adHocSubProcess",
        "eventSubProcess",
    ];
    for op in ops {
        let items = op.items();
        let args = &items[1..];
        if let Some(method) = items[0].as_str().filter(|m| CONTAINERS.contains(m)) {
            if !args.iter().any(|a| a.ops().is_some()) {
                return Some(method.to_owned());
            }
        }
        if let Some(m) = args.iter().filter_map(J::ops).find_map(missing_callback) {
            return Some(m);
        }
    }
    None
}

// ── Comparison ──────────────────────────────────────────────────────────────

/// An absent key and an empty object / array / `null` count as the same: TS leaves out
/// keys the Rust model always writes (and the reverse).
fn is_empty(v: &Value) -> bool {
    match v {
        Value::Null => true,
        Value::Array(a) => a.is_empty(),
        Value::Object(o) => o.is_empty(),
        _ => false,
    }
}

/// Like `bpmn::json_diff`, but with [`is_empty`] for keys only one side has.
fn lenient_diff(path: &str, a: &Value, b: &Value) -> Option<String> {
    match (a, b) {
        (Value::Number(x), Value::Number(y)) => {
            (x.as_f64() != y.as_f64()).then(|| format!("{path}: {x} != {y}"))
        }
        (Value::Array(x), Value::Array(y)) => {
            if x.len() != y.len() {
                return Some(format!("{path}: length {} != {}", x.len(), y.len()));
            }
            x.iter()
                .zip(y)
                .enumerate()
                .find_map(|(i, (x, y))| lenient_diff(&format!("{path}[{i}]"), x, y))
        }
        (Value::Object(x), Value::Object(y)) => {
            for (k, xv) in x {
                match y.get(k) {
                    Some(yv) => {
                        if let Some(d) = lenient_diff(&format!("{path}.{k}"), xv, yv) {
                            return Some(d);
                        }
                    }
                    None if is_empty(xv) => {}
                    None => return Some(format!("{path}.{k}: only in actual")),
                }
            }
            y.iter()
                .find(|(k, v)| !x.contains_key(*k) && !is_empty(v))
                .map(|(k, _)| format!("{path}.{k}: only in expected"))
        }
        _ => (a != b).then(|| format!("{path}: {a} != {b}")),
    }
}

/// Compares a script's outcome with `expected/`: `error.txt`, or `output.<ext>` and
/// `model.json`.
/// A case's `"export": { "validate": ... }`: TS writes the result with `Bpmn.export`, which
/// throws (`error.txt`) or warns (`warning.txt`); the written XML is `serializeBpmn`'s either way.
fn exported(
    case: &J,
    expected: &Path,
    result: Result<BpmnDefinitions, BuildError>,
) -> Result<Result<BpmnDefinitions, BuildError>, String> {
    let Some(export) = case.get("export") else {
        return Ok(result);
    };
    let Ok(defs) = result else {
        return Ok(result);
    };
    // Absent means TS's default, "auto"; `false` turns the check off.
    let validate = match export.get("validate") {
        Some(v) if v.raw.trim() == "false" => ExportValidate::Off,
        Some(v) => match v.as_str() {
            Some("warn") => ExportValidate::Warn,
            Some("error") => ExportValidate::Error,
            _ => ExportValidate::Auto,
        },
        None => ExportValidate::Auto,
    };
    let warning = match export_bpmn(&defs, ExportOptions { validate }) {
        Err(e) => {
            return Ok(Err(BuildError {
                message: e.to_string(),
            }))
        }
        Ok(out) => out.warning,
    };
    let warning_path = expected.join("warning.txt");
    let want = warning_path
        .exists()
        .then(|| read(&warning_path))
        .transpose()?;
    if warning.as_ref().map(|w| format!("{w}\n")) != want {
        return Err(format!("warning {warning:?} != {want:?}"));
    }
    Ok(Ok(defs))
}

fn compare<T: serde::Serialize>(
    expected: &Path,
    result: Result<T, BuildError>,
    ext: &str,
    serialize: fn(&T) -> String,
    diff: fn(&str, &Value, &Value) -> Option<String>,
) -> Result<(), String> {
    let error_path = expected.join("error.txt");
    if error_path.exists() {
        let want = read(&error_path)?;
        return match result {
            Err(e) if format!("{}\n", e.message) == want => Ok(()),
            Err(e) => Err(format!("error {:?} != {:?}", e.message, want)),
            Ok(_) => Err(format!("built, expected error {want:?}")),
        };
    }
    let built = result.map_err(|e| format!("unexpected error: {}", e.message))?;
    let output = format!("output.{ext}");
    let xml = serialize(&built);
    let want_xml = read(&expected.join(&output))?;
    if xml != want_xml {
        return Err(format!("{output} {}", first_diff_line(&xml, &want_xml)));
    }
    let want_model: Value = serde_json::from_str(&read(&expected.join("model.json"))?)
        .map_err(|e| format!("model.json: {e}"))?;
    let actual = serde_json::to_value(&built).map_err(|e| e.to_string())?;
    match diff("$", &actual, &want_model) {
        Some(d) => Err(format!("model.json {d}")),
        None => Ok(()),
    }
}

fn read(p: &Path) -> Result<String, String> {
    crate::tooling::read(p)
}

// ── Runner ──────────────────────────────────────────────────────────────────

/// Ids of every `builder/` case.
pub fn case_ids(dir: &Path) -> Vec<String> {
    crate::load_case_ids(dir, "builder")
}

/// Replays one case (`builder/<name>` under `dir`); the error says what differs.
pub fn check_case(dir: &Path, id: &str) -> Result<(), String> {
    let case_dir = dir.join(id);
    let expected = case_dir.join("expected");
    let case_text = read(&case_dir.join("case.json"))?;
    let case = read_source(&case_text);
    let script = case.get("script").ok_or("case.json has no script")?.items();
    if let Some(method) = missing_callback(script) {
        return Err(format!(
            "{method}() without a content callback cannot be written in Rust (the callback is a required closure)"
        ));
    }

    reset_id_counter();
    let (first, rest) = script.split_first().ok_or("empty script")?;
    let no_build = || format!("{id}: script has no build");
    match split(first) {
        ("createDecisionTable", a) => {
            let mut b = Dmn::create_decision_table(a[0].str());
            let result = replay_table(&mut b, rest).ok_or_else(no_build)?;
            compare(
                &expected,
                result,
                "dmn",
                serialize_dmn,
                crate::bpmn::json_diff,
            )
        }
        ("drd", a) => {
            let mut b = Dmn::drd(a.first().map(J::str));
            let result = replay_drd(&mut b, rest).ok_or_else(no_build)?;
            compare(
                &expected,
                result,
                "dmn",
                serialize_dmn,
                crate::bpmn::json_diff,
            )
        }
        ("createDiagram", a) => {
            let mut b = Bpmn::create_diagram(a.first().map(J::str));
            let result = replay_diagram(&mut b, rest).ok_or_else(no_build)?;
            let result = exported(&case, &expected, result)?;
            compare(&expected, result, "bpmn", serialize_bpmn, lenient_diff)
        }
        ("createProcess", a) => {
            let mut b = Bpmn::create_process(a[0].str());
            let result = replay_process(&mut b, rest).ok_or_else(no_build)?;
            let result = exported(&case, &expected, result)?;
            compare(&expected, result, "bpmn", serialize_bpmn, lenient_diff)
        }
        ("from", a) => {
            let path = match case.get("input").map(J::str) {
                Some(p) if case_dir.join(p).exists() => case_dir.join(p),
                Some(p) => dir.join(p),
                None => case_dir.join("input.bpmn"),
            };
            let defs = parse_bpmn(&read(&path)?).map_err(|e| format!("parse: {e}"))?;
            let mut b = Bpmn::continue_process(&defs, a[0].str());
            let result = replay_process(&mut b, rest).ok_or_else(no_build)?;
            let result = exported(&case, &expected, result)?;
            compare(&expected, result, "bpmn", serialize_bpmn, lenient_diff)
        }
        (other, _) => Err(format!("unsupported first op {other}")),
    }
}
