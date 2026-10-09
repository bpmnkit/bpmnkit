# App Integrations connector

Send and receive Microsoft Teams and Slack messages, and create channels, from your BPMN process.

Send messages to Microsoft Teams and Slack, receive what people write back, and create channels, directly from your BPMN process.


## About this connector

The **App Integrations connector** sends messages through your organization's Camunda app integrations. The connection is configured once for the environment, so the task itself carries no credentials and no endpoint.

A message can go to a Microsoft Teams channel, user, or conversation, to a Slack channel or user, or to a **Camunda recipient**, an assignee, candidate users, or candidate groups, which are resolved to whichever platforms those people have connected. Alongside the text you can send an [Adaptive Card](https://adaptivecards.io/), a [Block Kit](https://api.slack.com/block-kit) payload, or a Camunda form.

Your process can also listen. When someone writes to the Camunda app, a process can start from what they typed, and a running process can wait for their reply. See [receive a chat message](#receive-a-chat-message).

### When to use this connector

Use this connector if your organization uses [Camunda app integrations](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/app-integrations), the Camunda apps for Microsoft Teams and Slack. Messages sent from a process travel through the same integration your users already have, so they arrive in the same channels and chats, alongside the task notifications those users already receive, rather than through a separate bot with its own identity.

If you do not use app integrations, and you would rather register your own app and supply its credentials in the process model, use the [Slack](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack) or [Microsoft Teams](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-teams) connector instead.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
