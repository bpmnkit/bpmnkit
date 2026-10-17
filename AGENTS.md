# AGENTS.md

Guidance for AI coding agents working in this repository.
Full contributor and style rules live in [`CLAUDE.md`](CLAUDE.md) — read it too.

## Search the documentation before answering from memory

This repo ships its own documentation as an offline, searchable package:
**`@bpmnkit/docspack`** (`packages/docspack`). It follows the
[docspack format](https://docspack.dev/spec) and needs no server, no network access and
no MCP configuration.

```sh
npx bpmnkit-docs ask "how do I deploy a process to Camunda 8"
npx bpmnkit-docs search "exclusive gateway condition"
npx bpmnkit-docs list
```

- **Ask a question, not a package name.** Answers cap at 3 chunks / 3,000 tokens, so
  prefer several narrow questions over one broad one.
- **A returned chunk beats recalled knowledge.** It describes the version installed
  here; your memory describes some earlier release. If the two disagree, the chunk is
  right. Do not blend them into one answer.
- Each answer is headed with `<package>@<version>/<chunk-id>`, so you can cite exactly
  what you used.

This repo also ships **`@bpmnkit/camunda-docspack`** (`packages/camunda-docspack`), the
Camunda 8 documentation in the same format — BPMN and FEEL references, engine concepts,
best practices, the Modeler (DMN, forms, element templates), the web components, Self-Managed
deployment and configuration, the client guides, the Camunda 7 migration guides, the glossary and
the Orchestration Cluster API. Ask it for anything about *Camunda*
rather than about BPMN Kit's own APIs, and use `--pack` when a question could match both:

```sh
npx bpmnkit-docs ask "how should I name an exclusive gateway" --pack @bpmnkit/camunda-docspack
npx bpmnkit-docs ask "POST /jobs/activation" --pack @bpmnkit/camunda-docspack
```

It is rebuilt weekly from camunda-docs by `.github/workflows/camunda-docspack.yml`; to
rebuild it by hand you need a camunda-docs checkout:
`node packages/camunda-docspack/dist/cli.js --camunda-docs ../camunda-docs`.

Working in a project that only *consumes* BPMN Kit? Install the pack there and get the
same command:

```sh
npm i -D @bpmnkit/docspack
```

## Repository basics

- pnpm workspaces + Turborepo; TypeScript strict; Biome for lint and format; Vitest.
- Verify with `pnpm turbo build typecheck check test`.
- After editing `apps/landing/src/content/docs/`, rebuild the docs pack:
  `pnpm --filter @bpmnkit/docspack build`.

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
