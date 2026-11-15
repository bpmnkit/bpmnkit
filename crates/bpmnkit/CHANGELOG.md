# @crates/bpmnkit

## 0.4.0

## 0.3.0

### Minor Changes

- 086acf7: New crate `bpmnkit-viewer` (facade feature `viewer`, in `full`): `to_html` writes a self-contained HTML BPMN viewer page, byte-identical to `toHtml` of `@bpmnkit/viewer-lite`; `parts` returns the `head`, `body` and `scripts` to embed the viewer in your own page; `VIEWER_JS`, `LOADER_JS` and `CSS` are the raw assets. `bpmnkit::Error` gains a `Viewer` variant.

## 0.2.1

### Patch Changes

- 4d89511: Releases are now driven by Changesets; the .crate no longer can pick up package.json.

  Security: `quick-xml` 0.41 (was 0.36; RUSTSEC-2026-0194 quadratic duplicate-attribute check, RUSTSEC-2026-0195 `NsReader` namespace memory growth) and `resvg` 0.49 for the `png` feature (drops the unmaintained `rustybuzz`/`ttf-parser`). XML output is unchanged.
