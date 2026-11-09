# Conformance corpus

Shared fixtures that pin the behaviour of the TypeScript implementation so the Rust
implementation can be checked against it. TypeScript is the oracle: the expected values are
recorded from it, never edited by hand.

```sh
pnpm conformance:record   # rewrites every expected output from the TS implementation
```

CI runs the record step and fails on `git diff --exit-code conformance/`; the vitest suites
`packages/feel/tests/conformance.test.ts` and `packages/core/tests/conformance.test.ts` fail on any
drift. A Rust runner reads the same files.

## FEEL: `feel/<group>.jsonl`

One case per line:

```json
{"id":"<group>/<n>","expr":"...","context":{"<name>":<Value>},"expected":<Value>}
```

`context` binds variables for `expr`. `Value` is one of:

| Value | Meaning |
|---|---|
| `{"t":"null"}` | null |
| `{"t":"boolean","v":true}` | boolean |
| `{"t":"number","v":"1.5"}` | decimal string: no exponent, no trailing zeros, `-0` is `"0"` |
| `{"t":"string","v":"..."}` | string |
| `{"t":"date"\|"time"\|"date-time"\|"days-time-duration"\|"years-months-duration","v":"<ISO>"}` | the string FEEL's `string()` prints for the value |
| `{"t":"list","v":[Value]}` | list |
| `{"t":"context","v":{"k":Value}}` | context (keys sorted) |
| `{"t":"error"}` | parse or evaluation error, a non-finite number, or an unsupported type (range, function) |

Numbers: TS computes in float64, Rust (`bpmnkit-feel`) in exact decimals. The Rust runner
counts two numbers as equal when they are equal, or equal after rounding both to 15 significant
digits (what float64 always keeps), so `0.1 + 0.2` recorded as `0.30000000000000004` matches
Rust's `0.3`.

Seeded from the `@bpmnkit/feel` tests (evaluator, spec, Camunda extensions) plus hand-written
cases for dates and durations, `**`, contexts and filters. The DMN TCK is not on disk in this
repository, so none of its cases are included yet. Expressions that read the clock are excluded.

`fuzz.jsonl` holds the disagreements differential fuzzing found (see the end of this file),
one case per fix.

## BPMN: `bpmn/<case>/`

- `input.bpmn`: source, copied from `packages/core/tests/fixtures` (provenance there).
- `expected/model.json`: `parseBpmn(input)` as JSON, keys sorted, 2-space indent, trailing newline.
- `expected/roundtrip.bpmn`: `serializeBpmn(parseBpmn(input))`.

Provenance of the cases added from existing fixtures and samples (paths from the repo root):

| Case | Source |
|---|---|
| `bakeoff-expected` | `packages/core/tests/fixtures/bakeoff/expected.bpmn` |
| `bpmnlint-scopes-and-exemptions` | `packages/core/tests/fixtures/bpmnlint/scopes-and-exemptions.bpmn` |
| `compat-contents` | `packages/core/tests/fixtures/camunda-compat/contents.bpmn` |
| `compat-events` | `packages/core/tests/fixtures/camunda-compat/events.bpmn` |
| `compat-tasks` | `packages/core/tests/fixtures/camunda-compat/tasks.bpmn` |
| `c7-claim-handling` | `packages/core/tests/fixtures/camunda7/claim-handling.bpmn` |
| `c7-invoice-approval` | `packages/core/tests/fixtures/camunda7/invoice-approval.bpmn` |
| `miwg-a-2-1` | `packages/core/tests/fixtures/roundtrip/miwg-A.2.1.bpmn` |
| `miwg-a-4-1` | `packages/core/tests/fixtures/roundtrip/miwg-A.4.1.bpmn` |
| `miwg-b-1-0` | `packages/core/tests/fixtures/roundtrip/miwg-B.1.0.bpmn` |
| `miwg-b-2-0` | `packages/core/tests/fixtures/roundtrip/miwg-B.2.0.bpmn` |
| `miwg-c-1-0` | `packages/core/tests/fixtures/roundtrip/miwg-C.1.0.bpmn` |
| `miwg-c-10-0` | `packages/core/tests/fixtures/roundtrip/miwg-C.10.0.bpmn` |
| `miwg-c-2-0` | `packages/core/tests/fixtures/roundtrip/miwg-C.2.0.bpmn` |
| `miwg-c-3-0` | `packages/core/tests/fixtures/roundtrip/miwg-C.3.0.bpmn` |
| `miwg-c-5-0` | `packages/core/tests/fixtures/roundtrip/miwg-C.5.0.bpmn` |
| `miwg-c-6-0` | `packages/core/tests/fixtures/roundtrip/miwg-C.6.0.bpmn` |
| `miwg-c-7-0` | `packages/core/tests/fixtures/roundtrip/miwg-C.7.0.bpmn` |
| `miwg-c-8-0` | `packages/core/tests/fixtures/roundtrip/miwg-C.8.0.bpmn` |
| `miwg-c-8-1` | `packages/core/tests/fixtures/roundtrip/miwg-C.8.1.bpmn` |
| `miwg-c-9-0` | `packages/core/tests/fixtures/roundtrip/miwg-C.9.0.bpmn` |
| `miwg-c-9-2` | `packages/core/tests/fixtures/roundtrip/miwg-C.9.2.bpmn` |
| `engine-ad-hoc-tools` | `packages/engine/tests/cpt/fixtures/ad-hoc-tools.bpmn` |
| `engine-testing` | `packages/engine/tests/fixtures/testing.bpmn` |
| `eval-04-extend-add-timer-boundary` | `scripts/eval-generation/prompts/04-extend-add-timer-boundary/base.bpmn` |
| `layout-kyc-onboarding` | `apps/landing/src/data/layout-samples/kyc-onboarding.bpmn` |
| `layout-kyc-risk-classification` | `apps/landing/src/data/layout-samples/kyc-risk-classification.bpmn` |
| `layout-kyc-verification` | `apps/landing/src/data/layout-samples/kyc-verification.bpmn` |
| `layout-loan-prescreening` | `apps/landing/src/data/layout-samples/loan-prescreening.bpmn` |
| `layout-quote-to-cash` | `apps/landing/src/data/layout-samples/quote-to-cash.bpmn` |
| `sample-order-process` | `bpmn-samples/order-process.bpmn` |
| `sample-parallel-approval` | `bpmn-samples/parallel-approval.bpmn` |
| `flowable-lanes-pools` | `packages/core/tests/fixtures/roundtrip/08-flowable-lanes-pools.bpmn` |

