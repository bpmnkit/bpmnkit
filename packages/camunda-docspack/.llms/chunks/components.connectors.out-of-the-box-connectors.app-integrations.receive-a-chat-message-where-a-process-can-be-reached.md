# App Integrations connector — Receive a chat message — Where a process can be reached

| Surface                                   | A message reaches a process when                                                 |
| :---------------------------------------- | :------------------------------------------------------------------------------- |
| Microsoft Teams personal chat             | Someone writes anything.                                                         |
| Microsoft Teams channel                   | Someone writes a message that @mentions the Camunda app.                         |
| Slack direct message with the Camunda app | Someone writes anything that is not a help request.                              |
| Slack channel                             | Someone @mentions the Camunda app, and the app is a member of the channel.       |
| Slack group direct message                | Never. `/camunda chat` refuses to configure one, because the app cannot join it. |

In a Microsoft Teams channel or a Slack channel, add the Camunda app to the channel and @mention it to start a conversation. Messages that address nobody aren't delivered to a process, so a process that expects replies in a channel should ask to be @mentioned, or use a personal chat or direct message instead.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
