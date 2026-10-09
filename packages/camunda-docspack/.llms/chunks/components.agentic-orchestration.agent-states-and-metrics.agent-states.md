# States and usage metrics — Agent states

Camunda updates an agent instance's state as it progresses through its agent loop, fed by status updates from the connector handling the agent.

| State            | Meaning                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Initializing`   | The agent instance is being set up.                                                                                                                                 |
| `Tool discovery` | The agent is resolving which tools are available to it.                                                                                                             |
| `Thinking`       | The agent is reasoning with the model to decide its next step.                                                                                                      |
| `Tool calling`   | The agent is calling one or more tools.                                                                                                                             |
| `Idle`           | The process instance has moved away from the agent element, so the agent isn't currently working. It resumes when the process instance activates the element again. |
| `Completed`      | The agent instance is completed, because the process instance completed or terminated.                                                                              |

### State transitions

An agent instance follows a predictable path through these states. The following table lists what triggers entry into each state and what happens next.

| State            | Entered when                                                                                             | Moves to                                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Initializing`   | An agent element is activated and an agent instance is created.                                          | `Tool discovery`, once the agent instance is set up.                                                                                                       |
| `Tool discovery` | The agent instance resolves the tools available to it.                                                   | `Thinking`, once tool definitions are resolved.                                                                                                            |
| `Thinking`       | The agent instance is reasoning over the current conversation.                                           | `Tool calling`, if the model selects one or more tools. `Idle` or `Completed`, if the model returns a final response.                                      |
| `Tool calling`   | The model selected one or more tools in the previous `Thinking` state.                                   | `Thinking`, once tool results are available. This starts the next loop iteration.                                                                          |
| `Idle`           | The process instance moves away from the agent element, for example, to wait for a user task or message. | `Thinking`, when the process instance re-activates the same agent element and reuses this agent instance. `Completed`, if the process instance ends first. |
| `Completed`      | The process instance for the agent completes or terminates.                                              | Terminal state; the agent instance stops updating.                                                                                                         |

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-states-and-metrics
