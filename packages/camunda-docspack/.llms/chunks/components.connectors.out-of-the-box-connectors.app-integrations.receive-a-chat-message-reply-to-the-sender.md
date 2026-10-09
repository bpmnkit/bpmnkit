# App Integrations connector — Receive a chat message — Reply to the sender

Reply with a **Send message** task, using the values from `chatMessage`.

| Platform        | Recipient source | Property         | Value                       |
| :-------------- | :--------------- | :--------------- | :-------------------------- |
| Microsoft Teams | Microsoft Teams  | **Conversation** | `=chatMessage.conversation` |
| Slack           | Slack            | **Channel ID**   | `=chatMessage.conversation` |
| Slack           | Slack            | **Thread**       | `=chatMessage.threadId`     |

There is no Slack **Conversation** target, so a Slack reply is not the same shape as a Teams reply: it uses the **Channel ID** target plus **Thread** rather than a single **Conversation** value.

The reply is posted by the Camunda app, in the same thread the person wrote in.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
