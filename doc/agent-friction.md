# bpmnkit agent friction: why so many turns

This is a diagnosis only. No code was changed and no new eval runs were made.

- **Data:** `eval/v4/runs-setup2/{S04,S11,S16X}/{toolgatebr,toolgate}-*/r*/`. This covers 30 branch runs (S16X ×15, S11 ×10, S04 ×10) and a sample of 12 control runs.
- **Method:** each transcript was condensed to a timeline of tool calls and errors. Sonnet and Haiku subagents read one scenario/arm group each. All repros below were run against `@bpmnkit/core` 1.13.0, using the `eval/v4/arms/bpmnkit-branch` deps.
- **Accuracy:** turns and seconds are estimated from timeline timestamps, so treat them as ±30%.

**Headline.**
- On S16X, every branch run lost time to one bug: elements nested two branch levels deep inside a `subProcess` silently disappear.
- The error only surfaces later, as an unrelated message-flow error.
- That bug drove the debug probes, the `build({ validate: false })` use, the builder-source reading and the "graft the sub-process body" workarounds.
- The other big turn sinks are:
  - a post-build lint round that the `build()` gate does not catch (labels, forms, message subscriptions);
  - a preserving edit that cannot loop back to a new task;
  - unbounded layout polish on big collaborations.

## Ranked causes

| # | Cause | Class | Runs affected | Turns / s lost | Evidence |
|---|---|---|---|---|---|
| 1 | Nested `.branch()` inside `.subProcess()` callback: grandchild elements silently dropped; surfaces as `Invalid collaboration: Message flow … names source "X", which is not a participant or a flow node in one` or as a bogus unconditioned gateway flow | **real bug** + misleading error | S16X 15/15 (14 hit it, haiku r5 dodged by writing flat up front) | ~115 t / ~1850 s | `S16X/toolgatebr-sonnet/r1/ws/probe.ts`, `toolgatebr-opus/r4/ws/dbg.ts`, `toolgatebr-sonnet/r5/ws/build.ts:173` (graft with `validate:false`), `toolgatebr-opus/r3/ws/exp4.ts` |
| 2 | No layout for cross-pool message flows / data objects, and no "good enough" stop rule. Agents write A* routers, PIL/SVG renderers, DI shifters after an already clean deploy | missing API + doc gap | S16X opus r3, r4; sonnet r2 (also r1/r4 partial) | ~135 t / ~1300 s | `toolgatebr-opus/r3/ws/postprocess.ts`, `toolgatebr-sonnet/r2/ws/post.mjs`, `toolgatebr-opus/r4` (114 turns, 70% after first deploy) |
| 3 | Builder output passes `build()` but fails the c8ctl lint: `.branch(name)` becomes a flow label on event-based/parallel gateway flows (`superfluous-label`), and `userTask` has no form (`zeebe:FormDefinition`) | real bug (labels) + doc gap (forms) | S04 10/10, S16X 15/15, S11 9/10 | ~70 t / ~900 s | `S04/toolgatebr-*/r*` (first lint always 2-3 warnings); repro R5/R9 |
| 4 | A message end event / throw gets an auto `Message_<name>` with no `zeebe:subscription`. `build()` accepts it, then lint or deploy rejects it. Declaring `.message("info-sent", {correlationKey})` collides with the auto id | missing API + misleading | S16X 15/15 | ~31 t / ~500 s | haiku r1 `cvc-id.2 … 'Message_information_sent'`; sonnet r4 `Message_interview_answer_received: Must have exactly one zeebe:subscription` |
| 5 | Preserving edit with a loop-back (`continueProcess…insertAfter…withBoundary(…connectTo(newTask))`) gives a task with 2 incoming flows, and the boundary `errorEventDefinition` has no id. Then `placeNewShapes` reports `unplaced: []` but new shapes overlap old ones | real bug | S11 8/10 (opus 5, sonnet r1/r3/r5) | ~35 t / ~450 s | `S11/toolgatebr-opus/r*/ws/edit.ts`; repro R8 |
| 6 | Data/annotation gaps:<br>• kit lint flags `dataStoreReference`/`dataObject` as `flow/unreachable` **error**, with fix hint "Connect this element…"<br>• `dataObjectReference` does not create its `dataObject` (raw XSD IDREF error)<br>• data associations get no id, so no DI edge<br>• `textAnnotation()` cannot be free-standing<br>• no root `bpmn:dataStore` | real bug (lint) + missing API | S16X 15/15 | ~30 t / ~500 s | `casen check` exit 1 in opus r4; sonnet r5 `IDREF 'd_listData'`; R3/R4/R7 |
| 7 | Ids must be unique across all pools. The builder does not check this or namespace ids, so the error comes back as a raw XSD message with no pool context | misleading error + doc gap | S16X haiku r1, r3, r4 (others pre-prefixed) | ~5 t / ~40 s | R6 |
| 8 | Steering: compact mode is never picked, the "edit by size" rule pushes structural edits into scripts, and there is no single gate. Agents run `casen check`, kit `lintDiagram` and c8ctl, and the three disagree | doc gap | all 30 | see section below | AGENTS.md / bpmn.md quotes below |

