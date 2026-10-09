# LLM recommendations for agentic processes — General recommendations for agentic processes — Use detailed tool descriptions

When defining tools for the agent to use be very specific about what each tool does and what input it expects:

- The more context you give the AI about the tool’s purpose, the more accurately it will use that tool.
- Write clear, instructive descriptions for each tool call.

You can do so via [`fromAi` expressions](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#ai-generated-parameters-via-fromai) in Camunda.
For example, `fromAi(toolCall.emailBody, "Body of the email to be sent")`.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/model-recommendations-agentic
