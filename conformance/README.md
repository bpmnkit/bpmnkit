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

## `pending.json`

`{"<case id or bpmn/<case>>": "<reason or issue link>"}`: cases a non-TS runner knows it does
not pass yet. TypeScript never reads it.
