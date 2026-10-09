# Initiate a batch operation — Initiate a batch operation

Let's create a **selection** in Operate. A selection is a set of process instances on which you can carry out a batch retry or batch cancellation.

To create a selection and apply an operation, take the following steps:

1. On the **Processes** page, in the **Process Instances** table, check the box next to the process instances you'd like to include.
2. In the table header, select the operation you want to apply.

![Three process instances selected in the Process Instances table, with the batch action toolbar visible above the table.](./img/selections-operations.png)

**Note**
A batch retry reports an item as completed once Camunda marks its incident as resolved and triggers the retry. This confirms that the retry operation ran, not that the underlying problem was fixed. For example, `12 of 12 completed` means all 12 retries were triggered successfully.

For [job incidents](https://docs.camunda.io/docs/next/components/concepts/incidents#resolving), Camunda checks the underlying cause again only when a worker next activates each job. Keep a worker connected for the affected job types so Camunda can raise new incidents promptly if the problems remain unresolved.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/selections-operations
