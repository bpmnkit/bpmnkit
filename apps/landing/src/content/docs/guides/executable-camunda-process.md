---
title: Build an Executable Camunda Process
description: Task-shaped recipes for a build script that must deploy to Camunda 8.10 as written — start-event forms, user-task input mapping, gateway flow labels, element templates, an AI Agent sub-process with a tool grid, and the deployability check.
sidebar:
  order: 19
---

Each section below answers one question you hit while writing a build script for a process
that Camunda 8.10 has to run, not only draw. The snippets are cut from one reference script,
`packages/core/tests/fixtures/bakeoff/build.ts` in the repository, which builds a chat agent
with tools end to end. Run its output through the last section before you test anything.

Every snippet assumes this setup:

```typescript
import { Bpmn } from "@bpmnkit/core"
import { applyTemplates } from "@bpmnkit/core/connectors"

const model = Bpmn.createProcess("ai-agent-chat-with-tools")
	.name("AI Agent Chat With Tools")
	.executable(true)
	.executionPlatformVersion("8.10.0")
```

## How do I put a form on a start event?

Pass `formId` to `startEvent`. It writes a `zeebe:formDefinition` with that `formId` on the
event, so the form is linked by id and Camunda looks it up in the cluster at runtime.

```typescript
model.startEvent("StartEvent_TaskReceived", {
	name: "Task to perform received",
	formId: "ai-agent-chat-initial-request",
})
```

A user task takes the same `formId` option. The `formId` is the id of a Camunda Form (a
`.form` file), not a file name or a path. Deploy the form together with the process: if the
cluster has no form with that id, the person who opens the task or starts the instance finds
no form. A start event without a `formId` has no start form at all; an instance then starts
only with the variables you pass to the API.

## How do I map a user task's input?

Set `ioMapping` on `userTask`. Each input is a FEEL `source` expression, starting with `=`,
copied into a local variable named `target`. Add `zeebeUserTask: true` so the task is a
Camunda user task and not a job-worker one; the form and the input mapping belong to it. Name
`target` after the form field that shows the value. `ioMapping` also takes `outputs`, with the
same `source` and `target` shape, for values that leave the task.

```typescript
.userTask("UserTask_ReviewAgentResponse", {
	name: "User Feedback",
	zeebeUserTask: true,
	formId: "ai-agent-chat-user-feedback",
	ioMapping: { inputs: [{ source: "=agent.responseText", target: "responseText" }] },
})
```

## How do I label a gateway's Yes and No flows?

Open a `branch` after the gateway and call `label` for the text shown on the sequence flow,
`flowId` for the flow's own id, and `condition` for the FEEL expression. The branch id
(`"yes"`) is only the builder's handle and stays separate from the flow label, so the label
reads "Yes" while the id stays stable. Use `connectTo` to loop a branch back to an earlier
element.

```typescript
.exclusiveGateway("Gateway_UserSatisfied", { name: "User satisfied?" })
.branch("yes", (b) =>
	b.label("Yes").flowId("Flow_Yes").condition("=userSatisfied")
		.endEvent("EndEvent_UserSatisfied", { name: "User satisfied" }),
)
.branch("no", (b) =>
	b.label("No").flowId("Flow_No")
		.condition("=userSatisfied = null or userSatisfied = false")
		.connectTo("Gateway_RunAgent"),
)
```

## How do I apply an element template (connector) to a task?

Build the task first, then call `applyTemplates` from `@bpmnkit/core/connectors` on the
finished model. Name the element, the template as `id@version`, and the values. It returns the
new definitions and a list of `problems`; throw on a non-empty list rather than ship a
half-applied template.

```typescript
const { definitions, problems } = applyTemplates(model.build(), [
	{
		elementId: "FetchSafeJoke",
		template: "io.camunda.connectors.HttpJson.v2@18",
		values: {
			"authentication.type": "noAuth",
			method: "GET",
			url: "https://v2.jokeapi.dev/joke/Any?format=txt&safe-mode",
			resultExpression: "={toolCallResult: response.body}",
			retryCount: 3,
		},
	},
])
if (problems.length > 0)
	throw new Error(problems.map((p) => `${p.elementId}: ${p.message}`).join("\n"))
```

