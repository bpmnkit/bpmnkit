---
title: Rust crates
description: The bpmnkit crate and its bpmnkit-* parts, a native Rust twin of BPMN Kit's core (FEEL, BPMN, DMN, forms, lint, layout, builder, text formats), held to the TypeScript packages by a shared conformance suite.
sidebar:
  order: 20
---

## Overview

The `bpmnkit-*` crates are a Rust implementation of BPMN Kit's core. They are the Rust twin of
the TypeScript packages and are built next to them, not instead of them. JavaScript hosts
(browser, Node, the editor) keep using `@bpmnkit/*`. Rust programs (CLIs, servers, the desktop
app) use the crates natively, with no JS runtime.

The reebe engine (`apps/reebe`) runs on these crates. It parses BPMN and DMN and evaluates FEEL
through them.

The `bpmnkit` crate is the front door: one dependency that re-exports the other crates as
modules behind cargo features.

## The guarantee

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

## Crates

| Crate | Twin of | What it does |
|---|---|---|
| `bpmnkit` | all of the below | Facade: re-exports the crates as feature-gated modules |
| `bpmnkit-feel` | `@bpmnkit/feel` | FEEL lexer, parser and evaluator with exact decimals |
| `bpmnkit-xml` | `@bpmnkit/core` (XML) | Lossless XML reader and writer: prefixes, attribute order and unknown content kept |
| `bpmnkit-bpmn` | `@bpmnkit/core` (BPMN I/O) | BPMN 2.0 and Zeebe model, parser and lossless serializer |
| `bpmnkit-dmn` | `@bpmnkit/core`, `@bpmnkit/engine` | DMN model, parser, serializer and decision evaluation |
| `bpmnkit-form` | `@bpmnkit/core` (forms) | Camunda Form model, parser and exporter |
| `bpmnkit-lint` | `@bpmnkit/core` (lint, optimize) | Lint and optimize passes, bpmnlint config, DMN and form lint |
| `bpmnkit-compat` | `@bpmnkit/core` (camunda-compat, camunda7) | Camunda 8 version checks, Camunda 7 to 8 migration incl. JUEL to FEEL |
| `bpmnkit-layout` | `@bpmnkit/core` (auto-layout) | BPMN and DMN auto-layout |
| `bpmnkit-builder` | `@bpmnkit/core` (`Bpmn.createProcess`, DMN builders) | Fluent process, diagram, decision-table and DRD builders |
| `bpmnkit-text` | `@bpmnkit/core` (compact, process text) | Compact JSON for BPMN and DMN, the process line format |
| `bpmnkit-spec` | `spec/` | Shared data: FEEL built-ins, lint rules, compatibility tables, connector templates |

## Quick start

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

## Performance vs TypeScript

The Rust crates are faster than the TypeScript packages in most areas, but not all. These
figures are approximate. They were measured on a shared machine, as the minimum of interleaved
runs over the conformance corpora, and they will vary with hardware and input. Treat them as an
order of magnitude. The details and the bench commands are in the repository's
`doc/progress.md`.

| Operation | Rust vs TypeScript |
|---|---|
| Layout, semantic (BPMN) | ≈2.5× faster (owned API, up to ≈2.9×) |
| Layout, grid (BPMN) | ≈2.2× faster |
| Layout, DMN | ≈1.4× faster (≈3.5× with the owned API) |
| Builder with layout | ≈2.2× faster |
| Process text, parse | ≈2.4× faster |
| Process text, write | ≈2.6× faster |
| Compact JSON, expand | ≈2.9× faster |
| Compact JSON, compactify | ≈2.1× faster |
| Lint, optimize, compat checks | ≈2× faster |
| DMN evaluate | ≈1.35× faster |
| BPMN serialize | ≈1.2× faster |
| BPMN parse | on par |

Not everything is faster: DMN parsing is currently slower than TypeScript.

## Requirements

- Rust 1.85 or later (MSRV). CI checks the crates on exactly that toolchain.
- Licence: `MIT OR Apache-2.0`.
- All crates share one version and are released together.

## Where they are published

Releases go to [crates.io](https://crates.io/crates/bpmnkit). API docs are built on
[docs.rs](https://docs.rs/bpmnkit). The source is in the `crates/` directory of the
[repository](https://github.com/bpmnkit/bpmnkit).

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
