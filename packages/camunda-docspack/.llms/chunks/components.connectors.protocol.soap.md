# SOAP connector

The SOAP connector allows you to connect your BPMN process with SOAP services.

**Note**
The **SOAP connector** is only supported by Self-Managed and Hybrid Camunda 8 instances.

**Simple Object Access Protocol (SOAP)** is a messaging protocol specification for exchanging structured
information in the implementation of web services in computer networks.

The **SOAP connector** allows you to interact with [SOAP](https://www.w3.org/TR/soap/) service endpoints
from your BPMN process.


## Prerequisites

To use the **SOAP connector**, ensure you have an active SOAP service.


## Create a SOAP connector task

---
---

You can apply a connector to a task or event via the append menu. For example:

- **From the canvas**: Select an element and click the **Change element** icon to change an existing element, or use the append feature to add a new element to the diagram.
- **From the properties panel**: Navigate to the **Template** section and click **Select**.
- **From the side palette**: Click the **Create element** icon.

In each of these menus, you can search by connector name or by the operation you want to perform, such as `upload object` or `send email`. Connectors that provide several operations list them as separate entries, and selecting an operation applies the connector with that operation preselected.

After you have applied a connector to your element, follow the configuration steps or see [using connectors](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/soap
