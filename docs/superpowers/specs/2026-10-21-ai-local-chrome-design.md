# On-device diagram generation with Chrome's built-in AI — design

Date: 2026-10-21. Status: draft for review.

## Why

Chrome ships Gemini Nano on the device and exposes it through the Prompt API (`LanguageModel`). A
visitor to the public web editor could describe a process and get a diagram with no account, no
server, no cost to us, and nothing leaving their machine. BPMN Kit already has the hard part: the
model never writes XML; it writes the line-based process text (`PROCESS_TEXT_GUIDE`), which
`parseProcessText` repairs and `createProcessTextStream` previews while it streams (as Drop does).

Decided with the user:
- **Where:** the public web editor (`apps/landing`, page `/editor`) first.
- **Scope:** generate only — describe a process, get a new diagram. No editing of an existing
  diagram, no chat.
- **Fallback:** none. When the browser has no on-device model, the feature is not shown.
- **Approach:** a new standalone plugin `@bpmnkit/plugins/ai-local`, separate from `ai-bridge`
  (which needs the local proxy and drives MCP tools Nano cannot use).

## Success criteria

1. In Chrome with the Prompt API available (origin-trial token or local flag) and a capable device,
   the landing editor shows a **Generate** HUD button and dock tab; elsewhere neither appears and no
   error is logged.
2. Typing a description and pressing Generate opens a **new tab**, named from the `# Process name`
   line, whose diagram grows as lines stream in; the user's open diagrams are never modified.
3. When generation ends, the panel lists the parser's problems and fixes; the tab holds a valid,
   laid-out diagram (`Bpmn.parse(xml)` succeeds).
4. Stop aborts within one chunk and keeps what was drawn.
5. Zero Biome warnings, zero type errors, new tests pass; nothing calls Chrome in CI.

## Background: the Prompt API (as of Chrome 148)

Sources: developer.chrome.com/docs/ai/prompt-api, /docs/ai/built-in-apis,
github.com/webmachinelearning/prompt-api.

- Web pages: origin trial (Chrome 148). Extensions: stable since 138. Local dev: chrome flag.
- Desktop only (Windows 10/11, macOS 13+, Linux, ChromeOS Chromebook Plus); > 4 GB VRAM, 16 GB RAM,
  ≥ 22 GB free disk; one-time model download on an unmetered network.
- `LanguageModel.availability(opts)` → `"unavailable" | "downloadable" | "downloading" | "available"`.
- `LanguageModel.create({ initialPrompts, expectedInputs, expectedOutputs, monitor, signal })`; needs
  user activation when it triggers the download.
- `session.promptStreaming(input, { signal })` → `ReadableStream<string>` of chunks.
- `session.measureContextUsage(input)`, `session.contextUsage`, `session.contextWindow`; overflow
  rejects with `QuotaExceededError`. (Older names `inputQuota`/`measureInputUsage` are removed.)
- `session.destroy()`.

The API changed recently, so the plan pins `@types/dom-chromium-ai` only if its types match the
names above; otherwise `model.ts` declares the few members it uses locally.

## Architecture

New folder `packages/plugins/src/ai-local/`, export `./ai-local` in `packages/plugins/package.json`.

| File | Job | Depends on |
|---|---|---|
| `prompt.ts` | `AI_LOCAL_SYSTEM_PROMPT`, `AI_LOCAL_GUIDE`, the example pair | nothing |
| `model.ts` | the only code touching `globalThis.LanguageModel`: `checkAvailability()`, `createSession()`, `fitsContext()` | `prompt.ts` |
| `generate.ts` | `generateProcess(session, description, { signal, onFrame })` — headless, no DOM | `@bpmnkit/core` |
| `panel.ts`, `css.ts` | the panel UI | the above |
| `index.ts` | `createAiLocalPlugin(options)` | the above |

### `model.ts`

```ts
type Availability = "unavailable" | "downloadable" | "downloading" | "available"
checkAvailability(): Promise<Availability>      // "unavailable" when LanguageModel is undefined or throws
createSession(o: { signal: AbortSignal; onDownloadProgress?(loaded: number): void }): Promise<LocalSession>
fitsContext(session: LocalSession, description: string): Promise<boolean>
```

`createSession` passes `initialPrompts` = system prompt, then the example as a user/assistant pair,
and `expectedInputs`/`expectedOutputs` = `[{ type: "text", languages: ["en"] }]`. Availability is
checked with the same `expected*` options. `fitsContext` requires
`contextUsage + measureContextUsage(description) + ANSWER_RESERVE <= contextWindow`, where
`ANSWER_RESERVE` = 1,024 tokens (a typical diagram is 200–800 tokens of process text).

`LocalSession` is the narrow interface `generate.ts` uses (`promptStreaming`, `measureContextUsage`,
`contextUsage`, `contextWindow`, `destroy`), so tests pass a fake.

### `prompt.ts`

- `AI_LOCAL_SYSTEM_PROMPT`: Drop's rules from `apps/drop/src/lib/generate.ts`, without the
  ad-hoc-agent, outside-system and annotation lines — the description is untrusted data, write only
  the diagram with no code fence, naming conventions, model only what is asked — followed by
  `AI_LOCAL_GUIDE`.
