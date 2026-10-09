# Amazon Bedrock Knowledge Base connector — Configuration — Retrieve from Knowledge Base

Perform a semantic search over the documents indexed in your knowledge base. The connector returns the most relevant passages that match your query.

#### Parameters

| Parameter             | Required | Description                                                                                                                   |
| :-------------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **Query**             | Yes      | A natural language query to search the knowledge base. Supports [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) expressions. |
| **Number of results** | No       | The maximum number of results to return (1-100). Defaults to five.                                                            |

#### Response

The connector returns the following fields:

| Field             | Description                                                                                                          |
| :---------------- | :------------------------------------------------------------------------------------------------------------------- |
| `results`         | A list of retrieval results. Each result contains the fields described below.                                        |
| `resultCount`     | The number of results returned.                                                                                      |
| `paginationToken` | A token for retrieving additional results in subsequent requests. This value is `null` if there are no more results. |

Each result in the `results` list contains the following fields:

| Field               | Description                                                                                                                                                   |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `documentReference` | A [Camunda document](https://docs.camunda.io/docs/next/components/document-handling/getting-started) reference containing the chunk text, for use with downstream connectors or processing. |
| `content`           | The matched text passage from the knowledge base.                                                                                                             |
| `score`             | A relevance score between 0 and 1 indicating how well the result matches the query.                                                                           |
| `sourceUri`         | The S3 URI of the source document.                                                                                                                            |
| `metadata`          | Key-value metadata associated with the source document.                                                                                                       |

#### Output mapping

1. Use **Result Variable** to store the response in a process variable. For example, `kbResult`.
2. Use **Result Expression** to map specific fields from the response into process variables.

For example, to extract just the text content from all results:

```feel
= {
  texts: results.content,
  count: resultCount
}
```

#### Query guidelines

For best results, use specific, descriptive queries rather than short keywords:

| Query                                                            | Quality | Why                                               |
| :--------------------------------------------------------------- | :------ | :------------------------------------------------ |
| "What does the auto insurance policy cover for stolen vehicles?" | Good    | Specific topic with clear intent.                 |
| "What are the exclusions for water damage in home insurance?"    | Good    | Targets a specific section and policy type.       |
| "Coverage"                                                       | Poor    | Too broad. It may return loosely related results. |
| "Tell me everything about insurance"                             | Poor    | Too vague. No specific topic to match against.    |

**Tip**
When using the connector as a tool in an [AI Agent Sub-process](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess), the agent composes the query automatically based on the user's request. Use the `fromAi()` function to let the agent generate targeted queries.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-knowledgebase
