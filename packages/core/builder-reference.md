# @bpmnkit/core builder reference

Generated from `bpmn-builder.ts`; do not edit.

## Rules

- Start with `Bpmn.createProcess(id)`, end with `.build()`, then `Bpmn.export(definitions)` for the XML. Call `.withAutoLayout()` before `.build()`, or the diagram has no shapes.
- Element ids are unique. Each element connects to the previous one automatically; there are no manual flows.
- `subProcess`, `transaction`, `eventSubProcess` and `adHocSubProcess` take the callback as the SECOND argument and options THIRD: `.subProcess(id, (sub) => sub.startEvent()..., { name })`. Swapped order is tolerated.
- Gateways fork with `.branch(name, (b) => b...)`. Inside, `b.condition(feelExpr)` sets the flow condition and `b.defaultFlow()` marks the default flow. To merge, end a branch with `.connectTo(targetId)` and declare that target after the last branch.
- Event definitions are named options, not nested objects: `timerDuration`, `timerDate`, `timerCycle`, `messageName` + `correlationKey`, `signalName`, `errorCode`, `escalationCode`, `linkName`. Unknown options are silently dropped: `timer: { duration }` does nothing.
- `withBoundary(id, options, (b) => ...)` attaches a boundary event to the PRECEDING activity; the callback builds the path leaving it, and the main chain continues from the activity.
- FEEL expressions start with `=`. Options without `?` are required.

## Methods

`ProcessBuilder` methods (all return `this`; callback builders have the element methods too). `?` = optional.

Events:
- startEvent(id?: string, options?: StartEventOptions)
- endEvent(id?: string, options?: EndEventOptions)
- intermediateThrowEvent(id?: string, options?: IntermediateThrowEventOptions)
- intermediateCatchEvent(id?: string, options?: IntermediateCatchEventOptions)
- boundaryEvent(id: string, attachedToOrOptions: string | BoundaryEventOptions, maybeOptions?: Omit<BoundaryEventOptions, "attachedTo">)
- withBoundary(id: string, options: Omit<BoundaryEventOptions, "attachedTo">, handler: (b: ProcessBuilder) => void)
Tasks and connectors:
- serviceTask(id: string, options: ServiceTaskOptions)
- restConnector(id: string, config: RestConnectorConfig)
- scriptTask(id: string, options: ScriptTaskOptions)
- userTask(id: string, options?: UserTaskOptions)
- sendTask(id: string, options?: MessageTaskOptions)
- receiveTask(id: string, options?: MessageTaskOptions)
- businessRuleTask(id: string, options?: BusinessRuleTaskOptions)
- callActivity(id: string, options: CallActivityOptions)
- manualTask(id: string, options?: ElementOptions)
- task(id: string, options?: ElementOptions)
Gateways:
- exclusiveGateway(id: string, options?: GatewayOptions)
- parallelGateway(id: string, options?: ElementOptions)
- inclusiveGateway(id: string, options?: GatewayOptions)
- eventBasedGateway(id: string, options?: ElementOptions)
- complexGateway(id: string, options?: GatewayOptions)
Containers (sub-processes):
- adHocSubProcess(id: string, content: (b: SubProcessContentBuilder) => void, options?: AdHocSubProcessOptions)
- subProcess(id: string, content: (b: SubProcessContentBuilder) => void, options?: SubProcessOptions)
- transaction(id: string, content: (b: SubProcessContentBuilder) => void, options?: SubProcessOptions)
- eventSubProcess(id: string, content: (b: SubProcessContentBuilder) => void, options?: ElementOptions)
Flow control:
- at(nodeId: string)
- insertAfter(nodeId: string)
- branch(name: string, callback: (b: BranchBuilder) => void)
- connectTo(targetId: string)
- element(elementId: string)
Process settings and misc:
- withAutoLayout()
- executionPlatformVersion(version: string)
- defaults(options: {serviceTask?: {retries?: string}})
- name(name: string)
- executable(value: boolean)
- versionTag(tag: string)
- message(id: string, options: {name: string})
- error(id: string, options: {code: string; name?: string})
- signal(id: string, options: {name: string})
- escalation(id: string, options: {code: string; name?: string})
- textAnnotation(text: string)
- annotate(elementId: string, text: string, options?: AnnotateOptions)
- build(options?: BuildOptions)

