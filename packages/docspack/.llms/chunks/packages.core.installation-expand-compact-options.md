# @bpmnkit/core — Installation — `expand(compact, options?)`

Builds a `BpmnDefinitions` object from a `CompactDiagram`. It restores only what the compact
form carries, so `expand(compactify(definitions))` is not `definitions` — use this to build a
model from a compact definition, not as a round trip for a file you need to keep.

```typescript
import { expand } from "@bpmnkit/core";

const definitions = expand(compactDiagram);
const xml = Bpmn.export(definitions);
```

**Deployable by default.** A compact diagram is written for Camunda 8, so `expand` marks the
result `modeler:executionPlatform="Camunda Cloud"` (plus the diagram's `executionPlatformVersion`,
when it names one) and runs `assertDeployable` on it. What Zeebe would reject is refused with a
`DeployabilityError` that lists every reason:

```text
Not deployable on Camunda 8.10: 1 error(s)
- Message_payment-received: Must have exactly one zeebe:subscription extension element (zeebe/message-subscription)
```

The options are those of the builder's gate:

| Option | Default | Effect |
|---|---|---|
| `validate` | `true` | `false` skips the gate. The result is then not marked as Camunda 8 (unless the diagram names a version), so `Bpmn.export`'s `"auto"` check leaves it alone too. For previews and work in progress. |
| `placeholders` | `false` | Fill the documented `PLACEHOLDERS` (job types, message names, keys, `PT1H` timers, ...) instead of refusing. |
| `camundaVersion` | the diagram's `executionPlatformVersion`, else the newest | The Camunda 8 version to check for. |

`createCompactStream` and `createProcessTextStream` frames are previews of unfinished text, so
they expand with `validate: false`.

**Names, codes and times.** These `CompactElement` fields become the root elements Camunda 8
needs:

| Field | On | Written as |
|---|---|---|
| `messageName` | message events, receive tasks | a `bpmn:message` per name and key (`Message_<name>`), referenced by the element |
| `correlationKey` | a message waited for | the message's `zeebe:subscription` (`"=orderId"`); needed everywhere but a process start |
| `signalName` | signal events | a `bpmn:signal` per name |
| `errorCode` | error events | a `bpmn:error` per code; an error boundary or start without one catches every error |
| `escalationCode` | escalation events | a `bpmn:escalation` per code |
| `timerDuration`, `timerDate`, `timerCycle` | timer events | `timeDuration` (`PT5M`), `timeDate` (ISO date-time or FEEL), `timeCycle` (`R/PT1H`, `R3/PT10M`) |
| `calledProcess` | call activities | `zeebe:calledElement processId` |
| `linkName` | link events | the link's `name` |
| `interrupting: false` | boundary events, an event sub-process's start event | `cancelActivity="false"` / `isInterrupting="false"` |

`compactify` reads them back, and a parsed event sub-process (`subProcess triggeredByEvent`) comes
back as `eventSubProcess`, so `expand(compactify(defs))` keeps the trigger.

```json
{ "id": "wait", "type": "intermediateCatchEvent", "eventType": "message",
  "messageName": "payment-received", "correlationKey": "=orderId" }
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

---
Source: https://bpmnkit.com/docs/packages/core
