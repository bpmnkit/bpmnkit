# On-device diagram generation (Chrome built-in AI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `@bpmnkit/plugins/ai-local` plugin that turns a typed description into a new BPMN tab using Chrome's on-device Gemini Nano, wired into the public web editor and hidden wherever the model is unavailable.

**Architecture:** `prompt.ts` (fixed prompt) → `model.ts` (the only code touching `globalThis.LanguageModel`) → `generate.ts` (headless: stream → `createProcessTextStream` → `expand` → `Bpmn.export`) → `panel.ts`/`index.ts` (UI). The landing editor gets a hidden "Generate" dock tab and HUD button that appear once the plugin reports the model is usable.

**Tech Stack:** TypeScript strict, Vitest + happy-dom, Biome, `@bpmnkit/core` (`parseProcessText`, `createProcessTextStream`, `expand`, `Bpmn`), `@bpmnkit/editor` (dock, HUD, chrome styles), Astro (landing).

**Spec:** `docs/superpowers/specs/2026-10-21-ai-local-chrome-design.md`

## Global Constraints

- Done = `pnpm biome check .` with zero warnings, `pnpm turbo typecheck` clean, `pnpm turbo test` green. Never skip or delete tests.
- ESM, `.js` extensions in relative imports. No new runtime dependency. If `@types/dom-chromium-ai` does not declare `contextUsage`/`contextWindow`/`measureContextUsage`, do not add it — declare the members locally in `model.ts`.
- Prompt API names to use: `LanguageModel.availability`, `LanguageModel.create({ initialPrompts, expectedInputs, expectedOutputs, monitor, signal })`, `promptStreaming(input, { signal })`, `measureContextUsage`, `contextUsage`, `contextWindow`, `destroy`. Not `inputQuota`/`measureInputUsage`.
- `expectedInputs` and `expectedOutputs` = `[{ type: "text", languages: ["en"] }]`, in both `availability()` and `create()`.
- Description max 2,000 characters. `ANSWER_RESERVE` = 1,024 tokens. Default name "Generated process".
- UI strings English only (like `ai-bridge`); `ai-local` is not added to the i18n `COVERED` list.
- Panel CSS must pass `packages/plugins/tests/chrome-invariants.test.ts`: no `box-shadow`/`backdrop-filter`/`linear-gradient`, `border-radius` only `50%`/`999px`, no raw hex outside `var(--x, #hex)`, no `--bpmnkit-accent*`; use `--bpmnkit-chrome-*` tokens and `injectChromeStyles()` as `packages/plugins/src/ai-bridge/css.ts` does.
- Never modify the user's open diagrams; output always goes to a new tab.
- Every change gets a dated entry at the top of `doc/progress.md`.

## Review Focus

1. The model wraps its answer in a ``` code fence despite the prompt → the diagram still appears and the fence lines are not reported as problems (test in Task 3).
2. Chunks split mid-line, mid-token, or with `\r\n` → same diagram as parsing the whole text at once (test in Task 3).
3. Generate clicked again while a run is in progress, or with an empty/whitespace description → no second run, nothing sent (tests in Task 4).
4. Availability says `downloadable` but `create()` rejects (e.g. disk) → one error message, no tab opened, button returns to Generate (test in Task 4).
5. The user switches to (or closes into) another tab mid-run → generation stops and no frame lands in that tab (Task 6 wiring; manual check in Task 7's checklist).

---

### Task 1: Prompt

**Files:**
- Create: `packages/plugins/src/ai-local/prompt.ts`
- Test: `packages/plugins/tests/ai-local/prompt.test.ts`

**Interfaces:**
- Produces: `AI_LOCAL_GUIDE: string`, `AI_LOCAL_SYSTEM_PROMPT: string`, `AI_LOCAL_EXAMPLE: { description: string; answer: string }`.

- [ ] **Step 1: Write the failing tests**

```ts
import { parseProcessText } from "@bpmnkit/core"
import { AI_LOCAL_EXAMPLE, AI_LOCAL_GUIDE, AI_LOCAL_SYSTEM_PROMPT } from "../../src/ai-local/prompt.js"

it("the example answer parses with only the expected join", () => {
  const r = parseProcessText(AI_LOCAL_EXAMPLE.answer)
  expect(r.problems).toEqual([])
  // as in core's own guide test: `pay` has two incoming branches, so a join is the only fix
  expect(r.fixes).toEqual(['joined 2 flows into "pay" with xor gateway "pay_join"'])
})
it("the guide contains the example answer", () => expect(AI_LOCAL_GUIDE).toContain(AI_LOCAL_EXAMPLE.answer))
it("the system prompt ends with the guide", () => expect(AI_LOCAL_SYSTEM_PROMPT.endsWith(AI_LOCAL_GUIDE)).toBe(true))
it("leaves out the features Nano doesn't need", () => {
  for (const s of ["adhoc", "inside=", "doc <", "note <", "form=", "in.<", "out.<", "each=", "camunda="]) expect(AI_LOCAL_GUIDE).not.toContain(s)
})
it("stays short", () => expect(AI_LOCAL_SYSTEM_PROMPT.length).toBeLessThan(2800)) // ~700 tokens
```

- [ ] **Step 2: Run** `pnpm --filter @bpmnkit/plugins exec vitest run tests/ai-local/prompt.test.ts` — expected FAIL (module not found).
- [ ] **Step 3: Write `prompt.ts`.** `AI_LOCAL_GUIDE` is the trimmed `PROCESS_TEXT_GUIDE` (in `packages/core/src/bpmn/process-text.ts:37`) keeping exactly what the spec's "prompt.ts" section lists. Its example is the expense-approval example from that guide; `AI_LOCAL_EXAMPLE.answer` is that example verbatim (the constant the guide interpolates), `AI_LOCAL_EXAMPLE.description` a one-paragraph English description of it. `AI_LOCAL_SYSTEM_PROMPT` = the first five lines of `GENERATE_SYSTEM_PROMPT` in `apps/drop/src/lib/generate.ts` (untrusted data, output only the diagram with no code fence, ids, naming, model only what's asked) + blank line + `AI_LOCAL_GUIDE`. A comment says why it's trimmed (Nano's small context).
- [ ] **Step 4: Run** the test — PASS.
- [ ] **Step 5: Commit** `feat(plugins): ai-local prompt for on-device generation`.

### Task 2: Model access

**Files:**
- Create: `packages/plugins/src/ai-local/model.ts`
- Test: `packages/plugins/tests/ai-local/model.test.ts`, shared fake in `packages/plugins/tests/ai-local/fake-model.ts`

**Interfaces:**
- Consumes: `AI_LOCAL_SYSTEM_PROMPT`, `AI_LOCAL_EXAMPLE` (Task 1).
- Produces:
  ```ts
  export type Availability = "unavailable" | "downloadable" | "downloading" | "available"
  export interface LocalSession {
    promptStreaming(input: string, o?: { signal?: AbortSignal }): ReadableStream<string>
    measureContextUsage(input: string): Promise<number>
    readonly contextUsage: number; readonly contextWindow: number
    destroy(): void
  }
  export const ANSWER_RESERVE = 1024
  export function checkAvailability(): Promise<Availability>
  export function createSession(o: { signal: AbortSignal; onDownloadProgress?(loaded: number): void }): Promise<LocalSession>
  export function fitsContext(session: LocalSession, description: string): Promise<boolean>
  ```
- `fake-model.ts` produces `installFakeModel(o: { availability?: Availability; chunks?: string[]; contextWindow?: number; usage?: number; createError?: Error; progress?: number[] }): { created: unknown[]; destroyed: number }` and `uninstallFakeModel()`; it sets/deletes `globalThis.LanguageModel`. Its session streams `chunks` one per `pull`, errors with `signal.reason` when aborted, and records the `create()` options in `created`.

- [ ] **Step 1: Write the failing tests** (`afterEach(uninstallFakeModel)`):
  - `checkAvailability` → `"unavailable"` with no `LanguageModel`; `"unavailable"` when `availability` throws; passes through `"downloadable"`; called with `expectedInputs`/`expectedOutputs` `[{ type: "text", languages: ["en"] }]`.
  - `createSession`: `created[0].initialPrompts` equals `[{role:"system",content:AI_LOCAL_SYSTEM_PROMPT},{role:"user",content:AI_LOCAL_EXAMPLE.description},{role:"assistant",content:AI_LOCAL_EXAMPLE.answer}]`; with `progress: [0.5, 1]` the callback receives `[0.5, 1]`; with `createError` it rejects with that error.
  - `fitsContext`: `contextWindow 4096, usage 1000`, description measuring 2000 → `true` (3,000 + 1,024 ≤ 4,096); measuring 2100 → `false`. (Fake `measureContextUsage` returns `description.length`.)
- [ ] **Step 2: Run** `pnpm --filter @bpmnkit/plugins exec vitest run tests/ai-local/model.test.ts` — FAIL.
- [ ] **Step 3: Implement `model.ts`.** Read `globalThis.LanguageModel` through a local `LanguageModelStatic` interface (`availability`, `create`); `monitor` wires `downloadprogress` events' `loaded` to `onDownloadProgress`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat(plugins): ai-local access to Chrome's Prompt API`.

### Task 3: Headless generation

**Files:**
- Create: `packages/plugins/src/ai-local/generate.ts`
- Test: `packages/plugins/tests/ai-local/generate.test.ts`

**Interfaces:**
- Consumes: `LocalSession` (Task 2), fake session from `fake-model.ts`.
- Produces:
  ```ts
  export interface GenerateResult {
    definitions: BpmnDefinitions; xml: string; name: string
    problems: ProcessTextProblem[]; fixes: string[]; stopped: boolean
  }
  export function generateProcess(session: LocalSession, description: string,
    o: { signal: AbortSignal; onFrame(defs: BpmnDefinitions): void }): Promise<GenerateResult | null>
  ```

- [ ] **Step 1: Write the failing tests**, with the expense example as model output:
  - `streams frames as lines complete`: chunks = the answer split into lines (each with `\n`) → `onFrame` called ≥ 3 times; the last frame contains a task with id `review`.
  - `returns valid XML`: `Bpmn.parse(result.xml)` doesn't throw; `result.name === "Expense approval"`; `stopped === false`.
  - `chunk boundaries don't matter` (Review Focus 2): the answer with `\r\n`, split every 3 characters → `result.xml` equals the XML from one chunk.
  - `ignores code fences` (Review Focus 1): output wrapped in "```text\n…\n```" → result non-null and no problem's text contains "```".
  - `passes problems and fixes through`: output `a[task Do it]` → `fixes` non-empty (start/end added).
  - `prose returns null`: output "Sure! Here is your process." → `null`, `onFrame` never called.
  - `abort keeps the partial diagram`: abort after the second chunk → `stopped === true`, result has the nodes of the first two lines.
  - `no name → "Generated process"`: output without a `#` line.
- [ ] **Step 2: Run** `… vitest run tests/ai-local/generate.test.ts` — FAIL.
- [ ] **Step 3: Implement.** Read the stream with a reader loop; split into whole lines yourself, drop lines matching `/^\s*```/`, and push each kept line plus `"\n"` to `createProcessTextStream()` (so fences never reach the parser). An `AbortError` (or `signal.aborted`) ends the loop with `stopped = true`; other errors rethrow. Then `end()` → `null` if the diagram has no flow nodes, else `expand` → `Bpmn.export`. Name = `diagram.processes[0].name`, else "Generated process".
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** `feat(plugins): ai-local streams process text into a diagram`.

### Task 4: Panel and plugin

**Files:**
- Create: `packages/plugins/src/ai-local/css.ts`, `panel.ts`, `index.ts`
- Modify: `packages/plugins/package.json` (add `"./ai-local"` export after `"./ai-bridge"`, same shape)
- Modify: `scripts/generate-readmes.mjs` (plugins table row next to `/ai-bridge` at ~line 1082: `` | `/ai-local` | `createAiLocalPlugin(options)` | Describe-to-diagram with Chrome's on-device model | ``), then run `node scripts/generate-readmes.mjs` and `node scripts/check-packages.mjs` (exit 0)
- Test: `packages/plugins/tests/ai-local/plugin.test.ts`

**Interfaces:**
- Consumes: Tasks 2 and 3.
- Produces:
  ```ts
  export interface AiLocalPluginOptions {
    openDiagram(xml: string, name: string): void
    updateDiagram(defs: BpmnDefinitions): void
    container?: HTMLElement
    onOpen?(): void
  }
  export function createAiLocalPlugin(o: AiLocalPluginOptions): {
    name: "ai-local"; install(api: unknown): void; button: HTMLButtonElement
    ready: Promise<boolean>; stop(): void
  }
  export { generateProcess, checkAvailability } // re-exported for integrators
  ```
- DOM contract for tests: the panel root has class `ai-local-panel`; it holds `textarea.ai-local-input` (`maxLength` 2000), `button.ai-local-run` (text "Generate" / "Stop"), `.ai-local-status`, `ul.ai-local-notes` (one `li` per problem/fix).

- [ ] **Step 1: Write the failing tests** (happy-dom, fake model, `container` = a div in `document.body`):
  - `ready` → `false` and `button.hidden === true` when unavailable; `true` and not hidden for `available` and `downloadable`.
  - `downloadable` → status mentions "one-time download".
  - Happy path: type the expense description, click run → `openDiagram` called once with name "Expense approval"; `updateDiagram` called for later frames and once for the final result; notes list rendered; run button back to "Generate".
  - Review Focus 3: click run twice quickly → `created.length === 1`; whitespace-only description → run button disabled, nothing created.
  - Review Focus 4: `createError: new Error("disk")` → status contains "Chrome couldn't prepare the on-device model: disk"; `openDiagram` never called; button says "Generate".
  - `fitsContext` false → status "Description too long for the on-device model — shorten it."; nothing streamed.
  - Prose output → status "The model didn't return a diagram — try rephrasing."; no `openDiagram`.
  - `stop()` mid-run → status "Stopped"; the session is destroyed (`destroyed === 1`).
  - A `QuotaExceededError` from the stream → "The diagram outgrew the model's context — try a smaller process."; any other stream error → "Generation failed: <message>".
- [ ] **Step 2: Run** `… vitest run tests/ai-local/plugin.test.ts` — FAIL.
- [ ] **Step 3: Implement** `css.ts` (`injectAiLocalStyles()`, modelled on `ai-bridge/css.ts`, docked layout only), `panel.ts` (`createAiLocalPanel(o)` builds the DOM above and runs: `fitsContext` → `createSession` (inside the click, for user activation) → `generateProcess` with `onFrame` calling `openDiagram(Bpmn.export(defs), name-so-far)` on the first frame and `updateDiagram` after; `finally` destroys the session), `index.ts` (button with an icon SVG, `button.hidden = true` until `ready` resolves true; clicking opens the panel via `onOpen`). Error copy is exactly the strings in the tests.
- [ ] **Step 4: Run** the plugin tests, then the whole package: `pnpm --filter @bpmnkit/plugins test` (chrome-invariants included) and `pnpm --filter @bpmnkit/plugins typecheck` — PASS.
- [ ] **Step 5: Commit** `feat(plugins): ai-local panel and plugin`.

### Task 5: Editor dock tab and HUD slot

**Files:**
- Modify: `packages/editor/src/dock.ts` (tab union at lines ~126/130/317/361; `SideDock` interface ~118–158; create/hide like the Tests tab ~214–225, 301, 371–378, 467–476)
- Modify: `packages/editor/src/hud.ts` (options ~103; append after the `aiButton` block ~237–240)
- Test: `packages/editor/tests/dock.test.ts` (new)

**Interfaces:**
- Produces: `SideDock.generatePane: HTMLDivElement`; `"generate"` in the tab union of `switchTab`/`activeTab`; `SideDock.setGenerateTabVisible(visible: boolean): void`; HUD option `generateButton?: HTMLButtonElement | null` (styled `hud-btn`, appended after `aiButton` with a `hudSep()`).

- [ ] **Step 1: Write the failing tests** (`// @vitest-environment happy-dom`): generate tab hidden by default; `setGenerateTabVisible(true)` shows it; `switchTab("generate")` un-hides `generatePane` and hides the others; hiding it while active falls back to `"properties"`. Tab text "Generate" goes through `t()` like the other tabs (the editor is i18n-covered).
- [ ] **Step 2: Run** `pnpm --filter @bpmnkit/editor exec vitest run tests/dock.test.ts` — FAIL.
- [ ] **Step 3: Implement** following the Tests tab exactly; add the HUD option.
- [ ] **Step 4: Run** `pnpm --filter @bpmnkit/editor test` (i18n-harvest/locales included — add "Generate" to the locale files if the harvest test asks) and typecheck — PASS.
- [ ] **Step 5: Commit** `feat(editor): Generate dock tab and HUD slot`.

### Task 6: Landing editor wiring

**Files:**
- Modify: `apps/landing/src/scripts/editor.ts` (near `aiBridgePlugin` ~435; `onTabActivate` ~374; `initEditorHud` ~609)
- Modify: `apps/landing/src/pages/editor.astro` (`<head>`, lines 7–12)

**Interfaces:**
- Consumes: `createAiLocalPlugin` (Task 4); `dock.generatePane`, `dock.setGenerateTabVisible`, HUD `generateButton` (Task 5).

- [ ] **Step 1: Wire the plugin.** `openDiagram(xml, name)` sets `generatedTabId = bridge.tabsPlugin.api.openTab({ type: "bpmn", xml, name })`; `updateDiagram(defs)` calls `editorRef?.loadDefinitions(defs)` only when `bridge.tabsPlugin.api.getActiveTabId() === generatedTabId`; `container: dock.generatePane`; `onOpen` expands the dock and `switchTab("generate")`. Pass `generateButton: aiLocalPlugin.button` to `initEditorHud`. `void aiLocalPlugin.ready.then((ok) => dock.setGenerateTabVisible(ok))`.
- [ ] **Step 2: Stop on tab switch** (Review Focus 5). In `onTabActivate`, if `generatedTabId !== null && id !== generatedTabId`, call `aiLocalPlugin.stop()` and clear `generatedTabId`. Note `openTab` activates the new tab before returning its id, so `generatedTabId` is still `null` during that activation — that's the case that must not stop.
- [ ] **Step 3: Origin-trial meta.** In `editor.astro` frontmatter `const otToken = import.meta.env.PUBLIC_CHROME_AI_OT_TOKEN`; in `<head>` `{otToken && <meta http-equiv="origin-trial" content={otToken} />}`.
- [ ] **Step 4: Verify** `pnpm --filter <landing package name> build` succeeds with and without `PUBLIC_CHROME_AI_OT_TOKEN=test`; `grep -c origin-trial` on the built `editor/index.html` gives 1 and 0 respectively. Then run the app (`/run` skill or `pnpm --filter <landing> dev`) in the pre-installed Chromium: the editor loads with no console errors and no Generate button (no model there).
- [ ] **Step 5: Commit** `feat(landing): on-device Generate in the web editor`.

### Task 7: Docs and release notes

**Files:**
- Create: `apps/landing/src/content/docs/guides/ai-on-device.md` (front matter copied from `guides/ai.md`)
- Modify: `doc/progress.md`, `doc/features.md`; add `.changeset/ai-local-chrome.md` (`@bpmnkit/plugins`: minor, `@bpmnkit/editor`: minor)

- [ ] **Step 1: Guide page**: what it does; requirements (desktop Chrome with the Prompt API, the hardware/disk numbers from the spec's Background section); enabling locally (`chrome://flags` Prompt API flag); the one-time download; privacy (nothing leaves the device); limits (English, generate only); integrator snippet using `createAiLocalPlugin`. Also the manual test checklist: three descriptions, Stop mid-run, switch tabs mid-run (no frame lands in the other tab), close the generated tab mid-run, 2,000-character description.
- [ ] **Step 2: Rebuild the docs pack**: `pnpm --filter @bpmnkit/docspack build` — exits 0.
- [ ] **Step 3: progress/features entries** dated 2026-10-21; the features entry names `@bpmnkit/plugins/ai-local` and the maintainer step (register the origin trial, set `PUBLIC_CHROME_AI_OT_TOKEN`).
- [ ] **Step 4: Full verification**: `pnpm verify` — zero Biome warnings, no type errors, all tests pass.
- [ ] **Step 5: Commit** `docs: on-device generation guide, progress and changeset`.
