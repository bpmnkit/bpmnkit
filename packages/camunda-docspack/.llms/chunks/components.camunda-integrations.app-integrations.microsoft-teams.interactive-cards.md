# Camunda for Microsoft Teams — Interactive cards

In addition to commands, the bot sends interactive cards with buttons you can use to perform actions directly in chat.

**Note**
When you trigger actions through the bot, such as starting processes or completing tasks, it automatically adds an [`appContext`](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/app-integrations#process-variable-appcontext) variable. This variable captures who triggered the action and from which surface (`"message"` or `"channel"`).

#### Select an organization and cluster

Select your organization from a dropdown, then choose a cluster. The bot remembers your selection for future interactions.

#### Start processes

Select a process definition and complete the start form or provide variables. The bot confirms when the process starts successfully or shows an error.

#### Work with tasks

| Action            | Description                                                                                                          |
| :---------------- | :------------------------------------------------------------------------------------------------------------------- |
| **Assign to me**  | Claim a task. If you do this from a channel, the bot also sends you a personal copy so you can work on it privately. |
| **Unassign**      | Release a task so others can pick it up.                                                                             |
| **Fill in form**  | Open the task completion form directly in the chat card.                                                             |
| **Complete task** | Submit the form and mark the task as done.                                                                           |
| **Reset form**    | Discard your form input and return to the task overview.                                                             |

#### Manage clusters

If your cluster is sleeping, the bot shows a **Wake up cluster** button.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/microsoft-teams
