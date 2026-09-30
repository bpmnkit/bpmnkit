# Drop: generate a process from a description — speed and token analysis

Status: implemented (2026-09-29). The line format is in `@bpmnkit/core` (`process-text.ts`). The route, page and bench are in `apps/drop`. The model is `@cf/zai-org/glm-4.7-flash`, chosen from the benchmark in §8.
Related: `doc/ai-bpmn-generation-analysis.md` (the repo-wide generation pipeline), `doc/drop-v2-spec.md` §2.6 (the AI review this builds on).

Goal: a Drop user types what a process should do, and a diagram appears. The generation must use very few tokens and must run fast. This document measures where the time and tokens go today and recommends a design. It does not implement the feature.

## 1. Where the cost is

With Workers AI, the time a user waits is roughly:

```
TTFT  +  (reasoning tokens + output tokens) / decode speed  +  our CPU
```

Findings:

- **Our CPU is negligible.** `expand()` + semantic layout + `Bpmn.export()` takes 0.4–1.0 ms for 8–36 elements. `compilePlan()` takes 1–5 ms. Neither is worth optimising.
- **Output tokens dominate.** Decoding one output token costs 10–100× the time of reading one input token. It also costs 2–7× more neurons, depending on the model.
- **Hidden reasoning tokens are output tokens.** `gpt-oss-*` cannot turn reasoning off (effort `low` is the minimum). Reasoning can be longer than the diagram itself. Drop's current `estimateNeurons()` counts only visible characters, so it undercounts a gpt-oss call.

Almost all of the gain therefore comes from four things: a denser output format, less reasoning, a smaller or faster model, and streaming so that the first shapes show before the last token.

## 2. Output format: measured

Token counts use `o200k_base`, the tokenizer of gpt-oss. The inputs are the repo fixtures (`bpmn-samples/`, `core/tests/fixtures/camunda7/`, `camunda-compat/`).

| Diagram | Elements | BPMN XML | Compact JSON (pretty) | Compact JSON (min) | Min, no flow ids | Line DSL | Chained-edge DSL |
|---|---|---|---|---|---|---|---|
| order-process | 8 | 1797 | 502 | 266 | 225 | 92 | 69 |
| parallel-approval | 9 | 2147 | 582 | 312 | 250 | 105 | 67 |
| claim-handling | 8 | 3049 | 678 | 392 | 350 | 129 | 75 |
| invoice-approval | 10 | 2786 | 673 | 390 | 337 | 168 | 113 |
| order-fulfillment | 16 | 4651 | 1083 | 634 | 538 | 281 | 189 |

On the 14 golden prompts in `scripts/eval-generation/` (with the `tests` blocks removed):

| Format | Total tokens | vs compact JSON |
|---|---|---|
| BPMN XML (compiled) | 27,203 | 6.7× |
| ProcessPlan JSON, pretty | 4,201 | 1.04× |
| Compact JSON, minified | 4,034 | 1× |
| ProcessPlan JSON, minified | 2,485 | 0.62× |

The ProcessPlan figure is smaller even though a plan carries more: connector values, conditions and boundaries. It has no flow ids, no merge gateways and optional element ids, because branches nest.

Recorded end-to-end runs in `apps/demo/recordings/` agree. On the same prompts, the demo's line DSL used 5–8× fewer output tokens than XML and ~3× fewer than builder code. Wall time fell accordingly: loan approval took 51 s as XML and 11.6 s as DSL; KYC took 123 s and 16 s.

What makes a format cheap:

1. **No redundant ids.** Flow ids, `"id":`, `"type":`, `"from":` and `"to":` keys are pure overhead. Keys and punctuation are ~40% of compact JSON.
2. **No redundant structure.** A model that must write a merge gateway, and every edge into it, spends tokens on facts the layout can infer.
3. **No whitespace.** Pretty JSON is 1.7–1.9× the minified form. JSON mode does not stop a model from emitting indentation.
4. **Chained edges.** `a > b > c` states a sequence once. It is also the Mermaid shape that models have seen most.

## 3. Streaming vs JSON mode

Workers AI documents two constraints (developers.cloudflare.com/workers-ai/features/json-mode):

- JSON Mode "currently doesn't support streaming".
- It is best effort. A request can fail with `JSON Mode couldn't be met`, and nothing guarantees the output matches the schema.

So JSON mode buys no correctness guarantee, and it costs the one thing that makes generation *feel* fast: seeing the diagram grow. A line-oriented format can be streamed without JSON mode. Every completed line is a complete fact that can be parsed on arrival and rendered. `createCompactStream` already does the same for JSON literals, and a line parser is simpler.

**Recommendation:** stream a line DSL with `stream: true` and no `response_format`. Validate after the stream ends.

## 4. Choosing the format

| | Compact JSON | ProcessPlan JSON | Line DSL (demo) | Chained DSL |
|---|---|---|---|---|
| Output tokens | 1× | ~0.6× | ~0.35× | ~0.25× |
| Streams line by line | no (brace scanner) | no (nested) | yes | yes |
| Can express a dangling edge | yes | no | yes | yes |
| Parser exists | `expand` | `compilePlan` | `apps/demo/server/compact-dsl.ts` (213 lines, line-numbered errors) | no |
| Structured problems | none | `{path, message}` | `line N: …` | — |

The recommendation is a **line DSL**, based on the demo's grammar with two additions:

- **Chained edges:** `a > b > c`, plus `gw > x "Yes" if=… ` for a labelled branch.
- **Declare-on-first-use:** `validate[service "Validate order"]`. A node can appear inline, so a linear process needs no separate element list.

The parser moves into `@bpmnkit/core`, next to `compact-stream.ts`. The demo, the proxy fallback and Drop then share one parser, and it outputs a `CompactDiagram`.

ProcessPlan is the better *semantic* target: it cannot express a dangling edge, and `compilePlan` returns problems with paths. It loses on two counts: it cannot stream, and connectors need `@bpmnkit/connectors`, whose templates are 2.1 MB of source and too heavy for the Drop Worker bundle. It stays the target for the CLI and agent path.

## 5. Model choice

Candidates on Workers AI that accept `stream` (prices from the pricing page, per M tokens, in → out):

| Model | Active params | Neurons in / out | Reasoning |
|---|---|---|---|
| `@cf/openai/gpt-oss-120b` (current) | ~5B of 120B | 31.8k / 68.2k | cannot be disabled; effort `low` |
| `@cf/openai/gpt-oss-20b` | ~3.6B | 18.2k / 27.3k | cannot be disabled; effort `low` |
| `@cf/google/gemma-4-26b-a4b-it` | 4B | 9.1k / 27.3k | `chat_template_kwargs.enable_thinking: false` |
| `@cf/zai-org/glm-4.7-flash` | — | 5.5k / 36.4k | toggle |
| `@cf/qwen/qwen3-30b-a3b-fp8` | 3B | 4.6k / 30.5k | no documented toggle; 32k context |
| `@cf/ibm-granite/granite-4.0-h-micro` | micro | 1.5k / 10.2k | none |

Cloudflare publishes no tokens-per-second figures, so the choice must be measured (§7). The model is `AI_MODEL`, a var, so switching needs no code change. Response shapes differ: gpt-oss, qwen3, glm and gemma-4 return chat-completion `choices[]`, while granite and llama return `{response}`. The stream reader has to accept both.

At 10k free neurons/day, a 700-token prompt with 300 output tokens is about 43 neurons on gpt-oss-120b, before reasoning. It is about 15 on gemma-4 and about 5 on granite.

## 6. Recommended pipeline

```
description ──► cache? ──► Workers AI (stream, DSL) ──► SSE ──► client parses lines, renders preview
                                     │
                                     └─► on done (Worker): parse → normalise → optimize() auto-fix → expand → export
                                                              └─► final XML ──► new drop
```

1. **Prompt: small, fixed and first.**
   - Target ≤ 700 input tokens: the grammar (~250), one short example (~150) and the style rules that matter (~100). The demo prompt is ~2.3k tokens, mostly a 2.1k-character example.
   - Put the user text last, so the whole system prefix is identical on every call. Send `x-session-affinity` so Workers AI's prefix cache hits, which gives faster TTFT.
   - Frame the description as untrusted data, as the review prompt does.
