# @crates/bpmnkit-builder

## 0.4.0

### Minor Changes

- e7f0bc0: Builder fixes for coding agents: nested `branch()` inside sub-processes no longer drops elements; an empty branch throws; message-flow endpoint errors suggest close ids; `branch(name)` no longer labels parallel/event-based gateway flows; `correlationKey` on message end/throw events; `DiagramBuilder.message()` merges into an existing message; a 2nd incoming flow into a task gets an exclusive `<id>_merge` gateway; edits give new event definitions ids; `placeNewShapes` reports overlapping new shapes; `dataObjectReference` declares its data object; data associations get ids and DI edges; root `bpmn:dataStore`; lint skips data elements in `flow/unreachable`/`flow/dead-end`; `DiagramBuilder.build()` reports ids reused across pools. BPMN agent card: path decision rule, compact example, one gate, stop rule.

## 0.3.0

## 0.2.1

### Patch Changes

- 4d89511: Releases are now driven by Changesets; the .crate no longer can pick up package.json.

  Security: `quick-xml` 0.41 (was 0.36; RUSTSEC-2026-0194 quadratic duplicate-attribute check, RUSTSEC-2026-0195 `NsReader` namespace memory growth) and `resvg` 0.49 for the `png` feature (drops the unmaintained `rustybuzz`/`ttf-parser`). XML output is unchanged.