**Not bpmnkit, but large.** These are worth fixing in the harness:
- **Bash guard rejects heredocs, `cd &&`, `sed -i` and `$VAR`:** `Contains brace with quote character (expansion obfuscation)`. This happens in ~every run, costing 1–15 turns each (~150 t total).
- **c8ctl lint JSON puts the element name in the `rule` field:** `"rule":"Submit expense report"`. In S11, 9/10 runs then guessed `.bpmnlintrc` rule ids (`camunda-compat/user-task-form` and variants) until they hit `camunda-compat/user-task-definition`. That cost ~45 t / ~600 s, and sonnet r4 gave up with warnings left.
- **ESM-only package:** `createRequire().resolve("@bpmnkit/core")` throws `ERR_PACKAGE_PATH_NOT_EXPORTED` (S11 opus r1/r4, S16X haiku r2).

**Control arm (1.12).** Sample of 12 runs: S16X opus/sonnet r1–3, S11 sonnet r1–3, S04 sonnet r1–3.
- **Cause 1 does not occur in control (0/6 S16X runs).** This confirms it is a regression in the branch build.
- **Causes 3, 4 and 6 occur in control too**, so they are not regressions:
  - labels;
  - forms;
  - the message subscription;
  - `flow/unreachable` on data elements;
  - the missing root `dataStore`;
  - `textAnnotation()` that cannot stand alone.
- **Control's fake-join is the same problem as cause 5.** In S11 the builder does not insert a merge gateway, and control hit this as `fake-join` 3/3.
- **Present in control, not seen in branch runs:** discarding `applyAutoLayout`'s return value (3/6 S16X runs, `TypeError: Cannot read properties of undefined (reading 'plane')`). In the branch arm only haiku r2 hit it. The documented `embeddedForm` option was also rejected by the gate (S04 r2: `Exactly one of the attributes 'formId, externalReference' must be present … (zeebe/form-definition-native)`).
- **Behaviour on `casen check`:** 4 control runs saw 7 `casen check` errors on data elements and still reported "clean".
- **Not used in either arm:** compact mode and the lanes API.

## Phase profile (branch arm, typical)

| Scenario | discover | write | build-debug | validate (lint fixes) | deploy | polish |
|---|---|---|---|---|---|---|
| S04 (13–31 t) | 1–5 s | 10–30 s | first build clean | 20–60 s (cause 3) | ~5 s | — |
| S11 (20–51 t) | ~10 s | ~15 s | 50–100 s (cause 5) | 40–130 s (c8ctl rule-id hunt) | ~5 s | — |
| S16X (33–114 t) | 30–100 s (AGENTS.md → card → full `builder-reference.md` → `casen --help`) | 100–250 s | 50–250 s (cause 1) | 60–180 s (causes 3, 4, 6) | 5–40 s | 0–750 s (cause 2) |

All 30 runs ended with 0/0 lint errors and warnings and a successful deploy. The turns are spent getting there, not on failing.

## Repros (Node 22, ESM, `@bpmnkit/core` 1.13.0)

### R1: nested branch in sub-process dropped (cause 1)

```js
import { Bpmn } from "@bpmnkit/core"
const d = Bpmn.createProcess("t").startEvent("s")
 .subProcess("sp", s => s.startEvent("ss").exclusiveGateway("g1")
   .branch("a", b => b.condition("=x").userTask("ua",{name:"UA"}).exclusiveGateway("g2")
      .branch("a1", c => c.condition("=y").endEvent("e1"))
      .branch("a2", c => c.defaultFlow().userTask("ub",{name:"UB"}).endEvent("e2")))
   .branch("b", b => b.defaultFlow().endEvent("e3")), {name:"SP"})
 .endEvent("end").build({ validate: false })
console.log(d.processes[0].flowElements.find(e=>e.id==="sp").flowElements.map(e=>e.id))
// → [ss g1 ua g2 e3]   (e1, ub, e2 and flows g2>e1, g2>ub missing; same chain at top level keeps all 8)
```

**Root cause.** `dist/bpmn/bpmn-builder.js:1591`, in `BranchBuilder.branch`:
```js
this.lanes?.scoped(() => callback(b));
```
Inside a sub-process, `SubProcessContentBuilder.branch` (line ~1890) builds the `BranchBuilder` without a `lanes` argument. So `this.lanes` is undefined, the optional chain short-circuits, and **the nested callback never runs**. This is a regression from the lanes work: `this.lanes` only appears in the branch build.

**Fix.**
- Change the call to:
  ```js
  this.lanes ? this.lanes.scoped(() => callback(b)) : callback(b)
  ```
- Or pass a no-op `LaneState` into sub-process branches.
- Add a regression test for depth ≥2 branches inside `subProcess`, `adHocSubProcess` and event sub-process.
- Separately, harden `buildCollaborations`: when a message-flow endpoint is missing, list the ids that exist in the nearest sub-process. Also detect "callback produced zero elements" and throw.

### R2: message end event has no subscription (cause 4)

```js
const d = Bpmn.createProcess("p").startEvent("s").endEvent("e",{messageName:"info-sent",taskType:"send"}).build()
d.messages // → [{id:"Message_info_sent",name:"info-sent"}]  no zeebe:subscription, build() passes
```

- **Downstream failures:**
  - c8ctl lint: `Message "info-sent" used by Message end event … has no zeebe:subscription.`
  - Deploy gate in the graft case: `Must have exactly one zeebe:subscription extension element (zeebe/message-subscription)`.
- **Fix:**
  - Accept `correlationKey` on `EndEventOptions` and `IntermediateThrowEventOptions`.
  - When a diagram-level `.message(name, {correlationKey})` exists, reuse it instead of creating `Message_<name>`. The auto id currently collides with it, giving `cvc-id.2 … 'Message_information_sent'`.
  - Make `build()` warn on any message without a subscription, so lint and the gate agree.

### R3–R7: data, labels, ids, annotations (causes 3, 6, 7)

```js
const P = () => Bpmn.createProcess("p").startEvent("s")
// R3 dataObjectReference w/o dataObject → raw XSD: "cvc-id.1: There is no ID/IDREF binding for IDREF 'do_x'. (zeebe/idref-resolves)"
P().dataObjectReference("dr","do_x",{name:"List"}).userTask("t",{name:"T",formId:"f"}).endEvent("e").build()
// R4 kit lint false positive: flow/unreachable severity "error" on a dataStoreReference, suggestion "Connect this element to the process flow"
lintDiagram(P().serviceTask("t",{taskType:"x"}).dataStoreReference("ds","store1",{name:"HR"}).endEvent("e").build())
// R5/R9 branch name becomes flow name on parallel & event-based gateways → c8ctl superfluous-label
P().eventBasedGateway("w").branch("paid",b=>b.intermediateCatchEvent("m",{messageName:"paid",correlationKey:"=id"}).endEvent("e1"))
   .branch("timeout",b=>b.intermediateCatchEvent("t",{timerDuration:"PT1H"}).endEvent("e2")).build()
   .processes[0].sequenceFlows.map(f=>f.name)   // → ["paid","timeout"]
// R6 same id in two pools → raw "cvc-id.2: There are multiple occurrences of ID value 's'. (zeebe/id-ncname-unique)"
Bpmn.createDiagram().process("p1",p=>p.startEvent("s").serviceTask("x",{taskType:"a"}).endEvent("e1"))
  .process("p2",p=>p.startEvent("s").serviceTask("x",{taskType:"a"}).endEvent("e2"))
  .participant("a",{name:"A",processId:"p1"}).participant("b",{name:"B",processId:"p2"}).build()
// R7 free-standing note → "textAnnotation() must follow a flow element"
P().textAnnotation("note")
```

**Fixes:**
- **R3:** auto-create the `dataObject` when it is missing, or throw a builder error that names the method: `dataObjectReference("dr", "do_x"): declare .dataObject("do_x") first`.
- **R4:** skip data elements and artifacts in `flow/unreachable` and `flow/dead-end`.
- **R5/R9:**
  - Do not copy the branch name onto flows that leave parallel or event-based gateways.
  - Or make the label opt-in: use `.label()` only, with `branch(name)` as an id hint.
- **R6:** check ids across all processes in `DiagramBuilder.build()`. The error should name both pools: `id "s" used in processes p1 and p2; ids are global in a collaboration`.
- **R7:**
  - Add `DiagramBuilder.annotation(id, text, {near?})`, with DI.
  - Give data associations ids so they get DI edges.
  - Emit a root `bpmn:dataStore` for `dataStoreReference`.

### R8: preserving edit with loop-back (cause 5)

```js
const base = Bpmn.export(Bpmn.createProcess("p").startEvent("s").userTask("submit",{name:"Submit",formId:"f"})
  .exclusiveGateway("gw").branch("y",b=>b.condition("=x>1").endEvent("e1")).branch("n",b=>b.defaultFlow().endEvent("e2")).build())
const ed = Bpmn.continueProcess(Bpmn.parse(base),"p").insertAfter("submit")
  .serviceTask("validate",{name:"Validate",taskType:"v"})
  .withBoundary("bErr",{name:"Invalid",errorCode:"RECEIPT_INVALID"},b=>b.userTask("fix",{name:"Fix",formId:"f"}).connectTo("validate")).build()
lintDiagram(ed)  // errors: 'Element "validate" (serviceTask) has 2 incoming flows…' and '"Invalid" has 1 event definition(s) without an id.'
```

The builder's own output fails its own lint twice.

**Fixes:**
- When `connectTo(target)` gives a non-gateway target its second incoming flow, auto-insert an exclusive merge gateway in front of it. This is what every agent hand-built.
- Give the event definitions created by `withBoundary` / `withBoundaryEvent` an id.
- In `placeNewShapes`, shift the downstream shapes when an inserted node has no room, or report those shapes in `unplaced`. Agents shifted DI by hand by +145 to +260 px.

### Cause 2 (layout polish): no snippet

Nothing throws here. `applyAutoLayout` on a 9-pool collaboration lays out message flows as straight lines. Agents then spend 250–750 s on custom routers.

**Fixes:**
- Route message flows orthogonally between pool edges in `applyAutoLayout`.
- Put data objects next to the task they belong to.
- Add a card line: "`applyAutoLayout` output is final. Do not post-process DI or render PNGs; the score does not depend on it."
- Separately, document in the card that `applyAutoLayout` returns a new model; it does not change the one you pass in. Haiku r2 ignored the return value and got 260 lint errors.

## Card / CLAUDE.md steering

**What the agents read.** All 30 runs read the same three sources, in the first ~5 s:
- `AGENTS.md`
- `agent-cards/bpmn.md`
- `builder-reference.md`, in full or by grep

