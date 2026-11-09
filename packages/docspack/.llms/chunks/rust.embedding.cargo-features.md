# Embedding the Rust crates — Cargo features

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

---
Source: https://bpmnkit.com/docs/rust/embedding
