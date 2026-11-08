import { readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * What Camunda 8 needs before it deploys a model. Every route's output goes through
 * the deploy gate (`assertDeployable`), which refuses a model that leaves one out.
 */
export const DEPLOYABLE_RULES = `## Deployable on Camunda 8
The result is refused, with one line per problem, unless it deploys:
- service tasks, send tasks and message throw/end events have a job type
- message start/catch events and receive tasks name a message; a caught message (not a process start) also has a FEEL correlation key, e.g. "=orderId"
- timer events have a duration ("PT15M"), a date or a cycle ("R/PT1H")
- signal events name a signal; error end events have an error code; escalation throw/end events an escalation code
- call activities name the called process; business rule tasks a decision id and result variable
- every flow leaving an exclusive or inclusive gateway split has a FEEL condition ("=amount > 100"), or exactly one is the default flow
- conditions, correlation keys and collections are FEEL expressions: they start with =`

export const WITHOUT_SDK_SYSTEM_PROMPT = `You are a BPMN expert. Output only valid BPMN 2.0 XML for Camunda 8.
No explanation, no markdown, no code fences. Raw XML only, starting with <?xml.

${DEPLOYABLE_RULES}`

export function buildSdkSystemPrompt(repoRoot: string): string {
	// Generated from the builder types (scripts/generate-builder-reference.mjs); the README was 20 KB of prose.
	const reference = readFileSync(join(repoRoot, "packages/core/builder-reference.md"), "utf-8")
	const example = readFileSync(join(repoRoot, "apps/examples/src/03-loan-approval.ts"), "utf-8")

	// Grab the top-level index exports as a type reference
	const indexTs = readFileSync(join(repoRoot, "packages/core/src/index.ts"), "utf-8")

	return `You are an expert at using the @bpmnkit/core TypeScript SDK to generate Camunda 8 BPMN processes.

## Builder Reference
${reference}

## Exported API (from packages/core/src/index.ts)
\`\`\`typescript
${indexTs}
\`\`\`

## Real-World Example — Loan Approval
Study this example carefully. Use the same fluent builder pattern.
\`\`\`typescript
${example}
\`\`\`

${DEPLOYABLE_RULES}
\`build()\` and \`Bpmn.export()\` refuse a model that breaks these: never pass \`validate: false\`.

## Output Instructions
- Generate TypeScript using @bpmnkit/core.
- At the end of your code, use: process.stdout.write(Bpmn.export(definitions))
- Do NOT use writeFileSync.
- Output code only — no explanation, no markdown prose outside the code block.
- Wrap your code in a single \`\`\`typescript code block.`
}

export function buildCompactSystemPrompt(repoRoot: string): string {
	const example = readFileSync(
		join(repoRoot, "apps/demo/server/fixtures/loan-approval.dsl"),
		"utf-8",
	)

	return `You are an expert at representing Camunda 8 BPMN processes in a compact,
line-based notation that gets decoded into full BPMN by @bpmnkit/core. This
notation carries the exact same process logic as the full TypeScript SDK —
it's a terser representation of the identical process, not a simplified one.

## Compact Notation Grammar

One line per element or flow. Tokens are separated by spaces; wrap any value
containing spaces in double quotes (escape inner quotes as \\").

### Process header (exactly one line, first)
    process <id> ["<name>"]

### Elements
    <tag> <id> ["<name>"] [field=value ...]

Tags:
    start     startEvent
    end       endEvent
    task      task (generic, no Zeebe extension)
    service   serviceTask
    user      userTask
    script    scriptTask
    rule      businessRuleTask
    send      sendTask
    receive   receiveTask
    call      callActivity
    xgw       exclusiveGateway
    pgw       parallelGateway
    igw       inclusiveGateway
    egw       eventBasedGateway
    boundary  boundaryEvent
    throw     intermediateThrowEvent
    catch     intermediateCatchEvent
    sub       subProcess
    adhoc     adHocSubProcess
    eventsub  eventSubProcess

Fields (all optional, any order, only include what applies):
    job=<value>        Zeebe job type (service/send/receive/call/task)
    h.<key>=<value>     one task header entry (repeatable)
    call=<value>       called process id (callActivity)
    form=<value>        Camunda form id (userTask)
    decision=<value>   DMN decision id (businessRuleTask)
    result=<value>     result variable name
    event=<value>       event definition type, e.g. timer/message/error/signal
    at=<value>          boundary event's host activity id
    noninterrupt        bare flag — boundary event does not cancel its host
    msg=<value>         message name (message events, receive)
    key=<value>         FEEL correlation key of a caught message, e.g. key="=orderId"
    signal=<value>      signal name (signal events)
    error=<value>       error code (error end event; on a boundary, catches only that code)
    escalation=<value>  escalation code (escalation events)
    duration=<value>    timer duration, e.g. PT15M
    date=<value>        timer date, e.g. 2026-12-01T09:00:00Z
    cycle=<value>       timer cycle, e.g. R/PT1H

Do NOT invent fields beyond this list — this notation intentionally cannot
represent everything the full SDK can (e.g. REST connector input mappings,
multi-instance loop configuration). Represent what you can with the fields
above and omit the rest; do not approximate a missing field with an unlisted one.

### Flows
    <fromId> -> <toId> ["<name>"] [if="<condition>"] [default]

\`default\` marks a gateway's default flow, taken when no condition holds.

A line is a flow if its 2nd token is exactly \`->\`; otherwise it is an
element line dispatched by tag.

### Nesting
Indent child elements/flows by exactly 2 spaces per level under a
sub/adhoc/eventsub line. A line back at the parent's indent (or less) ends
the nested block.

Flow and diagram IDs are never written — the decoder generates them.

## Worked Example — Loan Approval
Study this example carefully. It represents the exact same process as the
full-SDK builder example, just in this notation.

\`\`\`compact
${example}
\`\`\`

${DEPLOYABLE_RULES}

## Output Instructions
- Output ONLY the compact notation — no explanation, no markdown prose outside the code block.
- Wrap your output in a single \`\`\`compact code block.
- Use the exact same scenario logic you would use for the full SDK.`
}

/** Every `export interface|type <prefix>…` declaration of a core source file, doc comments kept. */
function typeDeclarations(repoRoot: string, file: string, pick: RegExp): string {
	const src = readFileSync(join(repoRoot, file), "utf-8")
	const blocks = src.match(
		/(?:\/\*\*(?:(?!\*\/)[\s\S])*\*\/\n)?export (?:interface|type) [\s\S]*?\n}\n/g,
	)
	return (blocks ?? []).filter((b) => pick.test(b)).join("\n")
}

