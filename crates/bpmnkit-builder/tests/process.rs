//! Replays the recorded TS builder scripts of `conformance/builder/` (see the corpus
//! README, "Builder") against `ProcessBuilder` and the branch / sub-process builders it
//! hands to callbacks: the built model's XML must equal `expected/output.bpmn`, its JSON
//! `expected/model.json`, and a failing script must fail with `expected/error.txt`.
//!
//! Option bags are typed straight from the case's JSON text (not through
//! `serde_json::Value`, which sorts keys): `taskHeaders` keep their order.

use std::panic::{catch_unwind, AssertUnwindSafe};
use std::path::{Path, PathBuf};

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn, BpmnDefinitions};
use bpmnkit_builder::{
    BoundaryEventOptions, Bpmn, BranchBuilder, BuildError, ProcessBuilder, SubProcessContentBuilder,
};
use serde::de::DeserializeOwned;
use serde_json::Value;

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

fn read_json(src: &str) -> J<'_> {
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

fn json_diff(path: &str, a: &Value, b: &Value) -> Option<String> {
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
                .find_map(|(i, (x, y))| json_diff(&format!("{path}[{i}]"), x, y))
        }
        (Value::Object(x), Value::Object(y)) => {
            for (k, xv) in x {
                match y.get(k) {
                    Some(yv) => {
                        if let Some(d) = json_diff(&format!("{path}.{k}"), xv, yv) {
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

fn first_diff_line(actual: &str, expected: &str) -> String {
    let n = actual
        .lines()
        .zip(expected.lines())
        .position(|(a, e)| a != e)
        .unwrap_or_else(|| actual.lines().count().min(expected.lines().count()));
    format!(
        "line {}: {:?} != {:?}",
        n + 1,
        actual.lines().nth(n),
        expected.lines().nth(n)
    )
}

// ── Runner ──────────────────────────────────────────────────────────────────

fn corpus() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance")
}

/// Cases this file does not replay: `diagram-*` drive `DiagramBuilder` (tested with it);
/// a missing content callback is a type error in Rust.
fn replayed(name: &str) -> bool {
    !name.starts_with("diagram-") && name != "sub-process-no-callback-error"
}

fn check_case(name: &str) -> Result<(), String> {
    let dir = corpus().join("builder").join(name);
    let read = |p: &Path| std::fs::read_to_string(p).map_err(|e| format!("{}: {e}", p.display()));
    let case_text = read(&dir.join("case.json"))?;
    let case = read_json(&case_text);
    let script = case.get("script").expect("script").items();

    reset_id_counter();
    let (first, rest) = script.split_first().expect("non-empty script");
    let mut builder = match split(first) {
        ("createProcess", a) => Bpmn::create_process(a[0].str()),
        ("from", a) => {
            let input = case.get("input").map(|j| j.str().to_owned());
            let path = match input {
                Some(p) if dir.join(&p).exists() => dir.join(p),
                Some(p) => corpus().join(p),
                None => dir.join("input.bpmn"),
            };
            let defs = parse_bpmn(&read(&path)?).map_err(|e| format!("parse: {e}"))?;
            Bpmn::continue_process(&defs, a[0].str())
        }
        (other, _) => return Err(format!("unsupported first op {other}")),
    };
    let result = replay_process(&mut builder, rest).ok_or("script has no build")?;

    let error_path = dir.join("expected/error.txt");
    if error_path.exists() {
        let expected = read(&error_path)?;
        return match result {
            Err(e) if e.message == expected.trim_end_matches('\n') => Ok(()),
            Err(e) => Err(format!("error {:?} != {:?}", e.message, expected)),
            Ok(_) => Err(format!("built, expected error {expected:?}")),
        };
    }
    let defs = result.map_err(|e| format!("unexpected error: {}", e.message))?;
    let xml = serialize_bpmn(&defs);
    let expected_xml = read(&dir.join("expected/output.bpmn"))?;
    if xml != expected_xml {
        return Err(format!(
            "output.bpmn {}",
            first_diff_line(&xml, &expected_xml)
        ));
    }
    let expected_model: Value = serde_json::from_str(&read(&dir.join("expected/model.json"))?)
        .map_err(|e| e.to_string())?;
    let actual = serde_json::to_value(&defs).map_err(|e| e.to_string())?;
    if let Some(d) = json_diff("$", &actual, &expected_model) {
        return Err(format!("model.json {d}"));
    }
    Ok(())
}

fn run(names: &[String]) -> Vec<String> {
    names
        .iter()
        .filter_map(|name| {
            let outcome = catch_unwind(AssertUnwindSafe(|| check_case(name)));
            match outcome {
                Ok(Ok(())) => None,
                Ok(Err(e)) => Some(format!("{name}: {e}")),
                Err(panic) => {
                    let msg = panic
                        .downcast_ref::<String>()
                        .cloned()
                        .or_else(|| panic.downcast_ref::<&str>().map(|s| (*s).to_owned()))
                        .unwrap_or_default();
                    Some(format!("{name}: panicked: {msg}"))
                }
            }
        })
        .collect()
}

fn bpmn_cases() -> Vec<String> {
    let mut names: Vec<String> = std::fs::read_dir(corpus().join("builder"))
        .expect("conformance/builder")
        .filter_map(|e| e.ok())
        .map(|e| e.file_name().to_string_lossy().into_owned())
        .filter(|name| replayed(name))
        .filter(|name| {
            let case = corpus().join("builder").join(name).join("case.json");
            std::fs::read_to_string(case).is_ok_and(|t| t.contains("\"kind\": \"bpmn\""))
        })
        .collect();
    names.sort();
    names
}

/// Every BPMN builder case of the corpus. Needs the element factories (`elements.rs`) and
/// the branch / sub-process builders.
#[test]
fn conformance_builder_bpmn() {
    let names = bpmn_cases();
    assert!(names.len() > 150, "found only {} cases", names.len());
    let failures = run(&names);
    assert!(
        failures.is_empty(),
        "{} of {} cases fail:\n{}",
        failures.len(),
        names.len(),
        failures.join("\n")
    );
}

/// Cases that only reach `ProcessBuilder`'s own code (continuing a document, its errors).
#[test]
fn conformance_builder_continue_errors() {
    let names: Vec<String> = [
        "from-unknown-process-error",
        "from-at-unknown-error",
        "from-at-end-error",
        "from-at-already-continued-error",
        "from-insert-after-unknown-error",
        "from-insert-after-end-error",
        "from-insert-after-branch-error",
    ]
    .iter()
    .map(|s| (*s).to_owned())
    .collect();
    let failures = run(&names);
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

#[test]
fn missing_process_lists_the_document_or_says_none() {
    let defs = BpmnDefinitions::default();
    let err = ProcessBuilder::from(&defs, "p").build(None).unwrap_err();
    assert_eq!(
        err.message,
        "Process \"p\" is not in this document. It contains: no processes"
    );
}
