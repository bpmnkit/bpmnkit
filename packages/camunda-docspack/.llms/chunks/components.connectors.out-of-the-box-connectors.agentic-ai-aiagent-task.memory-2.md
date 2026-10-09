# AI Agent Task connector — Memory (2)

Evaluate these trade-offs against your process's expected lifetime, conversation size, and external dependencies to choose the backend that fits your use case.

**Note**
Operate's conversation history comes from the [Agent Instance API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-agent-instance.api), a separate representation from wherever the agent context itself is stored. See [agent context and memory](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances#agent-context-and-memory) for how the two relate. The backend you choose here only changes where the messages are durably stored for the agent's own context window, and whether you can also inspect them directly, for example as a raw process variable.

#### In-process storage

Messages passed between the AI agent and the model are stored within the agent context process variable, so you can also inspect them directly as raw JSON in the element's **Variables** tab in Operate.

This is suitable for many use cases, but you must be aware of the [variable size limitations](../../../../../concepts/variables.md) that limit the amount of data that can be stored in the process variable.

#### Camunda document storage

Messages passed between the AI agent and the model are not directly available as process variable but reference a JSON document stored in [document storage](../../../../../document-handling/getting-started.md).

As documents are subject to expiration, to avoid losing the conversation history you must be able to predict the expected lifetime of your process, so you can correctly configure the document time-to-live (TTL).

| Field                      | Required | Description                                                                                                                                                                                                                                                                                 |
| :------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Document TTL               | No       | Time-to-live (TTL) for documents containing the conversation history. Use this field to set a custom TTL matching your expected process lifetime.The [default cluster TTL](../../../../../document-handling/getting-started.md#saas) is used if this value is not configured. |
| Custom document properties | No       | Optional map of properties to store with the document.Use this option to reference custom metadata you might want to use when further processing conversation documents.                                                                                                      |

#### AWS AgentCore Memory

Messages passed between the AI agent and the model are stored as events in [Amazon Bedrock AgentCore Memory](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory.html). In addition to short-term conversation replay, AgentCore Memory automatically extracts long-term memory insights from conversational messages, enabling your agent to build up knowledge across sessions.

You must [create an AgentCore Memory resource](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/memory-create-a-memory-store.html) in your AWS account before configuring this storage type.

| Field          | Required | Description                                                                                                                                                                     |
| :------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Region         | Yes      | The AWS region where the AgentCore Memory resource is located. For example, `us-east-1`.                                                                                        |
| Endpoint       | No       | Custom API endpoint for VPC/PrivateLink configurations, AWS GovCloud, or other non-standard deployments.                                                                        |
| Authentication | Yes      | Select the authentication method for AgentCore Memory access.                                                                                                                   |
| Memory ID      | Yes      | The ID of the pre-provisioned AgentCore Memory resource.                                                                                                                        |
| Actor ID       | Yes      | Identifier of the actor associated with memory events (for example, end-user or agent/user combination). Supports [FEEL expressions](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel). |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task
