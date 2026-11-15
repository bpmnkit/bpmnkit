# @crates/bpmnkit-layout

## 0.4.0

### Minor Changes

- e7f0bc0: Line format: `decision=<id>` on rule tasks, else the decision id is the name kebab-cased. `expand` writes `xsi:type="bpmn:tFormalExpression"` on conditions. Layout: black-box pools prefer the stack's edges, message flows get labels in the band between pools, event names move off a docking message flow. `casen build`: message throws keep `messageRef` (keyed like the process's catches), one `bpmn:dataStore` per name across pools, a plain start a message flow reaches becomes a message start.

### Patch Changes

- e7f0bc0: Builder fixes for coding agents: nested `branch()` inside sub-processes no longer drops elements; an empty branch throws; message-flow endpoint errors suggest close ids; `branch(name)` no longer labels parallel/event-based gateway flows; `correlationKey` on message end/throw events; `DiagramBuilder.message()` merges into an existing message; a 2nd incoming flow into a task gets an exclusive `<id>_merge` gateway; edits give new event definitions ids; `placeNewShapes` reports overlapping new shapes; `dataObjectReference` declares its data object; data associations get ids and DI edges; root `bpmn:dataStore`; lint skips data elements in `flow/unreachable`/`flow/dead-end`; `DiagramBuilder.build()` reports ids reused across pools. BPMN agent card: path decision rule, compact example, one gate, stop rule.
- e7f0bc0: `casen build <spec>`: a text spec (pools, lanes, message flows, data), CompactDiagram JSON or a builder module becomes a laid-out `.bpmn` plus a form per user task, linted like c8ctl (each finding names its `.bpmnlintrc` key) and, with `--deploy`, deployed with its forms (env credentials like c8ctl). `--edit` changes an existing file and keeps its layout. casen no longer prints Node process warnings. Core: `attachUserTaskForms`, `parseFormFields`, `makeRoom`; data references stay in their task's lane, `bpmn:dataObject` gets no shape, and data elements need no lane in the builder.

## 0.3.0

## 0.2.1

### Patch Changes

- 4d89511: Releases are now driven by Changesets; the .crate no longer can pick up package.json.

  Security: `quick-xml` 0.41 (was 0.36; RUSTSEC-2026-0194 quadratic duplicate-attribute check, RUSTSEC-2026-0195 `NsReader` namespace memory growth) and `resvg` 0.49 for the `png` feature (drops the unmaintained `rustybuzz`/`ttf-parser`). XML output is unchanged.
