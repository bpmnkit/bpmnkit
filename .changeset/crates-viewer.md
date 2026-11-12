---
"@crates/bpmnkit-viewer": minor
"@crates/bpmnkit": minor
---

New crate `bpmnkit-viewer` (facade feature `viewer`, in `full`): `to_html` writes a self-contained HTML BPMN viewer page, byte-identical to `toHtml` of `@bpmnkit/viewer-lite`; `parts` returns the `head`, `body` and `scripts` to embed the viewer in your own page; `VIEWER_JS`, `LOADER_JS` and `CSS` are the raw assets. `bpmnkit::Error` gains a `Viewer` variant.
