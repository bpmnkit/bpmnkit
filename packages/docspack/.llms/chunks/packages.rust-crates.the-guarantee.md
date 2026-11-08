# Rust crates — The guarantee

TypeScript is the oracle. About 3,300 conformance cases, recorded from the TypeScript packages
and kept under `conformance/` in the repository, must be reproduced exactly by the Rust crates.
They cover models, serialized XML, lint findings, layout coordinates and FEEL results.

- CI runs the suite on every pull request.
- A nightly job fuzzes both implementations against each other and compares the answers (see
  [Differential fuzzing](#differential-fuzzing)).


## Installation

```sh
cargo add bpmnkit                                    # feel, bpmn, dmn and form
cargo add bpmnkit --features full                    # every crate
cargo add bpmnkit --no-default-features --features feel   # FEEL only
cargo add bpmnkit --features lint,layout             # defaults plus lint and layout
```

Each crate is a module behind a feature of the same name (`bpmnkit::feel`, `bpmnkit::bpmn`, …).
A feature turns on the crates it needs. For example `text` also builds `bpmn`, `dmn` and
`layout`, but only the modules you name are re-exported.

| Feature | Module | Crate | Default | What it does |
|---|---|---|---|---|
| `feel` | `bpmnkit::feel` | `bpmnkit-feel` | yes | FEEL lexer, parser and evaluator with exact decimals |
| `bpmn` | `bpmnkit::bpmn` | `bpmnkit-bpmn` | yes | BPMN 2.0 model, parser and lossless serializer (Zeebe extensions) |
| `dmn` | `bpmnkit::dmn` | `bpmnkit-dmn` | yes | DMN 1.3 model, parser, serializer and decision evaluation |
| `form` | `bpmnkit::form` | `bpmnkit-form` | yes | Camunda form JSON model, parser and serializer |
| `xml` | `bpmnkit::xml` | `bpmnkit-xml` | | Lossless XML reader and writer the BPMN and DMN parsers share |
| `spec` | `bpmnkit::spec` | `bpmnkit-spec` | | Shared data: element tables, FEEL built-ins, lint rules, connector templates |
| `compat` | `bpmnkit::compat` | `bpmnkit-compat` | | Camunda 8 version checks and Camunda 7 to 8 migration |
| `lint` | `bpmnkit::lint` | `bpmnkit-lint` | | BPMN lint and optimize passes, bpmnlint config, DMN and form lint |
| `layout` | `bpmnkit::layout` | `bpmnkit-layout` | | Auto layout of BPMN and DMN diagrams |
| `builder` | `bpmnkit::builder` | `bpmnkit-builder` | | Fluent process builders, DMN decision-table and DRD builders |
| `text` | `bpmnkit::text` | `bpmnkit-text` | | Compact JSON, the process line format and connector lines |
| `full` | | | | All of the above |

You can also add a crate on its own, for example `cargo add bpmnkit-feel`. For a size-bound
build (such as WebAssembly), depend on `bpmnkit-feel` or `bpmnkit-dmn` directly with
`default-features = false`. That leaves out the IANA time zone table and the full regex engine.

---
Source: https://bpmnkit.com/docs/packages/rust-crates