Only inside `.branch()` callbacks (BranchBuilder), applied to the flow leaving the gateway:
- condition(expression: string)
- label(text: string)
- flowId(id: string)
- defaultFlow()

Not available inside callbacks (top-level only): at, insertAfter, withAutoLayout, executionPlatformVersion, defaults, name, executable, versionTag, message, error, signal, escalation, restConnector, build.

## Options

`+El` = also accepts the ElementOptions fields.

- ElementOptions: name?: string; documentation?: string (Free-text documentation…)
- StartEventOptions +El: timerDuration?: string (Timer duration (ISO 8601)); timerDate?: string (Timer date (ISO 8601)); timerCycle?: string (Timer cycle (ISO 8601)); messageName?: string (Message name); formId?: string (Form to show when the process is…); isInterrupting?: boolean (Non-interrupting flag)
- EndEventOptions +El: errorCode?: string (Error code); messageName?: string; signalName?: string (Signal name); escalationCode?: string (Escalation code)
- IntermediateThrowEventOptions +El: messageName?: string; signalName?: string; escalationCode?: string; compensation?: boolean (Emit a compensateEventDefinition); linkName?: string (Link name)
- IntermediateCatchEventOptions +El: timerDuration?: string; timerDate?: string; timerCycle?: string; messageName?: string; correlationKey?: string (FEEL expression correlating this…); signalName?: string; linkName?: string
- BoundaryEventOptions +El: attachedTo: string (ID of the activity this boundary…); cancelActivity?: boolean (Whether the host activity is…); errorCode?: string; timerDuration?: string; timerDate?: string; timerCycle?: string; messageName?: string; correlationKey?: string; signalName?: string; compensation?: boolean
- ServiceTaskOptions: multiInstance?: MultiInstanceOptions (Runs the activity once per item…); name: string; taskType: string (Zeebe job type for this task); retries?: string (Number of retries…); ioMapping?: ioMapping shape (Input/output variable mappings); taskHeaders?: Record<string, string> (Task header key-value pairs); documentation?: string
- MultiInstanceOptions: isSequential?: boolean; collection?: string; elementVariable?: string; outputCollection?: string (Variable that collects each…); outputElement?: string (FEEL expression evaluated per…); completionCondition?: string
- RestConnectorConfig: name?: string; method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" (HTTP method…); url: string (Target URL); authentication?: {type: "noAuth"} | {type: "bearer"; token: string} (Authentication configuration); headers?: Record<string, string> | string (HTTP headers as key-value pairs…); body?: string (Request body); retries?: string; resultVariable?: string (Variable name to store the full…); resultExpression?: string (FEEL expression to extract values…)
- ScriptTaskOptions: multiInstance?: MultiInstanceOptions; name?: string; expression: string (FEEL expression for the script); resultVariable: string; documentation?: string
- UserTaskOptions: multiInstance?: MultiInstanceOptions; name?: string; formId?: string; ioMapping?: ioMapping shape; taskHeaders?: Record<string, string>; documentation?: string; assignee?: string (Static assignee…); candidateGroups?: string (Candidate groups, comma-separated…); candidateUsers?: string (Candidate users, comma-separated…); dueDate?: string (Due date); followUpDate?: string (Follow-up date); priority?: number (Task priority 0-100, default 50…)
- MessageTaskOptions +El: multiInstance?: MultiInstanceOptions; messageName?: string; correlationKey?: string
- BusinessRuleTaskOptions: multiInstance?: MultiInstanceOptions; name?: string; taskType?: string; decisionId?: string (DMN decision ID to evaluate); resultVariable?: string; documentation?: string
- CallActivityOptions: multiInstance?: MultiInstanceOptions; name?: string; processId: string (Process ID to call); propagateAllChildVariables?: boolean (Whether to propagate all child…); propagateAllParentVariables?: boolean (Whether the child process…); bindingType?: "latest" | "deployment" | "versionTag" (How the called process version is…); versionTag?: string (Version tag of the called…); ioMapping?: ioMapping shape; documentation?: string
- GatewayOptions +El: defaultFlow?: string (ID of the default sequence flow…)
- AdHocSubProcessOptions +El: activeElementsCollection?: string (FEEL expression for determining…); outputCollection?: string; outputElement?: string; taskDefinition?: {type: string; retries?: string} (Zeebe task definition…); ioMapping?: ioMapping shape; taskHeaders?: Record<string, string>; multiInstance?: MultiInstanceOptions; completionCondition?: string
- SubProcessOptions +El: multiInstance?: MultiInstanceOptions
- AnnotateOptions: side?: "above" | "below" (Which side of the element…)
- BuildOptions: explicitJoins?: boolean (Refuse to infer join gateways, so…)
- ioMapping shape = {inputs?: Array<{source: string; target: string}>; outputs?: Array<{source: string; target: string}>}

