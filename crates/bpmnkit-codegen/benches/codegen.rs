//! Plan I7: a 100-task BPMN → worker project, end to end (parse, extract, classify, emit).
//! Plain loop, no harness; rows are read by `scripts/bench-rs.mjs`.

use std::hint::black_box;
use std::time::Instant;

use bpmnkit_codegen::java::JavaEmitter;
use bpmnkit_codegen::rust::RustEmitter;
use bpmnkit_codegen::Emitter;
use bpmnkit_jobspec::{analyze, ApiIndex, Catalog, Inputs, WorkerConfig};

fn hundred_tasks() -> String {
    let mut s = String::from(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:zeebe=\"http://camunda.org/schema/zeebe/1.0\" id=\"d\" targetNamespace=\"t\">\n<bpmn:process id=\"p\" isExecutable=\"true\">\n",
    );
    for i in 0..100 {
        s.push_str(&format!(
            "<bpmn:serviceTask id=\"t{i}\" name=\"Task {i}\"><bpmn:extensionElements><zeebe:taskDefinition type=\"job-{i}\" retries=\"3\"/><zeebe:ioMapping><zeebe:input source=\"=a{i}\" target=\"in-{i}\"/><zeebe:output source=\"=r{i}.x\" target=\"out-{i}\"/></zeebe:ioMapping></bpmn:extensionElements></bpmn:serviceTask>\n"
        ));
    }
    s.push_str("</bpmn:process>\n</bpmn:definitions>\n");
    s
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
        .unwrap_or(50);
    let xml = hundred_tasks();
    let (catalog, apis, config) = (
        Catalog::builtin(),
        ApiIndex::default(),
        WorkerConfig::default(),
    );
    let project = || {
        let defs = vec![bpmnkit_bpmn::parse_bpmn(&xml).unwrap()];
        analyze(Inputs {
            name: "bench",
            definitions: &defs,
            apis: &apis,
            catalog: &catalog,
            config: &config,
        })
        .project
    };
    time("java 100 tasks", iterations, || {
        black_box(JavaEmitter::default().emit(&project()).unwrap());
    });
    time("rust 100 tasks", iterations, || {
        black_box(RustEmitter::default().emit(&project()).unwrap());
    });
}
