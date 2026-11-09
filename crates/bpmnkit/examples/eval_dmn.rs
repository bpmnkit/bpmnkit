//! Evaluate a decision table: `cargo run -p bpmnkit --example eval_dmn`.

use bpmnkit::dmn::evaluate_decision_graph;
use bpmnkit::prelude::*;

const DMN: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="d" name="d" namespace="http://example.com">
  <decision id="tier" name="tier">
    <decisionTable id="t" hitPolicy="FIRST">
      <input id="i"><inputExpression id="ie" typeRef="number"><text>amount</text></inputExpression></input>
      <output id="o" typeRef="string"/>
      <rule id="r1"><inputEntry id="ie1"><text>&gt; 1000</text></inputEntry><outputEntry id="oe1"><text>"manager"</text></outputEntry></rule>
      <rule id="r2"><inputEntry id="ie1"><text></text></inputEntry><outputEntry id="oe1"><text>"auto"</text></outputEntry></rule>
    </decisionTable>
  </decision>
</definitions>"#;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let Document::Dmn(definitions) = load(DMN)? else {
        unreachable!("the input is DMN");
    };
    let mut vars = Context::new();
    vars.insert("amount", 1500);
    let out = evaluate_decision_graph(&definitions, "tier", &vars)?;
    println!("tier = {}", out.result);
    Ok(())
}