## Examples

```typescript
import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("order")
	.withAutoLayout()
	.startEvent("start")
	.serviceTask("charge", { name: "Charge card", taskType: "payments", retries: "3" })
	.userTask("review", { name: "Review", assignee: "=reviewer" })
	.scriptTask("total", { expression: "=price * qty", resultVariable: "total" })
	.endEvent("end")
	.build()
const xml = Bpmn.export(definitions)
```

```typescript
import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("approval")
	.withAutoLayout()
	.startEvent("start")
	.exclusiveGateway("ok", { name: "Approved?" })
	.branch("yes", (b) =>
		b.condition("=approved").serviceTask("ship", { name: "Ship", taskType: "shipping" }).connectTo("end"),
	)
	.branch("no", (b) => b.defaultFlow().label("Rejected").endEvent("rejected"))
	.endEvent("end")
	.build()
const xml = Bpmn.export(definitions)
```

```typescript
import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("batch")
	.withAutoLayout()
	.startEvent("start")
	.subProcess(
		"each",
		(sub) =>
			sub
				.startEvent("subStart")
				.serviceTask("handle", { name: "Handle item", taskType: "handler" })
				.endEvent("subEnd"),
		{ name: "Per item", multiInstance: { collection: "=items", elementVariable: "item" } },
	)
	.endEvent("end")
	.build()
const xml = Bpmn.export(definitions)
```

```typescript
import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("sla")
	.withAutoLayout()
	.startEvent("start")
	.serviceTask("work", { name: "Work", taskType: "worker" })
	.withBoundary("late", { timerDuration: "PT1H", cancelActivity: false }, (b) =>
		b.serviceTask("remind", { name: "Remind", taskType: "mailer" }).endEvent("reminded"),
	)
	.withBoundary("failed", { errorCode: "WORK_FAILED" }, (b) => b.endEvent("aborted"))
	.endEvent("end")
	.build()
const xml = Bpmn.export(definitions)
```

```typescript
import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("payment")
	.withAutoLayout()
	.startEvent("start", { messageName: "order-placed" })
	.eventBasedGateway("wait")
	.branch("paid", (b) =>
		b
			.intermediateCatchEvent("gotPayment", { messageName: "payment", correlationKey: "=orderId" })
			.endEvent("done"),
	)
	.branch("late", (b) =>
		b.intermediateCatchEvent("expired", { timerDuration: "P3D" }).endEvent("cancelled"),
	)
	.build()
const xml = Bpmn.export(definitions)
```

```typescript
import { Bpmn } from "@bpmnkit/core"

const definitions = Bpmn.createProcess("onboarding")
	.withAutoLayout()
	.startEvent("start")
	.restConnector("lookup", {
		name: "Look up customer",
		method: "GET",
		url: '="https://api.example.com/customers/" + customerId',
		resultVariable: "customer",
	})
	.callActivity("kyc", { name: "KYC check", processId: "kyc-check", propagateAllChildVariables: true })
	.endEvent("end")
	.build()
const xml = Bpmn.export(definitions)
```
