# AI Agent connector — Choose an implementation — Configuration comparison

The following table summarizes the key configuration differences between the two implementations.

| Configuration field    | AI Agent Sub-process                                                      | AI Agent Task                                                     |
| :--------------------- | :------------------------------------------------------------------------ | :---------------------------------------------------------------- |
| Model provider         | Yes                                                                       | Yes                                                               |
| Model                  | Yes                                                                       | Yes                                                               |
| System prompt          | Yes                                                                       | Yes                                                               |
| User prompt            | Yes                                                                       | Yes                                                               |
| Tools                  | Automatic (resolved from activities inside the sub-process)               | Optional. Requires ad-hoc sub-process ID and tool call results    |
| Agent context (memory) | Optional. Only needed when re-entering the agent for a response follow-up | Required. Must be aligned with the output mapping result variable |
| Limits                 | Yes                                                                       | Yes                                                               |
| Event handling         | Yes                                                                       | No                                                                |
| Response               | Yes                                                                       | Yes                                                               |
| `toolCalls` in output  | No                                                                        | Yes. Returned for routing to the ad-hoc sub-process               |
| Error handling         | Yes                                                                       | Yes                                                               |
| Retries                | Yes                                                                       | Yes                                                               |
| Execution listeners    | Yes                                                                       | Yes                                                               |

**Note**
Execution listeners behave differently between the two implementations. On the AI Agent Sub-process, they only run when entering and exiting the ad-hoc sub-process, not on every loop iteration. On the AI Agent Task, they are triggered on every job execution.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent
