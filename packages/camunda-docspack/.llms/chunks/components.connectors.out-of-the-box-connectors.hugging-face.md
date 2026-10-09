# Hugging Face connector

Interact with Hugging Face models from your BPMN process.

The **Hugging Face connector** is an outbound connector that allows you to interact with
[Hugging Face](https://huggingface.co/) models from your BPMN processes.


## Prerequisites

To begin using the **Hugging Face connector**, you need to have a valid
[API key](https://huggingface.co/docs/api-inference/quicktour#get-your-api-token),
and a model deployed with [Inference API](https://huggingface.co/docs/api-inference/index).


## Create a Hugging Face connector task

---
---

You can apply a connector to a task or event via the append menu. For example:

- **From the canvas**: Select an element and click the **Change element** icon to change an existing element, or use the append feature to add a new element to the diagram.
- **From the properties panel**: Navigate to the **Template** section and click **Select**.
- **From the side palette**: Click the **Create element** icon.

In each of these menus, you can search by connector name or by the operation you want to perform, such as `upload object` or `send email`. Connectors that provide several operations list them as separate entries, and selecting an operation applies the connector with that operation preselected.

After you have applied a connector to your element, follow the configuration steps or see [using connectors](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/hugging-face
