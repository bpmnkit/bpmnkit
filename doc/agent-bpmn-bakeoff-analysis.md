# AI Agent BPMN Bake-off — analysis

Source: "AI Agent BPMN Bake-off" (15–16 Oct 2026, Sonnet 5.5 trials, external author). Four
methods rebuilt Camunda's "AI Agent Chat With Tools" process from one 6.6 KB spec; the gate
was Camunda lint with 0 errors plus the tutorial's 6 tests. Raw runs, scorer and spec:
`HanselIdes/bpmn-js-cli`, branch `camunda-executable`, folder `experiments/ai-agent-bpmn`.

## Result for BPMN Kit

| Metric | BPMN Kit | Best | Gap |
| --- | --- | --- | --- |
| Time to first passing gate | 172 s | 113 s (CLI) | +52% |
| Estimated cost | $0.77 | $0.47 (CLI) | +64% |
| Closeness to blueprint | 85.4 | 89.6 (CLI) | −4.2 |
| Layout (of 15) | 8.3 | 9.5 | −1.2 |
| Thinking share of time | 65% | 35–50% | — |
| Cache reads | 3.0 M | 1.3 M | 2.3× |

Passed the gate first time in both runs and was the most consistent (deterministic layout).
It lost on everything an agent pays for: time spent working out *how* to express things.

The runs went through "the ProcessOS path" (an external Camunda product with its own guide):
the `@bpmnkit/core` builder, then `c8ctl element-template apply` for connector values. They
did not use drop. Drop's own <8 s figure is a different product: it gives a shape only (see
section 4).

## Root causes, verified in this repo

### 1. The builder cannot say what the spec says (lost closeness)

| Spec requirement | Builder today | Where |
| --- | --- | --- |
| Start event form `formId` | Missing. `StartEventOptions` has no `formId` | `packages/core/src/bpmn/bpmn-builder.ts:66-88` |
| User task input mapping | Missing. `UserTaskOptions` has no `ioMapping` | `bpmn-builder.ts:136-160`, factory `makeUserTaskEl` ~818 |
| Flow labels "Yes"/"No" | The branch id *is* the label (`name: this.branchName`); no separate label | `bpmn-builder.ts:1226`, `:1257` |
| Explicit flow ids | Missing; all flows renamed by `assignStableFlowIds` | `src/bpmn/stable-ids.ts` |
| Element templates in the build | Partial: options can stamp `modelerTemplate*` but not resolve a template's values. `applyTemplateToElement` exists in `@bpmnkit/core/connectors` but the agents never found it | `src/connectors/apply-element.ts:329` |
| AI Agent sub-process **v2** | `buildAiAgentSubProcess` emits the old **v1 job-worker** shape, no template stamp; its doc example ignores `id` | `src/bpmn/agentic.ts:19,176,180-221` |
| 2 × 2 tool grid, users/recipes left | Grid is row-major in creation order; agent had to reorder calls | `src/layout/semantic/place.ts` (`placeGrid`) |
| Annotation 3 below the user task | Side picked automatically; no hint | `src/layout/annotations.ts:99` (`naturalSide`) |

Shell-quoting the template values through `c8ctl` also broke the system prompt (a literal
`\n` instead of a newline). Writing values as JS strings to `applyTemplateToElement` avoids
that class of bug entirely.

### 2. The agent could not find the answers (lost time and cost)

- `npx bpmnkit-docs ask …` from the repo root prints "No documentation packages found": the
  CLI only resolves `node_modules/@bpmnkit/*docspack`, and the root does not link it. The
  CLAUDE.md instruction does not work in a fresh checkout.
- When it does run: "apply an element template to a service task" ranks the unrelated
  `casen generate` table first; "set a form on a start event" returns a conformance page.
  There are no task-shaped recipe chunks.
- Template property keys are template property ids (`retryCount`, not `retries`). Nothing
  lists them compactly; the CLI winner had `template-props --filter --condensed`.
- The Claude plugin's `agent` skill (`plugins-claude/bpmnkit-claude/skills/agent/SKILL.md`)
  targets the v1 job-worker agent.
- No `casen` command applies a template to an element of an existing file.

The competitor CLI closed these with per-command help, a filterable property listing, a
"omitted properties keep their default" note and explicit flow ids. Its iteration log shows
each of those cut time; ours has the same levers.

### 3. Things that already work and should be advertised