2. **Deterministic normalisation instead of a repair round-trip.** This is the piece that fills today's gap. `expand()` currently accepts:
   - an edge to a missing node (the XML then references it),
   - a duplicate element id (emitted twice),
   - a flow without an id,
   - an unknown `eventType` (silently dropped).

   It throws only on an unknown element type. A `normaliseCompact()` in core would:
   - generate missing ids,
   - de-duplicate,
   - drop edges whose ends never arrive,
   - map unknown types to `task`,
   - add a missing start or end event,
   - mark a lone unconditioned branch of an XOR as the default.

   It returns a list of what it changed. Then run `optimize()` and apply the findings that have an `applyFix`. None of this costs a token.
3. **At most one repair call, and only on failure.** This applies only when the result is unusable, for example no start-to-end path or more than N dropped lines. Send only the problem lines back, not the diagram. The expected rate is low, and each repair doubles latency, so it must stay the exception.
4. **Stream to the browser.**
   - Stream the model's SSE through the Worker. The Worker tees the stream: it keeps a copy to finalise, and the client gets the tokens.
   - The client renders a preview after every completed line (throttled to animation frames), using the same core parser and `expand` it already bundles.
   - Time to first shape is about TTFT plus two lines.
5. **Cache and budget, as the review does.**
   - Look up the normalised description's hash in D1 before calling the model. The built-in example prompts are precomputed and cost nothing.
   - Keep the daily neuron budget and the Turnstile/passcode gate.
   - Compute cost from the `usage` chunk, not from character counts. The usage chunk includes reasoning tokens.
6. **v1 scope.** Plain task types, gateways, timer/message/error events, boundaries and sub-processes. Service tasks get a `job=` type. Connector templates are out of v1, because of the bundle size.

## 7. Benchmark harness

The model and prompt choice cannot be settled on paper, so they are measured with
`apps/drop/scripts/bench-generate.mjs`. The benchmark uses the same pieces the Worker will use:

- `GENERATE_SYSTEM_PROMPT` (`apps/drop/src/lib/generate.ts`, ~330 tokens including the guide)
- the SSE reader
- `createProcessTextStream` from core

It runs the golden prompts in `scripts/eval-generation/prompts` against each candidate model
through the Workers AI REST API. Three prompts are skipped by default: 03 (AI agent), 04 (edits an
existing file) and 09 (expects a clarifying question).

It records, for each model:

- time to first byte, first reasoning token, first content token and first drawable shape
- total time
- input, output, reasoning and cached tokens, from the model's `usage` chunk
- estimated neurons
- parser problems and fixes
- `optimize()` errors and warnings
- the `minElements` and `mustContainElementTypes` assertions (connector job types are out of v1)

It writes each model's raw text and BPMN, `results.json` and a `summary.md` table.

```sh
pnpm --filter @bpmnkit/core build          # the bench imports core's dist
CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… pnpm --filter @bpmnkit/drop bench:generate
# options: --models a,b  --runs 3  --only 02,13  --all  --no-extra  --max-tokens N  --out DIR
```

The token is a Cloudflare **API token**, not the Global API Key. It needs the account permissions
**Workers AI – Read** and **Workers AI – Edit**. The quickest way to get one:

1. In the dashboard, open *AI → Workers AI → Use REST API*.
2. Choose *Create a Workers AI API Token*.
3. Review the prefilled permissions and create it.

The same page shows the Account ID.

One sweep (6 models × 12 prompts × 1 run) should cost roughly 2–4k neurons. That fits in the
10k/day free allowance.

Success criteria for v1:

- median time to first shape under 1.5 s
- median total time under 5 s
- under 1k total tokens per generation
- at least 90% of the golden prompts produce a diagram with no `error` finding after auto-fix

## 8. Benchmark results and the model choice (2026-09-29)

This is one run of 12 golden prompts per model, against Workers AI
(`apps/drop/bench-results/2026-09-29T17-26-27-508Z/`). The figures are medians, except neurons and the
lint column, which are means. "Assertions" is how many of the 12 prompts produced every element
type the golden set expects.

