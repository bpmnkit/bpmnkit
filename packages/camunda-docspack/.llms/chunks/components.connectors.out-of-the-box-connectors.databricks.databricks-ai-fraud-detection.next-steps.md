# Trigger a process from Databricks with a webhook — Next steps

- Replace the hardcoded sample transaction with your actual model output to trigger the process from a production Databricks job.
- Add [inbound connector deduplication](https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication) if your Databricks job might send the same transaction more than once.
- Read the [Databricks connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks) reference if you also want Camunda to call Databricks directly, for example to look up additional transaction history before routing.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
