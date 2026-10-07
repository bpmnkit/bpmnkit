# @bpmnkit/drop

## 0.4.0

### Minor Changes

- f11e88f: The editor on a drop gets a properties panel: select one element to see and change its configuration — name, task type, connector inputs, conditions, timers. It is fetched as its own chunk once the editor is open, so neither readers nor the editor's start wait for the connector templates, and it opens beside an open side panel (Ask AI, history, comments) instead of covering it.

### Patch Changes

- f11e88f: The check after a draft asks for FEEL where it is missing: a step named for a computation from process data ("Calculate the count of open issues") that is not a script task with a FEEL expression gets one change request naming it.
- Updated dependencies [f11e88f]
- Updated dependencies [f11e88f]
  - @bpmnkit/core@1.4.0
  - @bpmnkit/editor@1.4.0

## 0.3.0

### Minor Changes

- ba14aa5: API cards: real endpoints of HTTP APIs for the REST connector, from an offline index.
  - **`@bpmnkit/connector-gen/api-index`**: the base URL, authentication and endpoints of 78 HTTP APIs (20,327 operations), built from the catalog's OpenAPI specs by `scripts/build-api-index.mjs`. It is one lazily loaded module per service (`API_SERVICES`, `loadApiService`, `loadApiServices`). Specs that state a non-permissive license are left out. Notion's catalog spec URL is fixed.
  - **`@bpmnkit/core/connectors`** (re-exported by `@bpmnkit/connectors`):
    - `selectConnectors(…, { apis })` offers the REST connector with an **API card** — the service's best-fitting endpoints — for a task that names a system without a dedicated connector, or one whose connector lacks the operation.
    - On an `http` line, `api=<service>` or a URL under the service's base URL gets the base URL, `{param}`s as FEEL, authentication with a secret placeholder, and required headers (`applyConnectorLines(…, { apis })`). A call the index lacks becomes a question.
    - New exports: `apiServicesIn`, `findApiOperations`, `rankApiOperations`, `findApiOperation`, `formatApiCard`, `formatApiOperation`, `apiUrl`, `apiAuthValues`, `apiSecretNames`, `apiBrand` and the `ApiService` types.
  - **`@bpmnkit/cli`**: `casen connector api "<request>"` prints the endpoints of the API a request names.
  - **`@bpmnkit/drop`**: the connect pass loads the services a request names and shows their endpoints to the model. `bench:generate` scores `mustCallUrls`, with new Notion and GitHub-workflow-runs golden prompts.

- ba14aa5: The connect pass: generated and shared diagrams get their Camunda connectors configured.
  - **`@bpmnkit/core/connectors`** (re-exported by `@bpmnkit/connectors`): `selectConnectors({ text, tasks })` picks the connector cards for each task of a diagram, in code. A card qualifies when the task's name names the system, when the request names it and no other task does, or when the task's name shares a word with the connector's name. REST is the fallback for HTTP-call tasks. A task with no candidate is left out. `formatConnectorSelection` writes the picked cards as a prompt block. `applyConnectorLines` now changes only the inputs a line names when the element already carries the same connector.
  - **`@bpmnkit/drop`**: `POST /drop/api/connect`, on when `AI_CONNECT_MODEL` is set.
    - It picks the cards, asks the model for `with` lines only, and applies them on the server; with nothing to connect it is skipped without a model call.
    - The "Describe a process" generator runs it after every draft and change. Required inputs it left out become questions answered with one line, applied without a model.
    - Shared diagrams get **Add connectors** while editing, as one undoable change.
    - The first-draft prompt asks for one service task per outside system.
    - `bench:generate --connect` scores the connected diagrams. Ten connector golden prompts are added, and a crash at the end of golden-prompt runs is fixed.

