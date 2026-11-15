# Builder lanes — design

**Why.** An agent eval showed agents fall back to raw XML for lanes: `ProcessBuilder` had no lane API, although the model (`BpmnLane`/`laneSet`) and auto-layout (lane bands) already support them.

**API** (approach "A + B", approved)
- A. `inLane(id, { name? })` on `ProcessBuilder` and `BranchBuilder`. Declares the lane on first use; a later call may name it. Following top-level nodes join it. In a `branch()` callback it switches lane for that branch only (restored after); branches inherit the current lane.
- B. `lane?: string` on flow-node options: overrides the lane for that node only, declaring it if unknown. Lane name defaults to its id.

**Rules**
- Lane order = first-use order. Lane ids become `<bpmn:lane id>`; the set is `<processId>_laneSet`.
- Boundary events take their host's lane (bpmn-js lists them in the host's lane); joins inferred at `build()` take the split's lane.
- Sub-process contents are not lane members; the sub-process itself is. `inLane` inside a sub-process throws.
- If any lane is used, `build()` throws listing every top-level node without one, ending with `agent-cards/bpmn.md#traps`.
- `ProcessBuilder.from()` plus lanes throws (the document keeps its own).

**Non-goals.** Nested lanes, compact-format lanes, `placeNewShapes` creating lanes.

**Implementation.** A `LaneState` shared by a process builder and its branch builders (not sub-process builders) records membership in `addFlowElement`/`addElement`; the `lane` option travels on a `WeakMap` set in `makeFlowElement`. `build()` turns it into `process.laneSet`.
