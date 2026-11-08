//! Ported from `packages/core/tests/lint.test.ts`.

use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_lint::lint::ExecutionPlatform;
use bpmnkit_lint::optimize::OptimizeOptions;
use bpmnkit_lint::{
    detect_execution_platform, lint_diagram, Category, LintOptions, LintReport, Severity,
};

#[derive(Default)]
struct X<'a> {
    platform: Option<&'a str>,
    task_type: Option<&'a str>,
    without_plane: bool,
}

fn make_xml(o: X) -> String {
    let modeler = o.platform.map_or(String::new(), |p| {
        format!(
            r#" xmlns:modeler="http://camunda.org/schema/modeler/1.0" modeler:executionPlatform="{p}" modeler:executionPlatformVersion="8.6.0""#
        )
    });
    let task_def = o.task_type.map_or(String::new(), |t| {
        format!(r#"<bpmn:extensionElements><zeebe:taskDefinition type="{t}" /></bpmn:extensionElements>"#)
    });
    let plane = if o.without_plane {
        ""
    } else {
        r#"<bpmndi:BPMNDiagram id="d1"><bpmndi:BPMNPlane id="p1" bpmnElement="proc">
    <bpmndi:BPMNShape id="s1" bpmnElement="start"><dc:Bounds x="100" y="100" width="36" height="36"/></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s2" bpmnElement="charge"><dc:Bounds x="200" y="80" width="100" height="80"/></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="s3" bpmnElement="end"><dc:Bounds x="360" y="100" width="36" height="36"/></bpmndi:BPMNShape>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>"#
    };
    format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"{modeler}
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="proc" isExecutable="true">
    <bpmn:startEvent id="start" name="Order received"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:serviceTask id="charge" name="Charge card">{task_def}<bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing></bpmn:serviceTask>
    <bpmn:endEvent id="end" name="Done"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="charge" />
    <bpmn:sequenceFlow id="f2" sourceRef="charge" targetRef="end" />
  </bpmn:process>
  {plane}
</bpmn:definitions>"#
    )
}

fn lint(xml: &str, options: LintOptions) -> LintReport {
    lint_diagram(&parse_bpmn(xml).unwrap(), options)
}

fn cloud() -> String {
    make_xml(X {
        platform: Some("Camunda Cloud"),
        ..X::default()
    })
}

fn categories(c: &[Category]) -> LintOptions {
    LintOptions {
        optimize: OptimizeOptions {
            categories: Some(c.to_vec()),
            ..OptimizeOptions::default()
        },
        ..LintOptions::default()
    }
}

#[test]
fn detects_the_platform() {
    let none = detect_execution_platform(&parse_bpmn(&make_xml(X::default())).unwrap());
    assert_eq!(
        serde_json::to_value(&none).unwrap(),
        serde_json::json!({"id": "none"})
    );
    let p = detect_execution_platform(&parse_bpmn(&cloud()).unwrap());
    assert_eq!(
        serde_json::to_value(&p).unwrap(),
        serde_json::json!({"id": "camunda-cloud", "name": "Camunda Cloud", "version": "8.6.0"})
    );
    let platform = |name| {
        detect_execution_platform(
            &parse_bpmn(&make_xml(X {
                platform: Some(name),
                ..X::default()
            }))
            .unwrap(),
        )
        .id
    };
    assert_eq!(
        platform("Camunda Platform"),
        ExecutionPlatform::CamundaPlatform
    );
    assert_eq!(platform("Flowable"), ExecutionPlatform::None);
}

#[test]
fn engine_rules_follow_the_platform() {
    let neutral = lint(&make_xml(X::default()), LintOptions::default());
    assert_eq!(neutral.platform.id, ExecutionPlatform::None);
    assert!(!neutral
        .diagnostics
        .iter()
        .any(|d| d.category == Category::Deploy));
    assert!(!neutral.categories.contains(&Category::Deploy));
    assert!(neutral.total > 0);

    let c = lint(&cloud(), LintOptions::default());
    assert!(c.diagnostics.iter().any(|d| d.category == Category::Deploy));
    assert!(c.categories.contains(&Category::Deploy));

    let forced = lint(
        &make_xml(X::default()),
        LintOptions {
            force_engine_rules: true,
            ..LintOptions::default()
        },
    );
    assert!(forced
        .diagnostics
        .iter()
        .any(|d| d.category == Category::Deploy));
}

#[test]
fn narrows_to_requested_categories() {
    let r = lint(&cloud(), categories(&[Category::Naming]));
    assert_eq!(r.categories, [Category::Naming]);
    assert!(r.diagnostics.iter().all(|d| d.category == Category::Naming));
    let n = lint(
        &make_xml(X::default()),
        categories(&[Category::Naming, Category::Deploy]),
    );
    assert_eq!(n.categories, [Category::Naming]);
}

#[test]
fn diagnostics_are_plain_data() {
    let r = lint(&cloud(), LintOptions::default());
    assert!(!r.diagnostics.is_empty());
    let v = serde_json::to_value(&r).unwrap();
    for d in v["diagnostics"].as_array().unwrap() {
        assert!(d["fixable"].is_boolean());
        assert!(d.get("applyFix").is_none());
    }
    let on_charge = r
        .diagnostics
        .iter()
        .find(|d| d.element_ids.iter().any(|e| e == "charge"));
    assert_eq!(on_charge.and_then(|d| d.plane.as_deref()), Some("proc"));
    let unplaced = lint(
        &make_xml(X {
            platform: Some("Camunda Cloud"),
            without_plane: true,
            ..X::default()
        }),
        LintOptions::default(),
    );
    assert!(unplaced.diagnostics.iter().all(|d| d.plane.is_none()));
    assert_eq!(r.counts.error + r.counts.warning + r.counts.info, r.total);
    assert_eq!(r.total, r.diagnostics.len());
}

#[test]
fn a_specified_model_has_no_deploy_errors() {
    let r = lint(
        &make_xml(X {
            platform: Some("Camunda Cloud"),
            task_type: Some("charge-worker"),
            ..X::default()
        }),
        LintOptions::default(),
    );
    assert!(!r
        .diagnostics
        .iter()
        .any(|d| d.category == Category::Deploy && d.severity == Severity::Error));
}
