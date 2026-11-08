# Zeebe deployability: gap report and plan (2026-11-08)

Goal: every BPMN that BPMN Kit generates must be valid and deployable on Camunda 8 (Zeebe).

Decision (2026-11-08): when the input is incomplete (for example a missing job type), generation refuses with an error by default. Placeholders are an explicit opt-in.

## Files
- `zeebe-rules.md`: 193 Zeebe rejection rows (189 real rules) from camunda/camunda@9702d8cd (8.11-SNAPSHOT), with file:line.
- `gap-matrix.md`: the per-rule matrix (P = prevented at generation, D = detected by a guard, M = missed, `~` = partial), the top misses with repros, and the serializer bugs with file:line.
- `ts-paths.md` / `rust-paths.md`: the TS generation paths (25) and Rust paths, the guards, reebe's deploy validation, conformance and CI.
- `repro/`: 26 hand-written BPMN files, one per rule (`zNN_*.bpmn`), and `zcheck-output.txt` with Zeebe 8.9.28's verdict on each.
- `tools/zeebe-check/`: the Java CLI that runs Zeebe's own `BpmnValidator` on files. It checks parse, XSD, design-time, runtime/FEEL and length rules. See its README.

## Result: real Zeebe 8.9.28 on generator outputs in `conformance/`
- builder `expected/output.bpmn`: 51/182 rejected
- process-text `expected/output.bpmn`: 37/236 rejected
- compact `expected/{expanded,output}.bpmn`: 74/111 rejected
- `bpmn-samples/`: 2/2 rejected

Some rejected cases are deliberately incomplete. Most are gaps.

## Counts (189 rules)
- P 10, P~ 19, D 1, D~ 90, M 69. M by kind: 51 static, 14 feel, 4 context.
- No guard runs automatically on any generation path.
  - `Bpmn.export` has `validate` off by default.
  - `lintDiagram` drops the deploy, connector, agentic and compat rules when there is no `executionPlatform`.
  - `deploy/*` checks the top level only.
- TS and Rust guards are in parity.

## Serializer/XSD bugs (TS and Rust)
- (a) `xsi:type` is written without `xmlns:xsi`, so the XML is not well-formed. Affects 11 cases.
- (b) `dataInputAssociation` has no `targetRef`.
- (c) `isCollection` is written on `dataObjectReference`.
- (d) Compact `linkEventDefinition` has no `name`.
- (e) No `zeebe:subscription` when `correlationKey` is omitted.
- (f) Compact and C7 conditions are copied without `=`.

`gap-matrix.md` has file:line for each.

## Recommendation
- One `assertDeployable` gate on every generation path. Targeting Camunda 8 implies it, without depending on `executionPlatform`. It recurses into sub-processes and refuses to return the XML on errors.
- A static `zeebe/*` rule set generated from `spec/zeebe-rules.json` in TS and Rust, pinned by conformance cases.
- A blocking CI job runs `tools/zeebe-check` (Zeebe version pinned, ideally 8.6 to latest) on every generator and fuzz output. It asserts that each case marked deployable passes, and that BPMN Kit's verdict matches Zeebe's.
- A nightly real-broker deploy in Docker, to cover the straight-through-loop and deployment-binding checks.
- reebe's validator is a subset of Zeebe's (no XSD, duplicate-id, FEEL, correlation-key or event-based-gateway checks). It should reuse the shared Rust validator.

## Session plan (1, 2 and 4 independent; 3 after 2)
1. **Serializer bugs and the CI oracle.**
   - Fix bugs (a)–(f) in TS and Rust.
   - Add a `tools/zeebe-check` CI job over the conformance outputs.
   - Mark intentionally incomplete cases `deployable:false`.
   - Done when: zero parse/XSD rejections and a regression case per bug.
2. **Static Zeebe validator.**
   - `zeebe/*` rules from `spec/zeebe-rules.json`, in TS and Rust: recursive, version-aware, not gated on `executionPlatform`.
   - Fix `compat/no-expression`.
   - Done when: it agrees with zeebe-check on the corpus and the repros, with a conformance case per rule.
3. **Gate and fix every generator.**
   - `assertDeployable` on the builder, expand, process-text, migration, connectors and patterns, and on the CLI, studio, proxy, MCP and `compilePlan`.
   - Generators refuse incomplete input by default, with placeholders as an opt-in.
   - Builder: `branch` requires a condition or a default, send tasks need a job type, the ad-hoc agent attribute combinations are rejected, and chaining after `endEvent` is refused.
   - Compact and process-text: names and codes, all three timer kinds, link names, sub-process starts.
4. **Real broker and reebe.**
   - A nightly Docker deploy across several Camunda versions.
   - reebe adopts the shared validator.

## Validator gaps (session 2, 2026-11-08)

`validateDeployable` / `validateDeployableXml` (TS) and `bpmnkit_compat::zeebe` (Rust) agree with Zeebe 8.9.28 on all 1,596 BPMN files in `conformance/` and the repros (file verdicts; 1,644 of 1,665 Zeebe errors matched by message). What they do not decide, or decide differently:

