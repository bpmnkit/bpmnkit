# AI Agent connector

AI agent connector implementing an agent loop for tool calls with an LLM, with support for response follow-up interactions.

Use the **AI Agent** connector to integrate Large Language Models (LLMs) with AI agents to build solutions using [agentic orchestration](https://docs.camunda.io/docs/next/components/agentic-orchestration/agentic-orchestration-overview).


## About this connector

The AI Agent connector enables AI agents to integrate with an LLM to provide interaction/reasoning capabilities. This connector is designed for use with an ad-hoc sub-process in an [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop), providing automated tool selection.

For example, use this connector to enable an AI agent to autonomously select and execute tasks within ad-hoc sub-processes by evaluating the current process context and determining the relevant tasks and tools to use in response. You can also use the AI Agent connector independently, although it is designed to be used with an ad-hoc sub-process to define the tools an AI agent can use.

Core features include:

| Feature              | Description                                                                                                                                                                                                                                                                         |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LLM provider support | Supports a range of [model providers](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers), such as Anthropic, AWS Bedrock, Google Gemini, and OpenAI.                                                                                                                                          |
| Memory               | Provides conversational/short-term memory handling to enable multi-turn conversations. For example, this allows a user to ask follow-up questions to an AI agent response.                                                                                                          |
| Tool calling         | Support for an AI agent to interact with tasks within an ad-hoc sub-process, allowing use of all Camunda features such as connectors and user tasks (human-in-the-loop). Automatic **tool resolution** allows an AI agent to identify the tools available in an ad-hoc sub-process. |

**Tip**

New to agentic orchestration?

- The [Build your first AI Agent](https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration) guide provides a quick introduction to agentic orchestration and how to use the AI Agent Sub-process connector using a blueprint.
- See the [example AI Agent connector integration](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess-example) for a worked example of a simple AI agent loop model.
- See [additional resources](#additional-resources) for examples of how you can use the AI Agent connector.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
