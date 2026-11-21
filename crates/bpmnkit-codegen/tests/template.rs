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
