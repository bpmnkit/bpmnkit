# bpmnkit-layout

BPMN and DMN auto-layout with coordinates that match the TypeScript implementation.

This is the Rust twin of `@bpmnkit/core` `applyAutoLayout` and `layoutDmn`. The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-layout
```

## Example

```rust
use bpmnkit_bpmn::parse_bpmn;
use bpmnkit_layout::{apply_auto_layout, LayoutEngine};

let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:endEvent id="e"><bpmn:incoming>f1</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="e"/>
  </bpmn:process>
</bpmn:definitions>"#;
let definitions = parse_bpmn(xml).unwrap();
assert!(definitions.diagrams.is_empty()); // no diagram interchange yet
let laid_out = apply_auto_layout(&definitions, LayoutEngine::Semantic, None);
assert_eq!(laid_out.diagrams[0].plane.shapes.len(), 2); // start and end event
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-layout>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
