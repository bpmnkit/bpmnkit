# App Integrations connector — Send message — slack

Select a **Slack target**, then fill the field it reveals. There is no Slack **Conversation** target.

| Slack target | Property   | Required | Description                                                 | Example       |
| :----------- | :--------- | :------- | :---------------------------------------------------------- | :------------ |
| Channel      | Channel ID | Yes      | The Slack channel to post into.                             | `C0123456789` |
| User         | User ID    | Yes      | Slack member ID of the recipient. An email is not accepted. | `U0123456789` |

**Thread** is shown for any Slack recipient, channel or user, and is optional. Set it to the `messageId` of a previous send to post the message as a reply in that thread. Leave it empty to post a new message.

| Property | Type   | Required | Description                                        | Example             |
| :------- | :----- | :------- | :------------------------------------------------- | :------------------ |
| Thread   | String | No       | Message ID of a previous send, to reply in-thread. | `1712345678.000100` |

There is no workspace field on send message. The destination is the workspace the backend's bot token belongs to.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
