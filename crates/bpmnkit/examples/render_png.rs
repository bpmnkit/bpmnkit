//! A diff drawn over the later diagram, as a PNG for a chat message:
//! `cargo run -p bpmnkit --features render-png,diff-html --example render_png > diff.png`.

use bpmnkit::prelude::*;
use std::io::Write;

fn model(task_name: &str) -> String {
    format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:task id="t" name="{task_name}"><bpmn:incoming>f1</bpmn:incoming></bpmn:task>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="t"/>
  </bpmn:process>
</bpmn:definitions>"#
    )
}

fn main() -> Result<(), Error> {
    let before = parse_bpmn(&model("Review order"))?;
    let after = parse_bpmn(&model("Check order"))?;
    let diff = diff_bpmn(&before, &after);
    // No diagram interchange in these models: lay them out first.
    let svg = diff_to_svg(&after, &diff, &RenderOptions::default().auto_layout(true))?;
    let png = svg_to_png(&svg, &PngOptions::default())?;
    eprintln!("{} bytes", png.len());
    std::io::stdout().write_all(&png).expect("stdout");
    Ok(())
}
