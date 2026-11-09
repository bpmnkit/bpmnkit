---
title: The Deploy Gate
description: Every BPMN that BPMN Kit generates deploys on Camunda 8, or is refused with one line per problem. The assertDeployable API, the error format, the placeholder values, the opt-outs, and how each tool behaves.
sidebar:
  order: 4
---

BPMN Kit generates BPMN that deploys on Camunda 8. When the input leaves out something Camunda 8
needs (a job type, a message name, a correlation key, a timer's time, a condition on a gateway
branch), the result is refused with a clear error instead of written. Placeholder values are an
explicit opt-in.

The check is Zeebe's own: the rules Zeebe runs when it receives a deployment (`zeebe/*`), plus its
XML schema stage, on the serialized XML. A model the gate accepts is one Zeebe accepts.

## The API

```typescript
import { Bpmn, DeployabilityError, assertDeployable, assertDeployableXml } from "@bpmnkit/core"

try {
  const { definitions, placeholders, warnings } = assertDeployable(defs)
} catch (err) {
  if (err instanceof DeployabilityError) {
    console.error(err.message)      // the lines below
    err.findings                    // the error findings, in the validator's order
    err.camundaVersion              // "8.10"
  }
}

// The bytes as they are, for XML you did not serialize yourself (a file, a model's answer):
assertDeployableXml(readFileSync("order.bpmn", "utf8"))
```

| Function | Checks | Returns | Throws |
|---|---|---|---|
| `assertDeployable(defs, options?)` | `defs`, serialized | `{ definitions, placeholders, warnings }`: the input, or a filled copy (the input is never mutated) | `DeployabilityError` |
| `assertDeployableXml(xml, options?)` | the XML string | the warnings | `DeployabilityError` |
| `validateDeployable(defs, options?)` / `validateDeployableXml(xml, options?)` | the same rules | every finding, without throwing | — |

Options: `camundaVersion` (default: the model's `modeler:executionPlatformVersion`, else the newest
supported version), `placeholders` (`assertDeployable` only), and a `resolver` for the other
resources of the same deployment. The Rust crates have the same functions
(`bpmnkit_compat::zeebe::{assert_deployable, assert_deployable_xml}`) with byte-identical messages.

## The error

```
Not deployable on Camunda 8.10: 2 error(s)
- charge: Must have exactly one 'zeebe:taskDefinition' extension element (zeebe/service-task-definition)
- reply: Must have exactly one zeebe:subscription extension element (zeebe/message-subscription)
```

The first line names the Camunda version checked and the number of errors. Then one line per
error: the element id, Zeebe's message, and the rule. The message is the same everywhere: in an
exception, a CLI refusal, a tool result an AI model reads, and the readiness panels.

## Placeholders

`placeholders: true` fills what a placeholder can fill, on a copy, and checks again. What still
fails is refused. Each value is deterministic and does nothing useful at runtime: replace it
before you deploy. `PLACEHOLDERS` exports this table.

| Field | Value | Where |
|---|---|---|
| `jobType` | `placeholder-<elementId>` | `zeebe:taskDefinition` type of a service task, send task, script task without a script, business rule task without a decision, or message throw/end event |
| `messageName` | `placeholder-<elementId>` | a message without a name; a missing `messageRef` gets a new message |
| `correlationKey` | `="placeholder-<elementId>"` | the `zeebe:subscription` of a caught message |
| `signalName` | `placeholder-<elementId>` | a signal without a name |
| `errorCode` | `placeholder-<elementId>` | the error an error end event throws |
| `escalationCode` | `placeholder-<elementId>` | a thrown escalation |
| `timer` | `PT1H` | a timer with no duration, date or cycle |
| `calledElement` | `placeholder-<elementId>` | a call activity's called process |
| `decisionId` | `placeholder-<elementId>` | a business rule task's decision |
| `condition` | `=false` | a non-default flow leaving an exclusive or inclusive gateway (never taken) |

`placeholders` (in the result) lists every value written: `{ elementId, field, value, rule }`.

## Where the gate runs

| Entry point | Default | Opt-outs |
|---|---|---|
| `ProcessBuilder.build()`, `DiagramBuilder.build()` | gated | `{ validate: false }`, `{ placeholders: true }`, `{ camundaVersion }` |
| `expand(compact, options?)` | gated | the same |
| `Bpmn.export(defs, { validate })` | `"auto"`: gated when the model targets Camunda 8 | `"error"` gates any model, `"warn"` logs, `false` skips |
| `convertCamunda7(defs, options?)` | gated | the same as `build()` |
| `compilePlan` / `mergePlan` | gated; a refusal returns no `xml` and one problem per error | `validate`, `placeholders`, `camundaVersion` |
| Connector templates (`applyTemplates`, `applyConnectorLines`) | applied elements checked; errors are `problems` (`kind: "not-deployable"`) | — |
| `casen generate bpmn` | refuses, writes nothing, exits 1 | `--placeholders`, `--no-validate` |
| `casen migrate c7` | refuses, exits 1 | `--placeholders`, `--no-validate` |
| `casen synth` | refuses, exits 1 | `--placeholders` |
| `casen deploy` | refuses before sending a `.bpmn`, exits 1 | `--no-validate` |
| `casen check --deploy` | reports the gate's errors with the lint's | — |
| AI proxy `/chat`, `/improve` | refuses: an `error` event with the gate's message, no `xml` | request body `"placeholders": true`; `"validate": false` returns the diagram as a draft with a `deployability` event carrying the message |
| AI proxy MCP tools | every tool that changes the diagram adds a deploy-check result, so the model fixes what Zeebe would refuse; `sdk.exportXml` throws the gate's message | `sdk.exportXml(compact, '{"placeholders":true}')` |
| aikit MCP `bpmn_create`, `bpmn_update` | refused, nothing written | `placeholders: true` |
| aikit MCP `bpmn_deploy` | refuses before sending | `validate: false` |
| aikit MCP `bpmn_validate` | reports `deployable` and the gate's message | — |
| Studio deploy pane | the Deploy button stays off and lists the gate's lines | — |
| Studio AI panels, on-device AI | insert the diagram as a draft and show the gate's lines | — |
| Drop draft | renders always; the readiness check shows the gate's lines and offers **Fill placeholders**; **Share** is refused until it deploys | **Edit** opens the draft as it is |

Work in progress is never gated: an editor saving the diagram you are drawing, streamed preview
frames, a diagram rendered in Markdown, the MCP server's state between tool calls. These pass
`validate: false` on purpose.

## Behaviour change

`@bpmnkit/core` 1.10 refuses generated output that Zeebe rejects. That output was a bug: it
looked fine until a deployment failed. Callers that relied on it have three ways forward:

1. Complete the input. The error names each element and rule.
2. Pass `placeholders: true` (CLI `--placeholders`) to get a deployable model with documented
   values to replace.
3. Pass `validate: false` (CLI `--no-validate`) for a draft that is not meant to deploy, or a model
   for another engine.

The serializer changed in one place: documentation on `<bpmn:definitions>` is not allowed by the
BPMN schema (Zeebe refuses it), so it is written inside a `<bpmn:extension>` and read back from
there.
