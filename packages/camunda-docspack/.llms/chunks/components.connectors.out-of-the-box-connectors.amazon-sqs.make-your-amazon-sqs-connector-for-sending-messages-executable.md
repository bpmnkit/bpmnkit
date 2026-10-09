# Amazon Simple Queue Service connector — Make your Amazon SQS connector for sending messages executable

To make your Amazon SQS connector for sending messages executable, take the following steps:

1. Choose an applicable authentication type from the **Authentication** dropdown. Learn more about authentication types in the related [appendix entry](#aws-authentication-types).
2. Set the relevant IAM key and secret pair in the **Authentication** section. For example, `{{secrets.MY_AWS_ACCESS_KEY}}`. The value can be plain text, but this is not recommended due to security concerns.
3. In the **Queue Properties** section, set the URL of your SQS queue, its region, and its type.
4. In the **Input message data** section, fill the **Message body** with the data you would like to submit to the queue. The field requires FEEL input.
5. (Optional) In the **Input message data** section, fill out the field **Message attributes** to set optional message metadata. This field requires FEEL input. Refer to the relevant [appendix](#what-are-the-message-attributes-and-how-can-i-set-them) section to find out more about this field.
6. (FIFO only) If you are using a queue of type **FIFO**, a [**Message Group ID** must be provided](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/using-messagegroupid-property.html). An optional **Message Deduplication ID** can be provided as well, depending on how you [configured](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/using-messagededuplicationid-property.html) the message deduplication of the queue.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sqs
