//! Render a model to SVG for a chat thumbnail: `cargo run -p bpmnkit --features render --example render_svg`.

use bpmnkit::prelude::*;

fn main() -> Result<(), Error> {
    // No diagram interchange: `render` lays the model out first.
    let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s" name="Order received"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:serviceTask id="t" name="Charge card"><bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing></bpmn:serviceTask>
    <bpmn:endEvent id="e"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="t"/>
    <bpmn:sequenceFlow id="f2" sourceRef="t" targetRef="e"/>
  </bpmn:process>
</bpmn:definitions>"#;
    let defs = parse_bpmn(xml)?;
    let opts = RenderOptions::default()
        .theme(Theme::Dark)
        .auto_layout(true)
        .max_size(640.0, 360.0);
    let svg = bpmn_to_svg(&defs, &opts)?;
    println!(
        "{} elements, {}x{} px",
        svg.elements.len(),
        svg.width,
        svg.height
    );
    println!("{}", svg.markup);
    Ok(())
}
