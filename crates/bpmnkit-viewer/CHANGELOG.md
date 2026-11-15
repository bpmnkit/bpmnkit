# @crates/bpmnkit-viewer

## 0.4.0

## 0.3.0

### Minor Changes

- 19c5bd0: `HtmlOptions` gets `theme(Theme::Light | Dark | Auto)` and `colors(Colors)`, with the same bytes as `toHtml` of `@bpmnkit/viewer-lite`. A colour that is not plain colour syntax is `ViewerError::InvalidColor`. `ViewerParts` gains `body_attrs` for the `<body>` tag.
- 086acf7: New crate `bpmnkit-viewer` (facade feature `viewer`, in `full`): `to_html` writes a self-contained HTML BPMN viewer page, byte-identical to `toHtml` of `@bpmnkit/viewer-lite`; `parts` returns the `head`, `body` and `scripts` to embed the viewer in your own page; `VIEWER_JS`, `LOADER_JS` and `CSS` are the raw assets. `bpmnkit::Error` gains a `Viewer` variant.

### Patch Changes

- 07b63a2: `viewer-lite.min.js` no longer throws when imported where there is no `document` (Node, SSR); it only sets the `BpmnLite` global there.
