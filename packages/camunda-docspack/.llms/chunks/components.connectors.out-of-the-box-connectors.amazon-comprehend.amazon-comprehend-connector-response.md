# Amazon Comprehend connector — Amazon Comprehend connector response

The response from the **Amazon Comprehend connector** will mirror the AWS Comprehend service’s response. The type of response you receive depends on the execution mode selected:

- **[Sync Response](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_ClassifyDocument.html#API_ClassifyDocument_ResponseSyntax)**: Provides immediate analysis for provided text.
- **[Asynchronous Response](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_StartDocumentClassificationJob.html#API_StartDocumentClassificationJob_ResponseSyntax)**: Used for batch processing where results are returned later through job completion.

### Using the Comprehend connector response in your process

The **Amazon Comprehend connector** provides the same response structure as the AWS Comprehend API. You can map fields from the response to process variables, depending on your needs. Here's an example of how to extract specific fields using **Result Expression** and **Result Variable**:

### Example Comprehend response (real-time execution)

Utilize output mapping to align this response with process variables:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`. This approach stores the entire Comprehend message as a process variable named `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. This approach allows for more granularity. Instead of storing the entire response in one variable, you can extract specific fields from the **Comprehend connector** message and assign them to different process variables. This is particularly useful when you are only interested in certain parts of the message, or when different parts of the message need to be used separately in your process.
   Example:

```json
{
  "classes": [
    {
      "name": "CHECKING_AC",
      "score": 0.5423,
      "page": null
    },
    {
      "name": "SAVINGS_AC",
      "score": 0.4577,
      "page": null
    }
  ],
  "labels": null,
  "documentMetadata": null,
  "documentType": null,
  "errors": null,
  "warnings": null
}
```

#### Mapping example

To store only first **Classes** element information, use the following result **expression**:

```feel
= {classInfo: classes[1]}
```

Mapped values **result**:

```json
{
  "name": "CHECKING_AC",
  "score": 0.5422999858856201,
  "page": null
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-comprehend
