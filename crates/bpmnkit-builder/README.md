# bpmnkit-builder

Fluent builders for BPMN processes and diagrams, DMN decision tables and DRDs.

This is the Rust twin of `@bpmnkit/core` `Bpmn.createProcess` and the `Dmn` builders. The TypeScript implementation is the oracle: both are held to the same
conformance cases, so results match.

## Install

```sh
cargo add bpmnkit-builder
```

## Example

```rust
use bpmnkit_builder::Bpmn;
use bpmnkit_bpmn::serialize_bpmn;

let definitions = Bpmn::create_process("order")
    .start_event(Some("start"), None)
    .end_event(Some("end"), None)
    .build(None)
    .unwrap();
assert!(serialize_bpmn(&definitions).contains(r#"<bpmn:process id="order""#));
```

## Links

- Website: <https://bpmnkit.com>
- Repository: <https://github.com/bpmnkit/bpmnkit>
- API docs: <https://docs.rs/bpmnkit-builder>

All `bpmnkit-*` crates share one version and are released together.

## License

Licensed under either of MIT or Apache-2.0 at your option ([LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE)).