| Model | First byte | First shape | Total | Out tokens | Reasoning | Neurons | Assertions | Lint errors |
|---|---|---|---|---|---|---|---|---|
| gpt-oss-120b (effort low) | 327 ms | 12.4 s | 10.6 s | 635 | 525 | 67.7 | 4/12 | 0.3 |
| gpt-oss-20b (effort low) | 230 ms | 19.2 s | 12.1 s | 1215 | 1257 | 41.8 | 4/12 | 0.0 |
| gemma-4-26b-a4b (thinking off) | 531 ms | 2.1 s | 2.4 s | 72 | 0 | 5.9 | 7/12 | 0.3 |
| **glm-4.7-flash (thinking off)** | **238 ms** | **0.8 s** | **2.0 s** | 80 | 0 | 5.0 | 5/12 → 6/12 | 1.5 |
| qwen3-30b-a3b | 142 ms | 5.5 s | 7.3 s | 1052 | 1130 | 33.8 | 3/12 | 0.3 |
| granite-4.0-h-micro | 383 ms | 1.1 s | 1.7 s | 51 | 0 | 1.2 | 2/12 → 3/12 | 1.3 |

- **Reasoning models are out.** gpt-oss cannot turn reasoning off, and qwen3 has no documented
  switch. Their reasoning is 5–15× longer than the diagram. Several gpt-oss-20b and qwen3 runs used
  their whole 2,048-token cap on reasoning and returned a two-element diagram.
  gpt-oss-120b also leaked its raw harmony channels into the answer text in some runs
  (`analysis: … <|end|><|start|>assistantfinal`, with no separate reasoning delta). That is where its
  7.3 problems per run come from.
- **gemma-4 wrote the best diagrams, but it queues.** Its generation time is comparable to glm's.
  But its first byte took 3.2 s, 4.0 s, 4.2 s, 10.5 s and 52.9 s in 5 of 12 runs, which is
  Workers AI capacity rather than the model. glm's first byte was under 0.7 s in every run, and its
  total time was under 3.7 s.
- **glm-4.7-flash is the v1 model**, because the feature is judged on speed. At about 5 neurons a
  generation, the 10k-neuron free allowance covers roughly 2,000 a day. `AI_GENERATE_MODEL` switches
  back to gemma-4 if Workers AI's capacity for it improves. It needs no code change.
- **The parser now accepts the most common grammar drift** found in the recorded answers:
  - a missing kind (`start[Order placed]`, typed from the id)
  - a name written where the trigger goes (`start:order received`)
  - synonyms such as `event`, `parallel` and `decision`

  Replaying all 72 recorded answers through the new parser moves glm from 5/12 to 6/12 and granite
  from 2/12 to 3/12, with no new model calls. The guide also says `rule (DMN decision)` and
  `catch (wait for message or timer)`, because every model wrote the DMN step as `service`. That
  prompt change is not yet measured.
- **Failures no model can fix in v1:** 06 needs a multi-instance sub-process, which the format
  cannot express. 11 expects an error boundary that the prompt never asks for.
- **Conditions in prose** (done). 7 of glm's 18 lint errors were conditions written as prose
  (`applicant is eligible`) instead of FEEL. The parser now checks each condition with the same
  FEEL parser the linter uses. If it is not FEEL, the text becomes the branch label
  (`Yes: applicant is eligible`) and the condition is left empty. When the other branch keeps its
  FEEL condition, the lone-branch rule makes the prose branch the default.

  Replayed on glm's answers, the total error count is unchanged (1.5 per run). But the invalid-FEEL
  errors, which fail at deploy time, go from 7 to 0, and `feel/empty-condition` goes from 3 to 9.
  Every remaining error is now a condition to fill in, with the intent written next to it.

  The guide also shows two FEEL examples (`amount > 1000`, `status = "ok"`). That prompt change is
  unmeasured. Parsing FEEL in the browser adds 19 kB to `landing.js` (297.6 → 316.4 kB minified).

## 9. Second run: glm-4.7-flash, 3 runs × 12 prompts (2026-09-30)

`apps/drop/bench-results/2026-09-30T05-05-15-556Z/`. This run used the parser and prompt changes
from §8.

| | Run 1 (12) | Run 2 (36) |
|---|---|---|
| First byte (median) | 238 ms | 167 ms |
| First shape (median) | 824 ms | 638 ms |
| Total (median) | 2.0 s | 1.2 s |
| Neurons (mean) | 5.0 | 7.1 (5.1 without the runaway) |
| Assertions | 5/12 (42%) | 15/36 (42%) |
| Lint errors per run | 1.5 | 0.9 |

