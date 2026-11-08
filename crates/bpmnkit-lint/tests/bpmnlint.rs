//! Ported from `packages/core/tests/bpmnlint.test.ts`.

use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_lint::bpmnlint::{
    apply_bpmnlint_config, parse_bpmnlint_config, resolve_bpmnlint_config, ApplyBpmnlintOptions,
    BpmnlintRuleSetting, BpmnlintSeverity, ResolvedBpmnlintConfig, UnsupportedReason,
    BPMNLINT_RULE_MAP,
};
use bpmnkit_lint::optimize::{optimize, OptimizeOptions};
use bpmnkit_lint::{lint_diagram, Category, Finding, LintOptions, Severity};

const NS: &str = r#"xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance""#;

fn doc_full(body: &str, extras: &str, di: &str) -> String {
    format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions {NS} id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  {extras}
  <bpmn:process id="proc" isExecutable="true">
    {body}
  </bpmn:process>
  {di}
</bpmn:definitions>"#
    )
}

fn doc(body: &str) -> String {
    doc_full(body, "", "")
}

fn flow(id: &str, from: &str, to: &str) -> String {
    format!(r#"<bpmn:sequenceFlow id="{id}" sourceRef="{from}" targetRef="{to}" />"#)
}

fn cond(id: &str, from: &str, to: &str) -> String {
    format!(
        r#"<bpmn:sequenceFlow id="{id}" sourceRef="{from}" targetRef="{to}"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">= ok</bpmn:conditionExpression></bpmn:sequenceFlow>"#
    )
}

fn linear() -> String {
    format!(
        r#"<bpmn:startEvent id="start" name="Started" />
  <bpmn:task id="a" name="Do A" />
  <bpmn:endEvent id="end" name="Done" />
  {}{}"#,
        flow("f1", "start", "a"),
        flow("f2", "a", "end")
    )
}

fn config(rules: &[(&str, BpmnlintSeverity)]) -> ResolvedBpmnlintConfig {
    ResolvedBpmnlintConfig {
        rules: rules
            .iter()
            .map(|(n, s)| (n.to_string(), BpmnlintRuleSetting::new(*s)))
            .collect(),
        unresolved_extends: vec![],
    }
}

fn resolve(rc: &str) -> ResolvedBpmnlintConfig {
    resolve_bpmnlint_config(&parse_bpmnlint_config(rc).unwrap()).unwrap()
}

fn with_rule(xml: &str, rule: &str, options: Option<&str>) -> Vec<Finding> {
    let defs = parse_bpmn(xml).unwrap();
    let mut c = config(&[(rule, BpmnlintSeverity::Error)]);
    c.rules[rule].options = options.map(|o| serde_json::from_str(o).unwrap());
    apply_bpmnlint_config(&defs, vec![], &c, &ApplyBpmnlintOptions::default()).findings
}

fn ids(findings: &[Finding]) -> Vec<String> {
    findings
        .iter()
        .map(|f| format!("{}@{}", f.data.id, f.data.element_ids.join(",")))
        .collect()
}

fn elements(xml: &str, rule: &str) -> Vec<String> {
    with_rule(xml, rule, None)
        .into_iter()
        .flat_map(|f| f.data.element_ids)
        .collect()
}

const NONE: &[&str] = &[];

// ── Parsing ───────────────────────────────────────────────────────────────────

#[test]
fn parses_extends_and_rule_settings() {
    let one = parse_bpmnlint_config(r#"{ "extends": "bpmnlint:recommended" }"#).unwrap();
    assert_eq!(one.extends.unwrap().entries(), ["bpmnlint:recommended"]);
    let parsed = parse_bpmnlint_config(
        r#"{"extends":["bpmnlint:correctness","plugin:camunda-compat/camunda-cloud-8-6"],
            "rules":{"label-required":"off","fake-join":["WARN"],"standard-size":[2,{"x":1}],"global":3}}"#,
    )
    .unwrap();
    assert_eq!(
        parsed.extends.unwrap().entries(),
        [
            "bpmnlint:correctness",
            "plugin:camunda-compat/camunda-cloud-8-6"
        ]
    );
    assert_eq!(parsed.rules.unwrap().len(), 4);
}

#[test]
fn says_what_is_wrong_with_an_invalid_file() {
    let err = |t: &str| parse_bpmnlint_config(t).unwrap_err().0;
    assert!(err("{ extends: ").contains("not valid JSON"));
    assert!(err("[]").contains("JSON object"));
    assert!(err(r#"{ "extends": 1 }"#).contains(r#""extends" must be"#));
    assert!(err(r#"{ "rules": { "fake-join": "loud" } }"#)
        .contains(r#"rule "fake-join" has setting "loud""#));
    assert!(err(r#"{ "rules": { "fake-join": 7 } }"#).contains("0–3"));
    assert_eq!(
        err("{ extends: "),
        ".bpmnlintrc is not valid JSON: Expected property name or '}' in JSON at position 2 (line 1 column 3). See https://github.com/bpmn-io/bpmnlint#configuration for the file format."
    );
}

#[test]
fn expands_presets_and_lets_the_files_rules_win() {
    let r = resolve(
        r#"{"extends":"bpmnlint:recommended","rules":{"fake-join":"error","bpmnlint/label-required":"off"}}"#,
    );
    assert_eq!(r.rules["no-disconnected"].severity, BpmnlintSeverity::Error);
    assert_eq!(
        r.rules["no-inclusive-gateway"].severity,
        BpmnlintSeverity::Warn
    );
    assert_eq!(r.rules["fake-join"].severity, BpmnlintSeverity::Error);
    assert_eq!(r.rules["label-required"].severity, BpmnlintSeverity::Off);
    assert!(r.unresolved_extends.is_empty());
}

#[test]
fn expands_all_and_correctness_and_keeps_options() {
    assert_eq!(resolve(r#"{"extends":"bpmnlint:all"}"#).rules.len(), 28);
    let c = resolve(
        r#"{"extends":["bpmnlint:correctness"],"rules":{"standard-size":[1,{"bpmn:Task":{"width":120,"height":80}}],"global":3}}"#,
    );
    assert_eq!(
        c.rules["no-duplicate-sequence-flows"].severity,
        BpmnlintSeverity::Warn
    );
    assert_eq!(c.rules["standard-size"].severity, BpmnlintSeverity::Warn);
    assert!(c.rules["standard-size"].options.is_some());
    assert_eq!(c.rules["global"].severity, BpmnlintSeverity::Info);
}

#[test]
fn lists_plugin_configs_it_cannot_expand() {
    let r = resolve(
        r#"{"extends":["bpmnlint:recommended","plugin:camunda-compat/camunda-cloud-8-6"]}"#,
    );
    assert_eq!(
        r.unresolved_extends,
        ["plugin:camunda-compat/camunda-cloud-8-6"]
    );
}

#[test]
fn rule_map_has_28_rules() {
    assert_eq!(BPMNLINT_RULE_MAP.len(), 28);
}

// ── Applying a config to existing findings ────────────────────────────────────

fn fake_join_xml() -> String {
    doc(&format!(
        r#"<bpmn:startEvent id="start" name="Started" />
  <bpmn:parallelGateway id="fork" />
  <bpmn:task id="a" name="Do A" />
  <bpmn:task id="b" name="Do B" />
  <bpmn:task id="join" name="Join" />
  <bpmn:endEvent id="end" name="Done" />
  {}{}{}{}{}{}"#,
        flow("f1", "start", "fork"),
        flow("f2", "fork", "a"),
        flow("f3", "fork", "b"),
        flow("f4", "a", "join"),
        flow("f5", "b", "join"),
        flow("f6", "join", "end")
    ))
}

fn fake_join(list: &[Finding]) -> Vec<&Finding> {
    list.iter()
        .filter(|f| f.data.id == "flow/multi-incoming-task")
        .collect()
}

fn apply(xml: &str, c: &ResolvedBpmnlintConfig, delegated: bool) -> (Vec<Finding>, usize) {
    let defs = parse_bpmn(xml).unwrap();
    let findings = optimize(&defs, &OptimizeOptions::default()).findings;
    let n = findings.len();
    let options = ApplyBpmnlintOptions {
        delegated,
        categories: None,
    };
    (
        apply_bpmnlint_config(&defs, findings, c, &options).findings,
        n,
    )
}

#[test]
fn takes_the_configured_level_and_names_the_rule() {
    let defs = parse_bpmn(&fake_join_xml()).unwrap();
    let findings = optimize(&defs, &OptimizeOptions::default()).findings;
    assert_eq!(fake_join(&findings)[0].data.severity, Severity::Error);
    let (applied, _) = apply(
        &fake_join_xml(),
        &config(&[("fake-join", BpmnlintSeverity::Warn)]),
        false,
    );
    let f = fake_join(&applied)[0];
    assert_eq!(f.data.severity, Severity::Warning);
    assert_eq!(f.data.bpmnlint_rule.as_deref(), Some("fake-join"));
    // The fix travels with the finding.
    assert!(f.fixable());
}

#[test]
fn drops_off_rules_and_leaves_others_alone() {
    let (off, _) = apply(
        &fake_join_xml(),
        &config(&[("fake-join", BpmnlintSeverity::Off)]),
        false,
    );
    assert!(fake_join(&off).is_empty());
    let (same, n) = apply(&fake_join_xml(), &config(&[]), false);
    assert_eq!(same.len(), n);
    assert!(same.iter().all(|f| f.data.bpmnlint_rule.is_none()));
    let (info, _) = apply(
        &fake_join_xml(),
        &config(&[("fake-join", BpmnlintSeverity::Info)]),
        false,
    );
    assert_eq!(fake_join(&info)[0].data.severity, Severity::Info);
}

#[test]
fn delegated_drops_covered_findings() {
    let defs = parse_bpmn(&fake_join_xml()).unwrap();
    let findings = optimize(&defs, &OptimizeOptions::default()).findings;
    let c = config(&[
        ("fake-join", BpmnlintSeverity::Warn),
        ("no-disconnected", BpmnlintSeverity::Error),
    ]);
    let options = ApplyBpmnlintOptions {
        delegated: true,
        categories: None,
    };
    let applied = apply_bpmnlint_config(&defs, findings, &c, &options);
    assert!(fake_join(&applied.findings).is_empty());
    assert!(!applied
        .findings
        .iter()
        .any(|f| f.data.id == "flow/disconnected"));
    assert!(applied.unsupported.is_empty());
}

#[test]
fn replaced_findings() {
    let xml = doc(&format!(
        r#"<bpmn:startEvent id="start" name="S" /><bpmn:task id="a" name="A" />{}"#,
        flow("f1", "start", "a")
    ));
    let dead = |l: &[Finding]| l.iter().filter(|f| f.data.id == "flow/dead-end").count();
    let (kept, _) = apply(&xml, &config(&[]), false);
    assert_eq!(dead(&kept), 1);
    let (applied, _) = apply(
        &xml,
        &config(&[("no-implicit-end", BpmnlintSeverity::Warn)]),
        false,
    );
    assert_eq!(dead(&applied), 0);
    let native: Vec<&Finding> = applied
        .iter()
        .filter(|f| f.data.bpmnlint_rule.as_deref() == Some("no-implicit-end"))
        .collect();
    assert_eq!(native.len(), 1);
    assert_eq!(native[0].data.id, "flow/implicit-end");
    assert_eq!(native[0].data.severity, Severity::Warning);
    assert_eq!(native[0].data.element_ids, ["a"]);
    let (off, _) = apply(
        &xml,
        &config(&[("no-implicit-end", BpmnlintSeverity::Off)]),
        false,
    );
    assert_eq!(dead(&off), 0);
    let (delegated, _) = apply(
        &xml,
        &config(&[("no-implicit-end", BpmnlintSeverity::Error)]),
        true,
    );
    assert_eq!(dead(&delegated), 0);
    assert!(!delegated.iter().any(|f| f.data.id == "flow/implicit-end"));
}

#[test]
fn reports_unsupported_rules() {
    let defs = parse_bpmn(&doc(&linear())).unwrap();
    let r = resolve(
        r#"{"extends":["bpmnlint:correctness","plugin:camunda-compat/camunda-cloud-8-6"],
            "rules":{"camunda-compat/timer":"error","no-such-rule":"warn","acme/x":"off"}}"#,
    );
    let u = apply_bpmnlint_config(&defs, vec![], &r, &ApplyBpmnlintOptions::default()).unsupported;
    let got: Vec<_> = u
        .iter()
        .map(|u| (u.name.as_str(), u.reason, u.severity))
        .collect();
    assert_eq!(
        got,
        [
            (
                "plugin:camunda-compat/camunda-cloud-8-6",
                UnsupportedReason::UnresolvedExtends,
                None
            ),
            (
                "camunda-compat/timer",
                UnsupportedReason::PluginRule,
                Some(BpmnlintSeverity::Error)
            ),
            (
                "no-such-rule",
                UnsupportedReason::UnknownRule,
                Some(BpmnlintSeverity::Warn)
            ),
        ]
    );
}

#[test]
fn lint_diagram_applies_the_config() {
    let defs = parse_bpmn(&fake_join_xml()).unwrap();
    let report = lint_diagram(
        &defs,
        LintOptions {
            bpmnlint: Some(resolve(
                r#"{"rules":{"fake-join":"warn","camunda-compat/no-such-rule":"error"}}"#,
            )),
            ..LintOptions::default()
        },
    );
    let d = report
        .diagnostics
        .iter()
        .find(|d| d.id == "flow/multi-incoming-task")
        .unwrap();
    assert_eq!(d.severity, Severity::Warning);
    assert_eq!(d.bpmnlint_rule.as_deref(), Some("fake-join"));
    assert!(d.fixable);
    let u = report.bpmnlint_unsupported.unwrap();
    assert_eq!(u.len(), 1);
    assert_eq!(u[0].name, "camunda-compat/no-such-rule");

    let plain = lint_diagram(&defs, LintOptions::default());
    assert!(plain.bpmnlint_unsupported.is_none());
    assert!(plain.diagnostics.iter().all(|d| d.bpmnlint_rule.is_none()));
}

#[test]
fn native_rules_run_only_within_requested_categories() {
    let xml = doc(&format!(r#"{}<bpmn:inclusiveGateway id="or" />"#, linear()));
    let defs = parse_bpmn(&xml).unwrap();
    let rc = r#"{"rules":{"no-inclusive-gateway":"warn"}}"#;
    let on = lint_diagram(
        &defs,
        LintOptions {
            bpmnlint: Some(resolve(rc)),
            ..LintOptions::default()
        },
    );
    assert!(on
        .diagnostics
        .iter()
        .any(|d| d.id == "pattern/inclusive-gateway"));
    let narrowed = lint_diagram(
        &defs,
        LintOptions {
            bpmnlint: Some(resolve(rc)),
            optimize: OptimizeOptions {
                categories: Some(vec![Category::Flow]),
                ..OptimizeOptions::default()
            },
            ..LintOptions::default()
        },
    );
    assert!(!narrowed
        .diagnostics
        .iter()
        .any(|d| d.id == "pattern/inclusive-gateway"));
}

// ── Native equivalents ────────────────────────────────────────────────────────

#[test]
fn native_rules_need_the_config() {
    let defs = parse_bpmn(&doc(&format!(
        r#"{}<bpmn:inclusiveGateway id="or" />"#,
        linear()
    )))
    .unwrap();
    let o = ApplyBpmnlintOptions::default();
    assert!(apply_bpmnlint_config(&defs, vec![], &config(&[]), &o)
        .findings
        .is_empty());
    let off = config(&[("no-inclusive-gateway", BpmnlintSeverity::Off)]);
    assert!(apply_bpmnlint_config(&defs, vec![], &off, &o)
        .findings
        .is_empty());
}

#[test]
fn native_rules_carry_severity_and_rule() {
    let defs = parse_bpmn(&doc(&format!(
        r#"{}<bpmn:complexGateway id="cx" />"#,
        linear()
    )))
    .unwrap();
    let c = config(&[("no-complex-gateway", BpmnlintSeverity::Info)]);
    let f = apply_bpmnlint_config(&defs, vec![], &c, &ApplyBpmnlintOptions::default()).findings;
    let d = &f[0].data;
    assert_eq!(
        (
            d.id.as_str(),
            d.severity,
            d.bpmnlint_rule.as_deref(),
            d.category,
            d.process_id.as_str()
        ),
        (
            "pattern/complex-gateway",
            Severity::Info,
            Some("no-complex-gateway"),
            Category::Pattern,
            "proc"
        )
    );
    assert_eq!(d.element_ids, ["cx"]);
}

#[test]
fn ad_hoc_conditional_event_and_sub_process_starts() {
    let xml = doc(&format!(
        r#"{}<bpmn:adHocSubProcess id="adhoc"><bpmn:startEvent id="s" /><bpmn:task id="t" /><bpmn:endEvent id="e" /></bpmn:adHocSubProcess>"#,
        linear()
    ));
    assert_eq!(
        ids(&with_rule(&xml, "ad-hoc-sub-process", None)),
        [
            "flow/ad-hoc-start-end-event@s",
            "flow/ad-hoc-start-end-event@e"
        ]
    );
    let body = format!(
        r#"{}<bpmn:intermediateCatchEvent id="c1"><bpmn:conditionalEventDefinition id="cd1" /></bpmn:intermediateCatchEvent>
		  <bpmn:intermediateCatchEvent id="c2"><bpmn:conditionalEventDefinition id="cd2"><bpmn:condition xsi:type="bpmn:tFormalExpression">= x</bpmn:condition></bpmn:conditionalEventDefinition></bpmn:intermediateCatchEvent>"#,
        linear()
    );
    assert_eq!(
        ids(&with_rule(&doc(&body), "conditional-event", None)),
        ["flow/conditional-event-no-condition@c1"]
    );
    let not_exec = doc(&body).replace(r#"isExecutable="true""#, r#"isExecutable="false""#);
    assert!(with_rule(&not_exec, "conditional-event", None).is_empty());
    let xml = doc(&format!(
        r#"{}<bpmn:subProcess id="sub"><bpmn:task id="t" /></bpmn:subProcess><bpmn:adHocSubProcess id="adhoc"><bpmn:task id="t2" /></bpmn:adHocSubProcess>"#,
        linear()
    ));
    assert_eq!(
        ids(&with_rule(&xml, "start-event-required", None)),
        ["flow/sub-process-no-start-event@sub"]
    );
    assert_eq!(
        ids(&with_rule(&xml, "end-event-required", None)),
        ["flow/sub-process-no-end-event@sub"]
    );
}

#[test]
fn event_based_gateway() {
    let xml = doc(&format!(
        r#"{}<bpmn:eventBasedGateway id="g1" />
		  <bpmn:intermediateCatchEvent id="m1"><bpmn:timerEventDefinition /></bpmn:intermediateCatchEvent>
		  <bpmn:eventBasedGateway id="g2" />
		  <bpmn:intermediateCatchEvent id="m2"><bpmn:timerEventDefinition /></bpmn:intermediateCatchEvent>
		  <bpmn:intermediateCatchEvent id="m3"><bpmn:timerEventDefinition /></bpmn:intermediateCatchEvent>{}{}{}"#,
        linear(),
        flow("e1", "g1", "m1"),
        cond("e2", "g2", "m2"),
        flow("e3", "g2", "m3")
    ));
    assert_eq!(
        ids(&with_rule(&xml, "event-based-gateway", None)),
        [
            "flow/event-gateway-invalid@g1",
            "flow/event-gateway-invalid@e2"
        ]
    );
}

#[test]
fn typed_and_blank_start_events() {
    let xml = doc(&format!(
        r#"{}<bpmn:subProcess id="evt" triggeredByEvent="true"><bpmn:startEvent id="blank" /></bpmn:subProcess>
		  <bpmn:subProcess id="sub"><bpmn:startEvent id="typed"><bpmn:timerEventDefinition /></bpmn:startEvent></bpmn:subProcess>"#,
        linear()
    ));
    assert_eq!(
        ids(&with_rule(
            &xml,
            "event-sub-process-typed-start-event",
            None
        )),
        ["flow/event-sub-process-untyped-start@blank"]
    );
    assert_eq!(
        ids(&with_rule(&xml, "sub-process-blank-start-event", None)),
        ["flow/sub-process-typed-start@typed"]
    );
}

#[test]
fn global_root_elements() {
    let extras = r#"<bpmn:error id="err1" name="Failed" errorCode="E1" />
		  <bpmn:error id="err2" name="Failed" errorCode="E2" />
		  <bpmn:message id="msg1" name=" " />
		  <bpmn:message id="msg2" />
		  <bpmn:signal id="sig1" name="Go" />"#;
    let body = format!(
        r#"{}<bpmn:boundaryEvent id="b1" attachedToRef="a"><bpmn:errorEventDefinition errorRef="err1" /></bpmn:boundaryEvent>
		  <bpmn:receiveTask id="r" name="Wait" messageRef="msg1" />
		  <bpmn:receiveTask id="r2" name="Wait too" messageRef="msg2" />
		  <bpmn:intermediateThrowEvent id="t"><bpmn:signalEventDefinition signalRef="sig1" /></bpmn:intermediateThrowEvent>"#,
        linear()
    );
    let messages: Vec<String> = with_rule(&doc_full(&body, extras, ""), "global", None)
        .into_iter()
        .map(|f| f.data.message)
        .collect();
    assert_eq!(
        messages,
        [
            r#"Global error "err1" shares its name with another error."#,
            r#"Global error "err2" is not referenced by any element."#,
            r#"Global error "err2" shares its name with another error."#,
            r#"Global message "msg1" has no name."#,
        ]
    );
}

#[test]
fn link_events() {
    let link = |id: &str, kind: &str, name: Option<&str>| {
        let n = name.map(|n| format!(r#" name="{n}""#)).unwrap_or_default();
        format!(
            r#"<bpmn:intermediate{kind}Event id="{id}"><bpmn:linkEventDefinition id="{id}_d"{n} /></bpmn:intermediate{kind}Event>"#
        )
    };
    let xml = doc(&[
        linear(),
        link("t1", "Throw", Some("A")),
        link("c1", "Catch", Some("A")),
        link("t2", "Throw", Some("B")),
        link("c3", "Catch", Some("C")),
        link("c4", "Catch", Some("C")),
        link("t5", "Throw", Some("D")),
        link("t6", "Throw", Some("D")),
        link("x", "Throw", None),
    ]
    .concat());
    assert_eq!(
        ids(&with_rule(&xml, "link-event", None)),
        [
            "flow/link-event-mismatch@x",
            "flow/link-event-mismatch@t2",
            "flow/link-event-mismatch@c3",
            "flow/link-event-mismatch@c4",
            "flow/link-event-mismatch@t5",
            "flow/link-event-mismatch@t6",
        ]
    );
}

#[test]
fn no_bpmndi() {
    let di = r#"<bpmndi:BPMNDiagram id="d"><bpmndi:BPMNPlane id="p" bpmnElement="proc">
		  <bpmndi:BPMNShape id="s1" bpmnElement="start"><dc:Bounds x="0" y="0" width="36" height="36" /></bpmndi:BPMNShape>
		  <bpmndi:BPMNShape id="s2" bpmnElement="a"><dc:Bounds x="100" y="0" width="100" height="80" /></bpmndi:BPMNShape>
		  <bpmndi:BPMNEdge id="e1" bpmnElement="f1"><di:waypoint xmlns:di="http://www.omg.org/spec/DD/20100524/DI" x="36" y="18" /><di:waypoint xmlns:di="http://www.omg.org/spec/DD/20100524/DI" x="100" y="18" /></bpmndi:BPMNEdge>
		</bpmndi:BPMNPlane></bpmndi:BPMNDiagram>"#;
    let xml = doc_full(
        &format!(r#"{}<bpmn:dataObject id="data" />"#, linear()),
        "",
        di,
    );
    assert_eq!(
        ids(&with_rule(&xml, "no-bpmndi", None)),
        ["pattern/missing-di@end", "pattern/missing-di@f2"]
    );
}

#[test]
fn connectivity_rules() {
    let xml = doc(&format!(
        r#"{}<bpmn:task id="lonely" />
		  <bpmn:task id="handler" isForCompensation="true" />
		  <bpmn:subProcess id="evt" triggeredByEvent="true" />
		  <bpmn:adHocSubProcess id="adhoc"><bpmn:task id="free" /></bpmn:adHocSubProcess>"#,
        linear()
    ));
    assert_eq!(
        ids(&with_rule(&xml, "no-disconnected", None)),
        ["flow/disconnected@lonely", "flow/disconnected@adhoc"]
    );
    let dup = doc(&format!("{}{}", linear(), flow("dup", "a", "end")));
    assert_eq!(
        ids(&with_rule(&dup, "no-duplicate-sequence-flows", None)),
        ["flow/duplicate-sequence-flow@dup,a,end"]
    );
    let split = doc(&format!(
        r#"{}<bpmn:task id="b" name="B" />{}<bpmn:task id="c" name="C" /><bpmn:task id="d" name="D" />{}{}"#,
        linear(),
        flow("f3", "a", "b"),
        cond("f4", "c", "d"),
        flow("f5", "c", "end")
    ));
    assert_eq!(
        ids(&with_rule(&split, "no-implicit-split", None)),
        ["flow/implicit-split@a"]
    );
}

#[test]
fn single_blank_start_and_single_definition() {
    let xml = doc(&format!(
        r#"{}<bpmn:startEvent id="start2" /><bpmn:intermediateCatchEvent id="multi"><bpmn:timerEventDefinition /><bpmn:messageEventDefinition /></bpmn:intermediateCatchEvent>"#,
        linear()
    ));
    assert_eq!(
        ids(&with_rule(&xml, "single-blank-start-event", None)),
        ["flow/multiple-blank-start-events@proc"]
    );
    assert_eq!(
        ids(&with_rule(&xml, "single-event-definition", None)),
        ["flow/multiple-event-definitions@multi"]
    );
}

#[test]
fn superfluous_label_and_termination() {
    let xml = doc(
        r#"<bpmn:startEvent id="start" /><bpmn:exclusiveGateway id="gw" default="no" />
		  <bpmn:endEvent id="e1" /><bpmn:endEvent id="e2" />
		  <bpmn:sequenceFlow id="in" sourceRef="start" targetRef="gw" name="go" />
		  <bpmn:sequenceFlow id="no" sourceRef="gw" targetRef="e1" name="No" />
		  <bpmn:sequenceFlow id="yes" sourceRef="gw" targetRef="e2" name="Yes" />"#,
    );
    assert_eq!(
        ids(&with_rule(&xml, "superfluous-label", None)),
        ["naming/superfluous-flow-label@in"]
    );
    let terminate = format!(
        r#"<bpmn:startEvent id="start" /><bpmn:endEvent id="end"><bpmn:terminateEventDefinition /></bpmn:endEvent>{}"#,
        flow("f", "start", "end")
    );
    assert_eq!(
        ids(&with_rule(
            &doc(&terminate),
            "superfluous-termination",
            None
        )),
        ["flow/superfluous-termination@end"]
    );
    let plain = format!(
        r#"{terminate}<bpmn:endEvent id="plain" />{}"#,
        flow("g", "start", "plain")
    );
    assert!(with_rule(&doc(&plain), "superfluous-termination", None).is_empty());
}

fn scopes_fixture() -> String {
    let p = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../packages/core/tests/fixtures/bpmnlint/scopes-and-exemptions.bpmn"
    );
    std::fs::read_to_string(p).unwrap()
}

#[test]
fn every_scope_with_bpmnlints_exemptions() {
    let xml = scopes_fixture();
    assert_eq!(
        ids(&with_rule(&xml, "conditional-flows", None)),
        [
            "feel/missing-condition@f_plain",
            "feel/missing-condition@f_x1_other",
            "feel/missing-condition@sf9"
        ]
    );
    assert_eq!(
        ids(&with_rule(&xml, "fake-join", None)),
        [
            "flow/multi-incoming-task@start_joined",
            "flow/multi-incoming-task@sub_join_task"
        ]
    );
    assert_eq!(
        elements(&xml, "label-required"),
        [
            "pool",
            "blackbox",
            "lane_unnamed",
            "lane_child",
            "task_blank",
            "f_cond",
            "sub_start",
            "sub_catch",
            "tx_start",
            "tx_task",
            "evt_start",
            "adhoc_unnamed",
        ]
    );
    assert_eq!(
        ids(&with_rule(&xml, "no-gateway-join-fork", None)),
        ["flow/mixed-gateway@sub_mixed"]
    );
    assert_eq!(
        ids(&with_rule(&xml, "superfluous-gateway", None)),
        ["flow/redundant-gateway@sub_redundant"]
    );
    assert_eq!(
        elements(&xml, "no-implicit-end"),
        [
            "boundary_timer",
            "tx",
            "adhoc",
            "sub_dead",
            "sub_catch",
            "sub_comp",
            "tx_task",
            "evt_task"
        ]
    );
    assert_eq!(
        elements(&xml, "no-implicit-start"),
        [
            "task_r1",
            "task_r2",
            "tx",
            "adhoc",
            "sub_orphan",
            "sub_catch"
        ]
    );
    for rule in [
        "conditional-flows",
        "fake-join",
        "label-required",
        "no-implicit-end",
        "no-implicit-start",
    ] {
        let all = elements(&xml, rule);
        for id in ["data_obj", "data_ref", "store_ref"] {
            assert!(!all.iter().any(|e| e == id), "{rule}: {id}");
        }
    }
}

fn shape(id: &str, x: u32, y: u32, w: u32, h: u32, extra: &str) -> String {
    format!(
        r#"<bpmndi:BPMNShape id="{id}_di" bpmnElement="{id}"{extra}><dc:Bounds x="{x}" y="{y}" width="{w}" height="{h}" /></bpmndi:BPMNShape>"#
    )
}

fn plane(shapes: &str) -> String {
    format!(
        r#"<bpmndi:BPMNDiagram id="d"><bpmndi:BPMNPlane id="p" bpmnElement="proc">{shapes}</bpmndi:BPMNPlane></bpmndi:BPMNDiagram>"#
    )
}

#[test]
fn overlapping_elements() {
    let xml = doc_full(
        &format!(
            r#"{}<bpmn:boundaryEvent id="b" attachedToRef="a"><bpmn:timerEventDefinition /></bpmn:boundaryEvent>
			 <bpmn:subProcess id="sub"><bpmn:task id="inner" /></bpmn:subProcess>"#,
            linear()
        ),
        "",
        &plane(
            &[
                shape("start", 0, 0, 36, 36, ""),
                shape("a", 20, 20, 100, 80, ""),
                shape("b", 60, 80, 36, 36, ""),
                shape("end", 400, 0, 36, 36, ""),
                shape("sub", 600, 0, 300, 200, r#" isExpanded="true""#),
                shape("inner", 850, 150, 100, 80, ""),
            ]
            .concat(),
        ),
    );
    assert_eq!(
        ids(&with_rule(&xml, "no-overlapping-elements", None)),
        [
            "pattern/overlapping-elements@start",
            "pattern/overlapping-elements@a",
            "pattern/overlapping-elements@inner",
        ]
    );
}

#[test]
fn standard_size() {
    let xml = doc_full(
        &linear(),
        "",
        &plane(
            &[
                shape("start", 0, 0, 36, 36, ""),
                shape("a", 100, 0, 120, 80, ""),
                shape("end", 300, 0, 40, 40, ""),
            ]
            .concat(),
        ),
    );
    let f = with_rule(&xml, "standard-size", None);
    assert_eq!(
        ids(&f),
        [
            "pattern/non-standard-size@a",
            "pattern/non-standard-size@end"
        ]
    );
    assert_eq!(
        f[0].data.message,
        r#"Element "a" is 120x80; the standard size is 100x80."#
    );
    assert_eq!(
        ids(&with_rule(
            &xml,
            "standard-size",
            Some(r#"{"bpmn:Task":{"width":120,"height":80}}"#)
        )),
        ["pattern/non-standard-size@end"]
    );
    let _ = NONE;
}
