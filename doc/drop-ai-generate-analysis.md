# Drop: generate a process from a description — speed and token analysis

Status: implemented (2026-09-29). The line format is in `@bpmnkit/core` (`process-text.ts`). The route, page and bench are in `apps/drop`. The v1 model choice is pending the bench results.
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

## 8. Issues found along the way

- **`expand()` emitted invalid BPMN without complaint** in the cases in §6.2. Fixed: it now throws one error listing every problem. The lenient repair described in §6.2 lives in `parseProcessText`, which only ever produces diagrams `expand` accepts.
- **`estimateNeurons()` in `apps/drop/src/lib/ai.ts` ignores reasoning tokens.** It also uses gpt-oss-120b rates whatever `AI_MODEL` says, so the daily budget undercounts. The fix is to read `usage` from the response.
- **`apps/landing/src/content/docs/guides/ai.md` had two errors.** It told models to write `taskType`, but the field is `jobType` (fixed). It also references a `compactDiagramJsonSchema` export that does not exist (still open).
- **The demo DSL parser is in `apps/demo`, not in core.** The proxy's non-MCP fallback still asks for compact JSON in a code fence.
