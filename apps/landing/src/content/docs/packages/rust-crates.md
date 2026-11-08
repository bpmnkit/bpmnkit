---
title: Rust crates
description: The bpmnkit-* crates — a native Rust twin of BPMN Kit's core (FEEL, BPMN, DMN, forms, lint, layout, builder, text formats), held to the TypeScript packages by a shared conformance suite.
sidebar:
  order: 20
---

## Overview

The `bpmnkit-*` crates are a Rust implementation of BPMN Kit's core, built next to the
TypeScript packages rather than instead of them. JavaScript hosts (browser, Node, the editor)
keep using `@bpmnkit/*`; Rust programs (CLIs, the reebe engine, the desktop app, servers) use
the crates natively, with no JS runtime.

The two are kept identical by a shared conformance suite under `conformance/` in the
repository: about 3,300 cases recorded from the TypeScript packages (the oracle) that the Rust
crates must reproduce byte for byte — models, serialized XML, lint findings, layout
coordinates, FEEL results. CI runs it on every pull request, and a nightly job fuzzes both
implementations against each other (see [Differential fuzzing](#differential-fuzzing)).

## Crates

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

## Installation

```sh
cargo add bpmnkit-bpmn bpmnkit-feel
```

## Quick start

Parse and round-trip a BPMN file:

```rust
use bpmnkit_bpmn::{parse_bpmn, serialize_bpmn};

let xml = std::fs::read_to_string("order.bpmn")?;
let definitions = parse_bpmn(&xml)?;
println!("{} processes", definitions.processes.len());
// Unknown attributes, prefixes and extension elements survive the round trip.
std::fs::write("order.out.bpmn", serialize_bpmn(&definitions))?;
```

Evaluate FEEL:

```rust
use bpmnkit_feel::{evaluate, Context, Value};

let mut ctx = Context::new();
ctx.insert("x", Value::from(2));
assert_eq!(evaluate("x * 3 + 1", &ctx)?, Value::from(7));
```

Build a process (same output as `Bpmn.createProcess` in TypeScript):

```rust
use bpmnkit_builder::Bpmn;
use bpmnkit_bpmn::serialize_bpmn;

let definitions = Bpmn::create_process("order")
    .start_event(Some("start"), None)
    .end_event(Some("end"), None)
    .build(None)?;
println!("{}", serialize_bpmn(&definitions));
```

Each crate's README on crates.io and its docs.rs page have more examples.

## How the Rust API maps to TypeScript

- One function or method per TS function, in snake_case: `parseBpmn` is `parse_bpmn`,
  `applyAutoLayout` is `apply_auto_layout`, `.serviceTask()` is `.service_task()`.
- Option objects are structs that deserialize from the same camelCase JSON.
- Where TS throws, Rust returns `Result` with TS's message. The builders keep the first error
  and return it from `build()`.

## Numbers

FEEL numbers are exact decimals in Rust (`rust_decimal`, 28 significant digits) and float64 in
TypeScript. Results agree when compared to float64's 15 significant digits: `0.1 + 0.2` is
`0.3` in Rust and `0.30000000000000004` in TS. Beyond about 7.9 × 10²⁸ Rust has no number and
returns `null`, where TS still has a (rounded) float. Values too small for 28 fraction digits
round to 0 on both sides.

## Differential fuzzing

`crates/bpmnkit-fuzz` generates random FEEL expressions, BPMN diagrams, DMN tables (parsed and
evaluated), forms and process text, runs each through both implementations and compares the
answers with the conformance suite's rules. Disagreements are shrunk to a minimal input.

```sh
pnpm --filter @bpmnkit/feel --filter @bpmnkit/core --filter @bpmnkit/engine build
pnpm fuzz --target feel --seconds 300        # or --target all
pnpm fuzz --replay target/fuzz-mismatches/feel-42.json
```

Every real disagreement becomes a conformance case and a fix on both sides.

## Versioning

The crates are versioned in lockstep, independently of the npm packages, and published
manually from a GitHub workflow. Each release notes which `@bpmnkit/core` and `@bpmnkit/feel`
versions its conformance corpus was recorded from.
