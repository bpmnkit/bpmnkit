# Embedding the Rust crates — Overview

The `bpmnkit` crate is the one dependency for a Rust CLI or server. Everything is synchronous,
pure and `Send + Sync`, so an async server (tokio) calls it from `spawn_blocking`. This page
covers loading, errors, lint reports and the cargo features.

```toml
[dependencies]
bpmnkit = { version = "0.2", features = ["lint", "layout"] }
```


## Load anything: `detect` and `load`

`bpmnkit::detect(&str)` looks at the input and returns a `DocKind`: `Bpmn`, `Dmn`, `Form`,
`ProcessText`, `CompactJson` or `Unknown`. It does not parse, so `Bpmn` does not promise
valid XML. `bpmnkit::load(&str)` detects and parses into a `Document` (`Bpmn`, `Dmn` or
`Form`). Process text and compact JSON expand into a laid-out BPMN (or DMN) document without
the Camunda 8 deploy gate, so a draft from a chat message still loads.

```rust
use bpmnkit::prelude::*;

fn main() -> Result<(), Error> {
    match load(&std::fs::read_to_string("model.bpmn").unwrap())? {
        Document::Bpmn(defs) => println!("{} bytes", serialize_bpmn(&defs).len()),
        Document::Dmn(_) | Document::Form(_) => {}
        _ => {}
    }
    Ok(())
}
```

`bpmnkit::prelude` re-exports `detect`, `load`, `Error`, `parse_bpmn`, `serialize_bpmn`,
`parse_dmn`, `parse_form`, `evaluate`, `Context` and `Value` for the enabled features.

---
Source: https://bpmnkit.com/docs/rust/embedding
