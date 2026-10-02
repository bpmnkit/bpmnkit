# AI generation with Camunda connectors — analysis and plan

**Status:** plan only, nothing implemented. Decisions D1–D4 in §8 are agreed. **Date:** 2026-10-01.
**Follows:** bpmnkit/monorepo#207–#212 (describe-to-diagram, refine, image drafts, feedback edits,
shared suggestions).

## 1. Goal

A user says *"generate a flow that interacts with the GitHub API and posts to Slack"* and gets a
BPMN file that **deploys and runs** on Camunda 8:

- Every integration step is a real connector task, with the right `zeebe:taskDefinition`,
  `zeebe:ioMapping` inputs, task headers, `zeebe:modelerTemplate` stamp and secrets.
- If no dedicated connector exists, the **REST connector** (`io.camunda:http-json:1`) is used,
  with a real base URL, method, path, auth scheme and result mapping.
- The model has no network. Everything it needs comes from data that is **committed in this
  repo**: the OOTB connector templates and the OpenAPI catalog.
- The connector catalog is available from **`@bpmnkit/core`**, not only from
  `@bpmnkit/connectors`.

Success criterion, measured by the bench (§9): for the connector golden prompts, ≥ 90 % of
answers expand to BPMN where every connector task applies with zero `missing-required`,
`unknown-key` or `invalid-feel` problems, and the process runs green in `ProcessTest` with the
connectors mocked by job type.

## 2. What exists today

### 2.1 Generation paths

| Path | Where | Model writes | Connectors |
|---|---|---|---|
| Describe-to-diagram, refine, image | `apps/drop` Worker → Workers AI (`glm-4.7-flash`, hedged by `gemma-4`), single shot, 600-token cap | Line DSL, `PROCESS_TEXT_GUIDE` (`packages/core/src/bpmn/process-text.ts:36`) | **None.** Only `job=<type>`; default job type is the element id (`process-text.ts:1193`) |
| Feedback edits / suggestions | `apps/drop` (`lib/feedback.ts`, `routes/ai-edit.ts`) | Change script, `PROCESS_DELTA_GUIDE` (`process-delta.ts:46`) | None; same three attributes `on`, `job`, `nonint` |
| ProcessPlan | CLI `casen synth`, Claude plugin skills (`plugins-claude/bpmnkit-claude`) | JSON `ProcessPlan` (`packages/core/src/plan/types.ts`) | **Yes**: `kind: "connector"` + `PlanConnectorRef { template, values }`, resolved by an injected `applyConnectorTemplate` |
| Proxy AI chat | `apps/proxy` (`prompt.ts`, `mcp-server.ts`), `apps/proxy-rs` | CompactDiagram JSON or MCP tool calls | REST only: `add_http_call` → `Bpmn.restConnector()` |

`doc/drop-ai-generate-analysis.md:84,140` left connectors out of Drop v1 **on purpose**: the
templates are 2 MB of source, too heavy for the Worker. The plan path has connectors but cannot
stream and is not used by Drop.

### 2.2 Connector data

- `@bpmnkit/connectors` 1.1.0 (depends on core + feel): **116 OOTB templates** in one generated
  file, `src/templates/generated.ts` (2.0 MB). They are synced by hand with `pnpm update-connectors`
  from `marketplace.cloud.camunda.io/api/v1/ootb-connectors`.
  - By direction: 63 outbound, 18 inbound-start, 23 inbound-intermediate, 11 inbound-boundary,
    1 agentic.
  - Templates include REST (`HttpJson.v2`), GitHub, GitLab, Slack, SendGrid, Email, Teams, O365,
    Twilio, WhatsApp, Kafka, RabbitMQ, SQS/SNS/EventBridge/Lambda/DynamoDB/S3, Google
    Drive/Sheets/Gemini, OpenAI/Azure OpenAI/Bedrock, GraphQL, SOAP, JDBC, Salesforce,
    ServiceNow, HubSpot, Asana, UiPath, AI Agent, MCP client, A2A and more.
