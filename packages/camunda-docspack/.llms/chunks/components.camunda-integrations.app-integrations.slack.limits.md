# Camunda for Slack — Limits

| Limit                         | Value               | Cause                                                     |
| :---------------------------- | :------------------ | :-------------------------------------------------------- |
| Tasks per page                | 15                  | Slack's 50-block message ceiling                          |
| Notification rules listed     | 20                  | Same ceiling                                              |
| Process options per keystroke | 25                  | Slack's options response budget                           |
| User task options in a rule   | 100                 | Slack's multi-select ceiling                              |
| Modal open time               | About three seconds | Slack's `trigger_id` expiry, handled with a loading modal |

A modal left open across a newer interaction is rejected with "This dialog is no longer valid. Run the command again."

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/slack
