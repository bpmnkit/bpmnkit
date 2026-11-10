---
title: Embedding the Rust crates
description: "Use the bpmnkit crate in a Rust CLI or chat server (Slack): load any model with one call, one error type, lint reports as text, Markdown or Slack mrkdwn, and cargo features for rendering and diff."
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

## FEEL and DMN results in chat

`Value::to_feel_string()` is FEEL's `string()` (`Display` prints `null` instead of `None`).
`Value::to_json_string()` / `to_json()` and `Value::from_json_str()` / `from_json()` convert to and
from JSON; `Context::from_json_str(body)` turns a request body into FEEL variables. Text forms keep
every digit of a number; `serde_json::Value` holds f64.

`bpmnkit_dmn::report::{result_to_text, result_to_markdown, result_to_slack_mrkdwn}(title, &result)`
print a decision result: a single value, one hit (a context) or many hits (rows, the union of
their keys as columns). Slack has no tables, so rows go in an aligned code block.

## Cargo features

| Feature | Adds |
|---|---|
| `default` | `feel`, `bpmn`, `dmn`, `form` |
| `text` | process text and compact JSON in `load` (implies `bpmn`, `dmn`) |
| `lint`, `layout`, `builder`, `compat`, `xml`, `spec` | the matching `bpmnkit-*` crate |
| `render` | `bpmnkit::render`: BPMN to SVG, auto layout for models without DI |
| `diff` | `bpmnkit::diff`: semantic diff, field-level changes, semantic hash |
| `diff-html` | `diff_to_html` and `diff_to_svg` (implies `diff`, `render`) |
| `render-png` | `svg_to_png`, `bpmn_to_png` (resvg, bundled Inter subset) |
| `render-system-fonts` | PNG text from the machine's fonts too (`FontSource::System`) |
| `full` | all of the above except `render-png` and `render-system-fonts` (a raster stack) |

## Render a diagram

`bpmn_to_svg(&defs, &RenderOptions)` gives the same SVG bytes as TS `exportSvg` with the same
options. `RenderOptions::default().theme(Theme::Dark).max_size(640.0, 360.0)` fits a chat
thumbnail; `.auto_layout(true)` draws models that have no diagram interchange. The returned
`Svg` also carries the view box, the drawn size and each element's geometry.

## Text to picture in one call

With `text` and `render`, `bpmnkit::quick::render_svg(text, &RenderOptions)` turns process text (or
compact JSON) into an `Svg`; with `render-png`, `bpmnkit::quick::render_png(text, &opts,
&PngOptions::default())` returns PNG bytes. Auto layout is always on. Input that is not BPMN
gives `Error::Unrecognized`. See the `text_to_png` example.

## Stable ids in a server

Text expansion derives ids from content, so the same text always gives the same ids, on any
thread. Do not rely on `bpmnkit_bpmn::ids::reset_id_counter`: the counter is thread-local, and a
tokio task may move between threads between calls. For models you build by hand, call
`bpmnkit_bpmn::stable_ids::assign_stable_flow_ids` to get content-derived flow ids instead.

## Diff two models

`diff_bpmn(&before, &after)` returns a `BpmnDiff`: every added, removed, changed (with
`path: before → after` per field) and moved (layout only) element, and the semantic hashes of
both sides (equal means the models mean the same). `diff_to_text(&diff, &DiffTextOptions)`
prints it as plain text or Markdown.

With `diff-html`, `diff_to_html(&before, &after, &diff, &DiffHtmlOptions)` writes one HTML
file: both diagrams with the changes highlighted, side by side or overlaid, a filterable change
list, zoom to a change on click and `j`/`k` to step through them. It loads nothing (a CSP
forbids it) and reads with JavaScript off. The TS `renderDiffHtml` and
`casen diff bpmn a.bpmn b.bpmn --html diff.html` give the same bytes. `diff_to_svg(&after,
&diff, &RenderOptions)` is the later diagram with the changes drawn over it, for surfaces that
cannot show HTML.

## Slack recipe

Slack does not render HTML. In `spawn_blocking`: run `diff_bpmn`, upload `diff_to_html` as a
file with `files.uploadV2`, and post `diff_to_text` with `markdown: true` (or a lint report as
`to_slack_mrkdwn`). For an inline image, `svg_to_png(&diff_to_svg(&after, &diff, &opts)?,
&PngOptions::default())` (feature `render-png`) gives the later diagram with the changes marked.

## Examples

`cargo run -p bpmnkit --all-features --example text_to_bpmn | eval_dmn | lint_report | render_svg | render_png | text_to_png | diff_html`.
