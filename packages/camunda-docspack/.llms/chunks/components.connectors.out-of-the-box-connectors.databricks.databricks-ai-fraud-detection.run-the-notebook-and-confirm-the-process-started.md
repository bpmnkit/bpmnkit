# Trigger a process from Databricks with a webhook — Run the notebook and confirm the process started

1. Click the code cell and press `Ctrl+Enter` to run it.
2. Confirm the cell prints `Process instance started`.
3. Open [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction), find the `Fraud Detection` process, and open the running instance.

The sample transaction has `riskScore: 0.87`, which is above the `0.75` threshold, so the instance should have already run the OpenAI task and be waiting at the `Review Flagged Transaction` user task. The SendGrid task runs only after the analyst completes the review. In Operate, you can see the process variables from the webhook payload (`caseId`, `riskScore`, `emailBody`, and so on), the current execution state, and any incidents, such as a missing secret.

If the instance isn't waiting at `Review Flagged Transaction`, check for an incident on the OpenAI task first; a missing or misspelled secret reference is the most common cause.

**Tip**
If the webhook call fails with a `401` status, check that `CAMUNDA_WEBHOOK_SECRET` matches the `FraudWebhookKey` secret value you set in [Store your API credentials as secrets](#store-your-api-credentials-as-secrets). If it fails with a `400` status, the payload's `riskScore` is missing or isn't a number.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
