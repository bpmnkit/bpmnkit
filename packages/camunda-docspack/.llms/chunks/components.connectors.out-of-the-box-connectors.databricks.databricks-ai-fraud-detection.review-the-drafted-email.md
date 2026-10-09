# Trigger a process from Databricks with a webhook — Review the drafted email

Add a [user task](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks) after the OpenAI task, named `Review Flagged Transaction`. This gives a fraud analyst a chance to validate the AI's assessment and edit the drafted email before it reaches the customer.

Link a [Camunda Form](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/utilize-forms) to the task with a **Text area** field:

| Setting     | Value         |
| :---------- | :------------ |
| Field label | Email content |
| Key         | `emailBody`   |

Binding the field's **Key** to `emailBody` prefills the text area with the AI-drafted email. When the analyst completes the task, any edits they make overwrite the `emailBody` process variable.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
