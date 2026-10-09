# Amazon Simple Notification Service connector — Make your Amazon SNS connector for sending messages executable

To make your Amazon SNS connector for sending messages executable, take the following steps:

1. Choose an applicable authentication type from the **Authentication** dropdown. Learn more about authentication types in the related [appendix entry](#aws-authentication-types).
2. Set the relevant IAM key and secret pair in the **Authentication** section. For example, `{{secrets.MY_AWS_ACCESS_KEY}}`. The value can be plain text, but this is not recommended due to security concerns.
3. In the **Topic Properties** section, set the topic ARN of your SNS topic as well as its region.
4. In the **Input message data** section, fill out the field **Message** with the data you would like to publish to the topic. The field requires FEEL input.
5. (Optional) In the **Input message data** section, fill out the field **Message attributes** to set optional message metadata. This field requires FEEL input. Refer to the relevant [appendix](#what-are-the-message-attributes-and-how-can-i-set-them) section to find out more about this field.
6. (Optional) In the **Input message data** section, fill out the field **Subject** to set optional message subject. FEEL input of the field is optional. Length must be less than 100 characters.
7. (FIFO only) For a FIFO type topic in Amazon SNS, a **Message Group ID** is required. This ID ensures that messages within the same group are delivered in sequence. The [Amazon SNS documentation on FIFO topics](https://docs.aws.amazon.com/sns/latest/dg/sns-fifo-topics.html) provides more details on Message Group ID usage. Additionally, an optional **Message Deduplication ID** can be provided. This is useful for message deduplication in FIFO topics and its necessity depends on the [deduplication settings of your SNS FIFO topic](https://docs.aws.amazon.com/sns/latest/dg/sns-message-deduplication.html). The Message Deduplication ID helps ensure Amazon SNS does not resend the same message within the deduplication interval.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sns
