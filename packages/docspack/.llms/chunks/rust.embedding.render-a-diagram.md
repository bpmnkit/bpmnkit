# Embedding the Rust crates — Render a diagram

`bpmn_to_svg(&defs, &RenderOptions)` gives the same SVG bytes as TS `exportSvg` with the same
options. `RenderOptions::default().theme(Theme::Dark).max_size(640.0, 360.0)` fits a chat
thumbnail; `.auto_layout(true)` draws models that have no diagram interchange. The returned
`Svg` also carries the view box, the drawn size and each element's geometry.


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

---
Source: https://bpmnkit.com/docs/rust/embedding
