# Trigger a process from Databricks with a webhook — Store your API credentials as secrets

Store the webhook credential and the OpenAI and SendGrid API keys as [secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) before you deploy the process. Create three secrets:

| Key               | Value                                                                                       |
| :---------------- | :------------------------------------------------------------------------------------------ |
| `FraudWebhookKey` | The credential Databricks sends to the webhook, for example `fraud-webhook-test-abc123xyz`. |
| `OpenAI`          | Your OpenAI API key.                                                                        |
| `SendGrid`        | Your SendGrid API key.                                                                      |

How you create them depends on where your cluster runs:

- **SaaS**: In Camunda Hub, under **Console** in the left navigation, click **Clusters**, select your cluster, and open the **Cluster secrets** tab. Click **Create new secret** for each key in the table.
- **Self-Managed**: Secrets aren't managed in the UI. Ask an operator to add these keys as described in [connector secrets configuration](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration).

Reference the secrets from Connector fields so their values aren't stored as plain text in the BPMN model. Reference them from a connector task as `{{secrets.FraudWebhookKey}}`, `{{secrets.OpenAI}}`, or `{{secrets.SendGrid}}`.

**Tip**
On Camunda 8.10 and later, you can also reference these secrets as `=camunda.secrets.FraudWebhookKey`, `=camunda.secrets.OpenAI`, and `=camunda.secrets.SendGrid`. See [reference connector secrets as `camunda.secrets.<name>`](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets#reference-connector-secrets-as-camundasecretsname).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