No run read the `.d.ts` files first. Every S16X run, though, ended up reading `dist/bpmn/bpmn-builder.js`, because of cause 1.

### Compact mode / `casen generate`: 0 of 30 runs used it

- **S04 (new single-pool process).** The card does offer compact mode:
  > `**Small new single-pool process:** write CompactDiagram JSON and run casen generate bpmn --definition '<json>' (schema: --help)`

  Three things outweigh it:
  1. It is a bullet near line 99, below the main section.
  2. It gives no schema or example, only "schema: --help".
  3. It sits under a card that opens with:
     > "Write a Camunda 8 BPMN process with `@bpmnkit/core` in one script… Never write a whole BPMN file by hand."

  The only runnable example in the card is the builder script, and S04 needs an event-based gateway, boundaries and a correlated message, which the builder example covers. No run even ran `casen generate --help`.
- **S16X.** The agents quoted:
  > "Several pools or message flows: `Bpmn.createDiagram()`"

  r1 (haiku) checked `casen agent-card bpmn --text` and concluded: "The text format cannot express pools, message flows or data stores".
- **AGENTS.md rule 1** says:
  > "Build with the builders… Never write XML or form JSON by hand."

  This reads as "scripts always".

### Direct XML edits

- **The steering line** is in `bpmn.md`:
  > "**Edit by size.** A tiny edit (rename, one attribute) … change that XML text directly, no script. A structural change (new or removed element, flow, pool): the preserving script below."
- **Which S11 runs followed it:** S11 is structural, so all 5 opus runs and sonnet r1/r3/r5 wrote a preserving script. They then hit cause 5 and hand-patched the XML or model anyway.
- **Which runs ignored it:** sonnet r2 and r4 went straight to Python XML edits. They were the fastest S11 runs (111 s and 100 s, against 119–290 s for the rest).
- **Result:** the rule sent agents onto the broken path.

### Lanes API

No scenario needs lanes, so none of the runs used or considered the lanes API. Lanes still matter here, because their implementation causes cause 1 (`this.lanes?.scoped`).

### Validation gates

- **What the docs say:**
  - AGENTS.md: "Validate before you finish: `npx @bpmnkit/cli check … --deploy`".
  - The task prompts name c8ctl lint and deploy.
- **What the agents did:** they treated c8ctl as "the gate that counts". Only 2 runs ran `casen check`, and its `flow/unreachable` errors on data stores (cause 6) taught them to ignore it.
- **Result:** three validators that disagree (`build()` gate, kit `lintDiagram`, c8ctl lint) mean extra turns explaining findings away.

### Proposed card / CLAUDE.md changes

1. **Make compact mode a real choice.** Put a 10-line `CompactDiagram` example right after the decision table in AGENTS.md. The rule: if it is one pool with ≤ ~15 nodes, use compact. Otherwise use the builder.
2. **Rewrite "Edit by size"** as: "Adding ≤3 nodes or flows to an existing file: edit the XML directly (copy a neighbour's `<bpmn:…>` and `<bpmndi:BPMNShape>`, shift x). Bigger restructures: preserving script." Until cause 5 is fixed, also add a trap: "A loop back into a task needs a merge gateway in front of it."
3. **Add traps to `bpmn.md#traps`:**
   - "`.branch(name)` names the flow. Leave the name empty on parallel and event-based gateways."
   - "User tasks need `formId` (see `form.md`)."
   - "Message end and throw events need `correlationKey` on a diagram-level `.message()`."
   - "Ids are global across pools: prefix them per pool."
   - "Nested branches inside `subProcess` (until fixed): connect them flat with `.connectTo`."
4. **Name one gate.** State that the gate is the command the task names, and that the kit's own `check` is advisory until the data-element false positives are fixed.
5. **Add a stop rule** (cause 2): "Once lint is clean and the deploy succeeds, stop. Do not hand-route DI."
6. **Harness CLAUDE.md:** say "Use the Write tool for files; heredocs and `cd &&` chains are refused." Every run burned turns rediscovering this.
