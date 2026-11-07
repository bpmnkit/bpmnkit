//! Times the fluent builders over the scripts of `conformance/builder/` that build
//! (the ones `scripts/bench-builder.mjs` replays for TS): BPMN without and with auto
//! layout, DMN tables and DRDs, and `serialize_bpmn` / `serialize_dmn` of the results.
//! `diagram-*` scripts (the `DiagramBuilder`) are left out on both sides.
//!
//! The replayer is copied from `tests/process.rs` / `tests/dmn.rs`. Its option bags are
//! decoded from JSON text on every op, which the TS replayer (options already parsed)
//! does not pay; the "decode only" row times that cost alone.

use std::cell::Cell;
use std::collections::HashMap;
use std::hint::black_box;
use std::path::{Path, PathBuf};
use std::time::Instant;

use bpmnkit_bpmn::ids::reset_id_counter;
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn, BpmnDefinitions};
use bpmnkit_builder::drd::{drg_id, DrdBuilder, DrdDecisionOptions, DrgRef};
use bpmnkit_builder::options::{HitPolicy, InputOptions, OutputOptions, RuleOptions};
use bpmnkit_builder::{
    BoundaryEventOptions, Bpmn, BranchBuilder, BuildError, DecisionTableBuilder, Dmn,
    ProcessBuilder, SubProcessContentBuilder,
};
use bpmnkit_dmn::{serialize_dmn, DmnDefinitions};
use serde::de::DeserializeOwned;
use serde_json::Value;

thread_local! {
    /// Whether `withAutoLayout` ops (and a final one) take effect in this pass.
    static LAYOUT: Cell<bool> = const { Cell::new(false) };
}

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
            ("build", a) => {
                if LAYOUT.get() {
                    b.with_auto_layout();
                }
                return Some(b.build(opt(a.first())));
            }
            ("at", a) => done(b.at(a[0].str())),
            ("insertAfter", a) => done(b.insert_after(a[0].str())),
            ("withAutoLayout", _) => {
                if LAYOUT.get() {
                    done(b.with_auto_layout());
                }
            }
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

fn s(v: &Value) -> &str {
    v.as_str().expect("string argument")
}

fn replay_table(b: &mut DecisionTableBuilder, ops: &[Value]) {
    for op in ops {
        let op = op.as_array().expect("op");
        let args = &op[1..];
        match s(&op[0]) {
            "name" => drop(b.name(s(&args[0]))),
            "hitPolicy" => {
                let policy: HitPolicy = serde_json::from_value(args[0].clone()).unwrap();
                b.hit_policy(policy);
            }
            "input" => {
                let o: InputOptions = serde_json::from_value(args[0].clone()).unwrap();
                b.input(o);
            }
            "output" => {
                let o: OutputOptions = serde_json::from_value(args[0].clone()).unwrap();
                b.output(o);
            }
            "rule" => {
                let o: RuleOptions = serde_json::from_value(args[0].clone()).unwrap();
                b.rule(o);
            }
            other => panic!("unknown table op {other}"),
        }
    }
}

fn callback_ops(v: &Value) -> Vec<Value> {
    v["$ops"].as_array().expect("$ops").clone()
}

fn resolve_ref(v: &Value, handles: &HashMap<String, DrgRef>) -> DrgRef {
    if let Some(name) = v.get("$ref") {
        return handles[s(name)].clone();
    }
    if let Some(id) = v.get("$drgId") {
        return drg_id(s(id)).into();
    }
    drg_id(s(v)).into()
}

fn replay_drd(b: &mut DrdBuilder, ops: &[Value]) -> Option<Result<DmnDefinitions, String>> {
    let mut handles: HashMap<String, DrgRef> = HashMap::new();
    for op in ops {
        let op = op.as_array().expect("op");
        let (name, rest): (Option<&str>, &[Value]) = if s(&op[0]) == "$let" {
            (Some(s(&op[1])), &op[2..])
        } else {
            (None, &op[..])
        };
        let args = &rest[1..];
        let handle: Option<DrgRef> = match s(&rest[0]) {
            "inputData" => Some(b.input_data(s(&args[0]), args.get(1).map(s)).into()),
            "decision" => {
                let table_ops = callback_ops(&args[1]);
                let requires = args
                    .get(2)
                    .and_then(|o| o.get("requires"))
                    .and_then(Value::as_array)
                    .map(|a| a.iter().map(|r| resolve_ref(r, &handles)).collect())
                    .unwrap_or_default();
                Some(
                    b.decision(
                        s(&args[0]),
                        |t| replay_table(t, &table_ops),
                        DrdDecisionOptions { requires },
                    )
                    .into(),
                )
            }
            "build" => {
                return Some(b.build().map_err(|e| e.message));
            }
            other => panic!("unknown drd op {other}"),
        };
        if let (Some(name), Some(h)) = (name, handle) {
            handles.insert(name.to_owned(), h);
        }
    }
    None
}

fn run_dmn(case: &Value) -> Result<DmnDefinitions, String> {
    let script = case["script"].as_array().unwrap();
    reset_id_counter();
    let first = script[0].as_array().unwrap();
    match s(&first[0]) {
        "createDecisionTable" => {
            let mut b = Dmn::create_decision_table(s(&first[1]));
            let (last, init) = script[1..].split_last().unwrap();
            replay_table(&mut b, init);
            assert_eq!(s(&last[0]), "build");
            b.build().map_err(|e| e.message)
        }
        "drd" => {
            let mut b = Dmn::drd(first.get(1).map(s));
            replay_drd(&mut b, &script[1..]).expect("script ends with build")
        }
        other => panic!("unknown start {other}"),
    }
}

