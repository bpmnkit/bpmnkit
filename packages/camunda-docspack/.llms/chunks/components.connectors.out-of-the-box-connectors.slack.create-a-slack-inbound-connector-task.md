# Slack connector — Create a Slack inbound connector task

1. Start building your BPMN diagram. You can use the **Slack inbound connector** with either a **Start Event** or **Intermediate Catch Event**.
2. Select the applicable element and change its template to a **Slack Inbound connector**.
3. Fill in all required properties.
4. Complete your BPMN diagram.
5. Deploy the diagram to activate the webhook.
6. Navigate to the **Webhooks** tab in the properties panel to see the webhook URL.


## Make your Slack inbound connector for receiving event notifications executable

1. In the **Webhook Configuration** section, configure the **Webhook ID**. By default, **Webhook ID** is pre-filled with a random value. This value will be a part of the Slack event subscription or slash command URL.
2. In the **Webhook Configuration** section, configure the **Slack signing secret**. This value is unique to your Slack application and used to validate a Slack payload integrity. Read more about signing secrets in the [Slack documentation](https://api.slack.com/authentication/verifying-requests-from-slack).
3. In the **Activation** section, configure **Condition** when the Slack event or command can trigger a new BPMN process. The following example will trigger a new BPMN process for every `app_mention` Slack event type: `=(request.body.event.type = "app_mention")`.
4. In the **Variable mapping** section, fill the field **Result variable** to store the response in a process variable. For example, `myResultVariable`.
5. In the **Variable expression** section, fill the field to map specific fields from the response into process variables using [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).
   The following example will extract both Slack message sender ID and text from Slack `app_mention` event: `={senderId: request.body.event.user, text: request.body.event.text}`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack
