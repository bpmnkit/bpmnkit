# Rust crates — Crates

| Crate | Twin of | What it does |
|---|---|---|
| `bpmnkit-feel` | `@bpmnkit/feel` | FEEL lexer, parser and evaluator with exact decimals |
| `bpmnkit-xml` | `@bpmnkit/core` (XML) | Lossless XML reader and writer: prefixes, attribute order and unknown content kept |
| `bpmnkit-bpmn` | `@bpmnkit/core` (BPMN I/O) | BPMN 2.0 + Zeebe model, parser and lossless serializer |
| `bpmnkit-dmn` | `@bpmnkit/core`, `@bpmnkit/engine` | DMN model, parser, serializer and decision evaluation |
| `bpmnkit-form` | `@bpmnkit/core` (forms) | Camunda Form model, parser and exporter |
| `bpmnkit-lint` | `@bpmnkit/core` (lint, optimize) | Lint and optimize passes, bpmnlint config, DMN and form lint |
| `bpmnkit-compat` | `@bpmnkit/core` (camunda-compat, camunda7) | Camunda 8 version checks, Camunda 7 → 8 migration incl. JUEL → FEEL |
| `bpmnkit-layout` | `@bpmnkit/core` (auto-layout) | BPMN and DMN auto-layout |
| `bpmnkit-builder` | `@bpmnkit/core` (`Bpmn.createProcess`, DMN builders) | Fluent process, diagram, decision-table and DRD builders |
| `bpmnkit-text` | `@bpmnkit/core` (compact, process text) | Compact JSON for BPMN and DMN, the process line format |
| `bpmnkit-spec` | `spec/` | Shared data: FEEL built-ins, lint rules, compatibility tables, connector templates |

All crates are dual-licensed `MIT OR Apache-2.0`, need Rust 1.85 or later, and share one
version (they are released together).

---
Source: https://bpmnkit.com/docs/packages/rust-crates