- 98667b4: Open a generated draft in the editor, and keep changing it there with an AI chat.
  - **Open in editor** on describe-to-diagram stores the draft as a drop, like Get a share link, and goes to it with `#edit`: the page claims the editor on arrival and opens the AI chat beside it.
  - **Ask AI** while editing (on when `AI_PASSCODE` and `AI_FEEDBACK_MODEL` are set) takes a request in your own words, about the selected elements or the whole diagram. It goes through `POST /drop/api/ai-edit` — which now takes `{ xml, request, elementIds? }` besides `threadIds` — and its change script is applied with the layout kept, as one editor change that Undo reverts.

- ba14aa5: Prove a generated process runs, and list the secrets it needs.
  - **`@bpmnkit/engine/testing`**: `dryRun(definitions, { processId, variables, response })` runs a process once from start to end with every connector and job mocked. It delivers the messages it waits for and moves the clock for timers. It reports `reachedEnd`, the path, the connectors passed, and where and why it stopped.
  - **`@bpmnkit/core`**: `listSecrets(definitions)` lists every `{{secrets.X}}` / `camunda.secrets.X` a diagram reads, with the elements that read it.
  - **`@bpmnkit/cli`**: `casen synth --check` dry-runs the compiled processes and lists their secrets. A process that cannot reach its end fails the command.
  - **`@bpmnkit/drop`**: drafts with connectors show their secrets and a dry-run result. `bench:generate --connect` dry-runs each connected diagram.
  - **`@bpmnkit/studio`**: **Try it** runs a model on the local engine, sending only GET requests for real and simulating everything else.

### Patch Changes

