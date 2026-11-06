# Proposal: a Rust twin of BPMN Kit's core

Status: analysis only, updated 2026-11-06. Nothing implemented. Phase 0 measured (§11).

## TL;DR

- **Two implementations, one spec.** TS stays the implementation for JS: browser, Node, editor, studio and plugins. A Rust implementation is built next to it for Rust CLIs, reebe, desktop and proxy-rs. A shared conformance suite keeps the two in sync, and CI checks it on every PR.
- **Why not one Rust core plus WASM:** phase 0 measured WASM at 1.1–2.7× slower than TS for BPMN parsing and 1.4–8× slower for FEEL, mostly from moving data across the JS boundary. A Rust twin keeps JS at full speed and gives Rust users native speed. Native Rust is ~2× faster than WASM.
- **Scope of the twin:** BPMN, DMN and Form (model, parse, serialize, build), FEEL (parse, evaluate, generate), lint, layout, Camunda compatibility checks, and C7 migration.
- **Reebe** replaces `reebe-bpmn`, `reebe-feel` and `reebe-dmn` with the shared crates. It loses its FEEL gaps and can lint and serialize.
- **Cost:** about 35–47 person-weeks to reach parity. After that, about +30–60% on each feature in these areas, since each is built twice. Shared data and generated code keep the hand-written part small.

## 1. Why a twin

- **Speed (phase 0).** WASM loses to TS in JS hosts, and native Rust beats both. Each host should run its own language.
- **Duplication already exists, without checks.** FEEL, BPMN and DMN parsing are each implemented twice today, in TS and in reebe. Nothing compares them. Phase 0 found 3 of 32 FEEL expressions where they disagree. The twin plan keeps two implementations, but adds checks and shared data so the copies cannot drift unnoticed.
- **Rust users.** Rust CLIs and tools get the full feature set as normal crates, with no JS runtime and no Node.

## 2. Scope

| Area | Rust twin | TS only |
|---|---|---|
| BPMN | model, parse, lossless serialize (DI included), fluent builder, stable IDs, semantic hash | editor-time fine-grained model edits stay TS-only |
| DMN | model, parse, serialize, evaluate, layout | — |
| Form | model, parse, serialize, validate | rendering |
| FEEL | lexer, parser, evaluator, builtins, formatter/generator, token stream | highlighter UI |
| Tooling | lint + optimize, camunda-compat, C7 migrate + JUEL, auto-layout, process-text/compact | — |
| Data | connector templates, profiles (shared JSON, see §4.3) | — |
| Everything else | — | canvas, editor, ui, plugins, studio, operate, drop, vscode, landing, learn, cli (`casen`), proxy, worker-client |

## 3. Layout

```
conformance/                 shared cases: inputs + expected outputs (§4.1)
  bpmn/  dmn/  form/  feel/  lint/  layout/  migrate/  build/
  pending.json               Rust cases still pending, each with an issue link
  api.json                   operation list and which side implements it
spec/                        single-source data (§4.3), both sides generate code from it
  elements/  feel-builtins.json  lint-rules.json  compat-rules.json  templates/
crates/                      cargo workspace, MIT OR Apache-2.0
  bpmnkit-xml      span-preserving reader/writer
  bpmnkit-bpmn     model, parser, serializer, builder
  bpmnkit-dmn      model, parser, serializer, evaluator
  bpmnkit-form
  bpmnkit-feel     the single Rust FEEL; reebe uses it
  bpmnkit-lint     rules + optimize
  bpmnkit-layout   BPMN + DMN layout
  bpmnkit-compat   camunda-compat, c7 migrate + JUEL
  bpmnkit-text     process-text, compact
  bpmnkit          facade crate re-exporting the above behind features
packages/*                   unchanged TS packages
```

`apps/reebe` depends on `crates/*` by path. The crates are published to crates.io at the same version as the npm packages.

## 4. Keeping the two in sync

### 4.1 Conformance suite (the core mechanism)

- A case is a folder with an input (`.bpmn`, `.dmn`, `.form`, or FEEL rows in `.jsonl`) and expected outputs. Outputs are a canonical model JSON (sorted keys, schema in `spec/model.schema.json`), serialized XML, lint findings, layout coordinates, migrate output, and FEEL results.
- TS is the oracle. `pnpm conformance:record` writes the expected outputs from TS. Vitest checks TS against them, and `cargo test` checks Rust against them.
- Comparison: XML byte-equal, JSON deep-equal, layout coordinates within ±0.5 px. FEEL numbers are compared as decimal strings.
- Sources for cases: existing TS test fixtures, the DMN TCK, the Camunda FEEL parity suite, and every bug fix (one regression case each).

### 4.2 CI rules

- **conformance-ts:** if TS output for any case changes and the recorded files were not updated, CI fails.
- **conformance-rs:** every case must pass in Rust, or be listed in `pending.json` with an issue link.
- Moving a case into `pending.json` is the explicit "port later" decision, visible in the diff. A weekly job reports the age of pending entries. Entries older than the agreed limit (e.g. 30 days) fail the release.
- **api-parity:** `api.json` is generated from TS exports and a Rust `#[bpmnkit_api]` attribute. CI prints a table of missing operations and fails if one is missing from both `api.json` and the pending list.

### 4.3 One source for data

Store data once in `spec/` and generate code from it with a build step on each side:
- element and extension definitions (BPMN, Zeebe, DMN, Form), which give both models, parsers and serializers
- FEEL builtin signatures
- lint rule metadata (id, severity, message)
- Camunda compatibility tables
- connector templates (today a 96k-line `generated.ts`)

This removes the largest error-prone part from hand-porting. Only behaviour (evaluation, layout, rule logic) is written twice.

