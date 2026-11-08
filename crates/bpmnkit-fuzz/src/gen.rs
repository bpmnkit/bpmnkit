//! Proptest strategies, one per [`Target`], each yielding the JSON request both sides answer.
//! Inputs are built from the formats' own vocabulary (element names, Zeebe extensions, FEEL
//! built-ins, process-text kinds) plus tricky text, so most of them parse and the comparison
//! reaches past the parser.

use crate::Target;
use bpmnkit_spec::feel::FEEL_BUILTINS;
use proptest::collection::vec;
use proptest::prelude::*;
use proptest::sample::select;
use serde_json::{json, Map, Value as Json};

pub fn strategy(target: Target) -> BoxedStrategy<Json> {
    match target {
        Target::Feel => feel_request().boxed(),
        Target::Bpmn | Target::Compact => bpmn_xml().prop_map(|xml| json!({ "xml": xml })).boxed(),
        Target::Dmn => dmn_xml().prop_map(|(xml, _)| json!({ "xml": xml })).boxed(),
        Target::DmnEval => dmn_eval_request().boxed(),
        Target::Form => form_json().prop_map(|j| json!({ "json": j })).boxed(),
        Target::Text => process_text().prop_map(|t| json!({ "text": t })).boxed(),
    }
}

// ── shared text ──────────────────────────────────────────────────────────────

/// Names as a user writes them, XML-escaped where needed by [`xml_attr`].
const NAMES: &[&str] = &[
    "Review",
    "Check order",
    "A & B",
    "<tag>",
    "say \"hi\"",
    "it's",
    "line\nbreak",
    "  padded  ",
    "Ünïcödé 😀",
    "tab\there",
    "",
    "x > 1?",
    "a]]>b",
    "\r\n",
    "Ω",
];

/// Attribute values already escaped, to reach the parser's entity handling.
const RAW_ATTRS: &[&str] = &[
    "&#10;",
    "&quot;q&quot;",
    "&#xD;&#xA;",
    "a&lt;b",
    "&amp;amp;",
    "&#x1F600;",
    "&apos;",
];

