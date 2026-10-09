# Amazon Comprehend connector — 3. Configure input — Execution types

Select the desired execution type from the **Execution Type** dropdown. The following options are available:

- **Sync**

Use **Sync** execution to create a classification request and analyze a single document in real-time.

For more details, refer to [sync execution](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_ClassifyDocument.html).

- **Async**

Use **Async** execution to start an asynchronous document classification job using a custom classification model. This method allows you to submit a document for analysis and receive results at a later time, making it ideal for background processing or batch operations.

**Async** execution enables you to process documents without waiting for immediate responses. This is particularly useful for larger files or when handling multiple documents simultaneously.

For more details on the fields that can be configured during asynchronous execution, refer to [async execution](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_StartDocumentClassificationJob.html).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-comprehend
