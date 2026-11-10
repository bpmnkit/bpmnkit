# Embedding the Rust crates — Render a diagram

`bpmn_to_svg(&defs, &RenderOptions)` gives the same SVG bytes as TS `exportSvg` with the same
options. `RenderOptions::default().theme(Theme::Dark).max_size(640.0, 360.0)` fits a chat
thumbnail; `.auto_layout(true)` draws models that have no diagram interchange. The returned
`Svg` also carries the view box, the drawn size and each element's geometry.


## Text to picture in one call

With `text` and `render`, `bpmnkit::quick::render_svg(text, &RenderOptions)` turns process text (or
compact JSON) into an `Svg`; with `render-png`, `bpmnkit::quick::render_png(text, &opts,
&PngOptions::default())` returns PNG bytes. Auto layout is always on. Input that is not BPMN
gives `Error::Unrecognized`. See the `text_to_png` example.

---
Source: https://bpmnkit.com/docs/rust/embedding
