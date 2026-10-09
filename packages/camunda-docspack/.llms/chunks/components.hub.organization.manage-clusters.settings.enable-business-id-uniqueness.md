# Manage cluster settings — Enable business ID uniqueness

When enabled, the cluster enforces uniqueness constraints on business identifiers to prevent duplicate process instances.


## Enable app integrations extensions

You can allow a cluster to exchange events with App Integrations, such as Camunda for Microsoft Teams or Slack, so App Integrations can deliver task notifications to your chat tool.

- Enable this setting to deliver user task notifications to Microsoft Teams or Slack based on your [notification rules](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/notification-rules). Notification cards also update as the task is assigned, completed, or canceled.
- Disable this setting if you do not want the cluster to exchange events. App Integrations then work with reduced functionality: the cluster delivers no notifications, but you can still use Camunda for Microsoft Teams or Slack to browse tasks, start processes, and act on tasks.

This setting is disabled by default. It is available for clusters running generation `8.9 gen13` or later, and organization admins can change it.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/settings