### 4.4 Differential fuzzing

- A nightly job generates random diagrams, DMN tables and FEEL expressions with fast-check and proptest.
- It runs them through both implementations: TS through Node, Rust through a small CLI test binary.
- Each disagreement is shrunk and saved as a new conformance case.

### 4.5 Ownership

- Each area has a named Rust owner.
- A TS PR may land with a pending Rust case. The owner ports it within the agreed limit.
- Without an owner the pending list grows and the twin loses value. This is the main process risk.

## 5. Reebe

- Replace `reebe-feel` with `bpmnkit-feel`. This fixes `**`, date + duration and datetime + duration, and puts reebe under the TCK.
- Replace `reebe-bpmn` and `reebe-dmn` with `bpmnkit-bpmn` and `bpmnkit-dmn`, keeping an execution view behind a feature flag.
- Deploy-time validation through `bpmnkit-lint` and `bpmnkit-compat`, with the same findings as the editor.
- `reebe-wasm` keeps serving `@bpmnkit/engine`. The size budget (500 KB gzip) stays.

## 6. Consumers

| Consumer | Uses |
|---|---|
| Browser, Node, Deno, Bun | TS packages, unchanged |
| Rust CLIs (yours, a future Rust `casen`) | `bpmnkit` crate from crates.io |
| reebe, proxy-rs, desktop (Tauri) | crates by path |
| Python (later) | PyO3 bindings over the crates |
| Other languages (later) | UniFFI or cbindgen over the crates |

No WASM build of the twin is planned. JS hosts already have TS.

## 7. Plan

| Phase | Work | Person-weeks |
|---|---|---|
| 0 Gate | done, §11 | — |
| 1 Harness | `conformance/` format, record script, cargo workspace, CI jobs (§4.2), relicense reebe as MIT OR Apache-2.0 | 3–4 |
| 2 Spec data | `spec/` folder and code generation for TS and Rust; switch TS to the generated code with no change in behaviour | 3–4 |
| 3 FEEL | `bpmnkit-feel` passes the TCK and parity cases; reebe switches to it | 3–4 |
| 4 BPMN I/O | xml, model, parse, lossless serialize; reebe-bpmn switches | 6–8 |
| 5 DMN + Form | model, parse, serialize, DMN evaluation; reebe-dmn switches | 4–5 |
| 6 Tooling | lint + optimize, camunda-compat, C7 migrate | 6–8 |
| 7 Layout | BPMN + DMN layout, coordinates within tolerance | 5–7 |
| 8 Builder + text | Rust builder with the same output as TS, process-text and compact | 4–5 |
| 9 Release | nightly fuzzing, crates.io publishing, docs | 1–2 |
| Later | Rust `casen` 12–20 (start with a plugin-bridge spike), proxy-rs parity 6–10, Python bindings | — |

Phases 1–9 come to about 35–47 person-weeks. Each phase ships on its own:
- After phase 3, Rust CLIs and reebe get FEEL.
- After phase 4, they get BPMN.
- Your Rust CLI can start on the crates after phase 4 and add features phase by phase.

## 8. Ongoing cost

- Each new feature in the twin's scope is built twice, adding about 30–60%. The spec data and the recorded cases keep it at the low end for model and schema changes. Logic changes such as new lint rules or layout tweaks cost the most.
- Maintenance cost of the harness and CI is about 1 day a month.

## 9. Risks

- **Drift through pending entries.** Mitigated by the age limit and the release gate (§4.2).
- **Canonical model JSON.** Both sides must emit the same shape, which can force small changes in the TS model export. Define it in phase 1.
- **Layout parity.** The float order of operations differs between JS and Rust. The ±0.5 px tolerance handles that; some cases may need algorithm notes in `spec/`.
- **Contributors.** Fewer people know Rust. Reebe gives some base.
- **License.** Reebe is Apache-2.0 today and has a single author. Relicense it to MIT OR Apache-2.0 in phase 1.

## 10. Decisions (2026-11-04/06)

1. Goal: both native tooling and JS performance. Met by the twin.
2. License: crates are dual `MIT OR Apache-2.0`.
3. Rust CLI: yes, after the core, starting with a plugin-bridge spike (a Node subprocess over JSON-RPC, or WASM components). TS `casen` stays until the Rust CLI matches it.
4. Strategy: twin with conformance sync (this document), replacing the "Rust core under a TS facade" plan of 2026-11-04.

## 11. Phase 0 results (2026-11-04)

Measured in scratch builds with Node 22. No tracked files changed.

**Size.** `reebe-wasm` with the size profile (`opt-level=z`, lto, `codegen-units=1`, `panic=abort`) plus `wasm-opt -Oz` is 1.04 MB raw, 395 KB gzip and 304 KB brotli. The current build is 630 KB gzip. `reebe_engine` is 26% of the code. FEEL is 6% and BPMN 4%.

**Speed:**

| Case | TS | WASM | WASM / TS |
|---|---|---|---|
| FEEL, 32 expressions, warm, TS parse cache on | 1.05 µs | 8.3 µs | 7.9× |
| FEEL, warm, no cache | 2.95 µs | 8.3 µs | 2.8× |
| FEEL, without context marshalling | 2.95 µs | 4.2 µs | 1.4× |
| BPMN 5 KB, model returned to JS | 52 µs | 103 µs | 2.0× |
| BPMN 65 KB, returned | 503 µs | 560 µs | 1.1× |
| BPMN 235 KB, returned | 1.48 ms | 1.74 ms | 1.2× |

- Native Rust is ~1.7–2× faster than WASM.
- WASM init takes 3–8 ms.
- FEEL results disagreed on 3 of 32 expressions: reebe has no `**` and no date or datetime + duration.
