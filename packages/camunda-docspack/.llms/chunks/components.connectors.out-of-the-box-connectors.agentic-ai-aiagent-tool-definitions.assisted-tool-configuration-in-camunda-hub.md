# AI agent tool definitions — Assisted tool configuration in Camunda Hub

In the properties panel, the Camunda Hub modeler helps you fill in both parts of the tool contract: [`fromAi()`](#ai-generated-parameters-via-fromai) inputs and the [`toolCallResult`](#tool-call-responses) output. This assistance appears only inside an ad-hoc sub-process marked as agentic through either the `io.camunda.agenticai.toolContainer` property or an out-of-the-box AI Agent element template. It does not appear in a plain sub-process.

Two affordances appear, and they apply to different fields:

| Affordance   | Where it appears                      | What it does                                                              |
| :----------- | :------------------------------------ | :------------------------------------------------------------------------ |
| **Autofill** | On a blank field only                 | Seeds a correctly structured value. It never overwrites an existing value |
| **Fix**      | On a field that already holds a value | Rewrites only the invalid part of that value and keeps the rest           |

**Autofill** disappears as soon as a field holds any value, so it can never replace something you entered. **Fix** edits only the part it identifies as invalid, so it preserves the rest of the expression. Both actions are undoable.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions
