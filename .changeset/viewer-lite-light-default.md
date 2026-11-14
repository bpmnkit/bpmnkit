---
"@bpmnkit/viewer-lite": minor
"@bpmnkit/cli": minor
"@bpmnkit/core": minor
---

`@bpmnkit/viewer-lite` is light by default instead of following `prefers-color-scheme` (a dark OS no longer gives a dark, bluish diagram on a light page). `theme: "auto"` opts back in, `theme` also takes a partial `SvgThemeColors` palette, and `--bpmnkit-viewer-*` CSS variables or `data-theme` on the script brand it without code. `toHtml` gets `theme` and `colors` options (values are validated). `casen export html` gets `--theme light|dark|auto` and a repeatable `--color key=value`. `@bpmnkit/core/svg` exports `SVG_THEMES`.
