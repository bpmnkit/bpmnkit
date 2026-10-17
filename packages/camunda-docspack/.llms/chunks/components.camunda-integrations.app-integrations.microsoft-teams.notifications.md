# Camunda for Microsoft Teams — Notifications

The bot sends notifications based on your [notification rules](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/notification-rules).

#### Personal notifications

Receive a message in your personal chat when a user task matches one of your notification rules. For example, when a task is assigned to you.

#### Channel notifications

A channel receives notifications for user tasks that match its configured rules. This allows your team to coordinate who picks them up.

To configure notifications, see [notification rules](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/notification-rules).

#### Notification behavior

Notification cards are interactive. You can assign, complete, or manage tasks directly from the card.

Cards update automatically to reflect the latest task state. For example, when someone else completes or assigns the task. On SaaS, automatic updates require a cluster running generation `8.9 gen13` or later with [app integrations extensions enabled](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/notification-rules#enable-notification-delivery-for-your-cluster).

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/microsoft-teams
