# bpmnkit-compat

Camunda 8 version compatibility checks and Camunda 7 to 8 migration (including JUEL to FEEL).

This is the Rust twin of `@bpmnkit/core` camunda-compat and camunda7. The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-compat
```

## Example

```rust
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_compat::compat::analyze_camunda_compat;

let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:endEvent id="e"><bpmn:incoming>f1</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="e"/>
  </bpmn:process>
</bpmn:definitions>"#;
let definitions = parse_bpmn(xml).unwrap();
// Findings for Camunda 8.6; a plain start-to-end process raises none.
let findings = analyze_camunda_compat(&definitions, Some("8.6"));
assert!(findings.is_empty());
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-compat>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
