# Trigger a process from Databricks with a webhook — Deploy the process and copy the webhook URL

In the top right corner of the modeling interface, click the dropdown next to **Deploy & run**, click **Deploy**, select a stage and the resources to deploy, then click **Deploy** again.

How you get the webhook URL depends on where your cluster runs:

- **SaaS**: Click the start event, open the **Webhook** tab in the properties panel, and copy the webhook URL. This tab is only available for Camunda 8 SaaS.
- **Self-Managed**: The **Webhook** tab isn't available. Build the URL yourself as `http(s)://<base URL>/<contextPath>/inbound/fraud-detection-trigger`, using your Connectors runtime's base URL and, if configured, its Helm chart context path. See [activate the HTTP Webhook connector](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook#activate-the-http-webhook-connector-by-deploying-your-diagram) for the full URL format.

Save the webhook URL, along with the `FraudWebhookKey` secret value from [Store your API credentials as secrets](#store-your-api-credentials-as-secrets). You need both to call the webhook from Databricks.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