Properties you leave out keep the template's default, so set only what differs. An unknown
key comes back as a problem with a suggestion for the nearest real one.

## Which keys does a template take?

The keys are the template's property ids, for example `url`, `method`, `retryCount` or
`authentication.type`, not the labels shown in the Modeler. List them from the command line:

```sh
casen connector show io.camunda.connectors.HttpJson.v2
```

Properties you omit keep their template default; you do not have to repeat them. If you
mistype a key, `applyTemplates` reports it in `problems` with the key it thinks you meant.
`casen connector show` prints the template's name and task type, then its required inputs and its optional
inputs, one per line as `key — label`. Copy the `key` from there: it is the same id
`applyTemplates` accepts, for example `retryCount`. Add `--filter timeout` to keep the properties
whose key or label contains that text, and `--condensed` for one line each with type, default,
`required` and the condition that switches it on (`key  type  default  required  when method in POST|PUT`).
Set only the keys whose template default is wrong for your process. Nested properties use dotted ids such
as `authentication.type`, and the dot is part of the key, not a path into an object.

To configure a task in a `.bpmn` file from the command line, `casen connector apply order.bpmn Call http --values call.json`
takes the same keys. Put multi-line or quoted FEEL in the JSON file rather than in a shell `--set`.

## How do I build an AI Agent sub-process (8.10, v2)?

Build an `adHocSubProcess` whose children are the tools, then apply the
`io.camunda.connectors.agenticai.ai-agent-subprocess.v2@1` template to it. Each tool is a
service task inside the sub-process; its `documentation` is what the model reads to decide
when to call it. Give each tool its own template, such as HTTP JSON.

```typescript
.adHocSubProcess(
	"AI_Agent",
	(sub) => {
		sub.serviceTask("FetchSafeJoke", {
			name: "Get a safe joke",
			documentation: "Fetches one random safe-mode joke. Use this tool when the user asks for a joke.",
			taskType: "io.camunda:http-json:1",
		})
	},
	{ name: "AI Agent" },
)
```

```typescript
applyTemplates(model.build(), [
	{
		elementId: "AI_Agent",
		template: "io.camunda.connectors.agenticai.ai-agent-subprocess.v2@1",
		values: {
			"provider.type": "openai",
			"data.systemPrompt.prompt": SYSTEM_PROMPT,
			"data.userPrompt.prompt": "=inputText",
			"data.limits.maxModelCalls": 10,
			resultVariable: "agent",
		},
	},
])
```

Omitted properties keep their defaults, so you can leave out everything you do not change.
The agent needs a provider and a user prompt at least; the remaining defaults are workable for
a first run. The `resultVariable` is where the agent's answer lands, and a later task reads it
as a FEEL variable, for example `=agent.responseText`. Pass the template's `values` on the
sub-process itself, never on the tool tasks inside it.

## How do I lay out the agent's tools in a grid?

Pass `toolGrid` as an option to `adHocSubProcess`. `columns` sets the width and `fill` sets
the order: `"column"` fills down each column first, `"row"` fills across. Tools are placed in
declaration order. Add `annotate` to attach a text annotation to an element; `side` picks which
edge it hangs from.

```typescript
.adHocSubProcess("AI_Agent", (sub) => { /* tools */ }, {
	name: "AI Agent",
	toolGrid: { columns: 2, fill: "column" },
})
.annotate("FetchSafeJoke", "Each task you add is a capability of the agent.", { side: "below" })
.withAutoLayout()
```

## How do I check the file is executable before tests?

Lint the file before you write any test against it. `lintDiagram` is the library call, and
`casen lint lint <file> --profile deploy` is the command; render the result with
`renderBpmnAscii` from `@bpmnkit/ascii` to read the shape.

```sh
casen lint lint process.bpmn --categories deploy,connector,agentic
```

Use the engine categories (`deploy`, `connector`, `agentic`) as the deployability gate: they
hold the checks that decide whether Camunda accepts the file. `--profile deploy` runs every
category and keeps the error-severity findings, so it also reports the `pattern` rules
`gateway-no-default-flow` and `subprocess-no-error-boundary`. On the spec-compliant bake-off
process those two are style advice that Camunda's own gate does not flag, and the reference
file `expected.bpmn` trips both. Fix them if you want a clean deploy profile, or gate on the
engine categories.
