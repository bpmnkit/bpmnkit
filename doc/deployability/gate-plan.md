# Zeebe deployability, session 3: one gate on every generator (plan)

Goal: every BPMN that BPMN Kit generates for Camunda 8 deploys on Zeebe. Incomplete input is
refused with a clear error by default; placeholders are an explicit opt-in.

## Gate API (TS `packages/core/src/bpmn/zeebe-validate/gate.ts`, Rust `bpmnkit_compat::zeebe::gate`)

```ts
interface AssertDeployableOptions extends ValidateDeployableOptions {
  /** Fill documented placeholder values instead of refusing (default false). */
  placeholders?: boolean
}
interface PlaceholderFill {
  elementId: string   // the element that got the value
  field: PlaceholderField // "jobType" | "messageName" | "correlationKey" | "signalName" | "errorCode" | "escalationCode" | "timer" | "calledElement" | "decisionId" | "condition" | ...
  value: string       // what was written
  rule: string        // the zeebe/* rule it satisfies
}
interface DeployableResult {
  definitions: BpmnDefinitions          // the input (no placeholders) or a filled copy (input never mutated)
  placeholders: PlaceholderFill[]       // empty unless placeholders: true
  warnings: OptimizationFinding[]       // non-error findings
}
function assertDeployable(defs, options?): DeployableResult   // throws DeployabilityError
class DeployabilityError extends BpmnSdkError {               // code "deployability-error"
  readonly findings: OptimizationFinding[]  // severity "error" only
  readonly camundaVersion: string
}
```

- The check is `validateDeployableXml(serializeBpmn(defs), options)`: the model rules plus the XML/XSD
  stage, so serializer bugs are caught too.
- Message (identical in TS and Rust; tests pin it):
  ```
  Not deployable on Camunda <version>: <n> error(s)
  - <elementId>: <zeebe message> (zeebe/<rule>)
  ```
  one line per error finding, in the validator's order. No suggestion text (keeps TS/Rust identical).
- Placeholders: one deterministic value per field, `placeholder-<elementId>` for names/ids/types,
  `="placeholder-<elementId>"` for a correlation key, `PT1H` for a missing timer duration,
  `=false` for a missing condition (never taken). Documented in the docs page and in `PLACEHOLDERS`.
  After filling, validate again; anything still failing throws.

## Behaviour change (decision: minor, as a fix, with an opt-out)

`@bpmnkit/core` 1.9 → 1.10 (minor). Generated output that Zeebe rejects was a bug; the opt-out keeps
old callers working.

- `Bpmn.export(defs, { validate })`: default `"auto"`: gate when the model targets Camunda 8
  (`modeler:executionPlatform="Camunda Cloud"`, version from `executionPlatformVersion`); otherwise no
  check. `"error"` gates regardless of platform; `"warn"` logs; `false` opts out. Editors exporting a
  work-in-progress diagram pass `validate: false`.
- Builder `build({ validate?: boolean = true, placeholders?, camundaVersion? })`, `DiagramBuilder.build`
  likewise. Generated models target Camunda 8, so the gate runs.
- `expand(compact, { validate?, placeholders?, camundaVersion? })`: gate on by default.
  Incremental callers (MCP state, editor ops) pass `validate: false` and gate their final output.
- process-text: `parseProcessText` stays tolerant; the gate runs at `expand`. A refusal surfaces
  as a `problems` entry where the caller reports problems.
- C7→C8 migration, connector templates, patterns, optimize auto-fixes, `compilePlan`: gate their result.
- Rust mirrors every default, option name (snake_case) and message.

## Builder rules (TS + Rust, clear errors before the gate)

- `branch()` after an exclusive/inclusive gateway needs `.condition()` or `.defaultFlow()`.
- `sendTask` / message `intermediateThrowEvent` / message `endEvent` need `taskType` (or a
  `publishMessage`, where Zeebe allows one).
- Ad-hoc agent: refuse the attribute combinations Zeebe forbids (e.g. `activeElementsCollection`
  with `zeebe:taskDefinition`).
- No chaining after `endEvent` (any later node in the same chain throws).
- Static FEEL refused where Zeebe needs an expression (conditions, correlation keys, ...): error
  that names the field and shows the `=` form.

## Compact / process-text expressiveness (TS + Rust; docs + grammar)

- Names and codes for message, signal, error and escalation events.
- Timer: duration, date and cycle.
- Sub-process start events.
- Call activity `calledElement` (process id) vs `job`.

## Known-undeployable list

Ends with only intentional cases (non-Camunda-8 models built with `validate: false`, round trips of
sources Zeebe rejects), each with a reason. Everything else must pass `pnpm zeebe:check`.

## Phases (sequential; each leaves every check green)

1. Gate API (TS + Rust), `Bpmn.export` default, error-message tests, changeset.
2. Builder rules and builder gate; re-record builder conformance; fix fallout in dependents.
3. Compact + process-text expressiveness and the `expand` gate; re-record.
4. Migration, connectors, patterns, optimize auto-fixes, `compilePlan`.
5. Callers: CLI, studio, proxy, MCP, AI paths, examples, docs snippets, landing docs.
6. Shrink `known-undeployable.json`, progress/features/docs, final report.
