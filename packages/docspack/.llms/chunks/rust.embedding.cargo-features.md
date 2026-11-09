# Embedding the Rust crates — Cargo features

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

---
Source: https://bpmnkit.com/docs/rust/embedding
