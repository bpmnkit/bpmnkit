//! Ported from `packages/core/tests/camunda-compat.test.ts`.

use super::*;
use bpmnkit_bpmn::parse_bpmn;

/// `version: None` leaves the platform attributes out.
fn model(body: &str, version: Option<&str>, head: &str) -> String {
    let platform = version.map_or(String::new(), |v| {
        format!(
            r#" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="{v}""#
        )
    });
    format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="D" targetNamespace="http://bpmn.io/schema/bpmn"{platform}>
{head}  <bpmn:process id="p" isExecutable="true">
{body}
  </bpmn:process>
</bpmn:definitions>"#
    )
}

fn m(body: &str) -> String {
    model(body, Some("8.6.0"), "")
}

fn compat(xml: &str, version: Option<&str>) -> Vec<Finding> {
    analyze_camunda_compat(&parse_bpmn(xml).expect("parse"), version)
}

fn rules(findings: &[Finding]) -> Vec<String> {
    findings
        .iter()
        .map(|f| format!("{} {}", f.data.id, f.data.element_ids[0]))
        .collect()
}

fn messages(findings: &[Finding]) -> Vec<String> {
    findings.iter().map(|f| f.data.message.clone()).collect()
}

const AD_HOC: &str = r#"    <bpmn:adHocSubProcess id="tools" name="Tools">
      <bpmn:serviceTask id="tool"><bpmn:extensionElements><zeebe:taskDefinition type="t" /></bpmn:extensionElements></bpmn:serviceTask>
    </bpmn:adHocSubProcess>"#;

#[test]
fn rejects_ad_hoc_before_8_7() {
    let found = compat(&m(AD_HOC), Some("8.6"));
    assert_eq!(found.len(), 1);
    let f = &found[0].data;
    assert_eq!(f.id, "compat/element-type");
    assert_eq!(f.category, Category::Deploy);
    assert_eq!(f.severity, Severity::Error);
    assert_eq!(f.element_ids, vec!["tools"]);
    assert_eq!(
        f.message,
        "Ad-hoc sub-process \"Tools\" needs Camunda 8.7 or newer; this model targets Camunda 8.6."
    );
    assert!(compat(&m(AD_HOC), Some("8.7")).is_empty());
}

#[test]
fn reads_target_from_model() {
    assert_eq!(
        rules(&compat(&model(AD_HOC, Some("8.6.3"), ""), None)),
        vec!["compat/element-type tools"]
    );
    assert!(compat(&model(AD_HOC, Some("8.8.0"), ""), None).is_empty());
}

#[test]
fn gates_event_definitions_separately() {
    let head = "    <bpmn:signal id=\"s\" name=\"go\" />\n";
    let body = r#"    <bpmn:endEvent id="end"><bpmn:signalEventDefinition id="sd" signalRef="s" /></bpmn:endEvent>"#;
    let xml = model(body, Some("8.2.0"), head);
    assert_eq!(
        messages(&compat(&xml, None))[0],
        "Signal end event \"end\" needs Camunda 8.3 or newer; this model targets Camunda 8.2."
    );
    assert!(compat(&xml, Some("8.3")).is_empty());
}

#[test]
fn reports_unsupported_elements() {
    let found = compat(&m(r#"    <bpmn:complexGateway id="g" />"#), Some("8.10"));
    assert_eq!(
        found[0].data.message,
        "Complex gateway \"g\" is not supported by any Camunda 8 version."
    );
}

#[test]
fn gates_zeebe_extensions() {
    let body = r#"    <bpmn:userTask id="u">
      <bpmn:extensionElements>
        <zeebe:userTask />
        <zeebe:formDefinition formId="f" />
        <zeebe:priorityDefinition priority="50" />
      </bpmn:extensionElements>
    </bpmn:userTask>"#;
    assert_eq!(
        rules(&compat(&m(body), Some("8.4"))),
        vec![
            "compat/no-zeebe-user-task u",
            "compat/no-priority-definition u"
        ]
    );
    assert_eq!(
        rules(&compat(&m(body), Some("8.5"))),
        vec!["compat/no-priority-definition u"]
    );
    assert!(compat(&m(body), Some("8.6")).is_empty());
}

#[test]
fn cron_cycle_from_8_1() {
    let body = r#"    <bpmn:startEvent id="s"><bpmn:timerEventDefinition id="t"><bpmn:timeCycle>0 0 9 * * MON</bpmn:timeCycle></bpmn:timerEventDefinition></bpmn:startEvent>"#;
    assert!(messages(&compat(&m(body), Some("8.0")))[0]
        .contains("cron expression, which needs Camunda 8.1"));
    assert!(compat(&m(body), Some("8.1")).is_empty());
}

#[test]
fn skips_non_executable_from_8_2() {
    let xml = m(r#"    <bpmn:complexGateway id="g" />"#)
        .replace(r#"isExecutable="true""#, r#"isExecutable="false""#);
    assert_eq!(compat(&xml, Some("8.1")).len(), 1);
    assert!(compat(&xml, Some("8.2")).is_empty());
}

#[test]
fn timer_without_value_or_unparsable() {
    let body = r#"    <bpmn:intermediateCatchEvent id="a"><bpmn:timerEventDefinition id="t1" /></bpmn:intermediateCatchEvent>
    <bpmn:intermediateCatchEvent id="b"><bpmn:timerEventDefinition id="t2"><bpmn:timeDuration>5 minutes</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:intermediateCatchEvent>"#;
    assert_eq!(
        messages(&compat(&m(body), None)),
        vec![
            "Timer intermediate catch event \"a\" has no timer value; set one of timeDate, timeDuration.",
            "Timer intermediate catch event \"b\" has timeDuration \"5 minutes\", which is not an ISO 8601 duration (PT15M).",
        ]
    );
}

#[test]
fn time_date_is_checked_by_calendar_day() {
    let at = |date: &str| {
        m(&format!(
            r#"    <bpmn:intermediateCatchEvent id="a"><bpmn:timerEventDefinition id="t"><bpmn:timeDate>{date}</bpmn:timeDate></bpmn:timerEventDefinition></bpmn:intermediateCatchEvent>"#
        ))
    };
    assert!(compat(&at("2026-01-01T09:00:00Z"), None).is_empty());
    assert!(compat(&at("2024-02-29T00:00:00Z"), None).is_empty());
    assert_eq!(
        rules(&compat(&at("2026-02-29T09:00:00Z"), None)),
        vec!["compat/timer a"]
    );
}

#[test]
fn missing_codes_and_names() {
    let head = "  <bpmn:error id=\"err\" name=\"Failed\" />\n  <bpmn:message id=\"msg\" />\n  <bpmn:signal id=\"sig\" />\n";
    let body = r#"    <bpmn:endEvent id="fail"><bpmn:errorEventDefinition id="e" errorRef="err" /></bpmn:endEvent>
    <bpmn:receiveTask id="wait" messageRef="msg" />
    <bpmn:intermediateThrowEvent id="shout"><bpmn:signalEventDefinition id="s" signalRef="sig" /></bpmn:intermediateThrowEvent>"#;
    assert_eq!(
        messages(&compat(&model(body, Some("8.6.0"), head), None)),
        vec![
            "Error end event \"fail\" references error \"Failed\", which has no error code.",
            "Receive task \"wait\" references message \"msg\", which has no name.",
            "Message \"msg\" used by Receive task \"wait\" has no zeebe:subscription.",
            "Signal intermediate throw event \"shout\" references signal \"sig\", which has no name.",
        ]
    );
}

#[test]
fn script_task_implementation() {
    let body = r#"    <bpmn:scriptTask id="none" />
    <bpmn:scriptTask id="half"><bpmn:extensionElements><zeebe:script expression="=1" /></bpmn:extensionElements></bpmn:scriptTask>"#;
    assert_eq!(
        messages(&compat(&m(body), None)),
        vec![
            "Script task \"none\" has no implementation; Camunda needs a zeebe:script or zeebe:taskDefinition.",
            "Script task \"half\" has a zeebe:script with no resultVariable.",
        ]
    );
    assert_eq!(
        messages(&compat(&m(body), Some("8.1"))),
        vec![
            "Script task \"none\" has no implementation; Camunda needs a zeebe:taskDefinition.",
            "Script task \"half\" has a zeebe:script, which needs Camunda 8.2 or newer here; this model targets Camunda 8.1.",
        ]
    );
}

#[test]
fn nothing_without_a_target() {
    assert!(compat(
        &model(r#"    <bpmn:complexGateway id="g" />"#, None, ""),
        None
    )
    .is_empty());
}

fn task(inputs: &str) -> String {
    format!(
        r#"    <bpmn:serviceTask id="svc">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="t" />
        <zeebe:ioMapping>{inputs}</zeebe:ioMapping>
      </bpmn:extensionElements>
    </bpmn:serviceTask>"#
    )
}

#[test]
fn feel_builtin_newer_than_target() {
    let body = task(r#"<zeebe:input source="=uuid()" target="id" />"#);
    let found = compat(&m(&body), Some("8.5"));
    assert_eq!(
        found
            .iter()
            .map(|f| (f.data.id.as_str(), f.data.message.as_str()))
            .collect::<Vec<_>>(),
        vec![(
            "compat/feel-compatibility",
            "FEEL function <uuid> requires Camunda >=8.6"
        )]
    );
    assert!(compat(&m(&body), Some("8.6")).is_empty());
    let shadowed =
        task(r#"<zeebe:input source="={uuid: function() 1, id: uuid()}" target="id" />"#);
    assert!(compat(&m(&shadowed), Some("8.5")).is_empty());
}

#[test]
fn legacy_secrets_from_8_10() {
    let body = task(r#"<zeebe:input source="{{secrets.TOKEN}}" target="token" />"#);
    assert!(compat(&m(&body), Some("8.9")).is_empty());
    let found = compat(&m(&body), Some("8.10"));
    assert_eq!(found.len(), 1);
    assert_eq!(found[0].data.id, "compat/secrets");
    assert_eq!(found[0].data.severity, Severity::Warning);
    assert_eq!(
        found[0].data.message,
        "Property <source> uses legacy secret expression format"
    );
}

#[test]
fn no_loop_reports_a_straight_through_cycle() {
    let body = r#"    <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:task id="a"><bpmn:incoming>f1</bpmn:incoming><bpmn:incoming>f3</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing></bpmn:task>
    <bpmn:exclusiveGateway id="g" default="f3"><bpmn:incoming>f2</bpmn:incoming><bpmn:outgoing>f3</bpmn:outgoing></bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="a" />
    <bpmn:sequenceFlow id="f2" sourceRef="a" targetRef="g" />
    <bpmn:sequenceFlow id="f3" sourceRef="g" targetRef="a" />"#;
    let found: Vec<_> = compat(&m(body), None)
        .into_iter()
        .filter(|f| f.data.id == "compat/no-loop")
        .collect();
    assert_eq!(messages(&found), vec!["Loop detected: a -> g -> a"]);
    assert_eq!(found[0].data.element_ids, vec!["p"]);
}

#[test]
fn normalizes_versions() {
    let n = |s: &str| normalize_camunda_version(Some(s)).map(CamundaVersion::as_str);
    assert_eq!(n("8.6.2"), Some("8.6"));
    assert_eq!(n("8.10.0"), Some("8.10"));
    assert_eq!(n("1.3.0"), Some("1.3"));
    assert_eq!(n(" 8.06"), Some("8.6"));
    assert_eq!(n("8.12.0"), Some(newest().as_str()));
    assert_eq!(n("7.20.0"), None);
    assert_eq!(n("latest"), None);
    assert_eq!(normalize_camunda_version(None), None);
}

#[test]
fn target_needs_a_cloud_platform() {
    let defs = parse_bpmn(&m(AD_HOC)).expect("parse");
    assert_eq!(
        target_camunda_version(&defs).map(CamundaVersion::as_str),
        Some("8.6")
    );
    let xml = m(AD_HOC).replace("Camunda Cloud", "Camunda Platform");
    assert_eq!(
        target_camunda_version(&parse_bpmn(&xml).expect("parse")),
        None
    );
}

#[test]
fn dedupe_drops_equivalents_on_the_same_element() {
    let finding = |id: &str, element: &str| {
        Finding::new(FindingData {
            id: id.into(),
            category: Category::Deploy,
            severity: Severity::Error,
            message: String::new(),
            suggestion: String::new(),
            process_id: "p".into(),
            element_ids: vec![element.into()],
            produces: None,
            consumes: None,
            bpmnlint_rule: None,
        })
    };
    let equivalent = rule("implementation")
        .and_then(|r| r.equivalents.first())
        .expect("implementation has an equivalent");
    let kept = dedupe_camunda_compat(vec![
        finding(equivalent, "svc"),
        finding("compat/implementation", "svc"),
        finding("compat/implementation", "other"),
    ]);
    assert_eq!(
        kept.iter()
            .map(|f| format!("{} {}", f.data.id, f.data.element_ids[0]))
            .collect::<Vec<_>>(),
        vec![
            format!("{equivalent} svc"),
            "compat/implementation other".into()
        ]
    );
    assert!(is_camunda_compat_finding("compat/timer"));
    assert!(!is_camunda_compat_finding("deploy/timer"));
}
