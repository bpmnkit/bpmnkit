//! Compare two versions of a model and write the HTML viewer:
//! `cargo run -p bpmnkit --features diff-html --example diff_html > diff.html`.

use bpmnkit::prelude::*;

fn model(task_name: &str, task_x: u32) -> String {
    format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="D" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:task id="t" name="{task_name}"><bpmn:incoming>f1</bpmn:incoming></bpmn:task>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="t"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="d"><bpmndi:BPMNPlane id="pl" bpmnElement="p">
    <bpmndi:BPMNShape id="s_di" bpmnElement="s"><dc:Bounds x="100" y="102" width="36" height="36"/></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="t_di" bpmnElement="t"><dc:Bounds x="{task_x}" y="80" width="100" height="80"/></bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="f1_di" bpmnElement="f1"><di:waypoint x="136" y="120"/><di:waypoint x="{task_x}" y="120"/></bpmndi:BPMNEdge>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>"#
    )
}

fn main() -> Result<(), Error> {
    let before = parse_bpmn(&model("Review order", 200))?;
    let after = parse_bpmn(&model("Check order", 240))?;
    let diff = diff_bpmn(&before, &after);
    // For a chat message: the text summary; the HTML goes up as a file.
    eprintln!("{}", diff_to_text(&diff, &DiffTextOptions::default()));
    let opts = DiffHtmlOptions::default()
        .title("order.bpmn")
        .labels("main", "feature");
    println!("{}", diff_to_html(&before, &after, &diff, &opts)?);
    Ok(())
}
