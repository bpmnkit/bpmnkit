# Build an Executable Camunda Process — How do I build an AI Agent sub-process with tools in a BPMN Kit build script (8.10, v2)?

To build an AI agent sub-process with tools in a BPMN Kit script, make an `adHocSubProcess` whose children are the tools, then apply the
`io.camunda.connectors.agenticai.ai-agent-subprocess.v2@1` template to it. Each tool is a
service task inside the sub-process; its `documentation` is what the model reads to decide
when to call it. Give each tool its own template, such as HTTP JSON.

```typescript
.adHocSubProcess(
	"AI_Agent",
	(sub) => {
		sub.serviceTask("FetchSafeJoke", {
			name: "Get a safe joke",
			documentation: "Fetches one random safe-mode joke. Use this tool when the user asks for a joke.",
			taskType: "io.camunda:http-json:1",
		})
	},
	{ name: "AI Agent" },
)
```

```typescript
const { definitions, problems } = applyTemplates(model.build(), [
	{
		elementId: "AI_Agent",
		template: "io.camunda.connectors.agenticai.ai-agent-subprocess.v2@1",
		values: {
			"provider.type": "openai",
			"provider.openai.backend.openai.apiKey": "=camunda.secrets.OPENAI_API_KEY",
			"provider.openai.model.model": "gpt-4o",
			"data.systemPrompt.prompt": SYSTEM_PROMPT,
			"data.userPrompt.prompt": "=inputText",
			"data.limits.maxModelCalls": 10,
			resultVariable: "agent",
		},
	},
])
if (problems.length > 0)
	throw new Error(problems.map((p) => `${p.elementId}: ${p.message}`).join("\n"))
```

Omitted properties keep their defaults, so you can leave out everything you do not change.
The agent needs a provider with its model and credentials, and a user prompt, at least; the remaining defaults are workable for
a first run. The `resultVariable` is where the agent's answer lands, and a later task reads it
as a FEEL variable, for example `=agent.responseText`. Pass the template's `values` on the
sub-process itself, never on the tool tasks inside it.

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
