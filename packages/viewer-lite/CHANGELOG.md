# @bpmnkit/viewer-lite

## 0.1.0

### Minor Changes

- 086acf7: `casen export html <file.bpmn> [-o out.html]` writes one self-contained HTML page that shows the diagram. `@bpmnkit/viewer-lite/html` exports `toHtml(xml, { title? })` for the same from Node, escaping `</script` in the XML safely.
- 19c5bd0: `@bpmnkit/viewer-lite` is light by default instead of following `prefers-color-scheme` (a dark OS no longer gives a dark, bluish diagram on a light page). `theme: "auto"` opts back in, `theme` also takes a partial `SvgThemeColors` palette, and `--bpmnkit-viewer-*` CSS variables or `data-theme` on the script brand it without code. `toHtml` gets `theme` and `colors` options (values are validated). `casen export html` gets `--theme light|dark|auto` and a repeatable `--color key=value`. `@bpmnkit/core/svg` exports `SVG_THEMES`.
- 086acf7: New package: a dependency-free BPMN viewer under 8 KB gzip for one self-contained HTML file (template with a `{{BPMN}}` placeholder, auto-boot, pan/zoom, dark mode).

### Patch Changes

- 07b63a2: `viewer-lite.min.js` no longer throws when imported where there is no `document` (Node, SSR); it only sets the `BpmnLite` global there.
- 086acf7: The HTML template has a file picker and drag-and-drop to open another BPMN file; `toHtml("")` makes an empty viewer.
- Updated dependencies [086acf7]
- Updated dependencies [19c5bd0]
  - @bpmnkit/core@1.14.0