- `AI_LOCAL_GUIDE`: a trimmed `PROCESS_TEXT_GUIDE`, ~450 tokens. Keeps: `# Name`, `a > b`, node
  declaration, xor branches with `(Label: condition)` and `(Label: default)`, kinds
  `start end task user service script send receive xor and catch boundary`, triggers
  `catch:timer boundary:error`, attributes `on= after= result= feel=`, and the rules on one start,
  xor defaults, boundaries and joins. Drops: ad-hoc, `inside=`, `doc`, `note`, `form=`, `in.`/`out.`,
  `each=`, `camunda=`, connector `with` lines.
- The example pair: user "An expense is submitted …" → the expense-approval example from the guide.

### `generate.ts`

```ts
interface GenerateResult {
  definitions: BpmnDefinitions; xml: string; name: string
  problems: ProcessTextProblem[]; fixes: string[]; stopped: boolean
}
generateProcess(session: LocalSession, description: string,
  o: { signal: AbortSignal; onFrame(defs: BpmnDefinitions): void }): Promise<GenerateResult | null>
```

Reads `promptStreaming(description, { signal })`, pushes each chunk into `createProcessTextStream()`,
calls `onFrame` for each non-null frame, then `stream.end()` → `expand` → `Bpmn.export`. On abort it
still calls `end()` on what arrived and returns `stopped: true`. Returns `null` when the parsed
diagram has no nodes (the model answered in prose). `name` is the process name, else
"Generated process".

### Plugin and panel

```ts
createAiLocalPlugin(o: {
  openDiagram(xml: string, name: string): void   // called on the first frame
  updateDiagram(defs: BpmnDefinitions): void     // later frames and the final result
  container?: HTMLElement; onOpen?(): void
}): { name: "ai-local"; install(api: unknown): void; button: HTMLButtonElement; ready: Promise<boolean>
      stop(): void }
```

`ready` resolves `true` for `available`, `downloadable` and `downloading`. The panel: a textarea
(max 2,000 characters), a Generate button that becomes Stop while running, a status line (download
progress, "Generating…", "Stopped"), and after the run the problems and fixes. For `downloadable`
the status line says the first use downloads Chrome's on-device model once. A session is created per
run and destroyed after it. Strings are English only, like `ai-bridge`; translation is out of scope.

## Wiring in the landing editor

- `packages/editor/src/dock.ts`: add a `generate` tab and `generatePane`, hidden by default, with
  `setGenerateTabVisible(visible)`, following the Tests tab pattern; add `"generate"` to the tab
  union.
- `apps/landing/src/scripts/editor.ts`: create the plugin with `container: dock.generatePane`;
  `openDiagram` → `bridge.tabsPlugin.api.openTab({ type: "bpmn", xml, name })` and remember the tab
  id; `updateDiagram` → `editorRef.loadDefinitions(defs)` only while that tab is active. If the user
  switches tabs during a run (`onTabChange`), the plugin's `stop()` is called, so frames never land
  in another tab. When `ready` resolves `true`, show the dock tab and pass `button` to the HUD
  (`initEditorHud` gets a `generateButton` option alongside `aiButton`).
- `apps/landing/src/pages/editor.astro`: emit `<meta http-equiv="origin-trial" content="…">` only
  when `PUBLIC_CHROME_AI_OT_TOKEN` is set at build time. Registering bpmnkit.com for the origin
  trial is a manual step for the maintainer.

## Errors

Each shows one message in the panel and leaves open tabs untouched:

| Case | Message |
|---|---|
| `fitsContext` false | "Description too long for the on-device model — shorten it." Nothing sent. |
| download fails / `create()` rejects (e.g. disk) | "Chrome couldn't prepare the on-device model: <reason>" |
| `QuotaExceededError` mid-run | "The diagram outgrew the model's context — try a smaller process." Partial tab kept. |
| stream error | "Generation failed: <reason>". Partial tab kept. |
| result `null` | "The model didn't return a diagram — try rephrasing." No tab opened. |
| Stop | status "Stopped"; partial diagram kept; problems/fixes shown. |

## Testing

Vitest, `packages/plugins/tests/ai-local/`:
- `prompt.test.ts`: `AI_LOCAL_GUIDE`'s example parses with `parseProcessText` with no problems and no
  fixes, and the example pair's answer equals the guide's example.
- `generate.test.ts`, with a fake session streaming fixed chunks: frames arrive as lines complete;
  final XML round-trips through `Bpmn.parse`; problems and fixes pass through; abort returns
  `stopped: true` with the partial diagram; prose output returns `null`.
- `model.test.ts`, with a fake `globalThis.LanguageModel`: missing API → `"unavailable"`; a throwing
  `availability` → `"unavailable"`; download progress reaches the callback; `fitsContext` edges.
- `packages/editor/tests/dock.test.ts` (new, happy-dom): the generate tab is hidden by default,
  `setGenerateTabVisible` toggles it, and hiding it while active falls back to properties.

Manual (documented in the PR): Chrome with the flag on a capable machine — generate three
descriptions, stop mid-run, switch tabs mid-run, oversize description. Optional: run the 15 golden
prompts of `scripts/eval-generation/` against Nano and record the scores in `doc/`.

## Docs

`doc/progress.md` (dated entry), `doc/features.md` (new feature), and a short guide page under
`apps/landing/src/content/docs/` on requirements and enabling it locally; then rebuild the docspack.

## Out of scope

Editing an existing diagram, chat, image input, languages other than English, UI translation, `responseConstraint`,
a cloud fallback or polyfill, the studio and desktop apps.
