# Slack connector — Make your Slack inbound connector for receiving slash command notifications executable

1. In the **Webhook Configuration** section, configure the **Webhook ID**. By default, **Webhook ID** is pre-filled with a random value. This value will be a part of the Slack event subscription or slash command URL.
2. In the **Webhook Configuration** section, configure the **Slack signing secret**. This value is unique to your Slack application and used to validate a Slack payload integrity. Read more about signing secrets in the [Slack documentation](https://api.slack.com/authentication/verifying-requests-from-slack).
3. In the **Activation** section, configure **Condition** when the Slack event or command can trigger a new BPMN process. The following example will trigger a new BPMN process for every `/test` Slack command type: `=(connectorData.command = "/test")`.
4. In the **Variable mapping** section, fill the field **Result variable** to store the response in a process variable. For example, `myResultVariable`.
5. In the **Variable expression** section, fill the field to map specific fields from the response into process variables using [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).
   The following example will extract both Slack message sender ID and text from Slack `/test hello` command: `={senderId: connectorData.user_id, text: connectorData.text}`.

When using the **Slack inbound connector** with an **Intermediate Catch Event**, fill in the **Correlation key (process)** and **Correlation key (payload)**.

- **Correlation key (process)** is a FEEL expression that defines the correlation key for the subscription. This corresponds to the **Correlation key** property of a regular **Message Intermediate Catch Event**.
- **Correlation key (payload)** is a FEEL expression used to extract the correlation key from the incoming message. This expression is evaluated in the connector Runtime and the result is used to correlate the message.

For example, given that your correlation key is defined with `myCorrelationKey` process variable, and the request body contains `text=hello}`, your correlation key settings will look like this:

- **Correlation key (process)**: `=myCorrelationKey`
- **Correlation key (payload)**: `=connectorData.text`

Learn more about correlation keys in the [messages guide](https://docs.camunda.io/docs/next/components/concepts/messages).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack
