# Amazon EventBridge connector — Configure the Amazon EventBridge Webhook connector — Fill properties in the Webhook Configuration section

1. Choose one of the required methods in the **Webhook method** property. For example, if you know the webhook will be triggered by the **POST** method, choose **POST**. Alternatively, if it is not essential to specify a specific method for the webhook trigger, select **ANY**.
2. Configure the **Webhook ID**. By default, the **Webhook ID** is pre-filled with a random value. This value will be part of the Webhook URL. For more details about Webhook URLs, refer to the section below on [activating the Amazon EventBridge Webhook connector by deploying your diagram](#activate-the-amazon-eventbridge-connector-by-deploying-your-diagram).
3. (Optional) Fill in the **Event Bus Name** property if you want to specify a specific event bus to subscribe to. If left empty, the default event bus will be used.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-eventbridge
