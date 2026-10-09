# AI agent tool definitions — Tool resolution

To resolve available tools, the AI Agent connector either resolves the tools by reling on data provided by the Zeebe engine or reads the BPMN model directly. The approach depends on the chosen AI Agent implementation:

When using the **AI Agent Sub-process** implementation, the connector relies on data provided by the [ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses#special-ad-hoc-sub-process-variables) implementation to resolve the tools.

When using the **AI Agent Task** implementation, the connector reads the BPMN model directly to resolve the tools:

1. It reads the BPMN model and looks up the ad-hoc sub-process using the configured ID. If not found, the connector throws an error.
2. Iterates over all activities within the ad-hoc sub-process and checks that they are root nodes (no incoming flows) and not boundary events.
3. For each activity found, analyzes the input mappings and looks for the [`fromAi`](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-ai-agent#fromaivalue) function calls that define the parameters that need to be provided by the LLM.
4. Creates a tool definition for each activity found, and passes these tool definitions to the LLM as part of the prompt.

**Note**
Refer to the [Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview) and [OpenAI](https://platform.openai.com/docs/guides/function-calling) documentation for examples of how tool/function calling works in combination with an LLM.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions
