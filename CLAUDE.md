# BPMN Kit — instructions

## Repository

pnpm workspaces + Turborepo, TypeScript strict, Biome (lint + format), Vitest.
- `packages/`: the published `@bpmnkit/*` libraries (core, canvas, editor, engine, feel, ui, …) plus the docs packs.
- `apps/`: cli, studio and demo (Preact + cascivo; studio state in Zustand), landing and learn (Astro), drop, proxy, desktop (Tauri), vscode, reebe / reebe-wasm / proxy-rs (Rust).
- Backend/Node code: ESM only, `.js` extensions in relative imports, `node:` imports, native APIs (`fetch`, top-level `await`) over packages.

## Commands

- Build: `pnpm turbo build` · Typecheck: `pnpm turbo typecheck` · Lint/format: `pnpm biome check .` (or `pnpm turbo check`) · Test: `pnpm turbo test`
- All at once: `pnpm verify`

## Rules

- State assumptions; ask when a request is ambiguous. Prefer the simplest change, touch only what the task needs, and don't refactor or reformat unrelated code.
- Done means zero Biome warnings, zero type errors, and passing tests. New behaviour gets tests; bug fixes get a regression test. Never skip or delete tests.
- All `devDependencies` go in the root `package.json`; runtime `dependencies` go in the package that uses them. Add a package only when it can't reasonably be written in-repo.
- Frontend state lives in Zustand stores with narrow selectors, not scattered hooks. Prefer type-level guarantees (discriminated unions, branded types) over runtime checks.
- Comments explain why, not what.
- Use docspack (block below) before broad searches. A `PreToolUse` hook (`scripts/docspack-nudge.mjs`) nudges toward it; follow the nudge.

## BPMN Kit's own docs: ask before answering from memory

`@bpmnkit/docspack` (`packages/docspack`) indexes BPMN Kit's APIs, CLI and guides; `@bpmnkit/camunda-docspack`
(`packages/camunda-docspack`) indexes Camunda 8 (BPMN/FEEL, engine, Modeler, Self-Managed, clients, APIs).
A returned chunk beats memory; never blend the two. Ask narrow questions (answers cap at 3 chunks).

```sh
npx bpmnkit-docs ask "how do I deploy a process to Camunda 8"
npx bpmnkit-docs ask "POST /jobs/activation" --pack @bpmnkit/camunda-docspack
npx bpmnkit-docs ask <chunk-id>    # one of the follow-up ids
```

After changing `apps/landing/src/content/docs/`, run `pnpm --filter @bpmnkit/docspack build`. Rebuilding the
Camunda pack is in `AGENTS.md`.

## Adding a published package

1. `package.json`: `description`, `keywords` (≥ 3), `license: "MIT"`, `repository.url` (`github.com/bpmnkit/bpmnkit`), `homepage: "https://bpmnkit.com"`, `bugs.url`, `publishConfig.access: "public"`, in the field order of existing packages (build config first, then metadata).
2. `scripts/generate-readmes.mjs`: add an entry (`name`, `description`, `content`: Overview, Features, Installation, Quick Start, API Reference) and add it to `footer()`'s related packages.
3. `scripts/published-packages.mjs`: add the path to `PUBLISHED` (the single list).
4. Run `node scripts/sync-license.mjs`, `node scripts/generate-readmes.mjs`, `node scripts/check-packages.mjs` (must exit 0).
5. After a build, `pnpm check:consumable --filter <package>`.

Never hand-write a published package's `README.md` or `LICENSE`; the scripts overwrite them.

## Brand tokens

- Single source: `packages/ui/src/tokens.css` and `packages/ui/src/css.ts` (`UI_TOKENS_CSS`), kept in sync. Public tokens use `--bpmnkit-*`.
- Never hardcode brand colours: `var(--bpmnkit-*, <hex fallback>)`. Semantic colours (success/warn/danger, execution state, syntax, DMN sections) are exempt.
- `--bpmnkit-ds-*` (landing, drop, editor chrome only) is additive: `border-radius: 0`; no `box-shadow`, `linear-gradient` or `backdrop-filter`; 1px hairlines; one accent; mono for every label; card grids are one bordered box. Diagram rendering is out of scope.
- Token table and the full design-system rules: `doc/brand-tokens.md`.

## Docs to update

- `doc/progress.md`: a dated entry at the top for **every** change.
- `doc/features.md`: when a feature is added.
- `doc/roadmap.md`: tick `[x]` on completed items.
- `README.md`: on significant changes.

<!-- docspack:start recipe=repo -->
## Documentation for this project's dependencies

Run `npx docspack ask "<question>"` for documentation on this project's
dependencies. It answers from the installed versions.

## Finding things in this repository

Before reading files to find where something is, ask the index:

- `npx docspack recall --name repo-code "<what the code does>"` answers with the `file:line`,
  signature and doc comment of matching declarations. Then read only that range.
- `npx docspack recall --name repo-docs "<question>"` answers from this repository's Markdown.

An answer is a pointer: read the file before you edit it. If you already know a name,
`grep` is as good. If `recall` says nothing is indexed, run `npx docspack index --repo`.

## Working efficiently in this repository

Every tool call is a turn, and every turn resends the whole conversation. Use fewer, larger calls:

- Read several files, or several ranges of one file, in one shell command
  (`sed -n '40,90p' a.ts; sed -n '1,60p' b.ts`) instead of one Read per file.
- Search once, with a pattern that covers everything you are looking for.
- Make related edits together, and run the tests once the change is complete.

<!-- Written by `npx docspack agent install`. Re-run it to update this block. -->
<!-- docspack:end -->
