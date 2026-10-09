# AI agent tool definitions — Assisted tool configuration in Camunda Hub — Autofill a `fromAi()` input

On a tool's root node (the activity with no incoming flows), an autofill icon appears for a blank input mapping or blank FEEL-capable element-template field. Select the icon to add a correctly structured call:

```feel
=fromAi(toolCall.parameterName, "Description of the parameter", "string")
```

Replace the placeholder key and description with values for your tool. The autofill icon appears only on a blank field, so it never replaces a value you entered.

The Camunda Hub modeler derives the key from the field's target and infers the type argument from the field's description or name. This inferred type is a heuristic, not a guaranteed match for the target's real shape, so check it when a tool call fails with a type mismatch.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions
