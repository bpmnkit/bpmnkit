# Blue Prism connector

Orchestrate your Blue Prism queue items from your BPMN process.

The **Blue Prism connector** allows you to orchestrate a Blue Prism queue from your BPMN process with [Blue Prism RPA](https://www.blueprism.com/).

To start using the connector, you must have a running Blue Prism instance configured API service. Refer to the [official documentation page](https://documentation.blueprism.com/bp-7-5/en-us/Guides/bp-api/api-introduction.htm?tocpath=Installation%7CInstall%20the%20Blue%20Prism%20API%7C_____0) to learn more about how to install and configure Blue Prism API service.


## Create a Blue Prism connector task

---
---

You can apply a connector to a task or event via the append menu. For example:

- **From the canvas**: Select an element and click the **Change element** icon to change an existing element, or use the append feature to add a new element to the diagram.
- **From the properties panel**: Navigate to the **Template** section and click **Select**.
- **From the side palette**: Click the **Create element** icon.

In each of these menus, you can search by connector name or by the operation you want to perform, such as `upload object` or `send email`. Connectors that provide several operations list them as separate entries, and selecting an operation applies the connector with that operation preselected.

After you have applied a connector to your element, follow the configuration steps or see [using connectors](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/blueprism
