# Amazon Simple Queue Service connector — Configure the SQS inbound connector

To configure the SQS inbound connector and receive messages from your SQS Queue, follow these steps:

1. Choose an applicable authentication type from the **Authentication** dropdown. Learn more about authentication types in the related [appendix entry](#aws-authentication-types-1).
2. Set the relevant IAM key and secret pair in the **Authentication** section. For example, `{{secrets.MY_AWS_ACCESS_KEY}}`. The value can be plain text, but this is not recommended due to security concerns.
3. In the **Queue Properties** section, set the URL of your SQS Queue and its region.
4. In the **Message polling properties** section, set the polling wait time. This is the duration (in seconds) for which the call waits for a message to arrive in the queue before returning. Refer to the [Amazon documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-short-and-long-polling.html) for more details. Be aware that setting the value to 0 will not take effect, as it will automatically be overridden
   with a value of 1 during runtime.
5. (Optional) In the **Use next attribute names for activation condition** section, set an array of **Attribute names** or **Message attribute name** (e.g., `["attributeName1", "attributeName2"]`) to receive messages from the queue with specific metadata. Alternatively, you can leave it empty to get results with all available attributes. Learn more about message metadata [here](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-message-metadata.html).
6. (Optional) Configure the **Activation Condition**. For example, if an external message has the body `{"messageId": 1, "body": "Hi team", "messageAttributes":{"key":{"stringValue":"value"}}...}`, the **Activation Condition** value might look like `=(messageAttributes.key.stringValue="value")`. Leave this field empty to receive all messages every time.
7. Set the **Output mapping**. For example, to get only the message body, you can set `{resultBody: body}` in the **Result expression** field. Learn more about **Output mapping** [here](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sqs
