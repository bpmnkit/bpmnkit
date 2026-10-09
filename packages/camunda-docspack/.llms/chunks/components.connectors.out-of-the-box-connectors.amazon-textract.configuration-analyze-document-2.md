# Amazon Textract connector — Configuration — Analyze Document (2)

Additional optional parameters for advanced configuration:

| Property                           | Type     | Required | Description                                                                                                                                                                                                                                                                               | Example                 |
| :--------------------------------- | :------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| Response format                    | Dropdown | No       | How the analysis result is returned: **as JSON** returns it directly in the process variables; **Document reference** uploads it to the Camunda document store and returns a reference. Not shown for **Asynchronous** execution, which always writes the result to the output S3 bucket. | Defaults to **as JSON** |
| Client Request Token               | String   | No       | The idempotent token that you use to identify the start request.                                                                                                                                                                                                                          |                         |
| Job Tag                            | String   | No       | An identifier that you specify that's included in the completion notification published to the Amazon SNS topic.                                                                                                                                                                          |                         |
| KMS Key ID                         | String   | No       | The KMS key used to encrypt the inference results.                                                                                                                                                                                                                                        |                         |
| Notification Channel Role ARN      | String   | No       | The Amazon SNS topic role ARN that you want Amazon Textract to publish the completion status of the operation to.                                                                                                                                                                         |                         |
| Notification Channel SNS Topic ARN | String   | No       | The Amazon SNS topic ARN that you want Amazon Textract to publish the completion status of the operation to.                                                                                                                                                                              |                         |

#### Output

The connector response mirrors the [AWS Textract API](https://docs.aws.amazon.com/textract/latest/dg/API_Reference.html), depending on the execution type:

- [Real-time Execution Response](https://docs.aws.amazon.com/textract/latest/dg/API_AnalyzeDocument.html#API_AnalyzeDocument_ResponseSyntax)
- [Polling Execution Response](https://docs.aws.amazon.com/textract/latest/dg/API_GetDocumentAnalysis.html#API_GetDocumentAnalysis_ResponseSyntax)
- [Asynchronous Execution Response](https://docs.aws.amazon.com/textract/latest/dg/API_StartDocumentAnalysis.html#API_StartDocumentAnalysis_ResponseSyntax)

For **Real-time** and **Polling** execution, the **Response format** dropdown controls how that result reaches your process:

- **as JSON** (default) returns the result above directly in the process variables, unchanged from earlier template versions.
- **Document reference** uploads the result as a JSON file to the Camunda document store instead, and returns a reference:

```json
{
  "document": {
    "storeId": "in-memory",
    "documentId": "8b54b413-b847-4650-b445-de963d5c506d",
    "contentHash": "ed0f7ad835669698a108a32b2a99e89e4f5aea84127fde68df4248b11197b0e5",
    "metadata": {
      "contentType": "application/json",
      "size": 2048,
      "fileName": "8b54b413-b847-4650-b445-de963d5c506d"
    },
    "camunda.document.type": "camunda"
  }
}
```

To get the answer of the query when using the Analyze queries feature:

```feel
= {"answer": response.blocks[item.blockType = "QUERY_RESULT"][1].text}
```

For example, to get the response, when using asynchronous execution, use a timer event for example and retrieve the result with the S3 connector.

---
---

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-textract