- Bundled templates: `io.camunda.connectors.HttpJson.v2` v18 and
  `io.camunda.connectors.agenticai.ai-agent-subprocess.v2` v1 (`connectors/templates/generated.ts`).
- `applyTemplateToElement(defs, id, template, values)` — every binding kind incl. `zeebe:adHoc`,
  idempotent, no shell.
- `lintDiagram` + `analyzeCamundaCompat` (8.0–8.10) and `casen lint lint --profile deploy`
  emulate the gate's bpmnlint rules.
- `renderBpmnAscii` and `exportSvg` give an agent a headless self-check.
- Deterministic semantic auto layout, ad-hoc tool grids, loop-backs routed around the agent.

### 4. Drop ("first diagram in <8 s, but just the diagram")

Drop streams a line DSL ("process text", `packages/core/src/bpmn/process-text.ts`) from
`glm-4.7-flash` (`max_tokens` 600) and draws as lines arrive. The DSL cannot express: ad-hoc
sub-processes, forms on start events or user tasks, `zeebe:userTask`, input/output
mappings, text annotations, or the execution platform version. Drop never lints the result
for deployability (`camunda-compat` is not called), the dry run only runs when connectors
were added, and a failed connect pass is silent. Nothing tells the user the output is a
shape, not an executable file. The eval set (`scripts/eval-generation/prompts`) has one
agentic prompt, and the drop bench skips it.

## What "do better" means here

1. An agent following our docs passes the same gate in **≤ 100 s and ≤ $0.45**, with
   closeness **≥ 90** — beating the CLI's 113 s / $0.47 / 89.6.
2. The builder expresses every line of the spec with no post-processing tool.
3. Drop says whether its output is executable, and can produce this process executable.
4. We can rerun the bake-off ourselves: a fixture test in-repo, plus the external scorer.

Fairness notes from the report worth keeping: means of two runs; the CLI was tuned over six
iterations and ours not at all; the ProcessOS guide used different template ids than the
spec. None of that changes the gaps above.

## Golden prompt 28 (Phase C)

`scripts/eval-generation/prompts/28-ai-agent-chat-with-tools` holds the spec as `prompt.md`, the
spec's literal values as `expected.json` (ids, form ids `ai-agent-chat-initial-request` and
`ai-agent-chat-user-feedback`, input target `responseText`, flow names Yes and No, three annotations,
`mustBeReady`) and a `fixture.plan.json`. The assertions are scored by
`scripts/eval-generation/assertions.mjs`, which both `run-eval.mjs` and drop's bench use.

The plan fixture cannot say everything: a `ProcessPlan` has no start-event form, no user-task input
mapping, no annotation and no loop back to an earlier gateway, and its `aiAgent` step compiles to
the v1 job-worker agent. The eval therefore reports the assertions on the compiled plan: the known
plan-format gaps it lists are reported, an unlisted miss fails the run, and a listed gap that no
longer misses is flagged as stale. Today the plan misses `Gateway_RunAgent`, the start form,
`responseText` and the three annotations. The reference file (`packages/core/tests/fixtures/bakeoff/expected.bpmn`) meets all of
them (`apps/drop/tests/spec-assertions.test.ts`).

Drop's bench no longer skips 03; it skips 04 and 09 only, so 03 and 28 run. Prompt 28 sets
`"connect": true`, so the connect pass must run for it. 03 still asserts the v1 job type, which the
v2 agent card does not produce; a miss there is data.

Drop bench: not run in the authoring sandbox (it needs Cloudflare credentials). Run it with:

```sh
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... pnpm --filter @bpmnkit/drop bench:generate -- --only 28 --connect
```

It writes time to first shape, total time and the failed assertions to
`apps/drop/bench-results/<timestamp>/` (`results.json`, `summary.md`). Add the numbers here.

## Results (rerun 2026-10-18)

Two fresh agents ran the same spec, gate and scorer against the Phase A–C builder. Against the
report's BPMN Kit baseline: time to first passing gate 132 s (was 172 s), 103,665 tokens (was
158,788 harness total), closeness 87.3 (was 85.4), layout 7.7 (was 8.3). Targets: ≤ 100 s missed,
closeness ≥ 90 missed, ≤ $0.45 not measurable (token totals only). Two runs, a different agent
harness and a slower gate (about 43 s per CPT run), so indicative only. Details, per-run tables and
proposed follow-ups: `doc/agent-bpmn-bakeoff-rerun.md`.
