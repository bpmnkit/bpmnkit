# Trigger a process from Databricks with a webhook — Convert the start event to a webhook

The default start event starts a process instance manually. Change it to start the process from an incoming webhook call instead.

1. Click the start event, then click the wrench icon that appears.
2. Search for `webhook` and select **Webhook Start Event Connector**.

The start event now shows a webhook icon. Configure it in the properties panel:

| Field           | Value                                           | Notes                                                                                                                                                                                                   |
| :-------------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Webhook ID      | `fraud-detection-trigger`                       | Becomes part of the webhook URL.                                                                                                                                                                        |
| Authorization   | API Key                                         | Authenticates incoming webhook calls.                                                                                                                                                                   |
| API Key         | `{{secrets.FraudWebhookKey}}`                   | The expected value, referenced from a secret rather than typed directly into the field.                                                                                                                 |
| API Key locator | `=split(request.headers.authorization, " ")[2]` | Extracts the key from the `Authorization: Bearer <value>` header. See [how to configure API key authorization](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook#how-to-configure-api-key-authorization). |

The Databricks notebook in this guide sends the key as a `Bearer` token, so the locator splits the header on the space and takes the second part rather than comparing the raw header value.

To reject payloads without a numeric `riskScore` at the webhook, set **Verification expression** to the following. Databricks then gets a `400` response instead of a `200`, and the run fails visibly:

```feel
=if request.body.riskScore instance of number
then null
else {"body": {"error": "riskScore must be a number"}, "statusCode": 400}
```

In **Variable Mapping**, set **Result expression** to map the incoming JSON body onto process variables:

```feel
= {
  caseId: request.body.caseId,
  customerId: request.body.customerId,
  emailAddress: request.body.emailAddress,
  transactionAmount: request.body.transactionAmount,
  riskScore: request.body.riskScore,
  modelVersion: request.body.modelVersion,
  timestamp: request.body.timestamp
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
