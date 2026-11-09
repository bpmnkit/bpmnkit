# Embedding the Rust crates — Cargo features

| Feature | Adds |
|---|---|
| `default` | `feel`, `bpmn`, `dmn`, `form` |
| `text` | process text and compact JSON in `load` (implies `bpmn`, `dmn`) |
| `lint`, `layout`, `builder`, `compat`, `xml`, `spec` | the matching `bpmnkit-*` crate |
| `render` | `bpmnkit::render`: BPMN to SVG, auto layout for models without DI |
| `diff` | `bpmnkit::diff`: semantic diff, field-level changes, semantic hash |
| `diff-html` | `diff_to_html` and `diff_to_svg` (implies `diff`, `render`) |
| `full` | all of the above |

PNG output (`render-png`, `render-system-fonts`) is not in `full`; it is planned in
[the embedding plan](https://github.com/bpmnkit/bpmnkit/blob/main/doc/plans/rust-embedding.md).

---
Source: https://bpmnkit.com/docs/rust/embedding
