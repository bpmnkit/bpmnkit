# Amazon Simple Notification Service connector — Create an Amazon SNS inbound connector task

1. Start building your BPMN diagram. You can use the **Amazon SNS inbound connector** with either a **Start Event** or **Intermediate Catch Event**.
2. Select the applicable element and change its template to an **Amazon SNS connector**.
3. Fill in all required properties.
4. Complete your BPMN diagram.
5. Deploy the diagram to activate the webhook.
6. Navigate to the **Webhooks** tab in the properties panel on the right side of the screen to observe the webhook URL.


## Make your Amazon SNS inbound connector for receiving notifications executable

1. In the **Subscription Configuration** section, configure the **Subscription ID**. By default, **Subscription ID** is pre-filled with a random value. This value will be a part of the topic subscription URL.
2. Set the **Allow to receive messages from topic(s)** value to **any** if the process may be triggered by any topic, or **Specific topic(s)** if you wish to allow-list only certain topics to start a new BPMN process.
3. If you have chosen the **Specific topic(s)**, you have to list comma-separated topics in the field **Topic ARN(s)** as well. In that case, the **Amazon SNS inbound connector** will auto-approve each qualified subscription request.
4. In the section **Activation**, configure **Condition** when the Amazon SNS topic can trigger a new BPMN process. The following example will trigger a new BPMN process for every notification with a subject _Start BPMN_: `=(request.body.Subject = "Start BPMN")`.
5. In the **Output mapping** section, fill in the **Result variable** field to store the response in a process variable. For example, `myResultVariable`. Alternatively, fill in the **Result expression** field to map specific fields from the response into process variables using [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).
   The following example will extract both the message and subject from an Amazon SNS message: `={message: request.body.Message, subject: request.body.Subject}`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sns
