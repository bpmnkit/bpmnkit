//! Template (REST binding) emitter: deterministic, only REST-classified jobs unless `all`.

use bpmnkit_codegen::template::TemplateEmitter;
use bpmnkit_codegen::{EmitError, Emitter};
use bpmnkit_jobspec::{analyze, ApiIndex, Catalog, Decision, Inputs, WorkerConfig};

fn project() -> bpmnkit_jobspec::WorkerProject {
    let defs = vec![bpmnkit_bpmn::parse_bpmn(include_str!("fixtures/order.bpmn")).unwrap()];
    let mut p = analyze(Inputs {
        name: "order",
        definitions: &defs,
        apis: &ApiIndex::default(),
        catalog: &Catalog::builtin(),
        config: &WorkerConfig::default(),
    })
    .project;
    p.jobs
        .get_mut("charge-card")
        .unwrap()
        .classified
        .as_mut()
        .unwrap()
        .decision = Decision::Rest;
    p
}

#[test]
fn golden_rest_binding() {
    let files = TemplateEmitter::default().emit(&project()).unwrap();
    let s: String = files
        .iter()
        .map(|f| {
            format!(
                "===== {} =====\n{}",
                f.path,
                String::from_utf8_lossy(&f.content)
            )
        })
        .collect();
    insta::assert_snapshot!(s);
}

#[test]
fn only_rest_jobs_unless_all_and_deterministic() {
    let p = project();
    let a = TemplateEmitter::default().emit(&p).unwrap();
    assert_eq!(a, TemplateEmitter::default().emit(&p).unwrap());
    assert_eq!(a.len(), 2, "one REST job: template + patch");
    assert_eq!(TemplateEmitter { all: true }.emit(&p).unwrap().len(), 4);
    let mut none = p;
    none.jobs
        .values_mut()
        .for_each(|j| j.classified.as_mut().unwrap().decision = Decision::Worker);
    assert_eq!(
        TemplateEmitter::default().emit(&none),
        Err(EmitError::NoJobs)
    );
}

// Regression: `send-email` and `send_email` share a slug, and the emitter failed with
// DuplicatePath instead of suffixing the second.
#[test]
fn colliding_slugs_are_suffixed() {
    let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="t">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:serviceTask id="a"><bpmn:extensionElements><zeebe:taskDefinition type="send-email"/></bpmn:extensionElements></bpmn:serviceTask>
    <bpmn:serviceTask id="b"><bpmn:extensionElements><zeebe:taskDefinition type="send_email"/></bpmn:extensionElements></bpmn:serviceTask>
  </bpmn:process>
</bpmn:definitions>"#;
    let defs = vec![bpmnkit_bpmn::parse_bpmn(xml).unwrap()];
    let p = analyze(Inputs {
        name: "x",
        definitions: &defs,
        apis: &ApiIndex::default(),
        catalog: &Catalog::builtin(),
        config: &WorkerConfig::default(),
    })
    .project;
    let paths: Vec<String> = TemplateEmitter { all: true }
        .emit(&p)
        .unwrap()
        .into_iter()
        .map(|f| f.path)
        .collect();
    assert_eq!(paths.len(), 4, "{paths:?}");
    let mut uniq = paths.clone();
    uniq.dedup();
    assert_eq!(uniq, paths);
}