- The API is already AI-oriented:
  - `listConnectors` / `searchConnectors` return `ConnectorSummary`, which carries
    `requiredInputs`, `optionalInputs`, `isSecret`, `isFeel`, `choices` and `condition`.
  - `applyConnectorTemplate(id, values)` returns core `ServiceTaskOptions` plus problems, with FEEL
    checked.
  - `applyTemplateToElement` stamps `zeebe:modelerTemplate*`.
- `@bpmnkit/connector-gen`: a `CATALOG` of **101 OpenAPI specs** (GitHub, Stripe, Cloudflare,
  Notion, …) and `buildTemplate()`, which makes one REST template per operation. The specs are
  **fetched at runtime by URL**; only `stats.ts` (100 services, 18,145 endpoints) is committed.
- `@bpmnkit/core` has `Bpmn.restConnector()` and `RestConnectorConfig`
  (`bpmn/rest-connector.ts`), and the builder's `ServiceTaskOptions` supports `ioMapping`,
  `taskHeaders`, `zeebeProperties` and `modelerTemplate*`. Core **cannot import**
  `@bpmnkit/connectors`, because that package depends on core.
- `plugins-claude/bpmnkit-claude/references/connectors.md` is a generated index table (id, name,
  task type). Per-property detail is only available at runtime (`casen connector show`).
- `@bpmnkit/camunda-docspack` does **not** include `docs/components/connectors`.

### 2.3 Measured sizes (built `@bpmnkit/connectors`, this branch)

| Data | Raw | gzip |
|---|---|---|
| All 116 templates (`CAMUNDA_CONNECTOR_TEMPLATES`) | 1.47 MB JSON | 290 KB |
| Same, without icons, groups, labels, tooltips, placeholders | 0.90 MB | **99 KB** |
| `listConnectors()` as JSON (all summaries) | 643 KB | — |
| Index line per connector (`id \| name \| taskType`) | **11 KB** (~3k tokens) | — |
| One summary: REST / Slack / GitHub | 4.7 KB / 2.6 KB / 20.7 KB | — |

So a slim catalog costs about 100 KB gzip in a bundle, which the Worker can afford. A prompt can
afford **one short index or a few cards, not the whole catalog**.

### 2.4 Defects found on the way (fix before building on them)

1. **Compact HTTP calls do not run.** `CompactElement.taskHeaders` (`compact.ts:41-45`) and the
   proxy prompt (`apps/proxy/src/prompt.ts:27`) tell the model to put `url`/`method` in **task
   headers**. The REST connector reads them from **input mappings**: `url`, `method`,
   `authentication.type` and so on, as `rest-connector.ts` does correctly. The result is a task
   that deploys and then fails.
2. **Compact `resultVariable` on a job task** writes an `ioMapping` output `= response`
   (`compact.ts:447-455`). For a connector, the result belongs in the `resultVariable` /
   `resultExpression` **task headers**. The output mapping reads a variable the connector never
   sets.
3. `Bpmn.restConnector()` stamps `modelerTemplateVersion: "12"` (`bpmn-builder.ts:2647`), but the
   bundled `HttpJson.v2` template is version 1. The editor then cannot match its own template.
4. `optimize/patterns.ts:66` compares against `"io.camunda.connector.HttpJson:1"`, which is not
   a real job type. It is harmless today.
5. `summarizeTemplate` flattens conditional properties. GitHub lists `owner` 5 times and
   `repo` 5 times, once per operation group, so a model cannot tell which inputs belong to which
   operation.
6. The template sync is manual, and `catalog-meta.json` (freshness) is written but not
   committed. No workflow refreshes it, unlike `camunda-docspack.yml`.
