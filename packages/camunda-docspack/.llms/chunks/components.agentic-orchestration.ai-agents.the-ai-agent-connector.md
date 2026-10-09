# AI agents — The AI Agent connector

The AI Agent connector is the primary Camunda connector for building Camunda AI agents. It integrates an LLM with your BPMN process, enabling the agent to reason over context, select tools, and respond to users or process events.

Key capabilities include:

- **LLM provider support**: Connects to a range of providers, such as Anthropic, Amazon Bedrock, Google Gemini, and OpenAI.
- **Tool calling**: Exposes BPMN activities inside an [ad-hoc sub-process](https://docs.camunda.io/docs/next/reference/glossary#ad-hoc-sub-process) as tools the LLM can select.
- **Memory**: Short-term conversational memory enables multi-turn interactions and follow-up questions within a process instance.

See the [AI Agent connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent) documentation for full configuration details, implementation examples, and reference.

### Integrate an AI agent into your process

The recommended approach for most use cases is to use the [AI Agent Sub-process](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess) implementation due to its simplified configuration and support for event sub-processes.

In this approach, you integrate the agent using an [ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses) and the AI Agent connector in an [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop), where the agent understands the process goal and uses the available tools to complete it.

#### How the agent loop works

The AI Agent connector operates in an agent loop between the LLM and Camunda:

1. A user prompt is sent to the connector. The LLM evaluates the prompt, the system prompt, and the available tool definitions.
1. If the LLM determines that a tool call is needed, Camunda activates the corresponding BPMN activity in the ad-hoc sub-process.
1. The tool result is passed back to the LLM, which decides whether more tool calls are needed.
1. The loop continues until the LLM returns a final response, which can then be routed to the next step in the process.

Decision-making and execution are intentionally split:

- **LLM decides**: Which tool to call next, in what order, and with which parameters.
- **Camunda orchestrates**: Executes the selected BPMN activity, stores variables, applies retries and incident handling, and routes human tasks and events.

**Tip**
Learn more in the [example AI Agent Sub-process connector integration](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess-example) and [Add tools to an AI agent](https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/ai-agents
