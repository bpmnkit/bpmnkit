# Camunda for Microsoft Teams — Error handling

The bot provides clear feedback when something goes wrong:

| Error                   | Behavior                                                             |
| :---------------------- | :------------------------------------------------------------------- |
| **Cluster is sleeping** | Shows a card with a button to wake it up, then retry your action.    |
| **Task not found**      | Indicates the task no longer exists.                                 |
| **Access denied**       | Informs you that you don't have permission for the requested action. |
| **Unexpected errors**   | Shows a message suggesting you retry or contact support.             |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/microsoft-teams
