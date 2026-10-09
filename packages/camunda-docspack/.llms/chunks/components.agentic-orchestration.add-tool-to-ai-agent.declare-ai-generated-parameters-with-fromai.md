# Add tools to an AI agent — Declare AI-generated parameters with `fromAi()`

If the tool requires values that the LLM should supply at runtime, such as a search query, a location, or an identifier, wrap those values in the [`fromAi()`](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-ai-agent#fromaivalue) FEEL function. The function returns the value unchanged at runtime, but it registers the parameter in the tool's input schema so the LLM knows it must generate a value.

Where you write the `fromAi()` call depends on whether the tool element has an element template applied:

- An element with an element template applied, such as a connector task, exposes the template's own input fields. Write `fromAi()` directly in those fields.
- An element without an element template, such as a plain service, script, or user task, exposes an [**Input mapping**](https://docs.camunda.io/docs/next/components/concepts/variables#input-mappings) section instead. Write `fromAi()` in an input mapping entry.

Both approaches produce the same tool input schema, because the AI Agent connector treats element template fields as input mappings.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
