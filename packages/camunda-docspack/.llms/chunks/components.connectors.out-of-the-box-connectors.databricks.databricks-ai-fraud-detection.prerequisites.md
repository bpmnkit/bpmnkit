# Trigger a process from Databricks with a webhook — Prerequisites

- A Camunda 8 SaaS cluster or a Self-Managed cluster running Camunda 8.7 or later.
- [Web Modeler](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) access to build the process, plus permission to deploy it and manage cluster secrets.
- A Databricks workspace with Python notebooks enabled and outbound HTTPS access to your Camunda webhook endpoint.
- An [OpenAI](https://platform.openai.com/api-keys) API key and a [SendGrid](https://app.sendgrid.com) API key. The process uses these to draft and send a review email for flagged transactions.


## Create the BPMN diagram

1. Log in to [Camunda Hub](https://console.camunda.io), open a workspace, and open a project.
2. Click **Create new > BPMN diagram**.
3. In the top navigation, open the menu next to **New BPMN diagram**, click **Rename**, and name it `Fraud Detection`.

Hub Modeler opens a blank diagram with a default start event.

The following diagram shows the completed process structure:

![Fraud detection process diagram](./img/fraud-detection-process.png)

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
