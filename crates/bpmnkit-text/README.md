# bpmnkit-text

Text formats over the BPMN and DMN models: compact JSON, the process line format and connector lines.

This is the Rust twin of `@bpmnkit/core` compact JSON and process text. The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-text
```

## Example

```rust
use bpmnkit_text::compact::compactify;
use bpmnkit_text::process_text::parse_process_text;

let parsed = parse_process_text("start[start Order placed] > user[user Review order] > end[end Done]");
assert!(parsed.problems.is_empty());
assert_eq!(parsed.diagram.processes.len(), 1);

// Compact JSON of a model: ids, names, elements and flows only.
let compact = compactify(&bpmnkit_bpmn::parse_bpmn(r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:endEvent id="e"><bpmn:incoming>f1</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="e"/>
  </bpmn:process>
</bpmn:definitions>"#).unwrap());
assert_eq!(compact.processes[0].id, "p");
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-text>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
