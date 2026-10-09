# AI Agent connector — Choose an implementation — AI Agent Task

The [AI Agent Task](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task) implementation is the original variant that relies on a BPMN [service task](https://docs.camunda.io/docs/next/components/modeler/bpmn/service-tasks/service-tasks) in combination with a multi-instance ad-hoc sub-process.

Unlike the AI Agent Sub-process implementation, you must model the [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop) explicitly in the BPMN diagram, leading to a more complex configuration.

This implementation is best suited for:

- Simple, one-shot tasks using the AI Agent connector as a generic LLM connector without any tool calling.
- Advanced use cases where you want to model the agent loop explicitly, for example to pre-/post-process tool calls for approval or auditing.

#### Example

A very simple example of using the AI Agent Task connector for a non-agentic task is as follows:

- The connector can be made agentic by adding a multi-instance ad-hoc sub-process and gateways to create an agent loop.
- The connector will be able to call tools until it reaches its goal or a configured limit.

The multi-instance ad-hoc sub-process acts as a toolbox:

The process can also be further enhanced to add a response follow-up outside the agent loop. When the AI Agent completes its task and does not request any tool calls, its response can be verified with a task (such as a user task or another LLM as a judge), with the process set up to loop back to the AI Agent if required.

This allows you to create a [human-in-the-loop (HITL)](https://docs.camunda.io/docs/next/reference/glossary#human-in-the-loop-hitl) process, for example, such as a chat where the user can ask follow-up questions:

If you need more control over the agent loop, you can model pre-/post-processing of tool calls with additional tasks, such as approval or tool call auditing.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
