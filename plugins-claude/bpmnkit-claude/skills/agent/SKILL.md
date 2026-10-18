---
name: agent
description: Design and add a Camunda AI Agent Sub-process to a new or existing BPMN process — model, prompts, tools, and a mocked test scenario. Targets Camunda 8.10 (AI Agent Sub-process v2). Usage: /bpmnkit:agent [file] <description>
---

Design an AI agent: $ARGUMENTS

Read `references/agentic.md` first — it has the v2 sub-process facts, the builder flow and a verified example. Read `references/connectors.md` for tool candidates and `references/feel.md` for prompt/condition syntax.

For Camunda 8.10 the agent is the **AI Agent Sub-process v2**: an `adHocSubProcess` from the TypeScript builder, configured with `applyTemplates` from `@bpmnkit/core/connectors`. The plan/`casen synth` `aiAgent` step still emits the **v1** job-worker agent (see the v1 note at the end) — do not use it for 8.10.

## 1. Look up the recipe

Ask the docs, one narrow question at a time, instead of answering from memory. For builder questions pass `--pack @bpmnkit/docspack`, so Camunda's own pages do not outrank the recipe:

```sh
npx bpmnkit-docs ask guides.executable-camunda-process.how-do-i-build-an-ai-agent-sub-process-with-tools-in-a-bpmn-kit-build-script-8.10-v2
npx bpmnkit-docs ask guides.executable-camunda-process.how-do-i-lay-out-the-agent-s-tools-in-a-grid
npx bpmnkit-docs ask guides.executable-camunda-process.which-keys-does-a-template-take
npx bpmnkit-docs ask guides.executable-camunda-process.how-do-i-apply-an-element-template-connector-to-a-task
```

Related chunks: `...how-do-i-put-a-form-on-a-start-event`, `...how-do-i-map-a-user-task-s-input`, `...how-do-i-label-a-gateway-s-yes-and-no-flows` (all prefixed `guides.executable-camunda-process.`). A complete worked script is `packages/core/tests/fixtures/bakeoff/build.ts` (in the bpmnkit repo) — read it for the shape; don't copy it wholesale.

## 2. Design the agent

From the description, work out:

- **Provider/model** — default to the user's configured model if the plugin's `userConfig` has one set, otherwise ask. Credentials are `{{secrets.NAME}}` (or `=camunda.secrets.NAME` FEEL on 8.10) — never literal.
- **System prompt / user prompt** — a clear brief of the role and constraints; the user prompt is usually a FEEL reference to an incoming variable.
- **Tools** — one per capability. Run `casen connector search "<capability>"`; use the connector's template if one exists, otherwise `io.camunda.connectors.HttpJson.v2@18` for HTTP APIs (take URLs from `casen connector api`, not memory). Each tool is a task inside the sub-process with **no incoming flow**, its element id is the name the LLM sees and its `documentation` is the description the LLM reads — write it like a brief to a new teammate.
- **Limits** — a sensible `data.limits.maxModelCalls` (10 is usually fine).

## 3. Build the model

Write a build script: `adHocSubProcess(id, cb, { toolGrid: { columns, fill } })` with one `serviceTask` per tool inside, then:

```ts
applyTemplates(model.build(), [
  { elementId: "AI_Agent", template: "io.camunda.connectors.agenticai.ai-agent-subprocess.v2@1", values: { /* ... */ } },
  { elementId: "SomeTool", template: "io.camunda.connectors.HttpJson.v2@18", values: { /* ... */ } },
])
```

`applyTemplates` returns `{ definitions, problems }` — treat any problem as a failure. To wire a template onto an existing file instead, use the CLI:

```sh
casen connector show io.camunda.connectors.agenticai.ai-agent-subprocess.v2 --filter prompt --condensed
casen connector apply <file>.bpmn <elementId> ai-agent-subprocess@1 --values values.json --dry-run
casen connector apply <file>.bpmn <elementId> ai-agent-subprocess@1 --values values.json
```

The sub-process job type is `io.camunda.agenticai:aiagent:subprocess:2`.

## 4. Gate checklist

Run in order; do not skip ahead.

1. `casen lint lint <file>.bpmn --profile deploy` — expect 0 errors. The `pattern` rules `gateway-no-default-flow` and `subprocess-no-error-boundary` may show as warnings (style advice; Camunda's own gate does not flag them).
2. Render the file's XML with `renderBpmnAscii` (`@bpmnkit/ascii`) and check the layout: tools in the grid, no flow into a tool, labels on gateway flows.
3. Run the tests (below).

Ignore `data-flow` findings against the agent's own provider/model/prompt bindings — see "Known noisy finding" in `references/agentic.md`.

## 5. Test with a mocked agent job

Add a scenario mocking `io.camunda.agenticai:aiagent:subprocess:2` with a plausible final response (see `references/agentic.md`'s scenario example), then:

```sh
casen test test <file>.bpmn
```

Exit 0 means every case passed, and that is the done gate. Lint first (section 4), then run this.

This verifies the process routes correctly around the agent — it does not exercise real model behavior or tool-calling, which is out of scope for `casen test`.

## 6. Summarize

Report: the tool schema the LLM will see (tool ids + descriptions + parameters — literally what the agent is told), the model/provider, the lint result per category, and the test result.

## Older Camunda (v1 job-worker agent)

For clusters before 8.10, the v1 agent (`io.camunda.agenticai:aiagent-job-worker:1`, template `io.camunda.connectors.agenticai.aiagent.jobworker.v1`) is produced by the plan `aiAgent` step: write the step per `references/plan-format.md`, run `casen synth <plan>.json --output <file>.bpmn` (or `--merge`), lint with `--categories agentic`, and mock `io.camunda.agenticai:aiagent-job-worker:1` in the scenario. The plan compiler emits only v1; it has no v2 output.
