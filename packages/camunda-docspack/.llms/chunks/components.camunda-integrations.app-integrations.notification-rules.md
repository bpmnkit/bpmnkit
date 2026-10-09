# Notification rules

Configure which Camunda user task notifications a Microsoft Teams or Slack channel or direct message receives.

Notification rules let you control which user tasks trigger notifications in Microsoft Teams or Slack. The rule model is identical on both platforms; what differs is where you configure a rule and what you can do to it afterwards.

Each rule applies to a specific organization and cluster and can filter user task events by process definition, user task elements, candidate users, or candidate groups.


## Enable notification delivery for your cluster

On Camunda 8 SaaS, the notifications a cluster delivers depend on its generation.

Clusters running generation `8.9 gen13` or later require the **Enable app integrations extensions** setting in the [cluster settings](https://docs.camunda.io/docs/next/components/saas/clusters/settings#enable-app-integrations-extensions). Until an organization admin turns it on, you can create and save rules, but the cluster delivers no notifications.

Clusters running earlier generations need no configuration. They deliver a notification when a matching user task is created.

| Notification                                                     | Earlier generations | `8.9 gen13` or later, with app integrations extensions enabled |
| :--------------------------------------------------------------- | :------------------ | :------------------------------------------------------------- |
| A matching user task is created                                  | Yes                 | Yes                                                            |
| A card updates when the task is assigned, completed, or canceled | No                  | Yes                                                            |
| An existing task is later assigned to you                        | No                  | Yes                                                            |

Clusters running generation `8.9 gen13` or later also receive new notification capabilities as they become available.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/notification-rules
