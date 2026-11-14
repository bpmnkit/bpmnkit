# @crates/bpmnkit-text

## 0.4.0

### Minor Changes

- e7f0bc0: Line format: `decision=<id>` on rule tasks, else the decision id is the name kebab-cased. `expand` writes `xsi:type="bpmn:tFormalExpression"` on conditions. Layout: black-box pools prefer the stack's edges, message flows get labels in the band between pools, event names move off a docking message flow. `casen build`: message throws keep `messageRef` (keyed like the process's catches), one `bpmn:dataStore` per name across pools, a plain start a message flow reaches becomes a message start.

## 0.3.0

## 0.2.1

### Patch Changes

- 4d89511: Releases are now driven by Changesets; the .crate no longer can pick up package.json.

  Security: `quick-xml` 0.41 (was 0.36; RUSTSEC-2026-0194 quadratic duplicate-attribute check, RUSTSEC-2026-0195 `NsReader` namespace memory growth) and `resvg` 0.49 for the `png` feature (drops the unmaintained `rustybuzz`/`ttf-parser`). XML output is unchanged.
