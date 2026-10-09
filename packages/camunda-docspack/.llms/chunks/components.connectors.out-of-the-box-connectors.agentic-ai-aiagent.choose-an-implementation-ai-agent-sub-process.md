# AI Agent connector — Choose an implementation — AI Agent Sub-process

The [AI Agent Sub-process](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess) implementation uses the [job worker implementation type](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses#job-worker-implementation) of an [ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses) to provide an integrated solution
to handle tool resolution and an [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop). This is the recommended implementation type for most use cases, and offers:

- Simplified configuration as the agent loop is handled internally
- Support for handling of event sub-processes within the ad-hoc sub-process

#### Restrictions

- Because of BPMN semantics, the ad-hoc sub-process must contain at least one activity. This means you cannot create an AI Agent Sub-process without any tools.
- As the agent loop is implicitly handled within the AI Agent execution, you have less control over the tool calls.

#### Example

A basic AI Agent Sub-process might look similar to the following example.

- The connector is configured so the AI Agent resolves available tools and activates them as needed to complete it's goal.
- Handling of event sub-processes within the ad-hoc sub-process is supported (See [Event Handling](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess#event-handling)). The AI Agent Task implementation does not support this.

This pattern can also be combined with a response follow-up for verification or follow-up interactions. For example, instead of the showcased user task, this could also be another LLM acting as a judge, or any other task that validates the agent's response.

![AI Agent Sub-process with response follow-up](../img/ai-agent-subprocess-follow-up.png)

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
