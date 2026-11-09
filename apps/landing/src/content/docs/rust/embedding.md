---
title: Embedding the Rust crates
description: Use the bpmnkit crate in a Rust CLI or chat server (Slack): load any model with one call, one error type, lint reports as text, Markdown or Slack mrkdwn, and cargo features for rendering and diff.
sidebar:
  order: 21
---

## Overview

The `bpmnkit` crate is the one dependency for a Rust CLI or server. Everything is synchronous,
pure and `Send + Sync`, so an async server (tokio) calls it from `spawn_blocking`. This page
covers loading, errors, lint reports and the cargo features.

```toml
[dependencies]
bpmnkit = { version = "0.1", features = ["lint", "layout"] }
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

## One error type

`bpmnkit::Error` is `#[non_exhaustive]` and has `From` for each crate's error (`Xml`, `Bpmn`,
`Dmn`, `Form`, `Feel`, `Text`, `Build`), so `?` works across crates. `Display` prefixes the
source (`BPMN: ...`) and `source()` returns the original. `Unrecognized` and `FeatureDisabled`
come from `load` itself.

## Lint reports for people

`bpmnkit_lint::report` turns a `LintReport` into a string:

| Function | For |
|---|---|
| `to_text(&report, &TextStyle { color, max })` | terminals and logs; `max: 0` prints all |
| `to_markdown(&report)` | PR comments |
| `to_slack_mrkdwn(&report)` | Slack; `&`, `<` and `>` are escaped |

`check_findings_to_text`, `check_findings_to_markdown` and `check_findings_to_slack_mrkdwn` do
the same for DMN and form `CheckFinding`s. See the `lint_report` example.

## Cargo features

| Feature | Adds |
|---|---|
| `default` | `feel`, `bpmn`, `dmn`, `form` |
| `text` | process text and compact JSON in `load` (implies `bpmn`, `dmn`) |
| `lint`, `layout`, `builder`, `compat`, `xml`, `spec` | the matching `bpmnkit-*` crate |
| `full` | all of the above |

Image rendering (`render`, `render-png`) and semantic diff (`diff`, `diff-html`) are planned in
[the embedding plan](https://github.com/bpmnkit/bpmnkit/blob/main/doc/plans/rust-embedding.md).
For a Slack bot: build the image in `spawn_blocking`, upload with `files.uploadV2`, and post the
lint report as `to_slack_mrkdwn`.

## Examples

`cargo run -p bpmnkit --all-features --example text_to_bpmn | eval_dmn | lint_report`.
