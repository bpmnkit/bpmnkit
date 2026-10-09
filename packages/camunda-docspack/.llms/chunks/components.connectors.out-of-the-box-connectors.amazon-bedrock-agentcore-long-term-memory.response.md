# Amazon Bedrock AgentCore Long-Term Memory connector — Response

The connector operations use the following response structure:

| Field         | Description                                                                                  |
| :------------ | :------------------------------------------------------------------------------------------- |
| `records`     | A list of memory record entries. Each entry contains the fields described below.             |
| `resultCount` | The number of records returned.                                                              |
| `nextToken`   | A token for retrieving additional results in subsequent requests. `null` if no more results. |

Each record in the `records` list contains:

| Field              | Description                                             |
| :----------------- | :------------------------------------------------------ |
| `memoryRecordId`   | Unique identifier for the memory record.                |
| `content`          | The text content of the memory record.                  |
| `memoryStrategyId` | The extraction strategy that created this record.       |
| `namespaces`       | List of namespaces associated with the record.          |
| `createdAt`        | Timestamp when the record was created.                  |
| `score`            | Relevance score (only present for retrieve operations). |
| `metadata`         | Key-value metadata associated with the record.          |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-agentcore-long-term-memory