7. The bench ignores `mustContainTaskTypes` (`apps/drop/scripts/bench-generate.mjs:218`: "out of
   scope for v1"), so golden prompts 01, 10 and 11 never test their connectors.

## 3. Design principles

Carried over from #207–#212, because they are why that pipeline works with small models:

- **The model writes intent, code writes XML.** The model never writes binding names,
  `zeebe:` elements, template ids or versions. A deterministic resolver turns a short line into a
  fully applied template.
- **Never throw; repair and ask.** Unknown connector, unknown key or missing required input
  becomes a `ProcessTextProblem` or a `ProcessTextQuestion`, never a failed generation.
- **Retrieve, then generate.** Do not paste 116 connectors into the prompt. Pick candidates
  from the user's text with code, and send only those cards. The cached prompt prefix stays fixed;
  the cards go after it, next to the user text.
- **Secrets are never values.** The model writes `{{secrets.GITHUB_TOKEN}}`. Inputs marked
  `isSecret` that hold anything else are replaced and reported.
- **One source of truth.** Cards, guide text, the plugin reference and the bench all come from
  the same generated data, with a test that parses the guide's own example.

## 4. Architecture: two passes

**Decided (2026-10-01):** generation runs in two AI passes. First a fast structural pass, then a
connect pass that only configures connectors.

```
PASS 1 — structure (exactly today's pipeline, unchanged)
user text ─► GENERATE_SYSTEM_PROMPT ─► path lines ─► parseProcessText ─► expand ─► diagram streams in
                                                                                     │ ids are stable
PASS 2 — connect                                                                     ▼
diagram ─► candidates per task (code, no model):            selectConnectors(user text, task names,
           "Post summary to Slack" → slack chat.postMessage  ◄── core/connectors cards + API index)
           "List open issues" (+ "GitHub" in text) → http + GitHub API card
      │
      ▼
CONNECT prompt = FIXED CONNECT GUIDE + diagram as text (process-text-writer) + candidate cards + user text
      │
      ▼
model writes only `with` lines (+ kind restatements, e.g. task → service, start → start:message)
      │
      ▼
parseProcessDelta ─► applyProcessDelta (layout kept, #211) ─► resolveConnector ─► BPMN with
ioMapping / headers / modelerTemplate ─► validation: apply problems, lint, ProcessTest with mocks
```

### 4.1 Why two passes

- **Pass 1 does not change.** Its prompt, cached prefix, 600-token cap, latency to the first
  shape and the bench numbers from #207/#208 stay as they are. Connector work cannot make
  structure generation worse.
- **Retrieval is much better with a diagram.** In one pass, connectors can only be picked from
  the user's sentence. In pass 2, every service task has a name ("Post summary to Slack", "Create
  GitHub issue"). Candidates are picked **per task**, so the model gets two or three exact cards
  per task instead of a guessed list for the whole request.
- **Each pass does one small job.** Pass 2 writes only `with` lines, about 25–40 tokens per
  task, against a fixed id list. This suits the small Workers AI models better than writing
  structure and configuration at once (old risk 3).
- **It reuses the change-script machinery.** Pass 2 output is a change script (#211):
  `parseProcessDelta`, `applyProcessDelta` with layout kept, and the proposal dialog. Nothing
  else has to be built.
- **It works on any diagram.** The same pass is an **"Add connectors"** action for an imported,
  hand-drawn or older diagram, in Drop, the editor and the CLI, not only for fresh generations.
- **It fails gracefully.** If pass 2 fails or times out, the user still has the pass 1 diagram,
  with plain job types as today.
- **The passes can use different models.** Pass 2 can go straight to the stronger model, or to a
  bigger output cap, without slowing pass 1.

### 4.2 Costs and how they are handled

- **A second model call:** one more request and about 1–3 s more. Pass 2 starts as soon as
  pass 1's stream ends; the diagram is already on screen, and tasks show a "connecting…" state.
  Pass 2 is **skipped entirely**, with no model call, when the selector finds no candidates
  (e.g. a pure approval flow).
- **Structure that depends on the connector.** Some connectors need a different shape: an inbound
  webhook or Kafka start, a message catch, an AI agent ad-hoc sub-process.
  - Pass 2 may **restate a node's kind**, which the change script already allows
    (`x[kind Name]`): `task` → `service`, `start` → `start:message`, `catch` →
    `catch:message`. The inbound connector then binds to that event.
  - Pass 2 must not add or remove nodes. If it does, the change is reported, not applied.
  - For pass 1, add one rule line to `GENERATE_SYSTEM_PROMPT`: "each call to an outside system
    is its own service task, named after the system". This keeps integrations visible to pass 2
    and costs about 15 tokens on the cached prefix; the bench checks it.
- **Ids are stable.** `process-text-writer` writes the expanded diagram back with the same ids,
  so `with <id>:` lines line up. This is the same mechanism feedback edits use.
- **One pass is still possible.** The parser accepts `with` lines in a pass 1 answer too, since
  it is the same grammar. Strong models in the CLI and the Claude plugin may write everything at
  once and skip pass 2. Only Drop's fast path relies on two passes.

### 4.3 Without a model where possible

When every required input of the chosen card can be filled deterministically, pass 2 fills it
and the model is not called. Examples: a REST GET whose URL comes from the API card with only
process-variable placeholders, or secrets that follow the `{{secrets.<ALIAS>_TOKEN}}`
convention. Measure in the bench how often this happens before building it; it is an
optimisation, not part of P4.

## 5. Workstreams

### WS1 — Fix the foundations (small, independent, ship first)

1. Compact format: add `inputs?: Record<string,string>` (→ `zeebe:input`) and
   `modelerTemplate?: { id: string; version?: number }` to `CompactElement`. Round-trip both in
   `compactify`/`expand`.
2. Fix defect 1. `expand()` maps a job type of `io.camunda:http-json:1` with `url`/`method` in
   `taskHeaders` to inputs; this keeps old answers and recordings working. Fix the
   `compact.ts:42` doc comment, `apps/proxy/src/prompt.ts:27`, and the same text in
   `apps/proxy-rs/src/prompt.rs`.
3. Fix defect 2. For a job type that is a known connector, `resultVariable` becomes the
   `resultVariable` task header, not an output mapping. Plain job workers keep today's behaviour.
4. Fix defects 3 and 4. The version comes from the bundled template, not a literal.
5. Regression tests in `packages/core/tests` for each one, including an engine run of a REST task
   through `ProcessTest.mockConnector` (`packages/engine/src/testing/process-test.ts:385`).

### WS2 — Connectors in `@bpmnkit/core`

Goal: `import { listConnectors, applyConnectorTemplate } from "@bpmnkit/core/connectors"`.

- **Move**, not copy, the browser-safe part of `@bpmnkit/connectors` (`catalog.ts`, `apply.ts`,
  `apply-element.ts`, `validate.ts`, `template-types.ts`) into
  `packages/core/src/connectors/`. Expose it under a **new subpath export `./connectors`**, so
  `@bpmnkit/core`'s main entry and existing bundles do not grow. Core already depends on
  `@bpmnkit/feel`, which `apply.ts` needs, so no new dependency.
- **Data:** generate a **slim** template set into core (§2.3: ~100 KB gzip): bindings, types,
  conditions, constraints, choices, values, `feel`, plus a one-line description per property.
  Leave out icons, groups, tooltips and placeholders.
  - The full templates, with icons, stay in `@bpmnkit/connectors` for the editor's property panel
    (`packages/plugins/src/config-panel-bpmn`).
  - A test checks that `applyConnectorTemplate` gives identical results on slim and full data for
    every template.
- `@bpmnkit/connectors` 1.x becomes a **re-export shim** of `@bpmnkit/core/connectors`, plus
  the full templates and `./node` discovery. This is non-breaking for its 1.x users (plugins, CLI,
  proxy, vscode).
- `compilePlan` can then default `resolveConnector` to the core resolver. Injecting one stays
  possible, for custom or workspace templates (`registerElementTemplates`).
- **Sync:** have `scripts/update-connectors.mjs` write both data files and commit
  `catalog-meta.json`. Add a weekly workflow modelled on `.github/workflows/camunda-docspack.yml`
  that opens a PR when the marketplace changes (fixes defect 6).

### WS3 — Connector cards: what the model is told

A **card** is the smallest text that lets a model configure one connector operation. Cards are
generated from the slim data, never hand-written.

- **Alias.** Every outbound connector gets a short, stable alias, generated from its name and
  pinned in a committed `aliases.json` so renames don't break recorded answers. Examples: `http`,
  `slack`, `github`, `sendgrid`, `email`, `kafka`, `teams`, `openai`, `sqs`, `lambda`,
  `sheets`, `graphql`.
- **Operation.** Many templates select the operation with a dropdown (Slack `method`, GitHub
  `*OperationType`). For each choice, resolve the template's conditions and list **only the
  inputs active for that choice**. This fixes defect 5. Single-operation connectors have one
  card.
- **Card format** (target ≤ 60 tokens each):
  ```
  slack chat.postMessage — Post a message | token* (secret) channel* text* | out: result
  github createIssue — Create an issue | authentication.token* (secret) owner* repo* issueTitle* issueBody | out: result
  http — Any REST API | url* method(GET POST PUT PATCH DELETE) auth(noAuth bearer basic apiKey oauth) headers queryParameters body | out: response.body response.status
  ```
- **Index line.** One line per connector (alias + six words) for the case where retrieval found
  nothing. At about 60 aliases, that is ≤ 1.5k tokens. Use it only for strong models (CLI or
  Claude) or as a second pass, never in the Drop fast path.
- Cards are exported from core (`connectorCards(query, { limit })`) and regenerated into
  `plugins-claude/bpmnkit-claude/references/connectors.md` by
  `scripts/generate-skill-references.mjs`, so Claude Code skills get per-operation detail
  offline.

### WS4 — "Any HTTP API": offline API index

The REST connector is generic. For it to be *correct*, the model needs the real base URL, auth
scheme and path.

- New build script `scripts/build-api-index.mjs`. It runs offline in CI or by hand, not at install
  time. For each of the 101 `connector-gen` `CATALOG` entries it fetches the spec once and keeps,
  per service:
  - `baseUrl` and auth (scheme, header name, bearer/basic/apiKey)
  - per operation: `method`, `path`, `operationId`, a summary of 12 words at most, required
    path/query/body parameters (names only)
- The output is committed as `packages/connector-gen/src/api-index/*.json`, one file per
  service, so it can be lazily imported. The estimate is about 2 MB raw for 18k operations, so it
  does **not** go into core: core gets only the `ApiCard` type and the retrieval function
  signature, and Drop/CLI import the data from `@bpmnkit/connector-gen/api-index`.
  - Alternative: publish it in the existing docspack format (`@bpmnkit/api-docspack`), so
    `npx bpmnkit-docs ask "github create issue" --pack @bpmnkit/api-docspack` also works for
    agents. Decide in WS4 based on retrieval quality.
- **API card** (one per matched operation):
  ```
  GitHub REST https://api.github.com auth=bearer secret=GITHUB_TOKEN
  POST /repos/{owner}/{repo}/issues — Create an issue | body: title* body labels
  GET  /repos/{owner}/{repo}/issues — List repository issues | query: state labels
  ```
- **Precedence rule** in the prompt and in the resolver: dedicated OOTB connector > REST + API
  card > REST from the model's own knowledge. The last is allowed but flagged as a question:
  "URL not from the API index — check it".
- A weekly refresh can share the WS2 workflow.

### WS5 — Line DSL: writing connectors

Path lines stay exactly as they are, so streaming, the live preview and every structural repair
are unchanged. Connector configuration goes on **separate `with` lines**. In the two-pass flow
(§4), pass 1 writes the first four lines below and pass 2 writes only the two `with` lines:

```
# Triage new GitHub issues
start[start:timer Every hour] > list[service List open issues] > any[xor New issues?]
any >(Yes: count(issues) > 0) post[service Post summary to Slack] > done[end Summary posted]
any >(No: default) quiet[end Nothing new]
with list: http GET https://api.github.com/repos/{{owner}}/{{repo}}/issues?state=open | auth=bearer:GITHUB_TOKEN | result=issues: response.body
with post: slack chat.postMessage | channel=#triage | text== "New issues: " + string(count(issues))
```

- **Grammar:** `with <id>: <alias> [<operation>] | key=value | …`.
  - A value that starts with `=` is FEEL, checked with `parseExpression`.
  - `{{owner}}` in a URL compiles to a FEEL string concatenation of process variables.
  - `auth=<scheme>:<SECRET_NAME>` expands to the auth inputs, with `{{secrets.NAME}}`.
  - `result=<var>[: <FEEL over response>]` sets `resultVariable` / `resultExpression`.
- **Parser:** `parseProcessText` collects `with` lines into
  `CompactElement.connector = { alias, operation, values }`. `expand()` takes an optional
  `resolveConnector` (default: core's). The resolver maps alias → template id, operation → its
  dropdown value, and values → `applyConnectorTemplate`, then stamps `modelerTemplate`.
- **Repairs, in the existing never-throw style:**
  - `with` on an unknown id: a problem, and the line is dropped.
  - Unknown alias: nearest alias by edit distance, or REST, as a fix plus a question.
  - Missing required input: a question with a `draft`, e.g. "Which Slack channel?".
  - A literal secret: replaced with `{{secrets.X}}` and reported.
  - A task with no `with` and a name that matches a connector strongly ("Post to Slack"): a
    question offering the connector, never a silent change.
  - The `with` line binds a service task; if the node is a `task`, it is promoted to `service`
    and reported.
- **Writer and delta:** `process-text-writer.ts` emits `with` lines for elements with a
  `modelerTemplate`, so refine and feedback edits keep the configuration. `PROCESS_DELTA_GUIDE`
  gets `with x: …` (set or replace) and `- with x` (clear), and `applyProcessDelta` passes them
  through.
- **Guide:** `PROCESS_TEXT_GUIDE` (pass 1) is **not** changed. A new `CONNECT_GUIDE` (pass 2,
  about 200 tokens) teaches only the `with` grammar and the allowed kind restatements. Its
  example is parsed in a test, like the existing guides. The prefix stays fixed and cached; the
  diagram and cards are appended per request.
- **Why not reuse `| job=`:** a single attribute token cannot hold a URL with spaces, FEEL or
  several keys. A `with` line is also complete on its own, so it streams.
- **ProcessPlan** keeps `PlanConnectorRef`. Add `alias` and `operation` as an alternative to
  `template` + raw keys, so both formats share the WS3 resolver.

### WS6 — Retrieval and prompt assembly

- `selectConnectors({ text, tasks }) → { perTask: Map<id, cards>, apiCards }` in core,
  deterministic and pure. Each service, send or plain task is scored on its **own name**, with
  the user text as context (e.g. "GitHub" in the text, "List open issues" on the task). Steps:
  1. `searchConnectors` keyword scoring (exists).
  2. An alias and brand-name dictionary generated from template names and keywords
     ("github", "gh", "slack", "mail" → email/sendgrid, "sheet").
  3. If a brand matches an API index service but not an OOTB connector, the result is the REST
     card plus the top 5 operations by lexical match against the user text.
  4. If nothing matches but the text implies an API call ("call", "fetch", "API", "webhook",
     "endpoint", a URL), the REST card alone.
  - Caps: at most 3 cards per task, 8 cards and 6 API operations in total, about 700 tokens.
- **Drop:**
  - Pass 1 is unchanged.
  - New route `POST /drop/api/connect`. It takes the diagram as text, the user text and the
    selected cards. The prompt is the fixed `CONNECT_GUIDE` prefix, then the diagram, then a
    fenced "Connectors per task" block, then the user text. It streams `with` lines through
    `createChangeLineFilter`, and goes through the same gates and rate limits as generate.
  - After a fresh generation, the client calls it automatically and applies the result with the
    questions UI. "Add connectors" on an existing or shared diagram shows the result in the
    proposal dialog (#211), and it can be shared as a suggestion (#212).
  - Model: the bench decides between `glm-4.7-flash` and the fallback model for pass 2. The
    output cap is set per diagram as about 40 tokens × candidate tasks.
- **Refine and feedback edits** keep the `with` lines the writer emits. When an edit adds a new
  integration task, pass 2 runs for the new tasks only.
- **CLI / Claude plugin:** `casen connector cards "<query>"` prints cards. The `connect` and
  `implement` skills tell Claude to call it before writing a plan. This needs no model-side
  retrieval tooling.
- **Proxy MCP:** add a generic `add_connector { id, alias, operation, values }` tool beside
  `add_http_call`, backed by the same resolver, and a `find_connectors { query }` tool that
  returns cards.

### WS7 — Making it executable, and proving it

- **Static gate (always):** after `expand`, every connector task has applied with no
  `missing-required`, `unknown-key` or `invalid-feel` problem. Each remaining problem becomes a
  `ProcessTextQuestion`, shown in Drop's existing questions UI (#209).
- **Lint:** the existing `connector/missing-required` rule (`optimize/deploy.ts:177`) runs in
  `lintDiagram` on the result.
- **Dry run:** `ProcessTest` with `mockConnector(jobType, response)` for every connector task
  and the default branch taken. It must reach an end event. Drop can run it in the browser
  through `@bpmnkit/engine`; the CLI runs it in a new `casen synth --check` flag.
- **Live run (optional, user-triggered):** Studio's WASM engine already executes
  `io.camunda:http-json:1` through the local proxy (`apps/studio/src/api/wasm-adapter.ts:133`). A
  "Try it" action runs GET-only REST tasks for real. Other connectors stay mocked, because they
  need secrets.
- **Secrets checklist:** the generated result lists every `{{secrets.X}}` it needs, so the user
  knows what to configure in the Camunda console before deploying.

## 6. Where each part lives

| Piece | Package | Notes |
|---|---|---|
| Catalog, apply, validate, slim data, aliases, cards, `selectConnectors` | `@bpmnkit/core/connectors` (new subpath) | Main entry unchanged |
| Full templates with icons, `./node` discovery | `@bpmnkit/connectors` | Re-exports core; 1.x non-breaking |
| OpenAPI → API index data and build script | `@bpmnkit/connector-gen/api-index` | Too big for core |
| `with` lines in parser, writer, delta, guide | `@bpmnkit/core` (`process-text*.ts`, `process-delta.ts`) | |
| Prompt assembly, token caps, questions UI | `apps/drop` | |
| `casen connector cards`, `synth --check` | `apps/cli` | |
| `add_connector`, `find_connectors` | `apps/proxy`, `apps/proxy-rs` | |
| Skill references | `plugins-claude/bpmnkit-claude` | Generated |

## 7. Phases and order

| Phase | Content | Depends on | Size |
|---|---|---|---|
| P0 ✅ | WS1 defect fixes plus their tests; bench scores `mustContainTaskTypes` (done 2026-10-02) | — | S |
| P1 | WS2: move the catalog into core, slim data, shim, sync workflow | P0 | M |
| P2 | WS3 cards with per-operation conditions; regenerate skill reference; `casen connector cards` | P1 | M |
| P3 | WS5 `with` lines: parser, delta, writer, resolver in `expand`, `CONNECT_GUIDE`; unit tests | P1, P2 | L |
| P4 | WS6 per-task retrieval; Drop pass 2 (`/drop/api/connect`, auto after generate, "Add connectors" action); one rule line added to the pass 1 prompt; bench with 10 new connector golden prompts | P3 | M |
| P5 | WS4 API index and API cards; GitHub/Stripe/Notion golden prompts | P2 (cards), P4 | L |
| P6 | WS7 dry run in Drop and CLI, secrets checklist, Studio "Try it" | P3 | M |
| P7 | Proxy MCP tools, docs (`apps/landing` connectors guide, `doc/features.md`, docspack rebuild), changesets | P4 | S |

P0–P4 already deliver the headline case for all OOTB connectors and the generic REST connector.
P5 makes REST calls to arbitrary APIs accurate rather than recalled.

## 8. Decisions and risks

**Decided (2026-10-01):**

- **D1 — Connectors in core:** a `@bpmnkit/core/connectors` subpath with slim data (WS2). Core's
  main entry does not grow, and `@bpmnkit/connectors` becomes a 1.x-compatible shim.
- **D2 — API index:** lives in `@bpmnkit/connector-gen/api-index`, not in core. Core holds the
  `ApiCard` type and the selector.
- **D3 — Model choice:** the bench decides per pass. Pass 1 stays on the fast model; pass 2 may
  use the stronger one.
- **D4 — Two-pass flow:** a fast structure pass, then a connect pass (§4).

**Risks:**

1. **Two calls cost latency.** This is covered in §4.2: pass 2 is skipped when nothing matches,
   and the diagram is visible before pass 2 starts. The bench reports total time per prompt.
2. **Pass 1 hides integrations.** It may merge "fetch from GitHub and post to Slack" into one
   task. The new rule line in the pass 1 prompt targets this, and the bench measures it with
   `mustContainTaskTypes`. If one task names two systems, pass 2 asks a question ("split into two
   tasks?") instead of guessing.
3. **Small-model capacity.** This is smaller than in a one-pass design, since pass 2 writes only
   `with` lines. The mitigations still apply: tight cards, a strict key list per card,
   deterministic repair and model routing.
4. **Template drift.** Marketplace versions change keys. The weekly sync PR plus the
   slim-vs-full equivalence test catch that. Aliases are pinned, so recorded answers keep
   parsing.
5. **Licensing of OpenAPI specs.** Most are MIT or Apache, but check each `CATALOG` entry's
   licence before committing derived data. Drop entries whose licence forbids it.
6. **Security.**
   - Model-written URLs are untrusted. Drop never calls them server-side.
   - The Studio "Try it" run goes through the proxy's existing allow-list and hardening (#202).
   - Secret values are never accepted from the model.
7. **Token cost on refine and feedback edits:** `with` lines are written back into the prompt.
   Keep them short (no default values written) and measure.

## 9. Evaluation

- Re-enable `mustContainTaskTypes` in `bench-generate.mjs` `score()`, and add:
  - `connectorApplyClean`: zero apply problems
  - `secretsOnly`: no literal tokens
  - `dryRunReachesEnd`
  - `integrationTasksSeparate`: pass 1 gives each named system its own task
  - `pass2SkippedCorrectly`: no connect call for prompts with no integration
  - total time and output tokens per pass
- New golden prompts in `scripts/eval-generation/prompts/`:
  - GitHub issue triage → Slack
  - Stripe refund over REST
  - SendGrid order confirmation
  - Kafka publish
  - OpenAI summarise then email
  - Google Sheets append
  - Generic "call our internal API at https://…"
  - Webhook start → REST → Teams
  - SQS consume → Lambda
  - An ambiguous "notify the team"
- Recorded answers replay in `apps/drop/tests/generate.test.ts` as today, so the bench gates
  regressions without network.
- Report per phase in `doc/progress.md`: pass rates per model and median output tokens, before
  and after.