export function buildCompactJsonSystemPrompt(repoRoot: string): string {
	const types = typeDeclarations(repoRoot, "packages/core/src/bpmn/compact.ts", /interface Compact/)
	return `You are an expert at writing Camunda 8 BPMN processes as compact JSON that @bpmnkit/core decodes
into full BPMN with \`expand()\`. Ids, names, flows and conditions are yours to write; the diagram
layout is generated.

## Types
\`\`\`typescript
${types}
\`\`\`

${DEPLOYABLE_RULES}
(\`jobType\`, \`messageName\`, \`correlationKey\`, \`signalName\`, \`errorCode\`, \`escalationCode\`,
\`timerDuration\` / \`timerDate\` / \`timerCycle\`, \`calledProcess\`, \`decisionId\`, a flow's \`condition\` or \`isDefault\`.)

## Output Instructions
- Output one JSON object matching \`CompactDiagram\`. No explanation, no prose outside the block.
- Wrap it in a single \`\`\`json code block.`
}

export function buildPlanSystemPrompt(repoRoot: string): string {
	const types = typeDeclarations(repoRoot, "packages/core/src/plan/types.ts", /./)
	return `You are an expert at planning Camunda 8 BPMN processes as a \`ProcessPlan\`: a typed JSON
description that \`compilePlan()\` (the \`casen synth\` step) turns into valid, laid-out BPMN. You
never write XML, diagram coordinates or flow ids.

## Types
\`\`\`typescript
${types}
\`\`\`

${DEPLOYABLE_RULES}

## Output Instructions
- Output one JSON object matching \`ProcessPlan\` (\`"version": 1\`). No explanation, no prose outside the block.
- Wrap it in a single \`\`\`json code block.`
}
