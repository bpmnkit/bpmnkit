# Notification rules — What happens when a task matches

When a user task matches a rule, the app posts an interactive notification card to the channel, personal chat, or direct message. On Microsoft Teams, you can claim, assign, complete, or open the task without leaving the card. On Slack, the card links to Tasklist, and completion is available from the task card in your direct message. Cards update automatically as the task state changes.

See [notification behavior](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/microsoft-teams#notification-behavior) for the full description of how Microsoft Teams notification cards behave.


## Delivery requirements

On Slack, a channel rule needs the Camunda app to be a member of the channel. The app tries to join the channel when you submit the rule, and warns you when it cannot: "Invite the Camunda app to this channel (`/invite @Camunda`) so notifications can be delivered." A direct message rule is always deliverable.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/notification-rules
