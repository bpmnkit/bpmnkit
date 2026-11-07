# bpmnkit-bpmn

BPMN 2.0 and Zeebe model, parser and lossless serializer.

This is the Rust twin of `@bpmnkit/core` BPMN I/O. The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-bpmn
```

## Example

```rust
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};

let xml = r#"<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Defs_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="s"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:endEvent id="e"><bpmn:incoming>f1</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="e"/>
  </bpmn:process>
</bpmn:definitions>"#;
let definitions = parse_bpmn(xml).unwrap();
assert_eq!(definitions.processes.len(), 1);
// Unknown attributes, prefixes and extension elements survive the round trip.
let again = parse_bpmn(&serialize_bpmn(&definitions)).unwrap();
assert_eq!(again, definitions);
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-bpmn>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
