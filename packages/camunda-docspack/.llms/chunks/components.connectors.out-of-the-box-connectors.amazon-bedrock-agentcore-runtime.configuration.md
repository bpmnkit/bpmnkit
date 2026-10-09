# Amazon Bedrock AgentCore Runtime connector — Configuration

In the **Region** field, enter the AWS region where your AgentCore Runtime agent is deployed. For example, `us-east-1`.


## Action

The **Amazon Bedrock AgentCore Runtime connector** supports the following action.

### Invoke agent runtime

#### Parameters

| Parameter             | Required | Description                                                                                                                                       |
| :-------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Agent Runtime ARN** | Yes      | The ARN of the deployed AgentCore Runtime agent. You can find it in the AgentCore console or in the output of `agentcore deploy`.                 |
| **Prompt**            | Yes      | The message or task to send to the agent. Supports [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) expressions.                                  |
| **Session ID**        | No       | An optional session ID for multi-turn conversations. When provided, the agent retains context from previous interactions within the same session. |

#### Response

The connector returns the following fields:

| Field        | Description                                                                              |
| :----------- | :--------------------------------------------------------------------------------------- |
| `response`   | The agent's response text or payload.                                                    |
| `sessionId`  | The runtime session ID. Use this value in subsequent calls to continue the conversation. |
| `statusCode` | The HTTP status code of the response.                                                    |

#### Output mapping

1. Use **Result Variable** to store the response in a process variable. For example, `agentResult`.
2. Use **Result Expression** to map specific fields from the response into process variables.

For example, to extract the agent's response:

```feel
= {
  answer: response,
  session: sessionId
}
```

#### Example: Invoke a fraud detection agent

**Configuration:**

- Agent Runtime ARN: `arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/fraud_agent-1GRoTlCtHi`
- Prompt: `Claim: Customer reports stolen vehicle worth $45,000. Filed 2 days after policy activation. No police report.`

**Response:**

```json
{
  "response": "{\"result\": {\"role\": \"assistant\", \"content\": [{\"text\": \"{\\\"riskScore\\\": 85, \\\"riskLevel\\\": \\\"HIGH\\\", \\\"flags\\\": [\\\"Policy activated only 2 days before claim\\\", \\\"No police report filed\\\", \\\"High-value claim\\\"], \\\"recommendation\\\": \\\"REJECT\\\"}\"}]}}",
  "sessionId": "76f079e6-f30b-4416-9fbc-5d09d2ad31de",
  "statusCode": 200
}
```

#### Multi-turn conversations

To maintain context across multiple interactions with the same agent, pass the `sessionId` from the previous response into the **Session ID** field of the next call. This allows the agent to remember prior messages and maintain state.

**Note**
When using the connector as a tool in an [AI Agent Sub-process](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess), use the `fromAi()` function for the **Prompt** field to let the orchestrating agent compose the message dynamically based on the user's request.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-agentcore-runtime
