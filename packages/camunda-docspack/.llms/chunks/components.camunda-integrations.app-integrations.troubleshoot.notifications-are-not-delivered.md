# Troubleshoot app integrations — Notifications are not delivered

- On SaaS clusters running generation `8.9 gen13` or later, check that **Enable app integrations extensions** is turned on in the [cluster settings](https://docs.camunda.io/docs/next/components/saas/clusters/settings#enable-app-integrations-extensions). Microsoft Teams shows an **App Integrations Extensions not enabled** message when the setting is off.
- Verify that a [notification rule](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/notification-rules) matches the user task, and that the rule is configured for the channel, personal chat, or direct message you expect.
- If notifications arrive but cards do not update when a task is assigned, completed, or canceled, check that the cluster runs generation `8.9 gen13` or later.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/troubleshoot
