# AI agent tool definitions — Assisted tool configuration in Camunda Hub — Autofill a `toolCallResult` output

If a tool-flow element does not yet produce a contract-readable result, you can use autofill to write `toolCallResult` to the element's native result field:

| Element type | Field written                                                |
| :----------- | :----------------------------------------------------------- |
| Connector    | The connector result expression, as `={toolCallResult: ...}` |
| Script task  | The script result variable                                   |
| Other tasks  | An output mapping targeting `toolCallResult`                 |

For a multi-instance tool, autofill also sets the output collection and output element so the agent collects a result for every iteration instead of returning `null`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions
