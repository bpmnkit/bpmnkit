# AI Agent BPMN Bake-off — rerun (2026-10-18)

Two fresh agents rebuilt the same process with `@bpmnkit/core` after Phases A–C. This is the
rerun the analysis asked for (`doc/agent-bpmn-bakeoff-analysis.md`, "What do better means", item 4).

## Outcome

Against the report's BPMN Kit baseline (means of two runs): faster, fewer tokens, slightly closer.
All three targets are still missed. Cost could not be measured.

| Metric | Report baseline (BPMN Kit) | Rerun (mean of 2) | Change |
| --- | --- | --- | --- |
| Time to first passing gate | 172 s | 132 s (126 s without queue wait) | −23% |
| Total tokens | 158,788 (harness total) | 103,665 | −35%, see caveat below |
| Closeness | 85.4 | 87.3 | +1.9 |
| Layout (of 15) | 8.3 | 7.7 | −0.6 |
| Script lines | 55 | 95 | +40 |

Two runs per side. Treat every figure as indicative, not as a measured difference.

## Setup, and how it differs from the original

Same as the report:

- Spec: `exp/spec.md` from `HanselIdes/bpmn-js-cli`, branch `camunda-executable`. It is byte-identical to `packages/core/tests/fixtures/bakeoff/spec.md`.
- Gate: `c8ctl bpmn lint` with 0 errors (`@camunda8/cli` 4.5.0) plus the tutorial's CPT suite, 6 scenarios, on a Camunda 8.10.0 container.
- Scorer: `scorer/closeness.py` against `scorer/canon/canonical.bpmn`.
- Brief: "Use `@bpmnkit/core`. Ask `npx bpmnkit-docs` first", plus the done gate and log rules from the report's `common.md`. No tuning between the two trials.

Different:

- Agents were Claude Code subagents on the session's Sonnet model, not `claude -p` runs.
- One CPT run takes about 43 s here. The report saw 21–38 s per gate attempt. The gate is slower in this setup, which works against our time.
- Both trials started at the same second and CPT runs queue on a lock. bk3 waited 12 s.
- Only total tokens per agent are available. There is no split into input, cache write, cache read and output, so a dollar cost at the report's rates cannot be computed. Token totals are compared to the report's "harness total" column, and the two may not be counted the same way.
- Code state: branch `docspack/tag-field-ranking` at 87a5783 (Phases A–C).
- The external repo, spec and scorer were used from a scratch clone and are not vendored.

## Per-run results

| Run | Start to first passing gate | Queue wait | Gate attempts | First-attempt lint | Tokens | Agent wall time | Script lines | Closeness (S/C/A/L) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| bk3 | 154 s (142 s without queue) | 12 s | 2 | 2 errors (`no-bpmndi`) | 107,219 | 157 s | 84 | 86.9 (23.7/45.5/10/7.7) |
| bk4 | 110 s | 0 s | 1 | 0 errors | 100,110 | 118 s | 106 | 87.7 (25/45/10/7.7) |
| Mean | 132 s (126 s without queue) | | 1.5 | | 103,665 | | 95 | 87.3 |

S/C/A/L = structure, configuration, annotations, layout. bk3 scored 0.8 points below bk4 on the missing
process name and a small difference in the system prompt text. The `no-bpmndi` errors came from
an annotation made with `sub.annotate` inside the ad-hoc sub-process, which gets no diagram shape.

Reference: our committed fixture `packages/core/tests/fixtures/bakeoff/expected.bpmn` lints clean,
passes CPT 6/6 (100% process coverage) and scores 87.7 (25/45/10/7.7, mean shape offset 193.6 px).
bk4 scores the same as the fixture.

## Comparison with the report's methods

Report figures are means of two runs. The CLI was tuned over six iterations; ours were not tuned.

| Method | Time to gate | Cost | Tokens | Closeness | Layout | Script lines |
| --- | --- | --- | --- | --- | --- | --- |
| BPMN Kit, before (report) | 172 s | $0.77 | 158,788 | 85.4 | 8.3 | 55 |
| BPMN Kit, rerun | 132 s | not measured | 103,665 | 87.3 | 7.7 | 95 |
| CLI, tuned (report) | 113 s | $0.47 | 117,645 | 89.6 | 9.5 | 63 |
| /camunda-bpmn (report) | 164 s | $0.61 | 133,216 | 89.0 | 9.5 | n/a |
| Python (report) | 169 s | $0.56 | 124,235 | 87.1 | 8.2 | n/a |

Limits on this table: different agent harness, a slower gate (43 s against 21–38 s), two runs per
row, and token counts that may not be comparable. The rerun's token total is below every report row, and its time is faster than every report row except the tuned CLI (113 s). Do not read it as a ranking.

## Targets check

| Target | Rerun | Met |
| --- | --- | --- |
| ≤ 100 s to first passing gate | 132 s mean; best run 110 s | No |
| ≤ $0.45 | Not measurable (totals only) | Unknown |
| Closeness ≥ 90 | 87.3 mean; best run 87.7 | No |

Time missed by 32 s on the mean, and by 10 s on the best run. The slower gate is part of it: with
one CPT run at about 43 s, a first-attempt pass leaves little room under 100 s. Cost is not a miss
we can claim or deny; we have no figure. Closeness missed by 2.7 points on the mean.

## Where the closeness points go

Both runs and the fixture lose the same points, except bk3's process name.

- Template defaults written by `applyTemplates` that the canonical omits: `followRedirects`, `documentReturnFormat.choice` on 4 tools, `provider.openai.api.responses.effort` on the agent. The report says every method lost these.
- `ignoreNullValues=false` on the 4 GET tools is in the canonical. HttpJson v18 offers it only for POST, PUT and PATCH, and `applyTemplates` reports it as a problem.
- FEEL written without parentheses (`if count(...) > 0` against the canonical `if (count(...) > 0)`, and `if is defined(x)` against `if (is defined(x))`). This is a spec-wording and style difference. The report notes it for every method.
- Layout 7.7 of 15, mean shape offset 194 px from the canonical. The report had BPMN Kit at 8.3 and the CLI at 9.5.
- bk3 only: the process name is missing, and the system prompt text differs slightly.

## Friction the agents reported

- Both: `c8ctl element-template get-properties` needed a cache that was not present. Both dumped template property ids with `getTemplate()` from `@bpmnkit/core/connectors`. Neither used `casen connector show --condensed`, because casen was not built in the sandbox.
- bk3: `sub.annotate` inside the ad-hoc sub-process produced no diagram shape, so lint failed with `no-bpmndi` and the agent needed a second gate attempt. It fixed this by annotating on the process builder. This is the known deferred minor from Task 4.
- Both: annotations can only go above or below. "Left of the agent" and "right, below the user task" cannot be requested.

## Proposed follow-up tasks

None of these is implemented. Each is a candidate task.

- (a) Give sub-process annotations a diagram shape. It cost bk3 a gate attempt (bk3 took 44 s longer than bk4).
- (b) Support left and right annotation sides. The spec words positions that the builder cannot express.
- (c) Add an option for `applyTemplates` to leave out unchanged template defaults. These cost configuration points in both runs and the report says every method lost them, so the effect is report-wide.
- (d) Question: how should `ignoreNullValues` on GET be handled? The canonical has it and the HttpJson v18 template does not offer it for GET. Options include leaving it out and accepting the loss, or a documented override. This needs a decision before any change.
- (e) Make the template-key lookup easier to find. Both agents fell back to `getTemplate`. Consider pointing the recipe at a `casen connector show --condensed` that works without a build, or documenting the `getTemplate` route.
- (f) Improve layout closeness. The mean shape offset is 194 px and layout scores 7.7 of 15, below the report's 8.3.
- (g) Re-measure with a dollar cost breakdown (input, cache write, cache read, output) and more than two runs per side, so cost and time can be compared with the targets.
