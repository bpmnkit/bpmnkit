---
"@crates/bpmnkit-viewer": minor
---

`HtmlOptions` gets `theme(Theme::Light | Dark | Auto)` and `colors(Colors)`, with the same bytes as `toHtml` of `@bpmnkit/viewer-lite`. A colour that is not plain colour syntax is `ViewerError::InvalidColor`. `ViewerParts` gains `body_attrs` for the `<body>` tag.
