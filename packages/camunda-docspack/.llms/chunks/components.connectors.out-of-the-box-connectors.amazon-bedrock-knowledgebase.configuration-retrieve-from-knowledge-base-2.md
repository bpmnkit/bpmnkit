# Amazon Bedrock Knowledge Base connector — Configuration — Retrieve from Knowledge Base (2)

#### Example response

The following is an example of the connector response:

```json
{
  "results": [
    {
      "documentReference": {
        "storeId": "in-memory",
        "documentId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      },
      "content": "Comprehensive auto insurance covers damage to your vehicle from events other than collisions, including theft, vandalism, natural disasters, and falling objects.",
      "score": 0.92,
      "sourceUri": "s3://my-bucket/policies/auto-insurance.pdf",
      "metadata": {
        "category": "auto",
        "policyType": "comprehensive"
      }
    },
    {
      "documentReference": {
        "storeId": "in-memory",
        "documentId": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
      },
      "content": "Liability coverage pays for bodily injury and property damage that you cause to others in an auto accident.",
      "score": 0.85,
      "sourceUri": "s3://my-bucket/policies/auto-insurance.pdf",
      "metadata": {
        "category": "auto",
        "policyType": "liability"
      }
    }
  ],
  "resultCount": 2,
  "paginationToken": null
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock-knowledgebase
