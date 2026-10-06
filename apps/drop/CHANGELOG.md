# @bpmnkit/drop

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