Hand-written cases: `is-executable-false`, `is-executable-absent` (a process's `isExecutable` is
absent, `"true"` or `"false"`) and `compensation-subprocess` (`isForCompensation` on every
sub-process kind), `is-executable-xsd-boolean` (`1`, ` 0 ` and a non-boolean value) and
`lane-set-nested-legacy` (nested lanes as `@bpmnkit/core` up to 1.9.0 wrote them, in `<laneSet>`).

## Form: `form/<case>/`

- `input.form`: source form JSON.
- `expected/model.json`: `parseForm(input)` as JSON, keys sorted, 2-space indent, trailing newline.
- `expected/roundtrip.form`: `exportForm(parseForm(input))`, as written (no trailing newline).
- `expected/error.txt`: instead of the two above, when `parseForm` throws a `ParseError`: its
  message plus a newline. Cases named `error-*` all take this path. Only the messages of
  validation errors are pinned; V8's wording of a JSON syntax error is not, so none is recorded.

The recorder is `packages/core/tests/conformance-form.test.ts`; the Rust runner is
`crates/bpmnkit-conformance/src/form.rs`. Provenance of the cases seeded from existing forms
(paths from the repo root); the rest are written by hand to cover what the parser does with
every component type, unknown components and keys, odd JSON values and each error message:

| Case | Source |
|---|---|
| `docs-schema-example` | `packages/camunda-docspack/.llms/chunks/apis-tools.frontend-development.03-forms.02-embed-forms.01-concepts.the-form-schema.md` |
| `approval-modeler` | `FORM` in `packages/core/tests/form-preserving-writer.test.ts` |
| `drop-sample-minified` | `SAMPLE_FORM_JSON` in `apps/drop/tests/fixtures.ts` |
| `drop-demo-loan` | `DEMO_FORM` in `apps/drop/src/lib/demo.ts` |
| `user-tasks-widget` | `FORM` in `packages/user-tasks/tests/widget.test.ts` |
| `conditional-group` | `src` in `packages/core/tests/form/conditional.test.ts` |
| `builder-output` | the shape `FormBuilder` + `exportForm` produce (`packages/core/tests/form/builder.test.ts`) |
| `all-components` | one of every type in `spec/elements/form.json`, every modelled field set |
| `nested-group-dynamiclist` | hand-written: groups and dynamic lists three levels deep |
| `layout-variants`, `validation-variants`, `options-variants`, `display-components` | hand-written: valid and malformed values of the modelled fields |
| `unknown-components`, `unknown-keys`, `prototype-keys` | hand-written: types and keys the model does not know |
| `numbers`, `string-escapes`, `coercions` | hand-written: JS number printing, JSON escapes, `String(x)` coercions |
| `tab-indented-reordered`, `metadata-minimal`, `metadata-ignored` | hand-written: input formatting and root keys that differ from `exportForm` |
| `error-*` | hand-written: one per `ParseError` the parser can throw |

Known gaps (cases were left out rather than pending): a `layout: null` on an unknown component
makes TS `exportForm` throw a `TypeError`, a raw `extraProps` key on an unknown component is
spread character by character, and object keys that look like integers are reordered by JS. Rust
does not model these.

## DMN: `dmn/<case>/`

- `input.dmn`: source (provenance below).
- `expected/model.json`: `parseDmn(input)` as JSON, keys sorted, 2-space indent, trailing newline.
- `expected/roundtrip.dmn`: `serializeDmn(parseDmn(input))`.
- `expected/error.txt`: instead of the two files above, when `parseDmn` throws: the error message
  and a newline. Rust must fail with exactly that message. Cases that fail are named `error-*`.

Rust's `bpmnkit-dmn` model serialises to the same JSON as TS (absent optionals omitted, numbers by
value), so `model.json` is compared structurally; `roundtrip.dmn` byte for byte. Hit policy,
aggregation and type refs are raw strings in both. Quirks the cases pin (all replicated in Rust, not
fixed): an attribute is found by local name when no unprefixed one exists; `href="#"` reads as the
empty string and an empty `href` as absent; an information requirement without a reference is written
as `href="#undefined"` (and reads back as the id `undefined`); a decision's children the model does not
know (`literalExpression`, `variable`, ...) are kept as `extensionElements` only when the decision has no
`<extensionElements>` of its own; diagram numbers go through JS `Number()` (`" 0x10 "` is 16, a bad value is
`NaN`, written `NaN`) and `String(n)`; missing ids are reported in evaluation order of the TS object literals
(the `<definitions>` id and name last).

Provenance of the cases copied from existing sources (paths from the repo root); the others are
hand-written to cover one feature each:

| Case | Source |
|---|---|
| `loan-eligibility` | `packages/core/tests/fixtures/dmn/loan-eligibility.dmn` |
| `risk-score` | `packages/core/tests/fixtures/dmn/risk-score.dmn` |
| `preserving-writer-risk` | `XML` in `packages/core/tests/dmn-preserving-writer.test.ts` (has a comment) |
| `simple-table` | the "parses a simple DMN XML" input in `packages/core/tests/dmn.test.ts` |
| `wasm-runner-validate-order` | `DMN_XML` in `packages/engine/tests/wasm-runner.test.ts` |
| `reebe-collect-validation` | `apps/reebe/crates/reebe-engine/src/engine_integration_tests.rs` (COLLECT, line 798) |
| `reebe-two-collect-decisions` | same file, line 913 |
| `reebe-unique-multi-output` | same file, line 1224 |
| `reebe-first` | same file, line 1300 |
| `reebe-unique-short` | same file, line 1373 |
| `reebe-engine-collect` | `apps/reebe/crates/reebe-engine/src/tests.rs`, line 297 |
| `reebe-literal-greeting` | `DECISION` in `apps/reebe/crates/reebe-grpc/tests/variables.rs` (literal expression) |
| `builder-decision-table` | `Dmn.createDecisionTable(...)` with `resetIdCounter()`: two inputs, COLLECT, a rule description |
| `builder-drd` | `Dmn.drd(...)` with an input data and two decisions, `resetIdCounter()`, as in `dmn-drd.test.ts` |

Hand-written: `hit-policies` (every hit policy; COLLECT with each aggregation), `multi-io-rules`,
`drd-full` (input data, required decisions, BKMs, knowledge sources, authority requirements, text
annotations, associations, DMNDI with odd numbers), `prefixed-names` (`dmn:` element and prefixed
attribute names), `entities-cdata`, `extension-elements`, `modeler-attributes`, `empty-and-missing`,
and the `error-*` cases (missing ids, missing `inputExpression`, wrong root, no root, order of errors).
The reebe DMNs copied above all carry the ids TS requires; `error-missing-definitions-name` is the
`reebe-literal-greeting` document with its `name` removed, the shape reebe's own tests often use.

### Evaluation: `dmn/<case>/evaluate.json`

A case may also hold `evaluate.json`, a hand-written list of `{"decision": "<id>", "context":
{"<name>": Value}}` (values in the FEEL encoding above). `expected/evaluate.json` is recorded by
`packages/engine/tests/conformance.test.ts` from `evaluateDecisionGraph` (`@bpmnkit/engine`), one
entry per input: `{"result": Value, "evaluated": [{"decision": "<id>", "result": Value}]}`, or
`{"error": "<message>"}`. The Rust runner (`dmn/<case>/evaluate`) replays them through
`bpmnkit_dmn::evaluate_decision_graph`, numbers compared as for FEEL.

What it pins: every hit policy (an unknown one is null; no matching rule is null even for `COUNT`);
`COLLECT` aggregations over the first output's numbers only; output keys `name`, then `label`, then
`id`; required decisions evaluated once, before their readers, and bound by name; literal
expressions (kept in `extensionElements`); missing and cyclic requirements as errors; and that an
expression or entry with syntax errors still runs the tree the parser recovered (`x +` is `x`, an
entry with no tree matches anything). `eval-hit-policies` and `eval-drd` are written for this; the
other cases' inputs reuse their decisions.

## Tooling: `lint/`, `optimize/`, `compat/`, `migrate/`

Recorded by `packages/core/tests/conformance-tooling.test.ts`. Every case is a folder holding an
input and an optional `case.json`:

- `input.bpmn` (or `input.dmn` / `input.form` under `lint/`), or `case.json` `"input": "<path from
  conformance/>"` to reuse another case's input (e.g. `"bpmn/miwg-a-2-1/input.bpmn"`).
- `case.json` `"runs": {"<run>": <options>}`: one expected file per run, `expected/<run>.json`.
  Without `runs` there is one run, `default`, with `{}`.

All JSON is written with keys sorted, 2-space indent and a trailing newline; Rust compares it
structurally. A finding is `{id, category, severity, message, suggestion, processId, elementIds,
fixable}` plus `produces` / `consumes` / `bpmnlintRule` when TS sets them. Ids come from
`resetIdCounter()` (`bpmnkit_bpmn::ids::reset_id_counter()`), reset before every parse.

| Kind | Options of a run | `expected/<run>.json` |
|---|---|---|
| `lint/` (`.bpmn`) | `LintOptions` without functions; `bpmnlintrc` is a raw `.bpmnlintrc` object, passed as `resolveBpmnlintConfig(parseBpmnlintConfig(JSON.stringify(rc)))` | `lintDiagram(parseBpmn(input), options)` |
| `lint/` (`.dmn` / `.form`) | none | `{"findings": lintDmn(xml)}` / `{"findings": lintForm(json)}` |
| `optimize/` | `OptimizeOptions` without functions | `{"findings", "summary", "fixes"}`: `optimize(...)`, and for each fixable finding (by index) a fresh parse, `optimize`, then that finding's `applyFix`: `{"index", "id", "description", "xml": serializeBpmn(defs), "generated"?: serializeBpmn(generated)}` |
| `compat/` | `{"version"?: "8.6"}` (absent: the model's own) | `{"findings": analyzeCamundaCompat(defs, version)}` |
| `migrate/` | `{"direction": "7to8" \| "8to7", "options"?: Camunda7ConvertOptions}` (default `7to8`; `validate`, `placeholders`, `camundaVersion` reach the deploy gate) | `{"report"}` from `convertCamunda7` / `convertCamunda8To7`, and `expected/<run>.bpmn`: `serializeBpmn(result.definitions)` (none when the run throws). `pnpm zeebe:check` deploys every `7to8` `.bpmn` |

`migrate/juel.jsonl`: one `{"id": "juel/<n>", "juel": "...", "options"?: {...}, "expected":
<translateJuelToFeel result>}` per line; the recorder rewrites `expected`.

Details the table leaves open, as implemented:

- A run that throws records `{"error": "<message>"}` (the `convertCamunda7` refusal of a Camunda 8
  model or the deploy gate's `DeployabilityError`, a bad `.bpmnlintrc`). Rust compares the message.
- `migrate/` fragments (`c7mig-*`, `c7exp-009`, `ts-bug-*`: one rule, no start event) convert with
  `"validate": false` and are `deployable: false`; whole models keep the gated `default` run (which
  records the refusal) and add a `placeholders` run whose output must deploy.
- `connectorRequirements` (an option of `lint/` and `optimize/` runs) stands in for
  `resolveConnectorRequirements`: `{"<templateId>": ["key", ...]}`; the resolver returns the listed
  keys not among the bound ones, and a template id not in the table requires nothing. Without the
  option no resolver is passed, so no `connector/*` finding appears.
- `migrate/` with `"direction": "8to7"`: `convertCamunda8To7` has no counts, so
  `report` is `{"findings": [...]}`; for `7to8` it is the `Camunda7Report` (`findings`, `counts`,
  `total`).
- `lint/` `.dmn` / `.form` findings are `CheckFinding`s (`rule`, `severity`, `message`, `fix`,
  `elementId?`), not `id`-keyed.
- `plane`, `platform`, `categories`, `counts`, `total` and `bpmnlintUnsupported` come straight from
  `LintReport`; `bpmnlintUnsupported` is absent without a `bpmnlintrc`.
- `fixes` entries are recorded for every fixable finding of the full (unfiltered) report; the
  expected `xml` is `serializeBpmn` of the fixed fresh parse.
- Hand-written `.bpmn` inputs spell out `<bpmn:incoming>` / `<bpmn:outgoing>` on every flow node,
  because `packages/core/tests/node/bpmnlint-parity.test.ts` runs real bpmnlint over every `.bpmn`
  in the repository and bpmnlint reads those child elements. The TS parser also derives them from
  the flows.
- `migrate/juel.jsonl` lines are `{"id", "juel", "options"?, "expected"}`, one JSON object per line
  (keys inside `expected` sorted).
- Finding ids that no code path can emit are not covered: `compat/feel`, `compat/executable-process`
  and `compat/agent-tool-documentation` are plugin rules BPMN Kit answers with its own finding
  (`feel-syntax/parse-error`, `deploy/process-not-executable`, `agentic/tool-no-description`).

Runner case ids: `lint/<case>/<run>`, `optimize/<case>/<run>`, `compat/<case>/<run>`,
`migrate/<case>/<run>`, `juel/<n>`.

### Provenance of the tooling cases

Every `conformance/bpmn/<case>` is linted, optimized, compat-checked and (where it makes sense)
migrated through `"input"` references; nothing is copied.

| Cases | Kind | Source |
|---|---|---|
| `bpmn-<case>` | `lint/` | every `conformance/bpmn` case; runs `default` and `forced` (`forceEngineRules`) |
| `bpmn-<case>` | `optimize/` | the same cases, run `default`; left out where the recorded output would exceed ~100 KB (every fix carries a whole model): the large `miwg-*`, `compat-*`, `layout-quote-to-cash`, `bpmnlint-scopes-and-exemptions` |
| `bpmn-<case>` | `compat/` | the same cases at `default`, 8.0, 8.2, 8.5, 8.6, 8.8, 8.10; fixture-like cases (`compat-*`, `camunda-compat-*`, `zeebe-extensions`, `events-and-containers`, `root-elements`, `engine-ad-hoc-tools`) at 1.0 and every 8.x, `8.6.2` and `9.0` |
| `bpmn-c7-*`, `bpmn-camunda7-order-fulfillment` | `migrate/` | `7to8` (`default`, `v8-6`) and the `8to7` round trip |
| `bpmn-<case>-8to7` | `migrate/` | every other case, `8to7`, except `miwg-c-7-0` (see below) |
| `bpmn-<case>-7to8` | `migrate/` | a dozen neutral and Camunda 8 cases through `convertCamunda7` (`root-elements` records the refusal) |
| `dmn-<case>`, `form-<case>` | `lint/` | every `conformance/dmn` / `conformance/form` input |
| `opt-NNN-*` | `optimize/` | the models `packages/core/tests/optimize.test.ts` builds in code, serialized, one case per distinct model with every option set the test used |
| `lint-NNN-*`, `compat-NNN-*` | `lint/`, `compat/`, `optimize/` | the models of `lint.test.ts` and `camunda-compat.test.ts`, with the options (`version`, `bpmnlint`, `userTaskForms`...) of each call |
| `c7mig-NNN-*`, `c7exp-NNN-*` | `migrate/` | the Camunda 7 documents of `camunda7-migrate.test.ts` and the Camunda 8 documents of `camunda7-export.test.ts` |
| `juel.jsonl` | juel | the `TRANSLATED` / `REFUSED` tables of `camunda7-juel.test.ts`, the multi-instance counters, and edge cases (literals, escapes, operators, reserved words, mixed text, unbalanced input) |

The `opt-` / `compat-` / `lint-` / `c7mig-` / `c7exp-` numbers follow the order of the tests in the
file they come from when the cases were recorded; the case is frozen, not tied to the test.

Hand-written groups:

- `lint/platform-*`: one service-task model with and without a plane, with no platform, Camunda Cloud
  (with and without a job type or version), Camunda Platform, an unknown name, an empty name, a
  non-executable and an `isExecutable`-less process; runs cover `forceEngineRules`, `categories`,
  `userTaskForms: "off"`, `camundaVersion` and the thresholds.
- `lint/rc-*`: `.bpmnlintrc` configs (`bpmnlint:recommended` / `all` / `correctness`, numeric and
  mixed-case severities, `[level, options]`, `off`, plugin and unknown rules, an unresolved
  `extends`, `plugin:camunda-compat/camunda-cloud-X-Y` at several versions, per-rule
  `camunda-compat/*` overrides, `bpmnlintDelegated`) on the bpmnlint scopes fixture, a neutral and a
  Camunda 8 model.
- `lint/native-*`: one model per native bpmnlint rule (ad-hoc, conditional events, event-based
  gateways, `global`, link events, `no-bpmndi`, disconnected, duplicate flows, implicit split,
  overlapping and non-standard sizes, superfluous label / termination ...) with `error`, `off` and
  delegated runs for the rules it exercises, and the `all` / `recommended` presets.
- `lint/dmn-hand-*`, `lint/form-hand-*`: one document per `dmn/*` and `form/*` rule, and valid ones.
- `lint/connector-requirements`, `optimize/connector-requirements`: `connectorRequirements` tables.
- `optimize/fix-*`: every fixable finding (`feel/missing-default-flow`, `flow/dead-end`,
  `flow/multi-incoming-task`, `flow/redundant-gateway`, `task/reusable-group`, which also records the
  generated process) with and without diagram interchange, in nested scopes, on exclusive, inclusive
  and parallel gateways.
- `optimize/agentic-*`, `optimize/deploy-*`, `optimize/feel-syntax-everywhere`,
  `optimize/patterns-timers-annotations-parallel`: the `agentic/*`, `deploy/*`, `feel-syntax/*` and
  `pattern/*` findings the corpus does not reach.
- `compat/version-strings` (odd and unknown version strings), `compat/ad-hoc-gating`,
  `compat/listeners-*` (`beforeAll` / `cancel` execution listeners at every version).
- `migrate/options-platform-version`: `executionPlatformVersion` and the ignored `sourceXml`.

Known TypeScript defect, case left out: `convertCamunda8To7` throws `Cannot convert undefined or null
to object` (`stripForeignAttrs`) on a `bpmn:multiInstanceLoopCharacteristics` that has an `id`, as in
`bpmn/miwg-c-7-0`; the parser gives the loop no `unknownAttributes`. There is no `migrate/` case for
it until that is fixed.

## Validate: `validate/`

Recorded by `packages/core/tests/conformance-validate.test.ts`; the Rust runner is
`crates/bpmnkit-conformance/src/validate.rs`. Each case is a folder with `input.bpmn` (or `case.json`
`"input"`, a path from `conformance/`) and optional `case.json` `"runs"`; `expected/<run>.json` is
`{"findings": validateDeployableXml(input, options)}` (findings as in the tooling cases).

| Option of a run | Meaning |
|---|---|
| `camundaVersion` | Camunda version validated for; absent: the newest supported (`spec/zeebe-rules.json` `latestVersion`) |
| `limits` | `{maxIdLength, maxNameLength, maxWorkerTypeLength}` |
| `deployment` | `{processes, decisions, forms, resources}`: ids of the other resources of the deployment; stands in for the resolver |

- `z<NN>-bad*` / `z<NN>-ok*`: one negative and one positive case per rule of `spec/zeebe-rules.json`
  (`z140-bad` breaks Z140). A test fails when a rule with `check` other than `none` and no
  `coveredBy` lacks either, or no `-bad` case reports `zeebe/<name>`. Hand-written; each verified with
  `tools/zeebe-check` (rules newer than the Zeebe it pins were checked against Zeebe's source instead).
- `repro-*`: the 26 files of `doc/deployability/repro`, by reference.

### Agreement with Zeebe: `validate/zeebe-verdicts.json`

Real Zeebe's verdict (`tools/zeebe-check`, the version in its `pom.xml`) on every `.bpmn` under
`conformance/` and `doc/deployability/repro`, keyed by path, with the file's sha256 and Zeebe's errors.
`node scripts/zeebe-verdicts.mjs` rewrites it (needs Java 21 and the built tool);
`node scripts/zeebe-verdicts.mjs --check` fails when a file changed since (no Java needed). Both test
suites run `validateDeployableXml` with Zeebe's version and zeebe-check's 255-character limits on every
fresh entry and fail on a verdict they disagree with, except for the files `validate/undecidable.json`
lists with the reason. Stale entries are skipped and counted.

## Gate: `gate/`

Recorded by `packages/core/tests/conformance-gate.test.ts`; the Rust runner is
`crates/bpmnkit-conformance/src/gate.rs`. Each case is a folder with `input.bpmn` (or `case.json`
`"input"`, a path from `conformance/`) and `case.json` `"runs"`, each run the options of
`assertDeployable(parseBpmn(input), run)` (`camundaVersion`, `placeholders`). `expected/<run>.json` is
`{"error", "camundaVersion", "findings"}` when it throws a `DeployabilityError` (`findings` as
`"<rule> <elementIds>"`), else `{"placeholders", "warnings"}`; when placeholders were filled,
`expected/<run>.bpmn` is `serializeBpmn` of the filled model, compared byte for byte. `zeebe-check`
deploys every `gate/*/expected/fill.bpmn`, so a placeholder Zeebe rejects fails CI.

## Layout: `layout/`

Recorded by `packages/core/tests/conformance-layout.test.ts`; the Rust runner is
`crates/bpmnkit-conformance/src/layout.rs`. Every case is a folder holding an input and an optional
`case.json`:

- `input.bpmn` / `input.dmn`, or `case.json` `"input": "<path from conformance/>"` to reuse another
  case's input (as the tooling cases do).
- `case.json` `"runs": {"<run>": <options>}`: one expected file per run, `expected/<run>.bpmn` (or
  `.dmn`). Without `runs`, a BPMN case has `{"semantic": {}, "grid": {"engine": "grid"}}` and a DMN case
  has `{"default": {}}`.

Run options (all optional):

| Option | Meaning |
|---|---|
| `engine` | `"semantic"` (default) or `"grid"`: the `LayoutEngine` passed to `applyAutoLayout`. |
| `hints.grids` | `{"<adHocSubProcessId>": {"columns"?: n, "fill"?: "row" \| "column"}}`: `LayoutHints.grids` (a `Map` in TS). |
| `hints.annotationSides` | `{"<textAnnotationId>": "above" \| "below" \| "left" \| "right"}`: `LayoutHints.annotationSides`. |

Expected files: `serializeBpmn(applyAutoLayout(parseBpmn(input), engine, hints))`, or for `.dmn`
`serializeDmn(layoutDmn(parseDmn(input)))`, with `resetIdCounter()` called before the parse. A run that
throws records `expected/<run>.error.txt` (the message plus a newline) instead; Rust must fail with
the same message (a parse error counts, a panic does not). Runner case ids: `layout/<case>/<run>`.

Comparison: the serialized XML must match exactly, or be identical after aligning the values of the `x`,
`y`, `width` and `height` attributes, every pair of which differs by at most `LAYOUT_TOLERANCE`
(1.0 px, a `pub const` in `layout.rs`). Only those numbers may differ: ids, names, order and structure
are exact. The reason is that TS rounds every coordinate with `Math.round`, so a sub-pixel float
difference between the two implementations can flip a rounding by one pixel. The runner reports how many
runs match exactly and how many only within the tolerance (`layout: N exact, M within 1 px, K failed`);
a growing second number is worth a look even though it passes. `tests/layout.rs` names what differs for
each failing run.

Provenance:

| Cases | Source |
|---|---|
| `bpmn-<case>` | every `conformance/bpmn/<case>` input (`"input"` reference), default runs |
| `dmn-<case>` | every `conformance/dmn/<case>` input except the `error-*` ones, default run |
| `edge-lanes`, `edge-lanes-nested`, `edge-lanes-second-process` | one lane set with an empty lane and an element in no lane; nested `childLaneSet`; lanes in a second root process (its own plane). No collaboration: the lanes are drawn on the process plane, header at x 0 |
| `edge-pools-three`, `edge-pools-nine`, `edge-pools-black-box`, `edge-pools-annotations-only`, `edge-pools-annotations-black-box`, `edge-existing-di-collab` | 3 pools with message flows (pool ordering), 9 pools (the ordering heuristic), black-box participants, a pool holding only annotations, that pool next to a black box with message flows to it (black-box widening), a collaboration with DI and a collapsed sub-process |
| `edge-boundary-events`, `edge-boundary-subprocess-titled` | error / timer / escalation boundaries, interrupting and not, several on one task, on sub-processes (one with a long title) |
| `edge-subprocess-expanded`, `-collapsed`, `-nested`, `-event`, `-associations`, `edge-transaction` | expanded; collapsed through source DI `isExpanded="false"`; three levels; event sub-processes (interrupting and not); a sub-process annotation whose association would cut through a task (route repair); a transaction with a cancel boundary |
| `edge-adhoc-tools` | ad-hoc sub-process with unconnected tools, two linked ones and an annotation; runs `semantic`, `grid`, `grid-hint`, `grid-hint-column`, `annotation-sides`, `annotation-sides-above` |
| `edge-loops` | back edges, a self loop and nested retry gateways |
| `edge-gateway-exclusive`, `-parallel`, `-mixed` | default flow with labelled conditions; split / join with a fan; inclusive, event-based and complex gateways |
| `edge-annotations`, `edge-annotations-linked`, `edge-data-objects` | annotations with associations to nodes, a flow, several sources, no text and none at all (runs `semantic`, `grid`, `sides`); associations between two annotations, in a process and in a pool holding only annotations; data objects, references and a data store |
| `edge-multi-process`, `edge-empty-process`, `edge-empty-collaboration-process`, `edge-annotations-only-process`, `edge-disconnected` | processes without a collaboration; empty process / pool; a process with only an annotation; separate components and lone nodes |
| `edge-unicode-labels`, `edge-long-labels` | non-ASCII, emoji and astral characters (UTF-16 length); very long and empty labels |
| `edge-existing-di-labels`, `edge-existing-di-collab`, `edge-existing-di-duplicate-id`, `edge-existing-di-diagram-order` | existing DI with `BPMNLabelStyle`, label bounds, a colour attribute and `isMarkerVisible` (`keepDiAttributes`); source DI where two shapes (and two edges) share the id `X_di` of one of their elements; two root processes whose source diagrams are listed second process first (each keeps its own diagram and plane ids) |
| `edge-no-di-minimal`, `edge-no-di-no-ids` | a bare default-namespace model without DI; a model with no ids, which TS refuses to parse (`error.txt` runs) |
| `edge-event-types`, `edge-wide-fan` | one of each event / task kind in a row; an eight-way parallel fan |
| `edge-dmn-drd`, `-chain`, `-annotations`, `-existing-di`, `-empty` | DRD with decisions, input data, BKMs, a knowledge source and every requirement kind; a deep decision chain with shortcuts; annotations and associations; an existing `DMNDI`; a definitions element with no content |

The `edge-` inputs are hand-written XML (mostly without DI; the `existing-di-*`, `subprocess-collapsed`
and `no-di-*` ones are the exceptions), not copied from anywhere. They were then put through
`parseBpmn`/`serializeBpmn` with every flow node's `<incoming>`/`<outgoing>` filled in, as modelers
write them: `packages/core/tests/node/bpmnlint-parity.test.ts` lints every `.bpmn` file in the
repository with bpmnlint, which reads those children rather than the sequence flows. The two
malformed-on-purpose inputs (`edge-no-di-no-ids`, `edge-existing-di-duplicate-id`) are left out of
that walk.

Known TypeScript defects the recorded output pins down as it is (to fix later; fixing one means
re-recording and reviewing the diff): none at present.

Fixed since first recorded: a lane set in a process that is no participant's now gets lane shapes on
the process plane (the semantic engine already placed nodes in lane bands, so they were invisible
before; bpmn-js imports lane DI under a process root, and MIWG A.4.0 draws such lanes); an
association between two text annotations is now drawn.

## Builder: `builder/<case>/`

Recorded by `packages/core/tests/conformance-builder.test.ts`. A case drives the fluent builders
(`Bpmn.createProcess(...)`, `Bpmn.createDiagram(...)`, `Dmn.createDecisionTable(...)`, `Dmn.drd(...)`)
with a script of method calls, so the same file can be replayed by any implementation of the
builders. Files:

- `case.json`: `{"kind": "bpmn" | "dmn", "input"?: "<path>", "export"?: {"validate"?: "auto" | "warn" | "error" | false}, "script": [op, ...]}`.
  `export` (BPMN only) passes the built definitions through `Bpmn.export(defs, export)`
  (`bpmnkit_lint::export_bpmn`): a throw is recorded as `expected/error.txt`, a `console.warn` as
  `expected/warning.txt` (the message plus a newline) next to the usual outputs.
- `input.bpmn` or `input`: only for a script that starts with `["from", processId]` (below). `input`
  is a path relative to the case folder, or else to `conformance/` (several cases share
  `builder/from-noop/input.bpmn`).
- `expected/model.json` + `expected/output.bpmn` (`kind: "bpmn"`) or `expected/output.dmn`
  (`kind: "dmn"`): the definitions the script ends with, and `serializeBpmn` / `serializeDmn` of them.
  `model.json` is the usual encoding (keys sorted, 2-space indent, trailing newline), compared
  structurally.
- `expected/error.txt` instead of the three above, when a call throws: the message plus a newline.
  Exactly one of the two sets exists. TS throws at the call, so the ops after the failing one do not
  run; a Rust builder that records the first error and no-ops afterwards must report the same message.

`resetIdCounter()` (`bpmnkit_bpmn::ids::reset_id_counter()`) runs once, before the script. Auto ids
(`Flow_0000001`, `Decision Table` ids, ...) therefore depend on the order of the calls.

### Script language

An op is a JSON array `[method, ...args]`: call `method` with `args` on the current receiver; the
return value becomes the receiver, which is what chaining means. The initial receiver is the `Bpmn`
facade (`kind: "bpmn"`: `createProcess(id)`, `createDiagram(id?)`) or the `Dmn` facade
(`kind: "dmn"`: `createDecisionTable(id)`, `drd(name?)`). Method names and argument order are the
TypeScript ones (`serviceTask`, `withBoundary`, `restConnector`, `participant`, `messageFlow`,
`rule`, `decision`, ...); option bags are the TS option objects with their camelCase keys, passed as
the JSON value. `undefined` is never written: leave the key out.

| Form | Meaning |
|---|---|
| `{"$ops": [op, ...]}` as an argument | a callback `(b) => replay(b, ops)`: the ops run on the builder the method hands to its callback (`branch`, `subProcess`, `withBoundary`, `process`, a DRD `decision` table, ...) and the callback returns the last receiver. Callbacks nest. |
| `["$let", name, method, ...args]` | call `method` like any op, store the result under `name`, and **keep** the receiver. Needed where a method returns something that is not the builder: a DRD `decision(...)` / `inputData(...)` return a handle (`{kind, id, name}`). The ops of the DRD cases that create decisions and inputs are all `$let`. |
| `{"$ref": name}` as an argument | the value stored by `$let` (the handle). May sit inside arrays and option bags (`{"requires": [{"$ref": "risk"}]}`). |
| `{"$drgId": id}` as an argument | `drgId(id)`, the branded id. A plain string in `requires` is accepted too and behaves the same. |
| `["from", processId]` as the first op | `ProcessBuilder.from(parseBpmn(<input>), processId)`: continue a parsed document; the receiver is that builder, the rest of the script chains on it. `Bpmn.continueProcess` is the same call. |

The last op's result must be a definitions object (`["build", options?]`; for a DRD `build`, for a
decision table `build`). `build` takes the `BuildOptions` bag (`{"explicitJoins": true}`).

What the corpus pins (case-name prefixes): `task-*` (every task kind and option: headers, io mapping,
retries, listeners, forms incl. embedded, assignment, schedule, templates, multi-instance, message
tasks), `event-*` (every start / end / intermediate throw / catch event, link events), `root-*`
(message / error / signal / escalation roots, reuse and conflicts), `boundary-*`, `gw-*` (all gateway
kinds, branches, conditions, labels, default flows, flow ids, nested branches, join inference,
`explicitJoins`, `connectTo`, `element`), `sub-process-*` (sub-process, transaction, ad-hoc incl. agent
options and `toolGrid`, event sub-process), `data-*`, `annotation-*` (incl. `side`), `rest-connector-*`,
`meta-*` (`name`, `executable`, `versionTag`, `executionPlatformVersion`, `defaults`, id counter,
`withAutoLayout`), `from-*` (`at`, `insertAfter` on a parsed input), `diagram-*` (`DiagramBuilder`:
processes, participants, message flows, `Invalid collaboration:` errors), `dmn-table-*`, `drd-*`,
`xsd-*` (the build-time XSD checks: ids that are not NCNames, `retries` that are neither a whole
number nor FEEL, and a parsed document whose ids are left alone), `export-*` (`Bpmn.export`'s
`validate` option: off, warn, error, one and two deploy errors, a continued engine-neutral document).
`withAutoLayout` runs the semantic layout engine; there is no engine option on the builder.

Hand-written `.bpmn` input (`builder/from-noop/input.bpmn`) spells out `<incoming>` / `<outgoing>`
(`bpmnlint-parity` lints every `.bpmn`, including the recorded outputs: that is why builder cases keep
ids unique across scopes and avoid ids that are not valid XML names; the two `from-insert-after-arrow-in-id`
and `xsd-continue-keeps-invalid-ids` cases that need such ids are excluded there by name).

## Process text: `text/<case>/`

Recorded by `packages/core/tests/conformance-text.test.ts`. Three kinds of case, told apart by their
files. In all of them the id counter is reset with `resetIdCounter()` before the parse and again
before every `expand`.

**Parse**: `input.txt` (read byte for byte: CRLF, an empty file, no final newline all occur).

- `expected/result.json`: `parseProcessText(text)` as JSON, keys sorted: `{diagram, problems, fixes,
  questions, connectors}`. `diagram` is the `CompactDiagram` the parser produced (TS has no
  `definitions` field in the result; the model is derived from `diagram`). `problems` are
  `{line, message}`, `questions` carry `elementId`, `text`, `options` (`{label, change}`) and `draft`,
  `connectors` are the `with` lines (`{id, alias, args, values, line, elementId}`).
- `expected/output.bpmn`: `serializeBpmn(expand(result.diagram, options))`, or `expected/error.txt`
  (message plus newline) when `expand` throws. The diagram is always valid BPMN; since `expand`
  gates by default, an `error.txt` is a `DeployabilityError` for text that leaves out what Camunda 8
  needs (a correlation key, a timer's time). `options` is `case.json` `"expand"` (`{"validate"?,
  "placeholders"?, "camundaVersion"?}`), read for parse and stream cases; absent, the defaults.

**Stream**: `case.json` `{"chunks": ["...", ...]}`. Replay with `createProcessTextStream()`: `push`
every chunk in order, then `end()`. The id counter is reset **once** before the stream is created
and not between chunks (every non-null frame runs `expand` and consumes ids).

- `expected/frames.json`: an array with one entry per chunk: `null` when `push` returned `null`, or
  `"frame-<i>.bpmn"` (`i` = 0-based chunk index) when it returned definitions.
- `expected/frame-<i>.bpmn`: `serializeBpmn` of that frame.
- `expected/result.json` and `expected/output.bpmn`: the result of `end()`, encoded as for a parse
  case (the counter is reset before this `expand`).

**Write**: `input.bpmn`, or `case.json` `{"input": "<path>"}` relative to `conformance/` (e.g.
`bpmn/<case>/input.bpmn` or `text/<parse case>/expected/output.bpmn`, which the recorder produces
first). Replays `writeProcessText(parseBpmn(input))` with no options (`connectorLine` is not passed,
so no `with` lines are written).

- `expected/text.txt`: `text`, exactly as returned (no trailing newline added).
- `expected/written.json`: `{"aliases": {...}}`, alias to element id.
- `expected/error.txt` when the call throws (e.g. a document the writer rejects).

Case names: `parse-NNN-<slug>` are every distinct text the repository's own tests hand to
`parseProcessText` (`packages/core/tests/process-text*.test.ts`, `compact*.test.ts`, the Drop and
ai-local prompt examples they quote), numbered in the order the tests first call it; the other
`parse-*` cases are hand-written (every kind, trigger, gateway, attribute, `with` / `note` / `doc`
line, unicode, CRLF, loops, problems and questions). `stream-*` cases split the guide example and
other texts in lines, fixed sizes, single characters and mid-token. `write-bpmn-*` write every
`conformance/bpmn` input (lanes, pools, boundary events, sub-processes, data, all event kinds);
`write-parse-*` / `write-parsed-*` write what the parser built.

## Compact: `compact/<case>/`

Recorded by `packages/core/tests/conformance-compact.test.ts`. The kind of a case is told by its
input file; any `input.*` may instead be named by `case.json` `{"input": "<path>"}` (relative to the
case folder, else to `conformance/`, e.g. `bpmn/miwg-a-2-1/input.bpmn`). All JSON is encoded as in
the other corpora (keys sorted, 2-space indent, trailing newline). The id counter is reset before
the parse / `compactify` and again before the `expand`.

| Input | Replay | Expected |
|---|---|---|
| `input.bpmn` | `compact = compactify(parseBpmn(input))`, then `expand(compact)` | `compact.json`: `compact`; `expanded.bpmn`: `serializeBpmn(expand(compact))` (or `expanded.error.txt` if `expand` throws) |
| `input.json` (a `CompactDiagram`) | `expand(input)` | `model.json`: the definitions; `output.bpmn`: `serializeBpmn(defs)`; or `error.txt` (message plus newline) |
| `input.dmn` | `compact = compactifyDmn(parseDmn(input))`, then `expandDmn(compact)` | `compact.json`; `expanded.dmn`: `serializeDmn(expandDmn(compact))` (or `expanded.error.txt`) |
| `input.dmn.json` (a `CompactDmn`) | `expandDmn(input)` | `model.json`, `output.dmn`, or `error.txt` |
| `case.json` `{"chunks": [...], "base"?: <CompactDiagram or null>}` | `createCompactStream({base})` (no options when `base` is absent), `push` each chunk | `frames.json` and `frame-<i>.bpmn`, encoded exactly like a text stream (`null` or `"frame-<i>.bpmn"` per chunk) |

`case.json` `"expand": {"validate"?, "placeholders"?, "camundaVersion"?}` are the options of every
BPMN `expand` (`input.json` and `input.bpmn` cases; streams preview with `validate: false`). Absent,
`expand` gates: an `error.txt` / `expanded.error.txt` then records the `DeployabilityError`. Cases
that pin how a model Zeebe rejects expands (round trips of non-Camunda sources, element types
Camunda 8 does not run) pass `"validate": false` and say why in `deployableReason`.

`compactify` / `parseBpmn` / `parseDmn` failing records `error.txt` instead (none of the inputs does).
`expand` and `expandDmn` expand with auto-layout, so `output.bpmn` / `expanded.*` also pin the layout
of compact diagrams. `expandDmn` runs `layoutDmn`; a missing `requires` target throws a
`ValidationError`, whose message is the recorded text.

Case names: `bpmn-*` / `dmn-*` run every `conformance/bpmn` and non-error `conformance/dmn` input plus
a few hand-written `bpmn-hand-*` ones (default flows, multi-instance and boundary events, user task
assignment, link events, two processes); `expand-test-NNN` are the `CompactDiagram`s the repository's
tests pass to `expand` (numbered in order of first call; several are the error cases of
`compact-expand-validation.test.ts` and `compact-default-flow.test.ts`); `expand-*` /
`expand-error-*` are hand-written (every element and event type, notes, children, default-flow
errors, validation messages in one list); `dmn-expand-*`; `stream-*` replay the recorded model
stream (`tests/recordings/streamed-replace-diagram.json`) and hand-written fragments in chunks, with
and without `base`.

## `pending.json`

`{"<case id or bpmn/<case>>": "<reason or issue link>"}`: cases a non-TS runner knows it does
not pass yet. TypeScript never reads it.

## Differential fuzzing

`crates/bpmnkit-fuzz` generates inputs for seven targets (`feel`, `bpmn`, `dmn`, `dmn-eval`,
`form`, `text`, `compact`), answers each with the Rust crates and with the TS packages
(`scripts/fuzz/oracle.mjs`, one JSON request and answer per line), and compares them the way
this suite does. Proptest shrinks a disagreement to a minimal input and writes it, with both
answers, to `target/fuzz-mismatches/<target>-<seed>.json`.

```sh
pnpm --filter @bpmnkit/feel --filter @bpmnkit/core --filter @bpmnkit/engine build
pnpm fuzz --target all --seconds 60
pnpm fuzz --replay target/fuzz-mismatches/feel-42.json   # both answers, after a fix
```

It is looser than this suite in three documented places, all the number model rather than
defects: FEEL numbers (and the seconds of a duration, and digits printed by `string()`) agree
within float64 noise (relative 1e-12) instead of after 15-digit rounding; a number past
`rust_decimal`'s range (about 7.9e28) may be `null` in Rust, and one built from a very small
intermediate keeps fewer digits there (28 fraction digits, not 28 significant ones); and the text after
`Failed to parse form JSON: ` is each platform's JSON parser's own wording. `uuid()`, `now()`,
`today()` and `random number()` are not generated.

A real disagreement becomes a case here (FEEL: `feel/fuzz.jsonl`) and a fix on the wrong side,
with a regression test. The nightly workflow (`.github/workflows/fuzz-nightly.yml`) runs each
target for 10 minutes and uploads the mismatch files as artifacts.

