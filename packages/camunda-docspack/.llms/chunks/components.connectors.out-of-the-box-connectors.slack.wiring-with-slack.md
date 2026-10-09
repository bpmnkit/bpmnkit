# Slack connector — Wiring with Slack

### Events API

This is a simplified guide. For full guide, refer to the [official Slack documentation](https://api.slack.com/apis/connections/events-api).

1. Make sure you have sufficient permissions to modify your Slack application.
2. Open [Slack API portal](https://api.slack.com) and select your Slack application.
3. Navigate to the **Event Subscription** page.
4. Click **Enable Events**.
5. In the **Request URL** field, put the webhook URL. You can find it at the **Webhook** tab in the properties panel of you BPMN diagram.
6. Make sure that the **Request URL** indicates that endpoint is **Verified**. This process may take several seconds.
7. Click **Subscribe to bot events**.
8. Select all events you wish to receive. **Note:** some messages may produce several events. For example, a message `@YourBot test` will generate both `app-mention` and `message` events.
9. Click **Save** to apply new changes.
10. Install or re-install your app into your workspace.

### Slash commands

This is a simplified guide. For a full guide, refer to the [official Slack documentation](https://api.slack.com/interactivity/slash-commands).

1. Make sure you have sufficient permissions to modify your Slack application.
2. Open [Slack API portal](https://api.slack.com) and select your Slack application.
3. Navigate to **Slash Commands**.
4. Click **Create New Command**.
5. Fill the fields **Command**, **Short Description**, and **Usage Hint** as you prefer.
6. In the **Request URL** field, put the webhook URL. You can find it at the **Webhook** tab in the properties panel of your BPMN diagram.
7. Click **Save** to apply new changes.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack
