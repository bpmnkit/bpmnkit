---
title: "@bpmnkit/core"
description: Fluent process builder, BPMN 2.0 parser/serializer, auto-layout, and AI-compact format.
sidebar:
  order: 1
---

## Overview

`@bpmnkit/core` is the foundation of BPMN Kit. It provides everything needed to work with
BPMN 2.0 programmatically:

- **Fluent builder** — chain method calls to construct any process shape
- **Parser/serializer** — round-trip BPMN 2.0 XML, keeping unmodelled content verbatim
- **Auto-layout** — Sugiyama algorithm assigns coordinates automatically
- **Compact format** — token-efficient AI-friendly intermediate representation
- **DMN support** — parse, build, and export DMN 1.3 decision tables

Zero runtime dependencies. ESM-only. Runs in browsers, Node.js, Deno, Bun, and edge runtimes.

## Installation

```sh
pnpm add @bpmnkit/core
```

## API Reference

### `Bpmn.createProcess(id, name?)`

Returns a `ProcessBuilder` with the given process ID and optional name.

```typescript
const builder = Bpmn.createProcess("my-process", "My Process");
```

### `Bpmn.continueProcess(definitions, processId)`

Continue an existing model instead of generating a replacement for it. `build()` returns *that
document* with the named process's contents replaced, so other processes, the collaboration,
lanes, diagram interchange, root elements and unmodelled content all survive. The input is not
mutated.

```typescript
const updated = Bpmn.continueProcess(Bpmn.parse(xml), "order-process")
  .insertAfter("validate")
  .serviceTask("notify", { name: "Notify", taskType: "notify" })
  .build();
```

Also available as `ProcessBuilder.from(definitions, processId)`.

**`.at(nodeId)`** continues from a node whose path is open — no outgoing sequence flow, or a
gateway, where several outgoing flows are the point. It refuses a node that is not directly in
that process (a node inside a sub-process means building that sub-process), an end event, and a
node that would gain a second outgoing flow — that is an uncontrolled split, and almost always
means you wanted to insert.

**`.insertAfter(nodeId)`** splices what you build next into the path leaving an existing node:
`validate → end` becomes `validate → notify → end`. The existing flow keeps its **id and its
target** and only changes where it starts, so an edge nobody asked to move keeps its identity
in the diagram and in a diff. It refuses a node with no outgoing flow, and one with several,
where "after" is ambiguous.

Which of the two you mean is not guessable, so it is not guessed.

**Continuing never infers gateways.** `ProcessBuilder` normally inserts join gateways for
branches you build; on a parsed model that reads the whole topology and retargets edges you
never touched, so continue mode does not do it. A branch that needs a join here says so with
`.connectTo(joinId)`. `build()` refuses outright if anything would rewire a sequence flow the
document already had.

**Diagram interchange is not regenerated.** Existing shapes keep their positions, and elements
you add have none until `.withAutoLayout()` or a later `applyAutoLayout()` gives them one.

`isExecutable` and the process name are left as they were unless you call `.executable()` or
`.name()`. BPMN reads an absent `isExecutable` as false, so writing the builder's default onto
a process that never carried it would make a non-executable process executable.

### `Bpmn.createDiagram(id?)`

Returns a `DiagramBuilder` for assembling multiple processes into one BPMN definitions document.
`id` defaults to `"Definitions_1"`.

```typescript
const defs = Bpmn.createDiagram("OrderSystem")
  .process("order-flow", (p) =>
    p.startEvent("s").serviceTask("t", { name: "Process", taskType: "process" }).endEvent("e"),
  )
  .process("payment-flow", (p) =>
    p.startEvent("s2").serviceTask("pay", { name: "Pay", taskType: "pay" }).endEvent("e2"),
  )
  .build();
```

### DiagramBuilder — collaborations

`.participant()`, `.message()` and `.messageFlow()` build a pooled diagram. Ids are used
verbatim, so a generated diagram can be referred to by the ids you chose.

```typescript
const defs = Bpmn.createDiagram("Order")
  .process("order", (p) => p.startEvent("o_start").serviceTask("o_send", { taskType: "send" }).endEvent("o_end"))
  .process("supply", (p) => p.startEvent("s_start").serviceTask("s_recv", { taskType: "recv" }).endEvent("s_end"))
  .participant("P_Buyer", { name: "Buyer", processId: "order" })
  .participant("P_Seller", { name: "Seller", processId: "supply" })
  .participant("P_Bank", { name: "Bank" })            // black box — no process
  .message("Msg_Order", { name: "order placed", correlationKey: "= orderId" })
  .messageFlow("MF_1", { source: "o_send", target: "s_recv", messageRef: "Msg_Order" })
  .build();
```

A message flow's `source` and `target` name either participants or flow nodes inside them —
both are valid BPMN, and `applyAutoLayout` reads either.

A diagram with no participants gets **no** collaboration element. An empty
`<bpmn:collaboration/>` is not a neutral addition: a modeler reads it as "this document is
pooled" and renders every process pool-less.

`.collaborationId(id)` renames the collaboration, which defaults to `"Collaboration_1"`.

`build()` refuses a collaboration a modeler would not open, reporting every problem at once:
a participant naming a process the diagram does not contain, two participants claiming the
same process, a duplicate id, a message flow whose endpoint does not exist or which names an
undeclared message, and — the one that is easy to write by accident — a message flow that
starts and ends in the same pool. A message flow is what crosses a pool boundary; one that
stays inside a pool should be a sequence flow.

### `Bpmn.export(definitions)`

Serializes a `BpmnDefinitions` object to a BPMN 2.0 XML string.

```typescript
const xml = Bpmn.export(definitions);
```

### `Bpmn.parse(xml)`

Parses a BPMN 2.0 XML string into a typed `BpmnDefinitions` object.

```typescript
const definitions = Bpmn.parse(xmlString);
```

### `Bpmn.makeEmpty(processId?, processName?)`

Returns minimal BPMN 2.0 XML — one process with one start event.

```typescript
const xml = Bpmn.makeEmpty("my-process", "My Process");
// Returns an XML string (not a BpmnDefinitions object)
```

### `Bpmn.SAMPLE_XML`

A constant containing a simple 3-node sample diagram (start → task → end).
Useful for demos and tests.

### `semanticHash(definitions)`

SHA-256 of the model's meaning, with the diagram excluded. Two documents that say the same
thing hash the same however they are laid out, ordered or formatted — so a changed hash means
the model changed, not that the picture moved.

```typescript
import { Bpmn, applyAutoLayout, semanticHash } from "@bpmnkit/core";

const definitions = Bpmn.parse(xml);
semanticHash(applyAutoLayout(definitions)) === semanticHash(definitions); // true
```

Excluded from the hash: diagram interchange and its `bioc`/`color` extensions,
`zeebe:modelerTemplateIcon`, and `exporter`/`exporterVersion`. Element order, attribute order
and whitespace do not affect it. `modeler:executionPlatform` **is** included — it names the
engine the model targets, so changing it is a real change.

Synchronous and dependency-free, so it works in the browser and does not force callers to
become async.

### `projectSemantics(definitions)`

The canonical, presentation-free projection `semanticHash` covers. Returns `{ value, elements }`
— the whole model as canonical JSON, plus a shallow projection per element id.

### `diffSemantics(before, after)`

What changed between two models, as `{ added, removed, changed }` keyed by element id. Changes
are attributed to the element that actually changed rather than to all of its ancestors, and
running auto-layout produces an empty diff.

```typescript
import { diffSemantics } from "@bpmnkit/core";

const { added, removed, changed } = diffSemantics(before, after);
// changed: [{ id: "Task_1", before: {...}, after: {...} }]
```

### `diffDiagram(before, after)`

What a *reviewer* would see change — `diffSemantics()` plus the layout half it deliberately
ignores, restricted to elements a canvas can actually draw.

```typescript
import { diffDiagram } from "@bpmnkit/core";

const result = diffDiagram(before, after);
result.added;    // ids only in `after`
result.removed;  // ids only in `before`
result.changed;  // same element, different semantics
result.moved;    // same semantics, different place on the canvas
result.total;
result.planes;   // per-plane breakdown — a change inside a collapsed sub-process
                 // is invisible in a viewer until the reader drills into it
```

`moved` is why this exists. The semantic hash drops all diagram interchange — that is what
makes it stable across a re-layout — so a task somebody dragged reads as no change at all in
`diffSemantics()`. Here the geometry is compared separately from DI (bounds, waypoints, label
placement, and flags such as collapsed/expanded). An element that changed *and* moved is
reported as changed, since a semantic change is what a reviewer needs first.

An element with nothing to draw on either side is left out, so a changed `targetNamespace`
cannot inflate a count against nothing on screen.

The same comparison is [`casen diff bpmn`](/docs/cli/diff) on the command line,
`createBpmnDiff()` in `@bpmnkit/plugins` on a pair of canvases, and *Compare Diagram with
HEAD* in the [VS Code extension](/docs/guides/vscode).

### `applyBpmnOperations(definitions, operations, options?)`

Applies edit operations to the full model. The operation vocabulary is the same one an LLM
produces; applying it here rather than to a `CompactDiagram` means an edit touches only what it
names and leaves the document's pools, lanes, data wiring and Zeebe detail alone.

```typescript
import { applyBpmnOperations } from "@bpmnkit/core";

const { definitions, applied } = applyBpmnOperations(parsed, [
  { op: "rename", id: "Task_1", name: "Approve invoice" },
  { op: "update", id: "Task_1", patch: { jobType: "approve" } },
]);
```

**Strict by default.** An operation naming an element that does not exist throws an
`OperationError` and nothing is applied — the previous implementation skipped such operations
silently, so a patch with a misspelled id reported success and changed nothing. Pass
`{ strict: false }` to get `{ definitions, applied, problems }` instead and decide for
yourself. The input is never mutated either way.

### `ensureZeebeExtension(owner, extension)`

Finds a Zeebe extension element on a flow element, creating it if absent, and refuses a
placement the Zeebe schema does not allow. Use it instead of pushing onto `extensionElements`
directly: the push cannot fail, so `zeebe:calledDecision` on a service task becomes a deploy
error in Camunda rather than a throw where it was written.

```typescript
import { ensureZeebeExtension, ZeebePlacementError } from "@bpmnkit/core";

ensureZeebeExtension(serviceTask, "zeebe:taskDefinition").attributes.type = "worker";
ensureZeebeExtension(serviceTask, "zeebe:calledDecision"); // throws ZeebePlacementError
```

`ZeebePlacementError` carries `ownerElement`, `extension` and `allowedOn`, so the message
names the elements that *would* have been valid.

`isZeebePlacementAllowed(ownerElement, extension)` answers the same question without throwing,
and `ZEEBE_PLACEMENT` is the table itself — extension name to the element names that may own it.

The table is generated from `zeebe.json`'s `meta.allowedIn` (`zeebe-bpmn-moddle`, MIT),
resolved against the BPMN type graph, so it states the schema's rules rather than ours. **An
extension the schema says nothing about is allowed**: the descriptor declares no owner for
`zeebe:subscription` or `zeebe:properties`, and inventing a rule there would reject valid
documents. Non-`zeebe:` extensions are not checked at all.

`applyBpmnOperations` runs the same check, and reports a misplaced extension as an ordinary
operation problem — checked before anything is written, so the element is left untouched and
the rest of the batch still applies.

### `reconcileCompact(definitions, compact, options?)`

Applies a `CompactDiagram` to an existing model as a set of changes. Elements that already
exist are patched in place and keep their extensions, new ones are inserted, and ones the input
no longer mentions are removed — where `expand(compact)` would rebuild the whole document and
discard everything the compact form cannot describe.

Processes are only added, never removed: sending one process of a multi-process document means
"this is how that process should look", not "delete the others".

### `compactify(definitions)`

Projects a `BpmnDefinitions` object onto a `CompactDiagram` — a small JSON object suitable
for LLM prompts. **Lossy:** it keeps topology, names, `<bpmn:documentation>` and the common
Zeebe bindings, and drops collaborations, participants, message flows, lanes, data stores,
artifacts, root-level messages and errors, multi-instance loop characteristics, full
`zeebe:ioMapping` entries and diagram interchange.

A sequence flow leaving an exclusive, inclusive or complex gateway carries `isDefault: true`
when the gateway names it in `bpmn:default`. It sits on the flow rather than on the gateway
because that is where its alternative, `condition`, sits — a model writing the branches of a
decision marks one of them instead of pointing back at a flow id. `expand` turns it into the
attribute; a flow marked `isDefault` that leaves anything else, or a gateway with two of them,
throws rather than being dropped, because a lost default is a gateway that deadlocks the first
time every condition is false.

`documentation` is carried on every element and on the process itself, because in Camunda 8 it
is not decoration: on an ad-hoc sub-process child it is the tool description handed to the LLM,
and on a start event it is where the process input contract is written. It had been dropped, so
a single `rename` operation cost a file the documentation of every element in it.

```typescript
import { compactify } from "@bpmnkit/core";

const compact = compactify(Bpmn.parse(xml));
```

### `expand(compact)`

Builds a `BpmnDefinitions` object from a `CompactDiagram`. It restores only what the compact
form carries, so `expand(compactify(definitions))` is not `definitions` — use this to build a
model from a compact definition, not as a round trip for a file you need to keep.

```typescript
import { expand } from "@bpmnkit/core";

const definitions = expand(compactDiagram);
const xml = Bpmn.export(definitions);
```

Every element type the model knows expands to itself, data elements included. The switch is
exhaustive, so a new `BpmnElementType` fails the build here rather than silently arriving as a
`task` — which is how `dataObject`, `dataObjectReference` and `dataStoreReference` were lost.

`expand` throws when the diagram cannot be valid BPMN. The cases are:

- a flow that names an element outside its own scope (a sub-process's flows see only that
  sub-process's children)
- a boundary event without a host in the same scope
- a duplicate id, across elements, flows and processes
- a missing element or flow id
- an unknown `eventType`

The error lists every problem in one message. It does this so that a diagram written by a language
model can be sent back with the list instead of being turned into XML that a modeler rejects later.

### `createCompactStream(options?)`

Reads a diagram out of a model's token stream, so it can be rendered while it is still being
written. A model emits a diagram one character at a time, and the outermost `}` — the one
`JSON.parse` waits for — is the last character it sends, so the seconds before it arrives are
unusable to everything downstream.

This does not parse the document. It takes complete `{…}` literals as they close and keeps the
ones shaped like a `CompactElement` or a `CompactFlow` — the innermost objects, and therefore
the first to finish.

```typescript
import { createCompactStream } from "@bpmnkit/core";

// `base` is the diagram being edited, so a frame shows the whole process rather
// than the fragment the model is adding to it. Omit it to build from nothing.
const stream = createCompactStream({ base: currentDiagram });

for await (const chunk of tokens) {
  const frame = stream.push(chunk); // null until the frame changes
  if (frame) canvas.loadDefinitions(frame, { keepViewport: true });
}
```

Not parsing is also what makes it indifferent to what it is reading: a tool-call argument, a
fenced JSON block in an assistant's prose, and the body of a code-mode snippet all carry the
same literals, and none of them has to be valid as a whole.

**Frames are advisory.** Every one is a guess at an unfinished document, and the caller is
expected to have an authoritative result coming. `push` never throws on input, drops what it
cannot place, and strips `isDefault` from a flow rather than failing when the gateway it claims
has not been written yet — a preview without the marker beats no preview. Use the model's
finished output, not a frame, as the thing you save or deploy.

A single pass over a brace stack reads each character once and considers each literal once,
innermost first, so a sub-process is seen after the children it reclaims from the top level.
On a recorded Claude run writing a seven-element order process, the first renderable frame
arrived 16% of the way into the tool argument, with 15 frames following.

### `parseProcessText(text)` and `createProcessTextStream()`

A line format for a model to write a new process in. It costs about a quarter of the output
tokens of minified compact JSON. A path is written once as `a > b > c`, a node is declared inline
the first time it is used, and the parser adds what the model would otherwise spend tokens on.
`PROCESS_TEXT_GUIDE` is the part of a system prompt that teaches the format (~310 tokens,
example included).

```text
# Expense approval
start[start Expense submitted] > check[xor Amount over 1000?]
check >(Yes: amount > 1000) review[user Review expense] > pay[service Pay expense] > done[end Expense paid]
check >(No: default) auto[service Approve automatically] > pay
failed[boundary:error Payment failed | on=pay] > notify[send Notify submitter] > notice[end Payment failed]
```

```typescript
import { expand, Bpmn, parseProcessText, PROCESS_TEXT_GUIDE } from "@bpmnkit/core";

const { diagram, problems, fixes } = parseProcessText(modelOutput);
const xml = Bpmn.export(expand(diagram));
```

`parseProcessText` never throws, and its diagram always expands. It also keeps the structural
rules `lintDiagram` checks — including bpmnlint's recommended set — whatever the model wrote.
Text it cannot use, and anything it has to leave out, is returned in `problems` with its line
number. What it adds or changes is listed in `fixes`:

- flow ids are generated
- a line that ends in an arrow continues on the next line, a note after a line's last node
  (`(ADDED)`) is ignored, and a second `|` in the attributes is a separator
- an id used in a flow but never declared becomes a task named from it, or the gateway its
  name is a kind of (`pick > and`)
- an id declared again after an arrow, with a different kind or name, is a new node (`done_2`),
  and later bare references mean the newest; restated at the start of a line, it is the node
  already there
- a missing start event is added, and a start event left unconnected leads to the first path;
  only the first blank start event is kept
- a branch drawn into a boundary event continues to what the boundary leads to, and a flow from a
  node to itself is refused
- **every node lies on a path from a start event.** A task or gateway nothing leads to continues
  the latest path written before it that stops short of an end event — most often the model left
  out one arrow. What still cannot be reached, such as a boundary on a task that was never
  declared, is left out and reported; it is never drawn as a loose node
- an end event is added after every path that stops elsewhere, and a loop with no way out gets
  an exit branch from its decision; a loop with no decision loses the flows that close it
- a link event in a path becomes a plain event, since the format cannot name its partner
- a catch or boundary event written without a trigger becomes a message event, so it deploys
- a gateway with one way in and one way out — a question answered only one way — is removed;
  an event-based gateway waiting for one event becomes a catch event
- a task or event with several ways out gets a split gateway: exclusive when the branches are
  labelled, event-based when they all wait (at least one on a catch event, and receive tasks
  among them become message catch events), and parallel otherwise
- branches that meet at a task, an event or a gateway that also splits are joined first, by a
  gateway of the type they were split with: parallel branches get a parallel join
- a condition that is not FEEL (`applicant is eligible`) moves into the branch label and is
  reported, so it cannot fail at deploy time
- every xor/or split has one default — the branch labelled `No`, `Otherwise`, `Rejected` and the
  like, or else the last unconditioned one — and every other branch a FEEL condition. A branch
  written in prose gets one on a variable named for the gateway's question:
  `Status approved?` with `Yes` becomes `= statusApproved = true`
- flows out of anything but a decision carry no condition or label
- an unnamed event, task or decision is named from its id
- a service or send task without `job=` takes its id as job type, and a rule task its id as
  decision id

Some of those fixes are guesses only the reader can confirm, and `questions` puts them as
questions, in the order of the text. Each has the element it is about, the question, ready
answers where there are any, and a `draft` for the reader to finish. An answer is written as a
change request, for a model to apply to the diagram:

- a condition made up on a variable named for the question: what data decides it?
- a default branch picked because none was marked, or none reads as "otherwise": is it the
  right fallback? The other branches are the answers
- unlabelled branches split in parallel: do they really run at the same time? "Only one of them"
  or "One after the other"
- a question answered one way only, and removed: what happens otherwise?
- a task left out because nothing leads to it: where does it belong?
- a loop given an exit: when does it end?
- an event written without a trigger, made a message event: is it a timer, a signal, or nothing?

```typescript
const { questions } = parseProcessText(modelOutput);
// [{ elementId: "ok", text: '"Status approved?" decides on "statusApproved", a variable the
//    diagram made up. What data decides it?', options: [], draft: 'At "Status approved?", decide on ' }]
```

`createProcessTextStream()` reads the same format while it arrives. It reads each finished line
as it arrives, so every frame is built from whole facts. `push(chunk)` returns a laid-out frame,
or `null` when nothing new is drawable. `end()` returns what `parseProcessText` would.

### `writeProcessText(defs)` and `parseProcessDelta(text)`

The other direction, for changing a diagram that already exists. `writeProcessText` writes the
first process of a document in the line format, so a model can read it. Each node is written
under a short readable alias (`review_application` for `Activity_0x9k2lm`), and the map back to
the real ids comes with the text. Only what the format can express is written: flow nodes and
sequence flows, with names, triggers, `job=` and conditions. Lanes, data objects, annotations
and the inside of a sub-process are left out, so a change cannot reach them.

The model answers with a **change script** (`PROCESS_DELTA_GUIDE`): the same line format, but
only what changes. An existing node is named by its id; declaring it again changes its kind or
name; `- x` and `- a > b` remove; `@2 x y` says which feedback item a change answers.

```typescript
import { PROCESS_DELTA_GUIDE, PROCESS_TEXT_GUIDE, parseProcessDelta, writeProcessText } from "@bpmnkit/core";

const { text, aliases } = writeProcessText(defs);
// system: PROCESS_TEXT_GUIDE + PROCESS_DELTA_GUIDE; user: text + the feedback
const delta = parseProcessDelta(modelOutput);
// { nodes, flows, removedNodes, removedFlows, addressed, problems }
```

`parseProcessDelta` never throws and resolves nothing: it reads the script. Apply it with
`applyProcessDelta` from `@bpmnkit/editor/headless`, which keeps the diagram's layout.

### `retypeElement(element, type)`

Returns a copy of a flow element with a different `type`, keeping its id, name, documentation
and — crucially — its incoming and outgoing sequence flows. Use this to change a task's type
instead of removing and re-adding the element, which drops the wiring.

```typescript
import { retypeElement } from "@bpmnkit/core";

const index = process.flowElements.findIndex((el) => el.id === "charge");
process.flowElements[index] = retypeElement(process.flowElements[index], "manualTask");
```

Nested content is carried between container types, and a multi-instance marker between types
that both allow one. Zeebe extensions the new type cannot legally hold are dropped, using the
same placement table `ensureZeebeExtension` enforces — so a `serviceTask` retyped to
`manualTask` does not keep a job worker the engine would refuse.

### `createFlowElement(id, type, options?)`

Builds an empty flow element of any `BpmnElementType`, with the right shape for that type.
This is the single place that mapping lives; the fluent builder uses it too.

### Element catalog

`ELEMENT_TYPE_GROUPS` maps every `BpmnElementType` to one of `event`, `task`, `gateway`,
`container` or `data`, with `allElementTypes()` and `elementTypesInGroup(group)` over it. Tool
schemas and prompts render their type lists from this rather than hard-coding one — a
hand-written list is how the MCP schema came to advertise 18 types while the compact path
accepted 23.

### `layoutProcess(process)`

Runs the Sugiyama auto-layout algorithm on a `BpmnProcess` object.
Returns a `LayoutResult` with element positions.

```typescript
import { layoutProcess, ELEMENT_SIZES } from "@bpmnkit/core";

const result = layoutProcess(process);
// result.elements: Map<id, { x, y, width, height }>
// result.flows: Map<id, waypoint[]>
```

### ProcessBuilder methods

All builder methods return `this` for chaining.

| Method | Description |
|---|---|
| `.startEvent(id, options?)` | Add a start event |
| `.endEvent(id, options?)` | Add an end event |
| `.serviceTask(id, options?)` | Add a service task |
| `.userTask(id, options?)` | Add a user task |
| `.scriptTask(id, options?)` | Add a script task |
| `.sendTask(id, options?)` | Add a send task |
| `.receiveTask(id, options?)` | Add a receive task |
| `.businessRuleTask(id, options?)` | Add a business rule task |
| `.manualTask(id, options?)` | Add a manual task — work done outside the engine, no job worker |
| `.task(id, options?)` | Add an abstract task with no Zeebe extensions |
| `.exclusiveGateway(id, options?)` | Add an XOR gateway |
| `.parallelGateway(id, options?)` | Add a parallel gateway |
| `.inclusiveGateway(id, options?)` | Add an inclusive gateway |
| `.eventBasedGateway(id, options?)` | Add an event-based gateway |
| `.complexGateway(id, options?)` | Add a complex gateway (aspirational — Zeebe does not execute these) |
| `.subProcess(id, builder, options?)` | Add an embedded sub-process |
| `.adHocSubProcess(id, builder, options?)` | Add an ad-hoc sub-process — its children are **not** auto-chained, see below |
| `.eventSubProcess(id, builder, options?)` | Add an event sub-process (emits `subProcess triggeredByEvent="true"`) |
| `.transaction(id, builder, options?)` | Add a transaction sub-process (atomic scope) |
| `.callActivity(id, options?)` | Add a call activity |
| `.intermediateCatchEvent(id, options?)` | Add a catch event |
| `.intermediateThrowEvent(id, options?)` | Add a throw event |
| `.branch(id, builder)` | Define a gateway branch |
| `.boundaryEvent(id, options)` | Attach a boundary event to the previous task |
| `.withBoundary(id, options, handler)` | Attach a boundary event and build its error/timeout path; cursor auto-restores to the main flow after the handler |
| `.defaults(options)` | Set process-wide defaults (e.g. `{ serviceTask: { retries: "5" } }`) applied to all subsequent tasks |
| `.disconnectedStartEvent(id?, options?)` | Add a start event with no auto-connection to the current cursor — alias for `addStartEvent` |
| `.withAutoLayout()` | Apply Sugiyama layout before building |
| `.build(options?)` | Return the completed `BpmnDefinitions`. Pass `{ explicitJoins: true }` to refuse inferred join gateways — see below |

Every BPMN element type the model knows is reachable from a builder chain, except the three
data types (`dataObject`, `dataObjectReference`, `dataStoreReference`) — those are wired by
data associations rather than sequence flows, so the chain has nowhere to put them. A
compile-time table, `BUILDER_COVERAGE`, holds the SDK to that: adding an element type without
a builder method fails the build. Run `pnpm --filter @bpmnkit/core check:builder` to print it.

### Ad-hoc sub-processes: children are a set, not a chain

Sequential calls in a builder chain auto-connect with sequence flows. Inside
`.adHocSubProcess()` they do not: BPMN defines an ad-hoc sub-process's children as an unordered
set of independently-invocable activities, and Camunda 8's agentic AI runtime reads that
structurally — a child *without* an incoming flow is an LLM-invocable tool, a child *with* one
is part of an internal sub-flow and not a tool at all.

```typescript
.adHocSubProcess("agent", (s) => {
  s.serviceTask("listUsers",  { taskType: "io.camunda:http-json:1" });
  s.serviceTask("loadUser",   { taskType: "io.camunda:http-json:1" });
  s.serviceTask("createUser", { taskType: "io.camunda:http-json:1" });
}, { name: "Handle request" })
// → three tools, no sequence flows, no <bpmndi:BPMNEdge> between them
```

Auto-chaining them produced a file that lints clean and deploys, while the agent saw one tool
and a two-step sub-flow — so the default is off rather than opt-out.

An internal sub-flow inside the container stays expressible: say so with `.connectTo()`, which
still creates a flow from the cursor.

```typescript
.adHocSubProcess("agent", (s) => {
  s.serviceTask("listUsers", { taskType: "io.camunda:http-json:1" });   // a tool
  s.serviceTask("step1", { taskType: "work" }).connectTo("step2");      // an internal sub-flow
  s.serviceTask("step2", { taskType: "work" });
})
```

Each child's LLM-facing description is its `documentation`, which every builder method accepts:

```typescript
s.serviceTask("listUsers", {
  taskType: "io.camunda:http-json:1",
  documentation: "Call this to retrieve all users. Returns id, name, email.",
});
```

### Joins: inferred by default, or declared

Where several branches of one gateway reach the same element, `build()` inserts a matching
join gateway for you. That is a help when you are reading the chain you just wrote, and a trap
for generated code, which cannot see the element it did not emit.

```typescript
const defs = builder.build({ explicitJoins: true });
// Error: Inferred join gateways: gw_join. Declare them with .connectTo(joinId),
// or drop { explicitJoins: true } to keep the inference.
```

The error names the gateway it would have added, which is the id you pass to `.connectTo()`.

A join you declare only counts if it **matches the split**: an exclusive split converging on a
parallel gateway is not the gateway inference would have added, so it is still inferred — and
with `explicitJoins` that refusal is the only thing that tells you.

`Bpmn.continueProcess()` never infers joins at all, whatever this option says. Inference reads
the whole topology, and on a document you were handed that means rewriting edges you never
touched.

`{ strict: true }` was the former name for this option. It was removed in 1.0.0 — "strict"
says nothing about what it is strict *about*, and `applyBpmnOperations` takes a `strict` that
means something else entirely. Rename it to `explicitJoins`; the behaviour is identical.

## Writing files — `@bpmnkit/core/node`

Anything that touches the filesystem lives behind the `@bpmnkit/core/node` subpath, so
importing `@bpmnkit/core` itself never pulls `node:` builtins into a browser bundle.

### `writeBpmn(definitions, options)`

The only supported way to write a BPMN file, and the only one that checks what it wrote.
Before anything reaches disk it serialises the model, **parses the result back**, and compares
the semantic hashes. If they differ the write is refused and nothing is written.

```typescript
import { writeBpmn } from "@bpmnkit/core/node";
import { WriteError, WriteVerificationError } from "@bpmnkit/core";

const result = await writeBpmn(definitions, {
  output: "flow.bpmn",
  force: false,        // default — refuses rather than replace an existing file
  layout: "preserve",  // default — "auto" regenerates the diagram first
});

result.destination;    // absolute path written
result.semanticHash;   // the model's hash, verified after reading it back
result.outputSha256;   // digest of the exact bytes on disk
result.changes;        // what this write changed about the file it replaced
```

The file appears complete or not at all: contents go to a temporary file in the destination's
own directory and are then linked or renamed into place, so an interrupted write cannot leave
a half-written model behind. Two concurrent writes to the same new path cannot both succeed.

`WriteVerificationError` carries a `changes` field naming the elements that diverged.
`WriteError` means the destination exists and `force` was not given, or the filesystem refused.

**What the check does not cover.** It compares the model in memory against the model read back
from the output, so it catches the serialiser losing something. It cannot catch the *parser*
having dropped something on the way in — content the parser never saw is absent from both
sides. That is what the round-trip corpus gate covers, and there is deliberately no option to
skip verification: turning it off would only ever be used to get past the bug it exists to
report. If you want unchecked serialisation, `Bpmn.export()` still returns a string.

### `exportPreserving(original, definitions)`

Writes a model back over the file it came from, changing as little as possible.

`Bpmn.export()` writes a model the way this toolkit writes models. That is the right output
for a new document and the wrong one for an existing file: the first visual edit reformats
every line, and the commit says "the whole diagram" when it means "a box moved".

Exported from `@bpmnkit/core` itself, not the `/node` subpath — it is string work, and the
caller owns the file:

```typescript
import { readFile, writeFile } from "node:fs/promises";
import { Bpmn, exportPreserving } from "@bpmnkit/core";

const onDisk = await readFile("order.bpmn", "utf8");
const edited = Bpmn.parse(onDisk);
edited.processes[0].flowElements[0].name = "Validate Order";

await writeFile("order.bpmn", exportPreserving(onDisk, edited));
// Renaming one task changes one line, not the whole file.
```

Indentation, attribute order, comments, the order children were written in, and attributes
left at their schema default all survive. Opening a file and writing it back unchanged leaves
it byte for byte.

Nothing about that is assumed, though. The model cannot represent the order a file writes its
children in — a process holds `flowElements` and `sequenceFlows` as separate lists — so each
strategy is tried, **the result is parsed back and compared against a plain write**, and the
first that reads the same is the one used. The plain write is the floor, so calling this is
never worse than not.

| Function | Takes | Returns |
| --- | --- | --- |
| `exportPreserving(original, definitions)` | the file's current text + a model | the new text |
| `exportPreservingResult(original, definitions)` | same | the text plus what it managed to keep |
| `preserveBpmnFormatting(original, updated)` | two documents as text | for a caller that already serialised, such as an editor's `exportXml()` |
| `exportDmnPreserving` / `preserveDmnFormatting` | DMN | the same treatment |
| `exportFormPreserving` / `preserveFormFormatting` | Camunda form JSON | indentation, key order and trailing newline |

This is what the [VS Code extension](/docs/guides/vscode) saves through, and what makes a
visual edit reviewable in a pull request.

Builder output is stable for the same reason: sequence-flow and root-definition ids are
derived from the model (`Flow_<source>_<target>`, `Message_<name>`, `Error_<code>`) rather
than randomly generated, so rebuilding an unchanged model produces the same file and the one
edge that changed is not buried in a diff of edges that did not.

## Connectors — `@bpmnkit/core/connectors`

The Camunda 8 out-of-the-box connector catalog and deterministic element-template
application. It sits behind its own subpath because its data is about 100 KB gzipped: code
that imports only `@bpmnkit/core` does not bundle it.

```typescript
import { applyConnectorTemplate, searchConnectors } from "@bpmnkit/core/connectors"

searchConnectors("slack")[0]?.requiredInputs // what the template will ask for

const { serviceTask, problems } = applyConnectorTemplate("io.camunda.connectors.HttpJson.v2", {
  url: "https://api.example.com/orders",
})
// serviceTask: builder options — task type, input mappings, headers, template stamp
```

The bundled templates leave out icons, groups, tooltips and placeholders, which only a
property panel draws, so an applied element carries no `zeebe:modelerTemplateIcon`.
[`@bpmnkit/connectors`](/docs/packages/connectors) has the same API with those parts added
back. It is the one to use in an editor.

## DMN Support

```typescript
import { Dmn } from "@bpmnkit/core";

// Parse DMN XML
const dmnDefs = Dmn.parse(dmnXmlString);

// Create a minimal empty decision table
const empty = Dmn.makeEmpty();

// Export back to XML
const dmnXml = Dmn.export(dmnDefs);
```

## TypeScript Types

Key types exported from `@bpmnkit/core`:

```typescript
import type {
  BpmnDefinitions,
  BpmnProcess,
  CompactDiagram,
  LayoutResult,
  ProcessBuilder,
  DiagramBuilder,
  ServiceTaskOptions,
  UserTaskOptions,
  GatewayOptions,
} from "@bpmnkit/core";
```