- **The prompt hints did not move the pass rate.** Prompt 12 (DMN) went from 0/1 to 1/3 and
  prompt 05 (message wait) stayed at 3/3. Both are too few runs to tell.
- **One runaway.** With thinking off, one answer still "thought aloud" in the output, in Chinese.
  It rewrote a finished diagram for 175 lines, until the 2,048-token cap stopped it at 37 s and
  78 neurons. The longest real diagram was 191 tokens. Non-reasoning models now send
  `maxTokens: 600` (`MODEL_PROFILES`), which bounds a runaway at roughly 11 s and 23 neurons. The
  diagram that one produces is still poor, capped or not.
- **glm queues too, but less.** 4 of 36 first bytes took 2.0, 4.9, 7.6 and 11.5 s; the median is
  167 ms. See §10 for a proposal.
- **The prompt cache never hit.** `cached_tokens` was 0 on all 36 runs, even with
  `x-session-affinity`. Workers AI publishes cached rates only for its newer models, so glm-4.7
  probably has no prefix cache. The header is harmless, so it stays.
- **Parser rules from this run's answers.** Each was replayed on all three recorded sets before it
  was kept:
  - an id that is used but never declared becomes a task named from the id, instead of losing every
    flow and boundary on it
  - an id reused *after an arrow* for a different node (`check > done[end Rejected]`,
    `task[A] > task[B]`) becomes a new node (`done_2`), and a bare reference means the latest
  - at the start of a line, a reused id is the model revising or continuing from the node already
    there, so the earlier node is kept, as it is for a kind that is not a kind (`and[kind and]`)
  - a boundary is always new; `pay[boundary:error … | on=pay]` attaches to the earlier `pay`
  - `>(label) > x`, and `id [spec]` with a space, both parse
  - a rule task without a decision takes its id as decision id, so it passes the deploy lint

  A first version of the reused-id rule also split nodes at the start of a line. It lost gemma's
  boundary and added 10 unreachable elements to its answers, so it was narrowed to the version
  above.

| Replayed | Assertions | Problems/run | Lint errors/run | Unreachable |
|---|---|---|---|---|
| glm, run 1 (12) | 5 → 6 | 2.58 → 2.58 | 1.50 → 1.42 | 5 → 5 |
| glm, run 2 (36) | 15 → 18 | 5.83 → 2.53 | 0.92 → 0.83 | 17 → 16 |
| gemma, run 1 (12) | 7 → 8 | 1.83 → 1.33 | 0.33 → 0.33 | 0 → 0 |

The run-2 figures include the one runaway, cut at the simulated 600-token cap. It adds 12
unreachable elements, so on the other 35 answers unreachable went from 16 to 3.

## 10. Hedged request for the queueing tail (built 2026-09-30)

About 1 in 10 requests waited 2–12 s for Workers AI capacity before the first token (§9). Once
content flows, it flows at the model's usual speed, so the wait is the queue and not the model.
The route now hides it (`apps/drop/src/lib/hedge.ts`):

1. Ask `AI_GENERATE_MODEL` (glm-4.7-flash).
2. If it has written no content after `AI_GENERATE_HEDGE_MS` (1500 ms), ask
   `AI_GENERATE_FALLBACK_MODEL` (gemma-4) with the same request. If the primary fails before
   writing, the fallback is asked at once.
3. Stream whichever writes first and cancel the other, which also tells Workers AI to stop
   generating.

The rules around it:

- **Budget.** Both calls are charged: from `usage` when a stream reported it, otherwise estimated
  from the prompt and what was read. Charging a cancelled call its prompt may slightly overcount;
  the budget guard errs that way on purpose.
- **Cache.** The winner's answer is cached under the request key, which is derived from the
  primary model. A repeat is served from the cache whichever model wrote it.
- **Cost.** A second call happens only in the slow cases, roughly 10% of requests on the §9 run.
- **Observability.** Every generation logs
  `{ msg: "drop.generate", primary, winner, hedged, firstContentMs, neurons, usable }`, so the real
  hedge rate and the winner split can be read from Workers logs.
- **Turning it off.** Remove `AI_GENERATE_FALLBACK_MODEL` from `wrangler.jsonc`.

