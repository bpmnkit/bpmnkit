# App Integrations connector — Receive a chat message — Route a chat to the right process

A **chat key** decides which process the messages in a channel or chat start. You set it in two places that must match: the start event in your model, and the channel or chat in the Camunda app.

The **App Integrations Chat Conversation Start Event** template carries a **Chat key** property. It holds the full name of the message the process starts on, and must read `io.camunda.appIntegrations.conversationStarted.<chat key>`, for example `io.camunda.appIntegrations.conversationStarted.hr-intake`. It defaults to `io.camunda.appIntegrations.conversationStarted.default`. The template rejects a value in any other form, so a typo can't subscribe your process to an unrelated message.

You don't have to type the value. Configure the channel or chat first:

- On Microsoft Teams, open the Camunda app in the channel or chat, and select the **Settings** tab.
- On Slack, run `/camunda chat` in the channel or direct message. This is the Slack equivalent of the Teams **Settings** tab.

Either surface shows the exact string to copy into the **Chat key** property, and both ask for a short chat key, such as `hr-intake`, and for the organization and cluster the conversation runs in. Each channel and chat is in one of three states.

| State                | What you set                                               | What a message does                                                                                      |
| :------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Default process**  | Nothing. Every channel and chat starts here.               | Starts the process whose chat key is `default`, in the organization and cluster the sender has selected. |
| **Specific process** | A chat key, and the organization and cluster to run it in. | Starts the process with that chat key, in the configured cluster, whoever writes the message.            |
| **Off**              | Nothing is processed here.                                 | Reaches no process. The Camunda app answers with its help message instead.                               |

Give a chat key to exactly one process definition per cluster. If two deployed processes carry the same chat key, both of them start on every message and both reply to the person, and nothing detects the clash for you.

Changing a chat key applies to the next conversation. A conversation already under way finishes with the process holding it.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations
