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

## Phase 1 decisions (2026-11-08)

- `Bpmn.export` "auto" treats any `modeler:executionPlatform` containing "cloud" (case-insensitive) as Camunda 8, as `targetCamundaVersion` already does; an unparseable `executionPlatformVersion` is checked as the newest version.
- `"error"` now throws `DeployabilityError` (a `BpmnSdkError`), not `ValidationError`; `"warn"` logs the `DeployabilityError` message. Rust's `export_bpmn` returns the `DeployabilityError` as its `Err`.
- A message created for a missing `messageRef` on a catching element gets its `zeebe:subscription` at once, keyed `="placeholder-<elementId>"` on the catching element, so the key does not repeat the generated message id. Process-level message starts get no subscription.
- Rust's `Deployable.definitions` is a `Cow`: borrowed when nothing was filled.
- `compilePlan` / `mergePlan` export with `validate: false` until phase 4 gates them (they already report deploy errors as `problems`).

## Phase 3 decisions (2026-11-08)

- `expand` writes `modeler:executionPlatform="Camunda Cloud"` on gated output, so a later `Bpmn.export` "auto" agrees, but no `executionPlatformVersion` unless the diagram names one: the version checked is then the newest, the same one export picks. `validate: false` writes no platform (unless the diagram names a version), so an ungated preview is not gated on export either.
- A deployability refusal surfaces at `expand`, not in `parseProcessText`: the parser's result already reports what it changed, and the gate belongs where the model is built. Callers that report `problems` report the `DeployabilityError` alongside.
- Process-text repairs stay deterministic and identical in Rust: the id stands in for a missing message name, message throw/end job type, signal name, thrown error/escalation code and called process, as it does for `job=`. A correlation key and a timer's time have no stand-in; the gate names them. Caught errors and escalations without a code stay catch-alls.
- Compact cases that pin how a non-Camunda-8 model expands (round trips of rejected sources, cancel/compensate boundaries, complex gateways, transactions, an empty process) use `case.json` `"expand": {"validate": false}`; text cases written by a model without a key or timer time record the gate's error, with the parser's repairs still pinned in `result.json`.

## Phase 4 decisions (2026-11-08)

- Migration: the gate runs on the converted model and throws; the report is not attached to the error. `analyzeCamunda7` never gates, so callers (the CLI) get the report of a refused model from it. Placeholder fills are `manual` findings (construct `placeholder <field>`) and `Camunda7Conversion.placeholders`. Gate version: `camundaVersion`, else `executionPlatformVersion`, else 8.10.0.
- Connector templates report deploy errors as problems instead of throwing: they already return a model with problems and run on unfinished diagrams, so only the applied elements (and the message an inbound template writes) are checked. Builder-option functions (`applyElementTemplate`, `applyConnectorTemplate`) are gated by `build()`.
- `compilePlan` / `mergePlan`: a refused model has no `xml`; the reasons are `problems` (`element:<id>`). `mergePlan` gates the merged model, not the delta.
- Pattern compact templates were made deployable and expand gated. Conformance `migrate/` fragments convert with `validate: false` and are `deployable: false`.

## Phase 5 decisions (2026-11-08)

- A final artifact (written, downloaded, shared, deployed, or returned as "the result") passes the gate; work in progress (editor saves, previews, streamed frames, renders, MCP state between calls) uses `validate: false` with a comment. No `validate: false` from phases 1–4 named phase 5; each was reviewed and stays work in progress (editor, tabs, storage, checkpoints, command palette download of the user's own diagram, optimize plugin, desktop/landing editors, Drop doc/viewer/watcher, markdown, CLI `lint --fix` and `connector` write-backs of the user's file) except the proxy's `/improve` result, now gated.
- New `assertDeployableXml(xml, options)` (TS + Rust `assert_deployable_xml`): the gate on bytes a caller did not serialize (a file to deploy, a model's answer). Version: the option, else the document's `executionPlatformVersion`, else the newest.
- AI loops: the gate's message is the feedback. The proxy's MCP tools add a second content item with the deploy check after every change (TS server and the Rust/QuickJS bridge); `/chat` and `/improve` then gate the final diagram: `error` event with the gate's message, no `xml`. No loop had a retry budget to extend. Opt-ins in the request body: `placeholders: true`, or `validate: false` for a draft (XML plus a `deployability` event). Studio's AI panel, command palette and on-device AI ask for drafts and show the message; the deploy pane decides with the gate.
- CLI: `generate bpmn` refuses (exit 1, nothing written) with `--placeholders` / `--no-validate`, as `migrate c7`; a patched `--input` file follows `Bpmn.export`'s "auto". `deploy` gates `.bpmn` files with `--no-validate`; `check --deploy` adds the gate's findings on the file's bytes that the lint did not already report on that element.
- Drop: the draft renders always (gated expand, else ungated). `readiness` folds the gate in: what a placeholder fills is `shape-only` (with `gate.fillable`), anything else `invalid`; the check row shows the gate's lines and a **Fill placeholders** action. Share is gated; **Open in editor** is not (the editor is where a draft is finished); connect returns the draft ungated (its deploy errors are already problems).
- Definitions-level `<bpmn:documentation>`: Zeebe refuses it (repro `z00_definitions_documentation.bpmn`, same message as the XSD stage), and the validator already did. The serializer (TS + Rust) now writes it inside a bare `<bpmn:extension>` (Zeebe accepts that) and the parser reads it back, so round trips keep it; `bpmn/root-elements` deploys and lost its `deployable: false`.
- Found on the way: the QuickJS bridge bundle (`--global-name=Bridge`) overwrote `globalThis.Bridge` with `undefined`, so the Rust proxy's bridge had no functions; QuickJS has no `structuredClone` (placeholder fills); the MCP state laid out diagrams without declaring `bpmndi`/`dc`/`di` when started from XML without DI. All fixed. Four `casen generate` templates and two learn glossary snippets did not deploy (or build); fixed.

