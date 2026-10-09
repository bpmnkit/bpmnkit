# App Integrations connector — Receive a chat message — slack

```json
{
  "platform": "slack",
  "conversationKey": "slack:D0123ABCD:1712345678.000100",
  "conversation": "D0123ABCD",
  "threadId": "1712345678.000100",
  "messageId": "1712345690.000200",
  "text": "approved, ship it",
  "user": {
    "externalUserId": "T01234ABCDE::U01234ABCDE",
    "email": "ada@example.com"
  },
  "receivedAt": "2026-08-26T09:41:02.113Z"
}
```

| Field                 | Description                                                                                                                         |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `platform`            | `teams` or `slack`.                                                                                                                 |
| `conversationKey`     | Identifies the conversation. Use it as the correlation key of a catch element. Compare it, don't parse it.                          |
| `conversation`        | The conversation the message came from. Pass it back to reply.                                                                      |
| `threadId`            | The Slack thread anchor. Present on Slack only. On Microsoft Teams, the conversation is already the thread, so the field is absent. |
| `messageId`           | This message's own identifier, not the thread anchor.                                                                               |
| `text`                | The message as typed. In a channel, the mention of the Camunda app is removed.                                                      |
| `user.externalUserId` | The sender's identifier on the chat platform.                                                                                       |
| `user.email`          | The sender's Camunda email address.                                                                                                 |
| `receivedAt`          | When app integrations received the message, in ISO 8601 format.                                                                     |

Attachments, files, and edits to an existing message aren't delivered.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
