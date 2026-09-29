# @bpmnkit/flow — The agent contract

An `.agent()` step is a service task with two task headers: `prompt` (the template) and
`resultVariable` (where the output goes). `casen agent work` serves it — see
[Durable Agent Flows](/docs/guides/durable-agent-flows). To write your own agent worker, use
the same helpers:

| Export | Description |
|---|---|
| `agentJobType(role, rank?)` | `agent:<role>`, or `agent:<rank>:<role>` |
| `agentJobTypes(roles, rank?)` | Every type a worker with these roles serves: each role, then each role at its rank |
| `renderPrompt(template, variables)` | Fills `{{name}}` — strings as is, anything else as JSON. Throws on a missing variable |
| `promptVariables(template)` | The variable names a template refers to |
| `AGENT_PROMPT_HEADER`, `AGENT_RESULT_HEADER`, `DEFAULT_AGENT_RESULT` | `"prompt"`, `"resultVariable"`, `"result"` |

---
Source: https://bpmnkit.com/docs/packages/flow
