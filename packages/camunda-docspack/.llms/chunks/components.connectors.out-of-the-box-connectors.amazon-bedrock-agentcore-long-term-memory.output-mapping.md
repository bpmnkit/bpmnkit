# Amazon Bedrock AgentCore Long-Term Memory connector — Output mapping

1. Use **Result Variable** to store the response in a process variable. For example, `memoryResult`.
2. Use **Result Expression** to map specific fields from the response into process variables.

For example, to extract the content from all records:

```feel
= {
  memories: records.content,
  count: resultCount
}
```


## Example response

The following is an example of the connector response:

```json
{
  "records": [
    {
      "memoryRecordId": "mem-abc123",
      "content": "Customer prefers email communication over phone calls.",
      "memoryStrategyId": "preference-extraction",
      "namespaces": ["customer/12345"],
      "createdAt": "2024-01-15T10:30:00Z",
      "score": 0.95,
      "metadata": {
        "source": "support-ticket",
        "confidence": "high"
      }
    },
    {
      "memoryRecordId": "mem-def456",
      "content": "Customer is located in the Pacific timezone.",
      "memoryStrategyId": "fact-extraction",
      "namespaces": ["customer/12345"],
      "createdAt": "2024-01-10T14:20:00Z",
      "score": 0.87,
      "metadata": {
        "source": "profile-update"
      }
    }
  ],
  "resultCount": 2,
  "nextToken": null
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-agentcore-long-term-memory
