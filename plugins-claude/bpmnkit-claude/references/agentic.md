# AI Agent Sub-process (agentic generation)

Camunda 8's **AI Agent Sub-process** lets a process delegate a step to an LLM that can call tools (other BPMN activities) in a loop until it produces a final answer.

**Target Camunda 8.10 with v2** (this page, first half). v2 is authored with the TypeScript builder and `applyTemplates`. The plan `aiAgent` step and `casen synth` compile only the older **v1** job-worker agent; that is described in the second half, "Older Camunda (v1)".

## v2: AI Agent Sub-process on Camunda 8.10

- It's a **`bpmn:AdHocSubProcess`** with template `io.camunda.connectors.agenticai.ai-agent-subprocess.v2` (version `1`, alias `ai-agent-subprocess`) and job type `io.camunda.agenticai:aiagent:subprocess:2`.
- Build the sub-process with `adHocSubProcess(id, cb, { toolGrid: { columns, fill } })`, then call `applyTemplates(model.build(), [{ elementId, template: "io.camunda.connectors.agenticai.ai-agent-subprocess.v2@1", values }])` from `@bpmnkit/core/connectors`. It returns `{ definitions, problems }`; any problem is a failure.
- Each **tool** is a root-node activity inside the sub-process with no incoming flow. Its element id is its name for the LLM, its `documentation` is the description the LLM reads. HTTP tools take `io.camunda.connectors.HttpJson.v2@18` through the same `applyTemplates` call.
- Tool parameters the LLM supplies use `fromAi(toolCall.<param>, "<description>", ...)` inside the tool's template values (e.g. `queryParameters`); the first argument must reference `toolCall.<name>`.
- Property keys are dotted template keys (`provider.type`, `data.systemPrompt.prompt`, `data.userPrompt.prompt`, `data.limits.maxModelCalls`, `resultVariable`, ...). Never guess them: `casen connector show <template> --filter <text> --condensed` lists them one per line.
- CLI equivalent for an existing file: `casen connector apply <file> <elementId> <template[@v]> [--values file.json] [--set k=v]... [--dry-run]`.
- Recipe chunks, via `npx bpmnkit-docs ask <id> --pack @bpmnkit/docspack` (read these first):
  - `guides.executable-camunda-process.how-do-i-build-an-ai-agent-sub-process-with-tools-in-a-bpmn-kit-build-script-8.10-v2`
  - `guides.executable-camunda-process.how-do-i-lay-out-the-agent-s-tools-in-a-grid`
  - `guides.executable-camunda-process.which-keys-does-a-template-take`
  - `guides.executable-camunda-process.how-do-i-check-the-file-is-executable-before-tests`
- Complete reference script, in the bpmnkit repo: `packages/core/tests/fixtures/bakeoff/build.ts` (a chat agent with four HttpJson tools in a 2 x 2 grid, start-event form, user-task input mapping and a labelled feedback loop).

Deploy gate: `casen lint lint <file> --categories deploy,connector,agentic` must be clean. `--profile deploy` also reports the `pattern` rules `gateway-no-default-flow` and `subprocess-no-error-boundary`, which Camunda's own gate does not flag on a spec-compliant model; fix them only if you want a clean profile.

Scenario mock for v2 (the whole sub-process is one job):

```json
{
  "name": "Agent resolves the ticket",
  "mocks": {
    "io.camunda.agenticai:aiagent:subprocess:2": { "outputs": { "agent": { "status": "resolved" } } }
  },
  "expect": { "path": ["AI_Agent"], "variables": { "agent": { "status": "resolved" } } }
}
```

## Older Camunda (v1)

Everything below describes the v1 job-worker agent produced by the plan `aiAgent` step and `casen synth` (the plan compiler emits only v1). Use it only for clusters before 8.10.

## How it's modeled (facts, not guesses — byte-verified against the bundled Camunda template)

- It's a **`bpmn:AdHocSubProcess`** carrying a `zeebe:taskDefinition` with type `io.camunda.agenticai:aiagent-job-worker:1`. The presence of `zeebe:taskDefinition` on an ad-hoc sub-process is *itself* what makes it a "job worker implementation" — there is no separate `zeebe:adHocImplementation` attribute.
- Each **tool** is a root-node activity inside the sub-process — no incoming sequence flow. The tool's element **id is its name** as seen by the LLM; its `<bpmn:documentation>` is the description the LLM sees.
- Tool **parameters** the LLM must supply are declared via `fromAi(toolCall.<param>, "<description>", "<type>"?, <jsonSchema>?, {required: false}?)` FEEL expressions bound as `zeebe:input` on the tool activity. The first argument must reference `toolCall.<name>` — nothing else.
- Each tool's **result** is captured as `toolCallResult` (a `zeebe:output` on the tool, default `source="=response"`), then aggregated across all tool calls into `outputCollection` (default `toolCallResults`) via an `outputElement` FEEL expression (default: `{id: toolCall._meta.id, name: toolCall._meta.name, content: toolCallResult}`).
- The agent's own final answer lands in a process variable via `zeebe:output source="=agent"` (default target `agent`).
- Provider/model/prompt configuration is a flat set of dotted `zeebe:input` bindings: `provider.type`, `provider.<provider>.model.model`, `provider.<provider>.authentication.*`, `data.systemPrompt.prompt`, `data.userPrompt.prompt`, `data.memory.storage.type`, `data.limits.maxModelCalls`.

