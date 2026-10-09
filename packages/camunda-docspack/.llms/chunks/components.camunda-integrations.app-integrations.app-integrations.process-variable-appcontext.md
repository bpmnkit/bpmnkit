# Camunda app integrations — Process variable: `appContext`

When a process is started or a user task is completed through Microsoft Teams or Slack, the integration automatically injects an `appContext` variable into the process variables. This allows downstream BPMN processes to know _where_ and _how_ they were triggered.

The `appContext` variable has the following shape:

| Field            | Type                                  | Description                                                                |
| :--------------- | :------------------------------------ | :------------------------------------------------------------------------- |
| `integration`    | `"teams"` \| `"slack"`                | The platform that initiated the action.                                    |
| `externalUserId` | `string`                              | The platform-specific user ID of the person who triggered the action.      |
| `email`          | `string`                              | The Camunda account email associated with the user.                        |
| `source`         | `"tab"` \| `"message"` \| `"channel"` | The UI surface that triggered the action (see below).                      |
| `channel`        | `string` (optional)                   | The channel or conversation ID. Present only when `source` is `"channel"`. |

### Source values

| Value       | Meaning                                                                                                                                                          |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"tab"`     | Action was triggered from the Teams tab interface, including forms opened in a pop-up dialog from a bot card. Slack has no tab, so it never produces this value. |
| `"message"` | Action was triggered from a bot conversation in a personal or group chat, or from the Slack direct message with the Camunda app.                                 |
| `"channel"` | Action was triggered from a channel, either through a bot card posted in the channel, a channel command, or a Slack channel mention.                             |

**Tip**
You can use `appContext` in your BPMN processes to implement conditional logic based on where an action originated. For example, you could route a process differently depending on whether it was started from a tab or a channel command.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/app-integrations
