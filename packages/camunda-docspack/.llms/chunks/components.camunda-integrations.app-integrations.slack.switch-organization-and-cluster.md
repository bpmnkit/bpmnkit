# Camunda for Slack — Switch organization and cluster

Run `/camunda context` to see or switch your active organization and cluster. With exactly one option available, it is selected and confirmed with no modal.


## Notifications

Notification rules work the same way on Slack as on Microsoft Teams. See [notification rules](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/notification-rules) for how to create, list, and delete them.

An assignee with a linked Slack account receives a direct message when a task is assigned to them, independently of any notification rule.


## What Slack does not have

Compared to Microsoft Teams, Slack does not support:

- Incident monitoring
- A Home tab
- Waking a suspended cluster. You are told to resume it from the Camunda Hub instead
- Editing an existing notification rule. Delete it and create a new one instead
- File upload tasks
- Completing a task from a channel card. Completion is only available on the task card in your direct message
- Conversational replies to free text. Free text is offered to a process instead, and otherwise answered with the help card

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/slack
