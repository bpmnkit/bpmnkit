# bpmnkit-lint

BPMN lint and optimize passes, `.bpmnlintrc` support, DMN and Form lint.

This is the Rust twin of `@bpmnkit/core` lint, optimize and bpmnlint. The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-lint
```

## Example

```rust
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_lint::lint::{lint_diagram, LintOptions};

let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:endEvent id="e"><bpmn:incoming>f1</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="e"/>
  </bpmn:process>
</bpmn:definitions>"#;
let definitions = parse_bpmn(xml).unwrap();
let report = lint_diagram(&definitions, LintOptions::default());
for d in &report.diagnostics {
    println!("{} {}: {}", d.id, d.process_id, d.message);
}
assert_eq!(report.total, report.diagnostics.len());
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-lint>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
