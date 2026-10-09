# Add tools to an AI agent — Write a tool name and description

The LLM selects tools based on the tool element's **ID** and its **Documentation** fields:

- The element's **ID** field is always used as the tool name.
- The element's **Name** field is a human-readable label shown on the diagram.
- The element's **Documentation** field is used as the tool description.

**Note**
The **ID** is used as the tool name instead of the **Name** field because element IDs are unique within a process, which gives the LLM an unambiguous identifier to reference when it calls the tool. The **Name** field is free-form text for readers of the diagram and can repeat across elements, so it only acts as a fallback description when **Documentation** is empty.

See [tool definitions](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#tool-definitions) for more details.

Clear, specific descriptions significantly improve the reliability of tool selection.

1. Give the element a descriptive **ID**, since this is what the LLM receives as the tool name.
1. Give the element a descriptive **Name**. Since this is used as a fallback description when **Documentation** is empty, keep it meaningful even though it's primarily a diagram label.
1. Open the **Documentation** field in the properties panel and write a description that explains:
   - What the tool does.
   - When the LLM should use it.
   - When it should not, especially if two tools have overlapping purposes.
   - Any constraints or expected inputs.

**Note**
Modeler provides [modeling guidance](https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/agent-tool-documentation) that flags tools with missing or empty documentation as you model.

### Example: weak vs. strong description

A precise description makes the expected behavior explicit and reduces the risk of incorrect tool selection, repeated calls, or hallucinated behavior. Vague descriptions are the most common cause of unreliable agent behavior.

See the following comparison:

| &nbsp; | Tool name                          | Documentation                                                                                                                                                           |
| :----- | :--------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Weak   | `Lookup`                           | `Find customer data`                                                                                                                                                    |
| Strong | `Resolve customer by company name` | `Use this tool when a document mentions a company and you need its internal customer ID. If multiple matches are returned, request human validation before continuing.` |

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
