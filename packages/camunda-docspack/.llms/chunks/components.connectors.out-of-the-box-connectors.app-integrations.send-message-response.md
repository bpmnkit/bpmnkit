# App Integrations connector — Send message — Response

The connector reports every destination the message reached, and every one it did not:

```json
{
  "deliveries": [
    {
      "platform": "teams",
      "conversation": "19:abc@thread.tacv2;messageid=17123456789",
      "messageId": "17123456789",
      "conversationKey": "teams:19:abc@thread.tacv2;messageid=17123456789"
    }
  ],
  "failures": [
    {
      "platform": "slack",
      "conversation": "C0123456789",
      "reason": "not_in_channel"
    }
  ]
}
```

| Field                          | Description                                                                                                                                                                                                                          |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deliveries`                   | Every destination the message was delivered to.                                                                                                                                                                                      |
| `deliveries[].platform`        | `teams` or `slack`, never `camunda`. A Camunda recipient can fan out to both platforms in one response.                                                                                                                              |
| `deliveries[].conversation`    | The conversation the message landed in. Use it to reply later. For a Slack recipient, this is the channel ID, including the direct message channel when the target was a user.                                                       |
| `deliveries[].messageId`       | The message identifier. For Slack, this is the message timestamp, which also serves as the thread anchor.                                                                                                                            |
| `deliveries[].conversationKey` | Identifies the conversation for a chat catch element. For Teams, it is `teams:<conversationId>`. For Slack, it is `slack:<channelId>:<threadTs>`. Compare it, don't parse it. See [receive a chat message](#receive-a-chat-message). |
| `failures`                     | Every destination that could not be reached.                                                                                                                                                                                         |
| `failures[].platform`          | `teams` or `slack`, never `camunda`.                                                                                                                                                                                                 |
| `failures[].conversation`      | The conversation that could not be reached.                                                                                                                                                                                          |
| `failures[].reason`            | Why that destination failed.                                                                                                                                                                                                         |

A single delivery is a one-element list, so with a result variable of `response` you read it as `= response.deliveries[1].conversation`. FEEL lists are 1-indexed.

`failures` is non-empty on a partial success. A process that must not continue on an incomplete fan-out can check `= count(response.failures) > 0`.

**Tip**
To continue a conversation, feed the response back in. Pass `conversation` as the Microsoft Teams **Conversation** target, or as the Slack **Channel ID** target with `messageId` as **Thread**. To wait for an answer instead of sending again, pass `conversationKey` to a [chat message catch element](#receive-a-chat-message).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
