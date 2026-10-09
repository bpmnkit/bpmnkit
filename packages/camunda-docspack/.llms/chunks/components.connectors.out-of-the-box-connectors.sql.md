# SQL connector

Connect your BPMN process with SQL databases, learn how to create a SQL connector, and make it executable.

The **SQL connector** is an outbound connector that allows you to connect your BPMN service with SQL databases (MariaDB, Microsoft SQL Server, PostgreSQL, MySQL).


## Prerequisites

To use the **SQL connector**, ensure you have an SQL database instance running.

To avoid exposing your sensitive data as plain text, use secrets. Follow our documentation on [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.


## Create an SQL connector task

---
---

You can apply a connector to a task or event via the append menu. For example:

- **From the canvas**: Select an element and click the **Change element** icon to change an existing element, or use the append feature to add a new element to the diagram.
- **From the properties panel**: Navigate to the **Template** section and click **Select**.
- **From the side palette**: Click the **Create element** icon.

In each of these menus, you can search by connector name or by the operation you want to perform, such as `upload object` or `send email`. Connectors that provide several operations list them as separate entries, and selecting an operation applies the connector with that operation preselected.

After you have applied a connector to your element, follow the configuration steps or see [using connectors](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/sql
