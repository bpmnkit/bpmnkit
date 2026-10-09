# Amazon Simple Notification Service connector — Wiring with Amazon SNS

1. Sign in to the [Amazon SNS console](https://console.aws.amazon.com/sns/home).
2. On the navigation panel, choose **Topics**.
3. Choose the **Create** subscription.
4. In the **Protocol** drop-down list, select **HTTPS**.
5. In the **Endpoint** box, paste in the URL of the subscription found in at the **Webhooks** tab of your BPMN
   diagram that you want the topic to send messages. Then, choose **Create subscription**.
6. The confirmation message is displayed. Choose **Close**. Your new subscription's **Subscription ID**
   displays **PendingConfirmation**. Shortly after it will be confirmed by the BPMN process assuming **Allow to receive messages from topic(s)** contains the SNS topic ARN.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sns