- ba14aa5: Connect pass fixes from its first real benchmark.
  - **Card selection** (`selectConnectors`):
    - A connector the request names is no longer crowded out by another connector's operations, so SendGrid shows up for an email task.
    - A connector naming a system nobody asked for ranks lower (Azure OpenAI for "OpenAI").
    - Deprecated templates are no longer offered.
    - A task that names only an API ("Call Stripe REST API") gets endpoints that match the request.
    - A REST call the request asks for reaches the task it is for.
  - **The `with`-line resolver** now repairs:
    - a line copied from an API card's head;
    - `{{variable}}` and `${variable}` written instead of FEEL;
    - a `{{param}}` in a path;
    - a path written without `api=`.

    A short alias no longer matches another connector two letters away.

  - **Drop:**
    - A line is matched to its node by id in any case. If the id names no node, or a node no card was offered for, the line goes to the task its connector fits; with several, to the one whose name shares the line's words.
    - A second line for a node is reported.
    - A line missing its `with` is kept.
  - **More resolver repairs:** a line starting with an HTTP method is read as a REST call, and `==#channel` is read as the text it is.
  - **Drop, degenerate answers:** an answer of nothing but `!` (gpt-oss-120b's token 0, about 1 draft in 20 in the benchmarks) is given up on before it reaches the reader. The fallback model answers instead, or the reader is told to try again.
  - **More near misses repaired:** a line naming its node by label, a line without the colon after its id, headers written as text, and a system named in the singular ("Google Sheet").
  - **From the fourth benchmark:** a service of the API index written as the alias (`stripe POST /v1/refunds`) is read as a REST call to it. Several inputs in one `|` part (`region=… functionName=…`) are split, and a `*` copied from a card is dropped. In Drop, a line naming a flow (`start > summarize:`) is read as one for its last node, and a line that copied the node's kind (`service Run AWS Lambda …`) gets the node's first card.
  - **Drafting repairs:** `parseProcessText` reads an id written with spaces before its bracket (`call back[…]`) as one id, and makes a catch event named for a call it makes ("Send to SQS") a service task. `selectConnectors` ranks the request's system first on a task that names one the request does not ("Post summary to Slack" when the request says Teams). Drop's drafting prompt asks for the system the description names.
  - **From the fifth benchmark:** a bracket left open is closed where the name ends, and an id declared again after an arrow with a name of several words is a new node. `selectConnectors` leaves out an API card when the dedicated connector covers the request as well as the index does, and leaves out connectors that only share a word with a task that names its system. In Drop, `with` lines run together on one line are split.
  - **From the sixth benchmark:** the resolver reads an SDK call (`chat.completions.create`) as the operation it starts with, and keeps the path an `api=` line completes over a FEEL `url=`. `isConnectorAlias` is exported. In Drop, a line with the node's id in the alias's place, a copied `[declaration]`, a label before the alias, a flow with free text, or an alias no connector has is repaired, and a misplaced line may take a task from a line whose connector is not offered there.
  - **From the seventh and eighth benchmarks:** `parseProcessText` reads numbers as ids (`n1`), a line starting with an arrow as continuing the path above, and a space before an arrow's label. `selectConnectors` gives a service only the request names to no task that names another system. The resolver spells an API path's words as the service does, reads `${x}` inside FEEL as `x`, and reads an operation the connector lacks as the one sharing the longest start with it. Drop splits a flow of connector steps written on one line, and drops the connect guide's example lines when a model copies them.
  - **Bench:** a golden prompt's `mustContainTaskTypes` entry may list alternatives. Prompt 10 accepts SendGrid or the Email connector, and prompt 20 the OpenAI or the AI Agent connector.
  - **From the ninth benchmark:** `parseProcessText` reads a kind and a name without brackets after an arrow as a declaration. `selectConnectors` no longer makes a connector a candidate by a generic word alone (request, document, file, data, report, record, form). In Drop, a `with` line naming no connector gets the node's first card.
  - **API ranking:** `rankApiOperations` no longer counts the parts of a service's name ("git" and "hub" of GitHub) and weighs a word most of a service's operations share down, so "List failed GitHub Actions runs" ranks the workflow runs endpoint first. `selectConnectors` lets a dedicated connector's operation cover a task only when its verb and resource fit, and compares the same words in its request check. Drop's drafting prompt asks for tasks named in the description's own words.
  - **From the tenth benchmark:** the resolver reads an API card's summary written where the path goes as that operation. In Drop, an unknown alias read as a REST first card keeps the line's method and path, with the task's API.
  - **Drafting:** the line format gains `each=<list>` (a multi-instance task or sub-process) and `after=<duration>` (a timer's duration; also read from a timer's name), carried by `CompactElement.multiInstance` and `CompactElement.timerDuration`. An attribute written before the bar is read. The guide's example shows a parallel split, `each=` and a timer boundary. Drop's drafting prompt gives a REST call an error boundary.
  - **Drafting, after the bench:** the guide's example is its original four lines again, as glm copied example lines into unrelated processes; parallel work, deadlines and `each=` are taught as rules. A pass-through `and`/`or` node named like a step becomes a task, and pass-through gateways left by a removal are removed too.
  - **Drafting repairs:** a step named for each or every item ("Send email to each stakeholder") is multi-instance over the list, and a DMN decision's unlabelled outcomes split with an xor instead of running in parallel. Drop reads a diagram line copied before the colon as a `with` line, and keeps a copied guide example where its connector was offered.
  - **More drafting repairs:** `after=` on an event that is not a timer makes it one, ISO durations are read in lower case, and a boundary without `on=` that one task is drawn into goes on that task.
  - **Drop checks each draft against its request:** when the request names a DMN decision, a time limit, a failure or REST call to handle, parallel work, a step per list item, a person's work or a message to wait for that the draft has no element for, one change request asks for exactly that, and its answer is kept only when it fills a gap without losing an element. `bench:generate` runs the same check (`--no-check` to leave it out).
  - **Drafting repairs from the draft check:** steps in a row between two `and` nodes run in parallel, a catch event with `on=` a task is a boundary event (and the arrow from that task into it is dropped), and a named gateway with `each=` is a task run per item. `bench:rescore` re-evaluates completions the check dropped.
  - **From the five-run bench:** a URL written where a `with` line's alias goes is a REST call to it, and a method after the service in `api=` (`api=github GET`) is the call's method.

- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
  - @bpmnkit/connector-gen@1.1.0
  - @bpmnkit/core@1.3.0
  - @bpmnkit/editor@1.3.0
  - @bpmnkit/plugins@1.2.1
  - @bpmnkit/engine@1.2.0

## 0.2.1

### Patch Changes

- Updated dependencies [461287b]
  - @bpmnkit/plugins@1.2.0

## 0.2.0

### Minor Changes

- 471c6bd: AI proposals can be shared on their threads as suggested changes (migration `0010_comment_suggestions`, `POST/PATCH /drop/api/suggestions/…`, listed with the comments). A suggestion stores its change script, never a description: every reviewer's preview is worked out again against their own document, without asking the AI. Whoever holds the baton can apply it, which replies on its threads and records it applied. Its author can withdraw it.

## 0.1.0

### Minor Changes

- 78ccbf9: AI changes from review comments (closed beta). While editing a BPMN drop, "Apply with AI" on an open comment thread, or on all of them, asks the model named by the new `AI_FEEDBACK_MODEL` var to make the change the threads ask for. The page shows the proposal first: a preview, the changes per thread, and removals, conditions and job types to look at closely. Apply makes one undoable edit, then replies on each answered thread and resolves it. New route `POST /drop/api/ai-edit/:shareId/:filename`, with the same passcode, Turnstile pass, budget, hourly cap and cache as describe-to-diagram. `bench:generate --feedback` compares models on 11 review cases.
- 78ccbf9: A comment can be on several elements (Shift-click them; migration `0009_comment_element_ids`, `CommentView.elementIds`), and AI changes read such a thread as one on all of them. Each AI review suggestion has "Apply with AI": it becomes a comment thread, which the change answers and resolves. Replies on a changed gateway say what changed on its branches.
- 48e48de: Describe a process, get a diagram. The new "Describe a process" section on `/drop` sits behind the AI review's closed-beta passcode. It sends a plain-language description to Workers AI and draws the BPMN line by line as the model writes it. The reader can then share the result like any upload.

  Answers are cached in D1, and the daily neuron budget is charged from the model's reported usage. `AI_GENERATE_MODEL` picks the model. Migration `0007_ai_generations`.

- 48e48de: Describe-to-diagram hedges against Workers AI queueing. If `AI_GENERATE_MODEL` has written nothing after `AI_GENERATE_HEDGE_MS` (1500 ms), or fails first, the request also goes to `AI_GENERATE_FALLBACK_MODEL`, which is gemma-4 by default. Whichever model writes first is streamed and the other is cancelled.

  Both calls are charged to the daily budget. The winner's answer is cached under the request. Each generation logs `drop.generate` with the winning model and whether it hedged.

- fba1456: Describe-to-diagram drafts from an image: pick or paste a whiteboard photo, sketch or screenshot, with an optional description. The page scales it down and re-encodes it as JPEG. `POST /drop/api/generate` accepts `{ image, description? }` and sends it to the vision model `AI_GENERATE_IMAGE_MODEL` (default `@cf/google/gemma-4-26b-a4b-it`). The answer streams, is cached and can be changed like a typed draft. Leave the var unset to refuse images.
- 0afd35e: Describe-to-diagram: change a draft by asking, and answer the parser's guesses.
  - `parseProcessText` returns `questions`: the guesses it had to make that only the reader can confirm. These are a made-up condition variable, a default branch it picked, branches it put in parallel, a question answered one way only, a task left out, a loop exit it added, and an event given a message trigger. Each has ready answers where there are any, and a `draft` to finish, all written as change requests. New type `ProcessTextQuestion`.
  - Drop: once drawn, a draft takes change requests. `POST /drop/api/generate` accepts `{ description, diagram, change }`, and the model writes the whole diagram again with the change made. The page lists the parser's questions under the diagram, sends an answer as a change, and can undo each change.
  - Drop: a working indicator on the canvas while a request runs, with the seconds counted until the first line.
  - Drop: only lines in the diagram format are streamed back from the model, and each IP may make at most 40 model calls an hour (migration `0008_ai_generate_calls`).
  - Drop: with `TURNSTILE_SECRET` set, describe-to-diagram asks for one Turnstile challenge per 30 minutes, then carries a signed pass.
  - `bench:generate --edits` measures changes on 10 cases, including how much of the draft each answer keeps.

### Patch Changes

- 48e48de: Describe-to-diagram caps output at 600 tokens for models that do not reason: glm-4.7-flash, gemma-4 and granite. In the benchmark, the longest real diagram was 191 tokens. One answer that "thought aloud" instead ran to the old 2,048-token cap, taking 37 s and about 11× the usual neurons. Reasoning models keep 2,048.
- 502cc73: `parseProcessText` keeps the structural rules `lintDiagram` checks, whatever the model wrote.
  - Every node is on a path from a start event. A task or gateway nothing leads to continues the latest path that stops short of an end event. What is still unreached is left out and reported, and is never drawn as a loose node.
  - A gateway with one way in and one way out is removed.
  - A task or event with several ways out gets an xor split when its branches are labelled, and a parallel split when they are not.
  - Joins match the split they close. A gateway that both joins and splits gets its own join.
  - Every decision has one default, and every other branch has a FEEL condition. A branch written in prose gets a condition on a variable named for the gateway's question.
  - Unnamed elements are named.
  - Only the first blank start event is kept. An event-based gateway with one way out becomes a catch event. A flow from a node to itself is refused, and a loop with no way out gets an exit.
  - A branch drawn into a boundary event continues to the path that boundary leads to.
  - A loop with no decision loses the flows that close it, so every path ends. A link event in a path becomes a plain event.
  - Unlabelled flows from one node that all wait, at least one on a catch event, become a race behind an event-based gateway.
  - A catch or boundary event written without a trigger becomes a message event.

  `PROCESS_TEXT_GUIDE` teaches these rules. `pattern/gateway-single-outgoing` no longer flags join gateways.

- Updated dependencies [0afd35e]
- Updated dependencies [48e48de]
- Updated dependencies [78ccbf9]
- Updated dependencies [48e48de]
- Updated dependencies [48e48de]
- Updated dependencies [48e48de]
- Updated dependencies [502cc73]
  - @bpmnkit/core@1.2.0
  - @bpmnkit/editor@1.2.0

## 0.0.12

### Patch Changes

- 56ad670: Process documentation export: a document to circulate, built from the model.

  `@bpmnkit/core` adds `renderDocumentationHtml`, `renderDocumentationMarkdown` and `renderDocumentationDocx`. They take parsed definitions plus optional DMN decisions and forms. The HTML is self-contained and print-ready: an inline SVG diagram on a landscape page, a table of contents, and a section per process or pool. Each section has its lanes, a steps table and a detail block for every element in flow order: type, documentation, lane, job type, headers, mappings, called decision, called process, form, assignment, timers, messages, errors and the conditions on outgoing flows. The decision tables and form fields follow. Print → Save as PDF gives a clean PDF on A4 or Letter. Markdown has the same content without the diagram. The Word file is a small hand-written OOXML package with the diagram as SVG. `buildProcessDocumentation` returns the structured content, and `documentationToHtml`, `documentationToMarkdown` and `documentationToDocx` render it. Output is deterministic and all model text is escaped.

  `@bpmnkit/editor`: the HUD's More menu has **Export documentation…**. It offers a print view, HTML, Markdown and Word. The new `getDocumentationContext` option on `initEditorHud` supplies the linked decisions and forms. All new strings go through the editor's `translate` hook.

  `@bpmnkit/cli`: `casen doc export <file.bpmn> [linked .dmn/.form…] --format html|md|docx [--out] [--title] [--paper a4|letter]`.

  `@bpmnkit/drop`: a shared drop has a **Docs** button for anyone who can read it. It documents the drop's BPMN file together with every DMN and form file in the drop.

- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
  - @bpmnkit/core@1.1.0
  - @bpmnkit/editor@1.1.0
  - @bpmnkit/plugins@1.1.0
  - @bpmnkit/ui@0.3.1
  - @bpmnkit/feel@1.1.0
  - @bpmnkit/canvas@1.0.1

## 0.0.11

### Patch Changes

- Updated dependencies [d910fae]
- Updated dependencies [0ba6ef6]
- Updated dependencies [d910fae]
- Updated dependencies [d910fae]
- Updated dependencies [0ba6ef6]
  - @bpmnkit/plugins@1.0.0
  - @bpmnkit/canvas@1.0.0
  - @bpmnkit/editor@1.0.0
  - @bpmnkit/core@1.0.0

## 0.0.10

### Patch Changes

- Updated dependencies [191d4d2]
- Updated dependencies [f0a0ea2]
  - @bpmnkit/core@0.8.0
  - @bpmnkit/ui@0.3.0
  - @bpmnkit/plugins@0.4.0
  - @bpmnkit/canvas@0.2.5
  - @bpmnkit/editor@0.2.5

## 0.0.9

### Patch Changes

- Updated dependencies [c8ceaaa]
  - @bpmnkit/core@0.7.1
  - @bpmnkit/plugins@0.3.5
  - @bpmnkit/canvas@0.2.4
  - @bpmnkit/editor@0.2.4

## 0.0.8

### Patch Changes

- Updated dependencies [e096585]
  - @bpmnkit/core@0.7.0
  - @bpmnkit/canvas@0.2.3
  - @bpmnkit/editor@0.2.3
  - @bpmnkit/plugins@0.3.4

## 0.0.7

### Patch Changes

- Updated dependencies [780e39d]
  - @bpmnkit/core@0.6.0
  - @bpmnkit/canvas@0.2.2
  - @bpmnkit/editor@0.2.2
  - @bpmnkit/plugins@0.3.3

## 0.0.6

### Patch Changes

- Updated dependencies [53a9e25]
- Updated dependencies [9d412da]
- Updated dependencies [2cdc7f9]
- Updated dependencies [9d412da]
  - @bpmnkit/core@0.5.0
  - @bpmnkit/ui@0.2.0
  - @bpmnkit/canvas@0.2.1
  - @bpmnkit/editor@0.2.1
  - @bpmnkit/plugins@0.3.2

## 0.0.5

### Patch Changes

- Updated dependencies [8fdc6d4]
- Updated dependencies [e4c16a9]
- Updated dependencies [e4c16a9]
- Updated dependencies [e4c16a9]
- Updated dependencies [e4c16a9]
  - @bpmnkit/core@0.4.0
  - @bpmnkit/canvas@0.2.0
  - @bpmnkit/editor@0.2.0
  - @bpmnkit/plugins@0.3.1

## 0.0.4

### Patch Changes

- Updated dependencies [dc33af9]
- Updated dependencies [dc33af9]
- Updated dependencies [dc33af9]
  - @bpmnkit/plugins@0.3.0
  - @bpmnkit/ui@0.1.0

## 0.0.3

### Patch Changes

- Updated dependencies [1d2ec66]
- Updated dependencies [1d2ec66]
- Updated dependencies [1d2ec66]
- Updated dependencies [1d2ec66]
- Updated dependencies [1d2ec66]
- Updated dependencies [1d2ec66]
  - @bpmnkit/core@0.3.0
  - @bpmnkit/canvas@0.1.0
  - @bpmnkit/plugins@0.2.0

## 0.0.2

### Patch Changes

- Updated dependencies [00a65f5]
- Updated dependencies [00a65f5]
- Updated dependencies [f990c94]
- Updated dependencies [00a65f5]
  - @bpmnkit/plugins@0.1.0
  - @bpmnkit/core@0.2.0
  - @bpmnkit/canvas@0.0.31

## 0.0.1

### Patch Changes

- Updated dependencies [9cd1942]
  - @bpmnkit/plugins@0.0.33
  - @bpmnkit/canvas@0.0.30
  - @bpmnkit/core@0.1.2
  - @bpmnkit/ui@0.0.16
