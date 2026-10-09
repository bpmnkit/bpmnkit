# AI Agent Sub-process connector — Configuration — Memory (2)

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

To authenticate, choose one of the methods from the **Authentication** dropdown:

- Use **Credentials** if you have a valid pair of access and secret keys. The IAM user requires permissions for the `bedrock-agentcore:CreateEvent` and `bedrock-agentcore:ListEvents` actions.

**Note**
This option is applicable for both SaaS and Self-Managed users.

- Use **Default Credentials Chain** if your system is configured with an implicit authentication mechanism, such as role-based authentication, credentials supplied via environment variables, or files on target host. This approach uses the [Default Credential Provider Chain](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/credentials.html) to resolve required credentials.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess
