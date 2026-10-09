# Camunda for Slack

Use the /camunda slash command and the Camunda direct message to work with Camunda inside Slack.

Slack has no tab app. Everything happens through the `/camunda` slash command, the direct message with the Camunda app, and channel mentions. If you are coming from the Microsoft Teams page looking for tabs, there are none on Slack.


## Slash commands

One command, default `/camunda`, configurable per Self-Managed deployment. Routing is on the first word of the argument.

| Invocation                                            | What it does                                                                                                                  |
| :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `/camunda tasks`                                      | Open user tasks in the active organization and cluster. 15 per page, **Previous** and **Next**, per-row **Open in Tasklist**. |
| `/camunda tasks my`                                   | The same list, filtered to your tasks.                                                                                        |
| `/camunda start`                                      | Opens the start-process modal: organization, cluster, process definition, then the start form.                                |
| `/camunda context`                                    | Shows or switches the active organization and cluster. With one option available it is selected and confirmed with no modal.  |
| `/camunda chat`                                       | Opens the chat-channel modal, which configures the App Integrations connector chat key for this channel or direct message.    |
| `/camunda subscribe`                                  | Opens the create-notification-rule modal. The destination is the conversation you ran it in.                                  |
| `/camunda subscriptions`                              | Lists this conversation's notification rules with a **Delete** button per row. Capped at 20 rows.                             |
| `/camunda`, `/camunda help`, or any unrecognized word | The help card. There is no "unknown command" error on Slack.                                                                  |

`/camunda` with an unrecognized word shows the help card rather than an error.

**Note**
The command name is configurable on Self-Managed and defaults to `/camunda`. If your workspace uses a different name, replace `/camunda` with it in every invocation above.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/slack
