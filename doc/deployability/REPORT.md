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