It is not measured against Workers AI yet. The bench calls one model at a time. Production logs
are the measurement.

## 11. Issues found along the way

- **`expand()` emitted invalid BPMN without complaint** in the cases in §6.2. Fixed: it now throws one error listing every problem. The lenient repair described in §6.2 lives in `parseProcessText`, which only ever produces diagrams `expand` accepts.
- **`estimateNeurons()` in `apps/drop/src/lib/ai.ts` ignores reasoning tokens.** It also uses gpt-oss-120b rates whatever `AI_MODEL` says, so the daily budget undercounts. The fix is to read `usage` from the response.
- **`apps/landing/src/content/docs/guides/ai.md` had two errors.** It told models to write `taskType`, but the field is `jobType` (fixed). It also references a `compactDiagramJsonSchema` export that does not exist (still open).
- **The demo DSL parser is in `apps/demo`, not in core.** The proxy's non-MCP fallback still asks for compact JSON in a code fence.

## 12. Structural guarantees (2026-09-30)

A user asked for "a KYC process for a bank" and got a diagram with a loose `Governance` task and its
own end event, a boundary-to-end path hanging off it, and a question gateway (`Status approved?`)
with one branch. The answer was reconstructed and reproduced: the boundary named `on=governance`,
which was never declared, so the parser added a task that nothing led to; the gateway got one
branch and an added end event. The parser completed starts, ends and joins, and nothing else.

Replaying every recorded answer (104, §8 and §9) through `parseProcessText`, then `lintDiagram`
with bpmnlint's recommended rules, counted the answers with a non-info `flow`, `naming` or `feel`
finding (a long condition the model wrote, `feel/complex-condition`, is excluded):

| | answers with findings | lint errors | mean elements |
|---|---|---|---|
| before | 47 / 104 | 111 | 7.2 |
| after | 0 / 104 | 0 | 7.3 |

Before, by rule (answers): missing label 30, implicit split 15, branch without condition 14,
implicit start 9, redundant gateway 7, missing default 7, superfluous flow label 6, mixed gateway 5,
disconnected 2.

What `parseProcessText` now guarantees on the final text (not on streamed frames):

- **Every node is on a path from a start event.** A task or gateway nothing leads to continues the
  latest path written before it that stops short of an end event — the model left out one arrow
  (glm, prompt 13: `… > label` then `gw[xor Ready?] > dispatch`). Loose events are not guessed at.
  What is still unreached is left out and reported. An id only an `on=` names is no longer added
  as a task, since nothing would lead to it. On the replay, 8 nodes in 6 answers are still left
  out, all from answers whose lines did not parse; connecting recovered 14 more.
- **No pass-through gateways.** One way in and one out is removed and reported.
- **No implicit splits.** Several flows out of a task or event get an xor gateway when labelled,
  a parallel one when not.
- **Joins match their split.** Branches from one parallel split get a parallel join, not an xor
  join that would run the rest once per branch. A gateway that both joins and splits gets its own
  join.
- **Decisions are complete.** One default per xor/or split, preferring a `No` / `Otherwise` /
  `Rejected` branch, otherwise the last unconditioned one. Every other branch gets a FEEL
  condition. A prose branch gets one on a variable named for the question (`Status approved?` +
  `Yes` → `= statusApproved = true`), which is deployable and names the variable a task has to set.
  Flows out of anything else lose conditions and labels.
- **Everything is named.** Added events are named, and unnamed nodes are named from their ids.

`apps/drop/tests/generate.test.ts` replays the recorded answers on every test run and expects no
structural finding, so a parser change that regresses one fails CI.

The guide gained four rules (one start, no loose nodes; an xor has conditions and a default; a
boundary sits on a declared task and handles the problem before its end; joins). Its example no
longer sends an error boundary straight to an end event, which `pattern/catch-and-swallow` flags
and models copy. The guide is now ~310 tokens, up from ~250. The effect on answers is not yet
measured on Workers AI; the next `bench:generate` run is the measurement.

`pattern/gateway-single-outgoing` flagged every join gateway, since a join has one outgoing flow by
design. It now skips gateways with several incoming flows; `flow/redundant-gateway` still covers a
gateway with one flow in and one out.
