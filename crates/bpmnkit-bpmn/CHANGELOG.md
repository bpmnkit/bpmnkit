# @crates/bpmnkit-bpmn

## 0.6.0

## 0.5.0

### Patch Changes

- 3582cc4: Lanes and pools: write support and round-trip fixes (Flowable Modeler files included).

## 0.4.0

## 0.3.0

## 0.2.1

### Patch Changes

- 4d89511: Releases are now driven by Changesets; the .crate no longer can pick up package.json.

  Security: `quick-xml` 0.41 (was 0.36; RUSTSEC-2026-0194 quadratic duplicate-attribute check, RUSTSEC-2026-0195 `NsReader` namespace memory growth) and `resvg` 0.49 for the `png` feature (drops the unmaintained `rustybuzz`/`ttf-parser`). XML output is unchanged.
