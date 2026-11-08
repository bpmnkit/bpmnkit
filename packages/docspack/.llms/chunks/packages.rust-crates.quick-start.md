# Rust crates — Quick start

Parse and round-trip a BPMN file:

```rust
use bpmnkit::bpmn::{parse_bpmn, serialize_bpmn};

let xml = std::fs::read_to_string("order.bpmn")?;
let definitions = parse_bpmn(&xml)?;
println!("{} processes", definitions.processes.len());
// Unknown attributes, prefixes and extension elements survive the round trip.
std::fs::write("order.out.bpmn", serialize_bpmn(&definitions))?;
```

Evaluate FEEL:

```rust
use bpmnkit::feel::{evaluate, Context, Value};

let mut ctx = Context::new();
ctx.insert("x", Value::from(2));
assert_eq!(evaluate("x * 3 + 1", &ctx)?, Value::from(7));
```

Build a process (same output as `Bpmn.createProcess` in TypeScript). This needs the `builder`
feature:

```rust
use bpmnkit::bpmn::serialize_bpmn;
use bpmnkit::builder::Bpmn;

let definitions = Bpmn::create_process("order")
    .start_event(Some("start"), None)
    .end_event(Some("end"), None)
    .build(None)?;
println!("{}", serialize_bpmn(&definitions));
```

Each crate's README and its docs.rs page have more examples.

---
Source: https://bpmnkit.com/docs/packages/rust-crates
