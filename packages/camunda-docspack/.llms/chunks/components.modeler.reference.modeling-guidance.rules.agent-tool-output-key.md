# Agent tool output key

Reference for the `agent-tool-output-key` rule.

Tools within an [AI Agent sub-process](https://docs.camunda.io/docs/next/components/agentic-orchestration/agentic-orchestration-overview) return their results to the agent through the `toolCallResult` variable. The rule reports one warning per tool in either of the following situations:

1. **Misdirected result**: The tool sets result variables, but none of them is named `toolCallResult`, for example, because of a typo such as `toolCalResult`. The rule reports the warning on the element that set the wrong variable, which can be downstream of the tool's entry element.
2. **No result**: No element in the tool's flow sets a result variable. The rule reports the warning on the tool's entry element, because no single element is at fault. Even a fire-and-forget tool should report its completion, for example, with `= "Email sent."`.

---
Source: https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/agent-tool-output-key
