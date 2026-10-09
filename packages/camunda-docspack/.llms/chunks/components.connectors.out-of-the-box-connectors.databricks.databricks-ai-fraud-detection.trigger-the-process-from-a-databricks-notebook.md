# Trigger a process from Databricks with a webhook — Trigger the process from a Databricks notebook

### Create the notebook

1. In Databricks, open **Workspace**, then **Create > Notebook**.
2. Name it `Fraud_Detection_Trigger` and set the language to Python.

### Add the trigger code

Paste the following into the first cell. In production, `transaction` would come from your ML model or a data pipeline; this example uses a hardcoded sample transaction so you can test the integration end to end.

**Warning**
`CAMUNDA_WEBHOOK_SECRET` is hardcoded here for testing only. Don't commit a real webhook credential as plain text. In a production notebook, retrieve it from a [Databricks secret scope](https://docs.databricks.com/en/security/secrets/index.html) instead, for example `dbutils.secrets.get(scope="camunda", key="webhook-key")`.

```python
import requests
from datetime import datetime, timezone

CAMUNDA_WEBHOOK_URL = "https://example-webhook-url.com/"
CAMUNDA_WEBHOOK_SECRET = "fraud-webhook-test-abc123xyz"  # Test value only; use a secret scope in production

transaction = {
    "caseId": "FRAUD-2026-001",
    "customerId": "CUST-98765",
    "emailAddress": "customer@example.com",
    "transactionAmount": 15000.00,
    "riskScore": 0.87,
    "modelVersion": "fraud-detection-v2",
    "timestamp": datetime.now(timezone.utc).isoformat(),
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {CAMUNDA_WEBHOOK_SECRET}",
}

response = requests.post(
    CAMUNDA_WEBHOOK_URL, json=transaction, headers=headers, timeout=30
)

if response.status_code in (200, 201):
    print(f"Process instance started (status {response.status_code}).")
else:
    print(f"Webhook call failed (status {response.status_code}): {response.text}")
```

Replace `CAMUNDA_WEBHOOK_URL` and `CAMUNDA_WEBHOOK_SECRET` with the values you copied in [Deploy the process and copy the webhook URL](#deploy-the-process-and-copy-the-webhook-url).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
