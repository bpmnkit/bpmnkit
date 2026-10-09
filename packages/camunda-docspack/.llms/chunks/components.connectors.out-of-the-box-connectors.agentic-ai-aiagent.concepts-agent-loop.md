# AI Agent connector — Concepts — Agent loop

This connector is typically used in an [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop), with the connector implementation repeatedly being executed based on tool call results until it is able to reach its goal. Each pass through the loop is a [loop iteration](https://docs.camunda.io/docs/next/reference/glossary#loop-iteration).

For example, the following diagram shows an agent loop modeled with the [AI Agent Task](#ai-agent-task) implementation type.

- The process loops back to the AI Agent connector task from the ad-hoc sub-process until the agent decides no further tool calls are needed.
- With the [AI Agent Sub-process](#ai-agent-sub-process) implementation type, the agent loop is handled internally and so is not explicitly modeled in the BPMN diagram.

![AI Agent loop](../img/ai-agent-loop-overview.png)

1. A request is made to the AI agent connector task, and the LLM determines what action to take.
1. If the AI agent decides that further action is needed, the process enters the ad-hoc sub-process and calls any tools deemed necessary to satisfactorily resolve the request.
1. The process loops back and re-enters the AI agent connector task, where the LLM decides (with contextual memory) if more action is needed before the process can continue. The process repeats this loop iteration until the AI agent decides it is complete, and passes the AI agent response to the next step in the process.

#### Agent loop use cases

Typical agent loop use cases for this connector include the following:

| Use case             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool calling         | In combination with an ad-hoc sub-process, the AI Agent connector will resolve available tools and their input parameters, and pass these tool definitions to the LLM.The LLM generates a response, that might include tool calls (a request to call a tool paired with the input parameters).If tool calls are requested, the tools can be executed by activating the respective activities within the ad-hoc sub-process.With the [AI Agent Sub-process](#ai-agent-sub-process) implementation, activating the activities will be implicitely handled by the agent implementation.With the [AI Agent Task](#ai-agent-task) implementation, it is necessary to model the process to pass these tool calls to the ad-hoc sub-process and to return the tool call results to the AI Agent task. |
| Response interaction | After returning a response (and without calling any tools), model the process to act upon the response. For example, present the response to a user who can then ask follow-up questions back to the AI Agent connector as a [human-in-the-loop (HITL)](https://docs.camunda.io/docs/next/reference/glossary#human-in-the-loop-hitl) follow-up.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
