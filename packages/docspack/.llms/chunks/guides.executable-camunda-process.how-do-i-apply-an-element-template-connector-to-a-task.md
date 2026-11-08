# Build an Executable Camunda Process — How do I apply an element template (connector) to a task?

Build the task first, then call `applyTemplates` from `@bpmnkit/core/connectors` on the
finished model. Name the element, the template as `id@version`, and the values. It returns the
new definitions and a list of `problems`; throw on a non-empty list rather than ship a
half-applied template.

```typescript
const { definitions, problems } = applyTemplates(model.build(), [
	{
		elementId: "FetchSafeJoke",
		template: "io.camunda.connectors.HttpJson.v2@18",
		values: {
			"authentication.type": "noAuth",
			method: "GET",
			url: "https://v2.jokeapi.dev/joke/Any?format=txt&safe-mode",
			resultExpression: "={toolCallResult: response.body}",
			retryCount: 3,
		},
	},
])
if (problems.length > 0)
	throw new Error(problems.map((p) => `${p.elementId}: ${p.message}`).join("\n"))
```

Properties you leave out keep the template's default, so set only what differs. An unknown
key comes back as a problem with a suggestion for the nearest real one.

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
