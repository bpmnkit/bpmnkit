# Troubleshoot app integrations — Notifications are not delivered to a Slack channel

| Symptom                                        | Cause                                          | Fix                                                                                                                                                           |
| :--------------------------------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A channel rule creates no notifications        | The Camunda app is not a member of the channel | Invite the app with `/invite @Camunda`                                                                                                                        |
| A previously working channel rule stops firing | The rule was cleaned up automatically          | See [automatic cleanup](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/notification-rules#automatic-cleanup): the app left the channel, the channel was deleted or archived, or the app was uninstalled |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/troubleshoot