- **Not decidable from one BPMN** (`check: "none"` in `spec/zeebe-rules.json`, each with a note): Z35 straight-through loop (after BpmnValidator; `compat/no-loop` covers it), Z47 timer date range, Z92 empty retries (Zeebe's model turns it into 3), Z109/Z166 transformer failures, Z180, deployment-level Z181/Z182/Z184-Z186, broker state Z187-Z189, other resource types Z191-Z193, and the non-rules Z36/Z97/Z131/Z190.
- **Only with a resolver**: Z111, Z118, Z130, Z136 (`bindingType="deployment"` targets) and Z183 (duplicate process id across resources). zeebe-check runs one file at a time, so these are checked against Zeebe's source only.
- **Rules newer than 8.9.28** (`since` 8.10: Z34, Z38, Z101, Z102, Z107, Z108, Z111-Z113, Z128, Z153, Z178, and the 8.10 entries of Z33/Z94): taken from camunda/camunda `main`; each case has an 8.9 run showing no finding. `since` values before 8.9 come from reading the sources and the compat tables, not from running older Zeebe versions.
- **Transformer-only**: Z68 (evaluated message-start name length) is reported, but zeebe-check does not run the transformer, so `z68-bad` is listed in `conformance/validate/undecidable.json`.
- **Message differences, same verdict**: FEEL parse failures give `failed to parse expression '<expr>'` without feel-scala's detail. When Zeebe prints only the runtime error for an element (missing `correlationKey`, `processId`, `decisionId`, job `type`, script), the validator also reports the design-time rule (Z64, Z91, Z99, Z126, Z133). Z48 on an `attachedToRef` that is not an activity (Zeebe throws a ClassCastException). Z183 cannot name the other resource.
- **FEEL parser**: `@bpmnkit/feel` accepts some expressions feel-scala rejects (e.g. `=x >`), and has no backtick names, so a secret reference written `camunda.secrets.\`a-b\`` is missed by Z108. Process-level timer start events with a FEEL value are only parsed, not evaluated.
- **TS/Rust**: Z67/Z76 decide "could not be evaluated without context" in TS by watching variable lookups and in Rust by an AST walk, which counts `if true then 1 else x` as touching `x`; no case hits it. A file whose only problem is an attribute with no name gets `processId` `""` in Rust and the first process in TS (Rust's XML scanner is stricter).
- **Parser**: a `definitions` element without an `id` is refused by BPMN Kit's parser (reported as a parse failure); Zeebe accepts it.
- **Lint**: `zeebe/*` findings are left out of lint on elements another `deploy` error (a `deploy/*` or `compat/*` finding) already flags; `validateDeployable` reports them all.
- **reebe** (session 4): deploys run `validate_deployable_xml` with a resolver over the deployment's other resources, so reebe decides Z111/Z118/Z130/Z136 for processes and decisions and Z183 (naming both resources, as Zeebe does). It adds Z35 from `compat/no-loop`, which follows `bpmn:incoming`/`bpmn:outgoing`, and accepts a `definitions` without `id`. Forms and other resource types stay undecided, because reebe cannot deploy them. Not in reebe-wasm (size budget).
- **Broker-only checks**: `zeebe-broker-nightly.yml` deploys the corpus and `doc/deployability/broker-repro/` (Z35, Z130, Z183) to real 8.6/8.7/8.8/8.10 engines, which covers what zeebe-check cannot run. The Z35 repro assumes the broker's straight-through-loop detector is on by default.

## Result of session 3 (2026-11-08): one gate on every generator

- One gate: `assertDeployable(defs, { camundaVersion?, placeholders? })` / `assertDeployableXml` (TS) and `bpmnkit_compat::zeebe::assert_deployable` (Rust) throw `DeployabilityError` with one line per Zeebe error; `placeholders: true` fills the documented values and reports them. Docs: `apps/landing/src/content/docs/guides/deploy-gate.md`; decisions per phase: `gate-plan.md`.
- Every generator goes through it by default: builder `build()`, `expand`, process text (at `expand`), C7→C8 migration, connector templates (`not-deployable` problems), patterns, optimize fixes, `compilePlan`/`mergePlan`, `Bpmn.export` ("auto" when the model targets Camunda 8), and the CLI, proxy, MCP, studio, Drop, demo and examples callers. `validate: false` is the opt-out, used only for work in progress and render-only output, each with a reason.
- Zeebe 8.9.28 rejections (`pnpm zeebe:check`), before session 3 → after:
  - builder 43/183 → 30/185;
  - process text 36/236 → 0/223;
  - compact 72/113 → 40/119;
  - bpmn round trips 38/51 → 37/51;
  - migrate (newly checked) 83/100 → 63/89.
- Every rejection left is an intentional case (`deployable: false` + `deployableReason` in its `case.json`): models with elements Camunda 8 does not support (complex gateway, transaction, compensation pairs), fragments built with `validate: false` to pin a generator's shape, and round trips of sources Zeebe itself rejects. `known-undeployable.json` is empty (107 → 0) and stays shrink-only.
