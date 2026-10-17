# Build an Executable Camunda Process — How do I build an AI Agent sub-process (8.10, v2)?

Build an `adHocSubProcess` whose children are the tools, then apply the
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
applyTemplates(model, [
	{
		elementId: "AI_Agent",
		template: "io.camunda.connectors.agenticai.ai-agent-subprocess.v2@1",
		values: {
			"provider.type": "openai",
			"data.systemPrompt.prompt": SYSTEM_PROMPT,
			"data.userPrompt.prompt": "=inputText",
			"data.limits.maxModelCalls": 10,
			resultVariable: "agent",
		},
	},
])
```

Omitted properties keep their defaults, so you can leave out everything you do not change.
The agent needs a provider and a user prompt at least; the remaining defaults are workable for
a first run. The `resultVariable` is where the agent's answer lands, and a later task reads it
as a FEEL variable, for example `=agent.responseText`. Pass the template's `values` on the
sub-process itself, never on the tool tasks inside it.

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