fn xml_attr(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn xml_text(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

fn name() -> impl Strategy<Value = String> {
    prop_oneof![
        4 => select(NAMES).prop_map(xml_attr),
        1 => select(RAW_ATTRS).prop_map(str::to_owned),
        1 => "[a-zA-Z0-9 _-]{0,12}".prop_map(|s| xml_attr(&s)),
    ]
}

// ── FEEL ─────────────────────────────────────────────────────────────────────

const FEEL_VARS: &[&str] = &["a", "b", "c", "s", "l", "ctx", "d", "missing", "item"];

const FEEL_STRINGS: &[&str] = &[
    "\"\"",
    "\"abc\"",
    "\"a\\\"b\"",
    "\"line\\nnext\"",
    "\"ü😀\"",
    "\"  x \"",
    "\"2024-01-15\"",
    "\"12:30:00\"",
    "\"P1D\"",
    "\"1.5\"",
    "\"a,b,c\"",
    "\"\\u0041\"",
    "\"[a-z]+\"",
];

const FEEL_TEMPORALS: &[&str] = &[
    "@\"2024-02-29\"",
    "@\"2023-12-31T23:59:59\"",
    "@\"10:30:00\"",
    "@\"10:30:00+02:00\"",
    "@\"P1D\"",
    "@\"P1Y2M\"",
    "@\"PT36H\"",
    "@\"-P1D\"",
    "@\"2024-01-01T10:00:00Z\"",
    "@\"2024-03-31T02:30:00@Europe/Berlin\"",
    "date(\"2024-01-31\")",
    "time(\"12:00:00Z\")",
    "date and time(\"2024-01-01T00:00:00\")",
    "duration(\"P2DT3H\")",
    "duration(\"PT0.5S\")",
    "years and months duration(@\"2020-01-01\", @\"2024-06-15\")",
];

/// Built-ins that read the clock or randomness, so the two sides cannot agree.
const UNSTABLE: &[&str] = &["now", "today", "random number", "uuid"];

fn feel_number() -> impl Strategy<Value = String> {
    prop_oneof![
        (-100i64..100).prop_map(|n| n.to_string()),
        (-100_000i64..100_000, 1u32..5).prop_map(|(n, s)| {
            let p = 10i64.pow(s);
            let sign = if n < 0 { "-" } else { "" };
            format!(
                "{sign}{}.{:0width$}",
                n.abs() / p,
                n.abs() % p,
                width = s as usize
            )
        }),
        select(&["0", ".5", "1.0", "-0", "1000000", "0.1", "3.14159"][..]).prop_map(str::to_owned),
    ]
}

fn feel_leaf() -> impl Strategy<Value = String> {
    prop_oneof![
        3 => feel_number(),
        2 => select(FEEL_STRINGS).prop_map(str::to_owned),
        3 => select(FEEL_VARS).prop_map(str::to_owned),
        1 => select(&["true", "false", "null"][..]).prop_map(str::to_owned),
        2 => select(FEEL_TEMPORALS).prop_map(str::to_owned),
        1 => select(&["ctx.a", "ctx.b", "ctx.n.x", "l[1]", "l[-1]", "\"x\".y"][..]).prop_map(str::to_owned),
    ]
}

/// `**` is generated apart with a small exponent: a large power leaves Rust's decimal range
/// (about 7.9e28), where only float64 has a value, and that is the number model, not a defect.
const BIN_OPS: &[&str] = &[
    "+", "-", "*", "/", "=", "!=", "<", "<=", ">", ">=", "and", "or",
];

fn feel_expr() -> impl Strategy<Value = String> {
    let builtins: Vec<&'static str> = FEEL_BUILTINS
        .iter()
        .map(|b| b.name)
        .filter(|n| !UNSTABLE.contains(n))
        .collect();
    feel_leaf().prop_recursive(4, 24, 4, move |inner| {
        let builtins = builtins.clone();
        let paren = |s: String, p: bool| if p { format!("({s})") } else { s };
        prop_oneof![
            4 => (inner.clone(), select(BIN_OPS), inner.clone(), any::<bool>())
                .prop_map(move |(a, op, b, p)| paren(format!("{a} {op} {b}"), p)),
            1 => (inner.clone(), select(&["0", "1", "2", "3", "-1", "-2", "0.5", "1.5", "-0.5"][..]))
                .prop_map(|(a, e)| format!("{a} ** {e}")),
            1 => inner.clone().prop_map(|a| format!("-{a}")),
            1 => inner.clone().prop_map(|a| format!("not({a})")),
            2 => (inner.clone(), inner.clone(), inner.clone())
                .prop_map(|(c, a, b)| format!("if {c} then {a} else {b}")),
            2 => vec(inner.clone(), 0..4).prop_map(|v| format!("[{}]", v.join(", "))),
            1 => vec((select(&["a", "b", "\"k 2\"", "x"][..]), inner.clone()), 0..3).prop_map(|v| {
                let entries: Vec<String> = v.iter().map(|(k, e)| format!("{k}: {e}")).collect();
                format!("{{{}}}", entries.join(", "))
            }),
            1 => (inner.clone(), select(&["a", "b", "x"][..])).prop_map(|(c, k)| format!("({c}).{k}")),
            2 => (inner.clone(), inner.clone()).prop_map(|(l, f)| format!("({l})[{f}]")),
            1 => inner.clone().prop_map(|f| format!("l[item > {f}]")),
            4 => (select(builtins), vec(inner.clone(), 0..4))
                .prop_map(|(f, args)| format!("{f}({})", args.join(", "))),
            1 => (inner.clone(), inner.clone()).prop_map(|(l, r)| format!("for x in {l} return {r}")),
            1 => inner.clone().prop_map(|r| format!("for i in 1..3 return i * {r}")),
            1 => (select(&["some", "every"][..]), inner.clone(), inner.clone())
                .prop_map(|(q, l, c)| format!("{q} x in {l} satisfies x > {c}")),
            1 => (inner.clone(), inner.clone(), inner.clone())
                .prop_map(|(x, a, b)| format!("{x} between {a} and {b}")),
            1 => (inner.clone(), select(&["[1..5]", "(1, 2)", "> 3", "[\"a\"..\"m\")", "not(2)", "-"][..]))
                .prop_map(|(x, t)| format!("{x} in {t}")),
            1 => (inner.clone(), select(&["number", "string", "date", "boolean", "list<number>", "context", "Any", "days and time duration"][..]))
                .prop_map(|(x, t)| format!("{x} instance of {t}")),
            1 => (inner.clone(), inner.clone(), select(&["[", "("][..]), select(&["]", ")"][..]))
                .prop_map(|(a, b, o, c)| format!("{o}{a}..{b}{c}")),
            1 => (inner.clone(), inner).prop_map(|(a, b)| format!("{a} + \" \" + string({b})")),
        ]
    })
}

/// A neutral conformance value (`{"t": .., "v": ..}`).
fn feel_value() -> impl Strategy<Value = Json> {
    let leaf = prop_oneof![
        Just(json!({ "t": "null" })),
        any::<bool>().prop_map(|b| json!({ "t": "boolean", "v": b })),
        feel_number()
            .prop_map(|n| json!({ "t": "number", "v": n.trim_start_matches('.').to_owned() })),
        select(&["", "abc", "ü", "1.5", "a b", "2024-01-15"][..])
            .prop_map(|s| json!({ "t": "string", "v": s })),
        select(&["2024-02-29", "1999-12-31"][..]).prop_map(|s| json!({ "t": "date", "v": s })),
        select(&["P1D", "PT2H30M", "-PT1S"][..])
            .prop_map(|s| json!({ "t": "days-time-duration", "v": s })),
        select(&["P1Y", "P2Y3M"][..]).prop_map(|s| json!({ "t": "years-months-duration", "v": s })),
        select(&["2024-01-01T10:00:00", "2024-06-30T23:59:59Z"][..])
            .prop_map(|s| json!({ "t": "date-time", "v": s })),
    ];
    leaf.prop_recursive(2, 8, 3, |inner| {
        prop_oneof![
            vec(inner.clone(), 0..4).prop_map(|v| json!({ "t": "list", "v": v })),
            vec((select(&["a", "b", "n", "x"][..]), inner), 0..3).prop_map(|v| {
                let m: Map<String, Json> = v.into_iter().map(|(k, x)| (k.to_owned(), x)).collect();
                json!({ "t": "context", "v": m })
            }),
        ]
    })
}

fn feel_request() -> impl Strategy<Value = Json> {
    let numbers = vec(feel_number(), 0..4).prop_map(|v| {
        let items: Vec<Json> = v
            .into_iter()
            .map(|n| json!({ "t": "number", "v": n.trim_start_matches('.').to_owned() }))
            .collect();
        json!({ "t": "list", "v": items })
    });
    (feel_expr(), feel_value(), feel_value(), feel_value(), numbers, feel_value()).prop_map(
        |(expr, a, b, c, l, n)| {
            json!({
                "expr": expr,
                "context": {
                    "a": a, "b": b, "c": c, "l": l,
                    "s": { "t": "string", "v": "Hello World" },
                    "d": { "t": "date", "v": "2024-01-15" },
                    "ctx": { "t": "context", "v": { "a": { "t": "number", "v": "1" }, "b": { "t": "string", "v": "x" }, "n": n } },
                },
            })
        },
    )
}

// ── BPMN ─────────────────────────────────────────────────────────────────────

/// (element, event definition allowed, is an activity).
const BPMN_KINDS: &[(&str, bool, bool)] = &[
    ("startEvent", true, false),
    ("endEvent", true, false),
    ("intermediateCatchEvent", true, false),
    ("intermediateThrowEvent", true, false),
    ("task", false, true),
    ("serviceTask", false, true),
    ("userTask", false, true),
    ("scriptTask", false, true),
    ("businessRuleTask", false, true),
    ("sendTask", false, true),
    ("receiveTask", false, true),
    ("manualTask", false, true),
    ("callActivity", false, true),
    ("exclusiveGateway", false, false),
    ("parallelGateway", false, false),
    ("inclusiveGateway", false, false),
    ("eventBasedGateway", false, false),
    ("complexGateway", false, false),
    ("subProcess", false, true),
    ("adHocSubProcess", false, true),
    ("transaction", false, true),
];

const EVENT_DEFS: &[&str] = &[
    "",
    "<bpmn:timerEventDefinition><bpmn:timeDuration xsi:type=\"bpmn:tFormalExpression\">PT5M</bpmn:timeDuration></bpmn:timerEventDefinition>",
    "<bpmn:timerEventDefinition><bpmn:timeCycle>R3/PT1H</bpmn:timeCycle></bpmn:timerEventDefinition>",
    "<bpmn:timerEventDefinition><bpmn:timeDate>2025-01-01T09:00:00Z</bpmn:timeDate></bpmn:timerEventDefinition>",
    "<bpmn:messageEventDefinition messageRef=\"Msg_1\" />",
    "<bpmn:signalEventDefinition signalRef=\"Sig_1\" />",
    "<bpmn:errorEventDefinition errorRef=\"Err_1\" />",
    "<bpmn:escalationEventDefinition escalationRef=\"Esc_1\" />",
    "<bpmn:conditionalEventDefinition><bpmn:condition xsi:type=\"bpmn:tFormalExpression\">=x &gt; 1</bpmn:condition></bpmn:conditionalEventDefinition>",
    "<bpmn:terminateEventDefinition />",
    "<bpmn:linkEventDefinition name=\"L\" />",
    "<bpmn:compensateEventDefinition />",
    "<bpmn:messageEventDefinition />",
];

const EXTENSIONS: &[&str] = &[
    "<zeebe:taskDefinition type=\"job-a\" retries=\"3\" />",
    "<zeebe:taskDefinition type=\"=&quot;dyn&quot; + x\" />",
    "<zeebe:ioMapping><zeebe:input source=\"=a\" target=\"b\" /><zeebe:output source=\"=res\" target=\"out\" /></zeebe:ioMapping>",
    "<zeebe:taskHeaders><zeebe:header key=\"k\" value=\"v &amp; w\" /></zeebe:taskHeaders>",
    "<zeebe:properties><zeebe:property name=\"p\" value=\"1\" /></zeebe:properties>",
    "<zeebe:calledDecision decisionId=\"d1\" resultVariable=\"r\" />",
    "<zeebe:calledElement processId=\"child\" propagateAllChildVariables=\"false\" />",
    "<zeebe:formDefinition formId=\"f1\" />",
    "<zeebe:assignmentDefinition assignee=\"=user\" candidateGroups=\"a,b\" />",
    "<zeebe:userTask />",
    "<zeebe:script expression=\"=a + 1\" resultVariable=\"r\" />",
    "<zeebe:subscription correlationKey=\"=id\" />",
    "<zeebe:executionListeners><zeebe:executionListener eventType=\"start\" type=\"l\" /></zeebe:executionListeners>",
    "<zeebe:adHoc activeElementsCollection=\"=tools\" />",
    "<foo:custom a=\"1\"><foo:child>text</foo:child></foo:custom>",
    "<modeler:x />",
];

const LOOPS: &[&str] = &[
    "<bpmn:multiInstanceLoopCharacteristics isSequential=\"true\"><bpmn:extensionElements><zeebe:loopCharacteristics inputCollection=\"=items\" inputElement=\"item\" /></bpmn:extensionElements></bpmn:multiInstanceLoopCharacteristics>",
    "<bpmn:multiInstanceLoopCharacteristics><bpmn:completionCondition xsi:type=\"bpmn:tFormalExpression\">=done</bpmn:completionCondition></bpmn:multiInstanceLoopCharacteristics>",
    "<bpmn:standardLoopCharacteristics />",
];

const CONDITIONS: &[&str] = &[
    "=x &gt; 1",
    "=status = \"ok\"",
    "<![CDATA[=a < b]]>",
    "  =trimmed  ",
    "",
];

#[derive(Debug, Clone)]
struct Node {
    kind: usize,
    name: Option<String>,
    event_def: usize,
    extensions: Vec<usize>,
    loop_kind: Option<usize>,
    doc: Option<String>,
    attrs: u8,
}

fn node() -> impl Strategy<Value = Node> {
    (
        0..BPMN_KINDS.len(),
        proptest::option::of(name()),
        0..EVENT_DEFS.len(),
        vec(0..EXTENSIONS.len(), 0..3),
        proptest::option::weighted(0.15, 0..LOOPS.len()),
        proptest::option::weighted(0.15, select(NAMES)),
        any::<u8>(),
    )
        .prop_map(
            |(kind, name, event_def, extensions, loop_kind, doc, attrs)| Node {
                kind,
                name,
                event_def,
                extensions,
                loop_kind,
                doc: doc.map(xml_text),
                attrs,
            },
        )
}

fn render_node(
    out: &mut String,
    i: usize,
    n: &Node,
    flows: &[(usize, usize, Option<usize>)],
    ids: usize,
) {
    let (kind, has_events, activity) = BPMN_KINDS[n.kind];
    let id = format!("n{i}");
    let mut attrs = String::new();
    if let Some(name) = &n.name {
        attrs.push_str(&format!(" name=\"{name}\""));
    }
    if n.attrs & 1 != 0 && kind.ends_with("Gateway") {
        if let Some(j) = flows.iter().position(|f| f.0 == i) {
            attrs.push_str(&format!(" default=\"f{j}\""));
        }
    }
    if n.attrs & 2 != 0 && kind == "subProcess" {
        attrs.push_str(" triggeredByEvent=\"true\"");
    }
    if n.attrs & 4 != 0 && activity {
        attrs.push_str(" isForCompensation=\"true\"");
    }
    if n.attrs & 8 != 0 && kind == "eventBasedGateway" {
        attrs.push_str(" eventGatewayType=\"Exclusive\" instantiate=\"true\"");
    }
    if n.attrs & 16 != 0 {
        attrs.push_str(" foo:extra=\"1\"");
    }
    if n.attrs & 32 != 0 && kind == "startEvent" {
        attrs.push_str(" isInterrupting=\"false\"");
    }
    if n.attrs & 64 != 0 && kind == "scriptTask" {
        attrs.push_str(" scriptFormat=\"feel\"");
    }
    out.push_str(&format!("    <bpmn:{kind} id=\"{id}\"{attrs}>\n"));
    if let Some(d) = &n.doc {
        out.push_str(&format!(
            "      <bpmn:documentation>{d}</bpmn:documentation>\n"
        ));
    }
    if !n.extensions.is_empty() {
        out.push_str("      <bpmn:extensionElements>");
        for e in &n.extensions {
            out.push_str(EXTENSIONS[*e]);
        }
        out.push_str("</bpmn:extensionElements>\n");
    }
    for (j, (from, to, _)) in flows.iter().enumerate() {
        if *to == i {
            out.push_str(&format!("      <bpmn:incoming>f{j}</bpmn:incoming>\n"));
        }
        if *from == i {
            out.push_str(&format!("      <bpmn:outgoing>f{j}</bpmn:outgoing>\n"));
        }
    }
    if has_events && n.event_def > 0 {
        out.push_str(&format!("      {}\n", EVENT_DEFS[n.event_def]));
    }
    if let (true, Some(l)) = (activity, n.loop_kind) {
        out.push_str(&format!("      {}\n", LOOPS[l]));
    }
    if kind == "scriptTask" && n.attrs & 128 != 0 {
        out.push_str("      <bpmn:script>a &lt; b</bpmn:script>\n");
    }
    if matches!(kind, "subProcess" | "adHocSubProcess" | "transaction") {
        let p = format!("{id}_");
        out.push_str(&format!(
            "      <bpmn:startEvent id=\"{p}s\" /><bpmn:task id=\"{p}t\" name=\"Inner\" /><bpmn:endEvent id=\"{p}e\" />\n      <bpmn:sequenceFlow id=\"{p}f1\" sourceRef=\"{p}s\" targetRef=\"{p}t\" /><bpmn:sequenceFlow id=\"{p}f2\" sourceRef=\"{p}t\" targetRef=\"{p}e\" />\n"
        ));
    }
    let _ = ids;
    out.push_str(&format!("    </bpmn:{kind}>\n"));
}

#[derive(Debug, Clone)]
struct BpmnDoc {
    nodes: Vec<Node>,
    flows: Vec<(usize, usize, Option<usize>)>,
    boundaries: Vec<(usize, usize, bool)>,
    annotations: Vec<(String, usize)>,
    di: bool,
    collaboration: u8,
    executable: Option<bool>,
    process_name: Option<String>,
    prolog: bool,
    comments: bool,
}

fn bpmn_doc() -> impl Strategy<Value = BpmnDoc> {
    vec(node(), 1..9).prop_flat_map(|nodes| {
        let n = nodes.len();
        (
            Just(nodes),
            vec(
                (
                    0..n,
                    0..n,
                    proptest::option::weighted(0.3, 0..CONDITIONS.len()),
                ),
                0..n + 3,
            ),
            vec((0..n, 1..EVENT_DEFS.len(), any::<bool>()), 0..3),
            vec((select(NAMES).prop_map(xml_text), 0..n), 0..2),
            any::<bool>(),
            any::<u8>(),
            proptest::option::of(any::<bool>()),
            proptest::option::of(name()),
            any::<bool>(),
            proptest::bool::weighted(0.1),
        )
            .prop_map(
                |(
                    nodes,
                    flows,
                    boundaries,
                    annotations,
                    di,
                    collaboration,
                    executable,
                    process_name,
                    prolog,
                    comments,
                )| BpmnDoc {
                    nodes,
                    flows,
                    boundaries,
                    annotations,
                    di,
                    collaboration,
                    executable,
                    process_name,
                    prolog,
                    comments,
                },
            )
    })
}

fn render_bpmn(doc: &BpmnDoc) -> String {
    let mut out = String::new();
    if doc.prolog {
        out.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    }
    out.push_str("<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:di=\"http://www.omg.org/spec/DD/20100524/DI\" xmlns:zeebe=\"http://camunda.org/schema/zeebe/1.0\" xmlns:modeler=\"http://camunda.org/schema/modeler/1.0\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:foo=\"http://example.com/foo\" id=\"Definitions_1\" targetNamespace=\"http://bpmn.io/schema/bpmn\" modeler:executionPlatform=\"Camunda Cloud\" modeler:executionPlatformVersion=\"8.6.0\">\n");
    let collab = doc.collaboration % 4 == 0;
    if collab {
        out.push_str("  <bpmn:collaboration id=\"Collab_1\">\n    <bpmn:participant id=\"P_1\" name=\"Pool\" processRef=\"Process_1\" />\n  </bpmn:collaboration>\n");
    }
    let exec = match doc.executable {
        Some(b) => format!(" isExecutable=\"{b}\""),
        None => String::new(),
    };
    let pname = doc
        .process_name
        .as_ref()
        .map(|n| format!(" name=\"{n}\""))
        .unwrap_or_default();
    out.push_str(&format!("  <bpmn:process id=\"Process_1\"{pname}{exec}>\n"));
    if collab && doc.collaboration & 16 != 0 {
        let refs: String = (0..doc.nodes.len())
            .map(|i| format!("<bpmn:flowNodeRef>n{i}</bpmn:flowNodeRef>"))
            .collect();
        out.push_str(&format!("    <bpmn:laneSet id=\"LS_1\"><bpmn:lane id=\"Lane_1\" name=\"L\">{refs}</bpmn:lane></bpmn:laneSet>\n"));
    }
    for (i, n) in doc.nodes.iter().enumerate() {
        render_node(&mut out, i, n, &doc.flows, doc.nodes.len());
        if doc.comments {
            out.push_str("    <!-- comment -->\n");
        }
    }
    for (k, (host, def, cancel)) in doc.boundaries.iter().enumerate() {
        let c = if *cancel {
            ""
        } else {
            " cancelActivity=\"false\""
        };
        out.push_str(&format!("    <bpmn:boundaryEvent id=\"b{k}\" attachedToRef=\"n{host}\"{c}>{}</bpmn:boundaryEvent>\n", EVENT_DEFS[*def]));
    }
    for (j, (from, to, cond)) in doc.flows.iter().enumerate() {
        match cond {
            Some(c) => out.push_str(&format!("    <bpmn:sequenceFlow id=\"f{j}\" sourceRef=\"n{from}\" targetRef=\"n{to}\"><bpmn:conditionExpression xsi:type=\"bpmn:tFormalExpression\">{}</bpmn:conditionExpression></bpmn:sequenceFlow>\n", CONDITIONS[*c])),
            None => out.push_str(&format!("    <bpmn:sequenceFlow id=\"f{j}\" sourceRef=\"n{from}\" targetRef=\"n{to}\" />\n")),
        }
    }
    for (k, (text, target)) in doc.annotations.iter().enumerate() {
        out.push_str(&format!("    <bpmn:textAnnotation id=\"ta{k}\"><bpmn:text>{text}</bpmn:text></bpmn:textAnnotation>\n    <bpmn:association id=\"as{k}\" sourceRef=\"n{target}\" targetRef=\"ta{k}\" />\n"));
    }
    out.push_str("  </bpmn:process>\n");
    out.push_str("  <bpmn:message id=\"Msg_1\" name=\"m\" />\n  <bpmn:signal id=\"Sig_1\" name=\"s\" />\n  <bpmn:error id=\"Err_1\" errorCode=\"E1\" />\n  <bpmn:escalation id=\"Esc_1\" escalationCode=\"X\" />\n");
    if doc.di {
        let plane = if collab { "Collab_1" } else { "Process_1" };
        out.push_str(&format!("  <bpmndi:BPMNDiagram id=\"D_1\">\n    <bpmndi:BPMNPlane id=\"Pl_1\" bpmnElement=\"{plane}\">\n"));
        for i in 0..doc.nodes.len() {
            let x = 100 + 150 * i;
            let expanded = if BPMN_KINDS[doc.nodes[i].kind].0 == "subProcess" {
                " isExpanded=\"true\""
            } else {
                ""
            };
            out.push_str(&format!("      <bpmndi:BPMNShape id=\"n{i}_di\" bpmnElement=\"n{i}\"{expanded}><dc:Bounds x=\"{x}\" y=\"80.5\" width=\"100\" height=\"80\" /></bpmndi:BPMNShape>\n"));
        }
        for (j, (from, to, _)) in doc.flows.iter().enumerate() {
            out.push_str(&format!("      <bpmndi:BPMNEdge id=\"f{j}_di\" bpmnElement=\"f{j}\"><di:waypoint x=\"{}\" y=\"120\" /><di:waypoint x=\"{}\" y=\"120\" /><bpmndi:BPMNLabel><dc:Bounds x=\"1\" y=\"2\" width=\"3\" height=\"4\" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>\n", 200 + 150 * from, 100 + 150 * to));
        }
        out.push_str("    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n");
    }
    out.push_str("</bpmn:definitions>\n");
    out
}

pub fn bpmn_xml() -> impl Strategy<Value = String> {
    bpmn_doc().prop_map(|d| render_bpmn(&d))
}

// ── DMN ──────────────────────────────────────────────────────────────────────

const DMN_TYPES: &[&str] = &["string", "number", "boolean", "date", "integer", "Any", ""];
const DMN_INPUTS: &[&str] = &["x", "y", "s", "d", "x + 1", "missing"];
const UNARY_TESTS: &[&str] = &[
    "-",
    "",
    "1",
    "> 5",
    "<= 10",
    "[1..10]",
    "(1..10)",
    "]1..10[",
    "not(5)",
    "1, 2, 3",
    "\"a\"",
    "\"a\",\"b\"",
    "not(\"a\")",
    "true",
    "false",
    "null",
    "? > 3",
    "date(\"2024-01-01\")",
    "> date(\"2024-01-01\")",
    "y",
    "\"\"",
    "[\"a\"..\"m\"]",
    "-5",
    ">= -1.5",
    "< x",
    "matches(?, \"^a\")",
];
const OUTPUT_ENTRIES: &[&str] = &[
    "1",
    "\"low\"",
    "\"high\"",
    "true",
    "x + 1",
    "null",
    "\"a\" + s",
    "[1,2]",
    "{a: 1}",
    "date(\"2024-01-01\")",
    "",
    "10.5",
    "\"medium\"",
    "x * y",
    "-",
];
const HIT_POLICIES: &[&str] = &[
    "",
    "UNIQUE",
    "FIRST",
    "ANY",
    "COLLECT",
    "RULE ORDER",
    "PRIORITY",
    "OUTPUT ORDER",
];
const AGGREGATIONS: &[&str] = &["SUM", "COUNT", "MIN", "MAX"];
const DMN_NAMESPACES: &[&str] = &[
    "https://www.omg.org/spec/DMN/20191111/MODEL/",
    "http://www.omg.org/spec/DMN/20180521/MODEL/",
    "https://www.omg.org/spec/DMN/20230324/MODEL/",
];

#[derive(Debug, Clone)]
struct Table {
    hit: usize,
    aggregation: Option<usize>,
    inputs: Vec<(usize, usize, Option<String>)>,
    outputs: Vec<(usize, bool)>,
    rules: Vec<(Vec<usize>, Vec<usize>, bool)>,
}

fn table() -> impl Strategy<Value = Table> {
    (
        vec(
            (
                0..DMN_INPUTS.len(),
                0..DMN_TYPES.len(),
                proptest::option::weighted(0.3, name()),
            ),
            1..4,
        ),
        1usize..3,
    )
        .prop_flat_map(|(inputs, n_out)| {
            let n_in = inputs.len();
            (
                0..HIT_POLICIES.len(),
                proptest::option::weighted(0.3, 0..AGGREGATIONS.len()),
                Just(inputs),
                vec(
                    (0..DMN_TYPES.len(), proptest::bool::weighted(0.3)),
                    n_out..=n_out,
                ),
                vec(
                    (
                        vec(0..UNARY_TESTS.len(), n_in..=n_in),
                        vec(0..OUTPUT_ENTRIES.len(), n_out..=n_out),
                        proptest::bool::weighted(0.2),
                    ),
                    0..5,
                ),
            )
        })
        .prop_map(|(hit, aggregation, inputs, outputs, rules)| Table {
            hit,
            aggregation,
            inputs,
            outputs,
            rules,
        })
}

fn render_table(out: &mut String, t: &Table) {
    let hit = HIT_POLICIES[t.hit];
    let mut attrs = String::new();
    if !hit.is_empty() {
        attrs.push_str(&format!(" hitPolicy=\"{hit}\""));
    }
    if let (Some(a), "COLLECT") = (t.aggregation, hit) {
        attrs.push_str(&format!(" aggregation=\"{}\"", AGGREGATIONS[a]));
    }
    out.push_str(&format!("    <decisionTable id=\"{}\"{attrs}>\n", "T"));
    for (k, (expr, ty, label)) in t.inputs.iter().enumerate() {
        let label = label
            .as_ref()
            .map(|l| format!(" label=\"{l}\""))
            .unwrap_or_default();
        let ty = match DMN_TYPES[*ty] {
            "" => String::new(),
            t => format!(" typeRef=\"{t}\""),
        };
        out.push_str(&format!("      <input id=\"in{k}\"{label}><inputExpression id=\"ie{k}\"{ty}><text>{}</text></inputExpression></input>\n", xml_text(DMN_INPUTS[*expr])));
    }
    let multi = t.outputs.len() > 1;
    for (k, (ty, values)) in t.outputs.iter().enumerate() {
        let name = if multi || k > 0 {
            format!(" name=\"o{k}\"")
        } else {
            " name=\"result\"".into()
        };
        let ty = match DMN_TYPES[*ty] {
            "" => String::new(),
            t => format!(" typeRef=\"{t}\""),
        };
        let values = if *values {
            "<outputValues><text>\"high\",\"medium\",\"low\"</text></outputValues>"
        } else {
            ""
        };
        out.push_str(&format!(
            "      <output id=\"out{k}\"{name}{ty}>{values}</output>\n"
        ));
    }
    for (r, (ins, outs, desc)) in t.rules.iter().enumerate() {
        out.push_str(&format!("      <rule id=\"r{r}\">"));
        if *desc {
            out.push_str("<description>why &amp; how</description>");
        }
        for (k, i) in ins.iter().enumerate() {
            out.push_str(&format!(
                "<inputEntry id=\"r{r}i{k}\"><text>{}</text></inputEntry>",
                xml_text(UNARY_TESTS[*i])
            ));
        }
        for (k, o) in outs.iter().enumerate() {
            out.push_str(&format!(
                "<outputEntry id=\"r{r}o{k}\"><text>{}</text></outputEntry>",
                xml_text(OUTPUT_ENTRIES[*o])
            ));
        }
        out.push_str("</rule>\n");
    }
    out.push_str("    </decisionTable>\n");
}

#[derive(Debug, Clone)]
enum Logic {
    Table(Table),
    Literal(usize, usize),
}

/// A decision: its logic, name and the indexes it requires.
type Decision = (Logic, Option<String>, Vec<usize>);

fn dmn_doc() -> impl Strategy<Value = (Vec<Decision>, usize, bool, bool)> {
    (
        vec(
            (
                prop_oneof![3 => table().prop_map(Logic::Table), 1 => (0..OUTPUT_ENTRIES.len(), 0..DMN_TYPES.len()).prop_map(|(e, t)| Logic::Literal(e, t))],
                proptest::option::of(name()),
                vec(0usize..4, 0..2),
            ),
            1..4,
        ),
        0..DMN_NAMESPACES.len(),
        any::<bool>(),
        any::<bool>(),
    )
}

fn render_dmn(decisions: &[Decision], ns: usize, prefixed: bool, input_data: bool) -> String {
    let mut out = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    let ns = DMN_NAMESPACES[ns];
    out.push_str(&format!("<definitions xmlns=\"{ns}\" xmlns:modeler=\"http://camunda.org/schema/modeler/1.0\" id=\"Defs_1\" name=\"DRD\" namespace=\"http://camunda.org/schema/1.0/dmn\">\n"));
    for (i, (logic, name, reqs)) in decisions.iter().enumerate() {
        let name = name
            .as_ref()
            .map(|n| format!(" name=\"{n}\""))
            .unwrap_or_default();
        out.push_str(&format!("  <decision id=\"d{i}\"{name}>\n"));
        for r in reqs {
            if *r < i {
                out.push_str(&format!("    <informationRequirement id=\"ir{i}_{r}\"><requiredDecision href=\"#d{r}\" /></informationRequirement>\n"));
            } else if input_data {
                out.push_str(&format!("    <informationRequirement id=\"ir{i}_x{r}\"><requiredInput href=\"#id_x\" /></informationRequirement>\n"));
            }
        }
        match logic {
            Logic::Table(t) => render_table(&mut out, t),
            Logic::Literal(e, ty) => {
                let ty = match DMN_TYPES[*ty] {
                    "" => String::new(),
                    t => format!(" typeRef=\"{t}\""),
                };
                out.push_str(&format!("    <variable id=\"v{i}\" name=\"d{i}\"{ty} />\n    <literalExpression id=\"le{i}\"><text>{}</text></literalExpression>\n", xml_text(OUTPUT_ENTRIES[*e])));
            }
        }
        out.push_str("  </decision>\n");
    }
    if input_data {
        out.push_str("  <inputData id=\"id_x\" name=\"x\" />\n");
    }
    out.push_str("</definitions>\n");
    if prefixed {
        out = out
            .replace("<definitions xmlns=", "<dmn:definitions xmlns:dmn=")
            .replace("</definitions>", "</dmn:definitions>");
        for tag in [
            "decisionTable",
            "decision",
            "informationRequirement",
            "requiredDecision",
            "requiredInput",
            "inputExpression",
            "inputEntry",
            "outputEntry",
            "outputValues",
            "input",
            "output",
            "rule",
            "text",
            "description",
            "variable",
            "literalExpression",
            "inputData",
        ] {
            out = out
                .replace(&format!("<{tag} "), &format!("<dmn:{tag} "))
                .replace(&format!("<{tag}>"), &format!("<dmn:{tag}>"))
                .replace(&format!("</{tag}>"), &format!("</dmn:{tag}>"));
        }
    }
    out
}

pub fn dmn_xml() -> impl Strategy<Value = (String, usize)> {
    dmn_doc().prop_map(|(d, ns, p, i)| (render_dmn(&d, ns, p, i), d.len()))
}

fn dmn_eval_request() -> impl Strategy<Value = Json> {
    (
        dmn_xml(),
        0usize..4,
        feel_value(),
        feel_value(),
        feel_value(),
    )
        .prop_map(|((xml, n), pick, x, y, s)| {
            json!({
                "xml": xml,
                "decision": format!("d{}", pick % (n + 1)),
                "context": { "x": x, "y": y, "s": s, "d": { "t": "date", "v": "2024-01-15" } },
            })
        })
}

// ── Form ─────────────────────────────────────────────────────────────────────

const FORM_TYPES: &[&str] = &[
    "textfield",
    "number",
    "select",
    "radio",
    "checkbox",
    "checklist",
    "taglist",
    "textarea",
    "datetime",
    "button",
    "text",
    "group",
    "dynamiclist",
    "table",
    "image",
    "spacer",
    "separator",
    "html",
    "iframe",
    "expression",
    "filepicker",
    "documentPreview",
    "custom-thing",
];

fn json_scalar() -> impl Strategy<Value = Json> {
    prop_oneof![
        Just(Json::Null),
        any::<bool>().prop_map(Json::Bool),
        select(&[0.0, 1.0, -1.0, 1.5, 0.1, 1e21, 123456789.0, -0.5][..]).prop_map(|f| json!(f)),
        (-50i64..50).prop_map(|n| json!(n)),
        select(&["", "a", "=x", "ü", "1", "  "][..]).prop_map(|s| json!(s)),
    ]
}

fn form_component() -> impl Strategy<Value = Json> {
    let leaf = (
        select(FORM_TYPES),
        proptest::option::weighted(0.92, "[a-z]{1,6}"),
        proptest::option::weighted(0.92, select(NAMES)),
        any::<u16>(),
        json_scalar(),
        json_scalar(),
    )
        .prop_map(|(ty, key, label, bits, a, b)| component(ty, key, label, bits, a, b, None));
    leaf.prop_recursive(2, 10, 3, |inner| {
        (
            select(&["group", "dynamiclist", "table"][..]),
            proptest::option::weighted(0.92, "[a-z]{1,6}"),
            proptest::option::weighted(0.92, select(NAMES)),
            any::<u16>(),
            vec(inner, 0..3),
        )
            .prop_map(|(ty, key, label, bits, children)| {
                component(ty, key, label, bits, Json::Null, Json::Null, Some(children))
            })
    })
}

fn component(
    ty: &str,
    key: Option<String>,
    label: Option<&str>,
    bits: u16,
    a: Json,
    b: Json,
    children: Option<Vec<Json>>,
) -> Json {
    let mut c = Map::new();
    c.insert("type".into(), json!(ty));
    c.insert("id".into(), json!(format!("Field_{}", bits % 97)));
    if let Some(k) = key {
        c.insert("key".into(), json!(k));
    }
    if let Some(l) = label {
        c.insert("label".into(), json!(l));
    }
    if bits & 1 != 0 {
        c.insert("validate".into(), json!({ "required": bits & 2 != 0, "min": a, "max": b, "minLength": 1, "pattern": "^a", "validationType": "email", "custom": a }));
    }
    if bits & 4 != 0 {
        c.insert(
            "values".into(),
            json!([{ "label": "A", "value": "a" }, { "label": "B", "value": b, "extra": 1 }]),
        );
    }
    if bits & 8 != 0 {
        c.insert("valuesKey".into(), json!("opts"));
    }
    if bits & 16 != 0 {
        c.insert("valuesExpression".into(), json!("=opts"));
    }
    if bits & 32 != 0 {
        c.insert("conditional".into(), json!({ "hide": "=x = 1" }));
    }
    if bits & 64 != 0 {
        c.insert(
            "layout".into(),
            if bits & 128 != 0 {
                Json::Null
            } else {
                json!({ "row": "Row_1", "columns": a })
            },
        );
    }
    if bits & 256 != 0 {
        c.insert("defaultValue".into(), a.clone());
    }
    if bits & 512 != 0 {
        c.insert("properties".into(), json!({ "p": "1" }));
    }
    if bits & 1024 != 0 {
        c.insert("x-custom".into(), json!({ "nested": [a, b] }));
    }
    if bits & 2048 != 0 || (ty == "text" && bits & 1 == 0) {
        c.insert("text".into(), json!("# Title & *md*"));
    }
    if bits & 4096 != 0 {
        c.insert("readonly".into(), b.clone());
    }
    if bits & 8192 != 0 {
        c.insert("columns".into(), json!([{ "label": "C", "key": "c" }]));
    }
    if bits & 16384 != 0 {
        c.insert("disabled".into(), json!(true));
    }
    if let Some(children) = children {
        c.insert("components".into(), Json::Array(children));
    }
    Json::Object(c)
}

fn form_json() -> impl Strategy<Value = String> {
    let doc = (vec(form_component(), 0..5), any::<u8>()).prop_map(|(components, bits)| {
        let mut f = Map::new();
        f.insert("type".into(), json!("default"));
        f.insert("id".into(), json!("Form_1"));
        f.insert("components".into(), Json::Array(components));
        if bits & 1 != 0 {
            f.insert("schemaVersion".into(), json!(16));
        }
        if bits & 2 != 0 {
            f.insert(
                "exporter".into(),
                json!({ "name": "Camunda Modeler", "version": "5.0.0" }),
            );
        }
        if bits & 4 != 0 {
            f.insert("executionPlatform".into(), json!("Camunda Cloud"));
            f.insert("executionPlatformVersion".into(), json!("8.6.0"));
        }
        if bits & 8 != 0 {
            f.insert("generator".into(), json!({ "x": 1 }));
        }
        if bits & 16 != 0 {
            serde_json::to_string_pretty(&Json::Object(f)).unwrap_or_default()
        } else {
            serde_json::to_string(&Json::Object(f)).unwrap_or_default()
        }
    });
    prop_oneof![
        12 => doc,
        1 => select(&["", "[]", "null", "{}", "{\"components\": 1}", "{\"type\":\"default\"}", "{\"components\":[null]}", "{\"components\":[{\"type\":1}]}", "not json"][..]).prop_map(str::to_owned),
    ]
}

// ── Process text ─────────────────────────────────────────────────────────────

const TEXT_KINDS: &[&str] = &[
    "start",
    "end",
    "task",
    "user",
    "service",
    "rule",
    "send",
    "receive",
    "script",
    "manual",
    "call",
    "xor",
    "and",
    "or",
    "eventgw",
    "catch",
    "throw",
    "boundary",
    "adhoc",
    "start:message",
    "end:error",
    "catch:timer",
    "boundary:error",
    "boundary:timer",
    "catch:message",
    "end:terminate",
    "start:timer",
    "throw:signal",
    "catch:conditional",
    "bogus",
];
const TEXT_IDS: &[&str] = &["s", "a", "b", "c", "g", "e", "t1", "agent", "x"];
const TEXT_ATTRS: &[&str] = &[
    "on=a",
    "on=b",
    "nonint",
    "job=work",
    "each=items",
    "after=PT5M",
    "result=r",
    "feel=count(l)",
    "form=f1",
    "in.x=a = 1",
    "out.y=resp.ok",
    "inside=agent",
    "after=bogus",
    "feel=x > 1",
];
const LABELS: &[&str] = &[
    "Yes: amount > 1000",
    "No: default",
    "ok: status = \"ok\"",
    "default",
    "Maybe",
];

fn text_node() -> impl Strategy<Value = String> {
    (
        select(TEXT_IDS),
        proptest::option::weighted(
            0.6,
            (
                select(TEXT_KINDS),
                proptest::option::of(select(NAMES)),
                vec(select(TEXT_ATTRS), 0..3),
            ),
        ),
    )
        .prop_map(|(id, decl)| match decl {
            None => id.to_owned(),
            Some((kind, name, attrs)) => {
                let name = name
                    .map(|n| format!(" {}", n.replace(['\n', '\r'], " ")))
                    .unwrap_or_default();
                let attrs = if attrs.is_empty() {
                    String::new()
                } else {
                    format!(" | {}", attrs.join(" "))
                };
                format!("{id}[{kind}{name}{attrs}]")
            }
        })
}

fn text_line() -> impl Strategy<Value = String> {
    prop_oneof![
        8 => (text_node(), vec((proptest::option::weighted(0.3, select(LABELS)), text_node()), 0..4)).prop_map(|(first, rest)| {
            let mut l = first;
            for (label, n) in rest {
                match label {
                    Some(lb) => l.push_str(&format!(" >({lb}) {n}")),
                    None => l.push_str(&format!(" > {n}")),
                }
            }
            l
        }),
        1 => (select(TEXT_IDS), select(NAMES)).prop_map(|(id, t)| format!("note {id}: {}", t.replace(['\n', '\r'], " "))),
        1 => (select(TEXT_IDS), select(NAMES)).prop_map(|(id, t)| format!("doc {id}: {}", t.replace(['\n', '\r'], " "))),
        1 => select(&["", "   ", "garbage ]] [", "a >", "> b", "```", "a >> b", "a[user", "# x | camunda=8.10"][..]).prop_map(str::to_owned),
    ]
}

fn process_text() -> impl Strategy<Value = String> {
    (
        proptest::option::of(select(
            &[
                "# Process",
                "# Expense approval | camunda=8.10",
                "# ü & <x>",
                "#",
            ][..],
        )),
        vec(text_line(), 0..8),
        any::<bool>(),
    )
        .prop_map(|(header, lines, crlf)| {
            let mut all: Vec<String> = header.map(|h| vec![h.to_owned()]).unwrap_or_default();
            all.extend(lines);
            all.join(if crlf { "\r\n" } else { "\n" })
        })
}