/// A BPMN case: its parsed script and, for `from` scripts, the input document.
struct BpmnCase<'a> {
    case: J<'a>,
    input: Option<BpmnDefinitions>,
}

fn run_bpmn(case: &BpmnCase, layout: bool) -> Result<BpmnDefinitions, BuildError> {
    LAYOUT.set(layout);
    reset_id_counter();
    let script = case.case.get("script").expect("script").items();
    let (first, rest) = script.split_first().expect("non-empty script");
    let mut builder = match split(first) {
        ("createProcess", a) => Bpmn::create_process(a[0].str()),
        ("from", a) => Bpmn::continue_process(case.input.as_ref().expect("input"), a[0].str()),
        (other, _) => panic!("unsupported first op {other}"),
    };
    replay_process(&mut builder, rest).expect("script has no build")
}

/// Runs every option bag of a script through the JSON decoder: the replayer's own cost.
fn decode_only(j: &J) {
    match &j.node {
        Node::Arr(items) => items.iter().for_each(decode_only),
        Node::Obj(entries) => {
            if j.get("$ops").is_none() {
                black_box(serde_json::from_str::<Value>(j.raw).ok());
            }
            entries.iter().for_each(|(_, v)| decode_only(v));
        }
        _ => {}
    }
}

fn corpus() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../conformance")
}

fn time(label: &str, iterations: u32, mut run: impl FnMut()) {
    for _ in 0..iterations / 10 {
        run();
    }
    let start = Instant::now();
    for _ in 0..iterations {
        run();
    }
    let ms = start.elapsed().as_secs_f64() * 1e3 / f64::from(iterations);
    println!("{label:<18} {ms:>9.3} ms per pass");
}

fn main() {
    let iterations: u32 = std::env::args()
        .skip(1)
        .find_map(|a| a.parse().ok())
        .unwrap_or(30);
    let root = corpus().join("builder");
    let mut names: Vec<_> = std::fs::read_dir(&root)
        .expect("conformance/builder")
        .filter_map(|e| e.ok().map(|e| e.file_name().to_string_lossy().into_owned()))
        .filter(|n| !n.starts_with("diagram-"))
        .collect();
    names.sort();

    let mut texts = Vec::new();
    let mut dmn_cases: Vec<Value> = Vec::new();
    let mut inputs = Vec::new();
    for name in &names {
        let dir = root.join(name);
        if dir.join("expected/error.txt").exists() {
            continue;
        }
        let text = std::fs::read_to_string(dir.join("case.json")).expect("case.json");
        let case: Value = serde_json::from_str(&text).expect("json");
        if case["kind"] == "dmn" {
            dmn_cases.push(case);
            continue;
        }
        let input = (case["script"][0][0] == "from").then(|| {
            let local = dir.join(case["input"].as_str().unwrap_or("input.bpmn"));
            let path = match case["input"].as_str() {
                Some(p) if !local.exists() => corpus().join(p),
                _ => local,
            };
            parse_bpmn(&std::fs::read_to_string(path).expect("input")).expect("parses")
        });
        texts.push(text);
        inputs.push(input);
    }
    let cases: Vec<BpmnCase> = texts
        .iter()
        .zip(inputs)
        .map(|(text, input)| BpmnCase {
            case: read_json(text),
            input,
        })
        .collect();

    // Cases whose script cannot build in a mode drop out of that mode (and of the TS side).
    let plain: Vec<&BpmnCase> = cases
        .iter()
        .filter(|c| run_bpmn(c, false).is_ok())
        .collect();
    let laid: Vec<&BpmnCase> = cases.iter().filter(|c| run_bpmn(c, true).is_ok()).collect();
    let dmn_ok: Vec<&Value> = dmn_cases.iter().filter(|c| run_dmn(c).is_ok()).collect();
    let plain_out: Vec<BpmnDefinitions> =
        plain.iter().map(|c| run_bpmn(c, false).unwrap()).collect();
    let laid_out: Vec<BpmnDefinitions> = laid.iter().map(|c| run_bpmn(c, true).unwrap()).collect();
    let dmn_out: Vec<DmnDefinitions> = dmn_ok.iter().map(|c| run_dmn(c).unwrap()).collect();
    println!(
        "{} BPMN scripts ({} with layout), {} DMN scripts, {iterations} passes",
        plain.len(),
        laid.len(),
        dmn_ok.len()
    );

    time("build", iterations, || {
        for c in &plain {
            black_box(run_bpmn(black_box(c), false).ok());
        }
    });
    time("build layout", iterations, || {
        for c in &laid {
            black_box(run_bpmn(black_box(c), true).ok());
        }
    });
    time("build dmn", iterations, || {
        for c in &dmn_ok {
            black_box(run_dmn(black_box(c)).ok());
        }
    });
    time("serialize", iterations, || {
        for d in &plain_out {
            black_box(serialize_bpmn(black_box(d)));
        }
    });
    time("serialize layout", iterations, || {
        for d in &laid_out {
            black_box(serialize_bpmn(black_box(d)));
        }
    });
    time("serialize dmn", iterations, || {
        for d in &dmn_out {
            black_box(serialize_dmn(black_box(d)));
        }
    });
    time("decode only", iterations, || {
        for c in &plain {
            decode_only(black_box(&c.case));
        }
    });
}
