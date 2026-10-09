# Amazon Bedrock AgentCore Long-Term Memory connector — Configuration

1. In the **Region** field, enter the AWS region where your AgentCore Memory resource is deployed. For example, `us-east-1`.
1. In the **Memory ID** field, enter the identifier of the AgentCore Memory resource you want to query.
1. In the **Namespace** field, enter a namespace prefix to scope memory records. For example, `customer/12345`. This is required by AWS to organize and isolate memory records.


## Operations

The **Amazon Bedrock AgentCore Long-Term Memory connector** supports the following operations.

### Retrieve memory records

Perform a semantic search to find relevant memory records based on a natural language query.

#### Parameters

| Parameter              | Required | Description                                                                      |
| :--------------------- | :------- | :------------------------------------------------------------------------------- |
| **Search query**       | Yes      | Semantic search query to find relevant memory records (up to 10,000 characters). |
| **Memory strategy ID** | No       | Limits the search to memories created by a specific extraction strategy.         |
| **Max results**        | No       | Maximum number of results to return (1–100). Defaults to 10.                     |
| **Next token**         | No       | Pagination token from a previous response to fetch the next page.                |

### List memory records

List all memory records within the configured namespace.

#### Parameters

| Parameter              | Required | Description                                                       |
| :--------------------- | :------- | :---------------------------------------------------------------- |
| **Memory strategy ID** | No       | Filter memory records by a specific extraction strategy.          |
| **Max results**        | No       | Maximum number of results to return (1–100). Defaults to 20.      |
| **Next token**         | No       | Pagination token from a previous response to fetch the next page. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-agentcore-long-term-memory