You never write any of this by hand — the `aiAgent` plan step (compiled via `casen synth`) generates it deterministically. What matters is getting the **plan step** right.

## The `aiAgent` plan step

```json
{
  "kind": "aiAgent",
  "id": "triage_agent",
  "name": "Triage agent",
  "provider": "anthropic",
  "model": "claude-sonnet-5",
  "providerInputs": {
    "provider.anthropic.authentication.apiKey": "{{secrets.ANTHROPIC_API_KEY}}"
  },
  "systemPrompt": "You triage support tickets and post updates to Slack.",
  "userPrompt": "=ticketText",
  "tools": [
    {
      "id": "notify_slack",
      "description": "Post a status update to the #support-escalations Slack channel.",
      "connector": {
        "template": "io.camunda.connectors.Slack.v1",
        "values": {
          "method": "chat.postMessage",
          "token": "{{secrets.SLACK_OAUTH_TOKEN}}",
          "data.channel": "#support-escalations",
          "data.text": "placeholder"
        }
      },
      "params": [
        { "name": "message", "description": "The status update to post", "type": "string", "target": "data.text" }
      ]
    },
    {
      "id": "escalate",
      "description": "Escalate the ticket to a human agent.",
      "jobType": "escalate:1",
      "params": [{ "name": "reason", "description": "Why this needs a human" }]
    }
  ],
  "errorBoundary": {
    "errorCode": "AGENT_FAILED",
    "steps": [{ "kind": "end", "id": "agent_failed", "errorCode": "AGENT_FAILED" }]
  }
}
```

This is a real, tested, `casen synth`-compiled example — `casen lint --profile deploy` reports zero errors for it. Notes on the pattern:

- **Every tool needs an `id` and a `description`** — the description becomes what the LLM reads to decide when to call the tool. Write it like you're briefing a new teammate, not a code comment.
- **A tool is either connector-backed (`connector`) or a plain job-worker (`jobType`)** — never both. Use `casen connector search`/`show` to find a template first; fall back to `jobType` (with a scaffolded worker) only when no connector exists.
- **`params[].target` overriding a connector's static value is the standard way to let the LLM control one field of an otherwise-fixed connector call** — as in `notify_slack` above: the channel is fixed (a business decision), but the message text is supplied by the agent at call time. Any `values` key a `params[].target` also names is a required placeholder that gets *replaced*, not duplicated — give it a placeholder string, not a real value, when a param overrides it.
- **Give the agent an error boundary.** An unhandled agent failure (model error, tool failure not caught by the tool itself) should have somewhere to go — `casen lint --profile deploy` flags a sub-process (agentic or not) with no error boundary as a warning under the default profile.
- **Secrets**: provider auth keys and any tool credential always use `{{secrets.NAME}}` — never a literal key.

## Known noisy finding

`casen lint`'s `data-flow` category can report spurious "variable referenced but never set" findings against an `aiAgent` step's own provider/model/prompt bindings (e.g. a hyphenated model id like `claude-sonnet-5` gets misread as `claude - sonnet - 5`, or a prose system prompt's first word gets flagged). This is a known limitation of the `data-flow` heuristic (it treats bare literal text as potential FEEL) — it does **not** affect `--profile deploy` (errors only) and is safe to ignore for `aiAgent` steps specifically. Don't try to "fix" it by rewording prompts.

## Testing an agent without calling a real LLM

Scenarios mock the whole agent sub-process as one job (keyed by `io.camunda.agenticai:aiagent-job-worker:1`), not the individual tool calls inside it — the ad-hoc sub-process is dispatched as a job like any other task:

```json
{
  "name": "Agent resolves the ticket",
  "mocks": {
    "io.camunda.agenticai:aiagent-job-worker:1": { "outputs": { "agent": { "status": "resolved" } } }
  },
  "expect": { "path": ["triage_agent"], "variables": { "agent": { "status": "resolved" } } }
}
```

This is enough to verify the process routes through and around the agent correctly. It does not verify the agent's actual tool-calling behavior, prompt quality, or model choice — those require a real (or sandboxed) LLM run, which is out of scope for `casen test`.
