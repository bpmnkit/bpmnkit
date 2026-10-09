# Design and architecture — Design agent orchestration workflows — Call processes as agent tools

When an AI agent needs to invoke another BPMN process as a tool, you have two options:

- Use a call activity inside the ad-hoc sub-process.
- Add an MCP client gateway tool connected to the [Processes MCP Server](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-overview).

The right choice depends on whether your target process runs on the same or a different Orchestration Cluster:

| Scenario                                                   | Recommended approach                                                                                                                                                            |
| :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Target process is on the **same** Orchestration Cluster    | Use a [call activity](https://docs.camunda.io/docs/next/components/modeler/bpmn/call-activities/call-activities) inside the ad-hoc sub-process.                                                               |
| Target process is on a **different** Orchestration Cluster | Use the [MCP Remote Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-remote-client-connector) connected to the other cluster's Processes MCP Server. |

These two approaches differ in runtime behavior, the result the agent receives, instance visibility, and the audit trail:

| &nbsp;                 | Call activity                                                                                                      | MCP client                                                                                                                          |
| :--------------------- | :----------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **Execution**          | The tool call waits for the called process to complete and returns its output to the agent.                        | The called process starts immediately and the tool returns the process instance key. The agent does not receive the process output. |
| **Instance hierarchy** | The called process instance is a child of the ad-hoc sub-process element, visible in the instance tree in Operate. | The called process runs independently with no structural link to the calling agent process.                                         |
| **Audit logs**         | The audit trail reflects the full call hierarchy.                                                                  | The audit trail shows a process triggered by an external message, with no structural link to the calling agent.                     |

**Note**
Although it is technically possible to use an MCP client to connect to the Processes MCP Server on the same cluster as the calling agent, this produces a detached hierarchy and a less coherent audit trail. Use call activities for same-cluster process invocations.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture
