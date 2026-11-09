//! Lint a model and print the report for a terminal, a PR comment and Slack:
//! `cargo run -p bpmnkit --example lint_report`.

use bpmnkit::lint::lint::{lint_diagram, LintOptions};
use bpmnkit::lint::report::{to_markdown, to_slack_mrkdwn, to_text, TextStyle};
use bpmnkit::prelude::*;

fn main() -> Result<(), Error> {
    // A start event with nothing after it.
    let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true"><bpmn:startEvent id="s"/></bpmn:process>
</bpmn:definitions>"#;
    let Document::Bpmn(definitions) = load(xml)? else {
        unreachable!("the input is BPMN");
    };
    let report = lint_diagram(&definitions, LintOptions::default());
    println!(
        "{}",
        to_text(
            &report,
            &TextStyle {
                color: false,
                max: 10
            }
        )
    );
    println!("{}", to_markdown(&report));
    println!("{}", to_slack_mrkdwn(&report));
    Ok(())
}
