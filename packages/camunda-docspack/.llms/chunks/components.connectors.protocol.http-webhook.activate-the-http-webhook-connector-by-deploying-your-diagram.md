# HTTP Webhook connector — Activate the HTTP Webhook connector by deploying your diagram

Once you click the **Deploy** button, your HTTP Webhook will be activated and publicly available.
You can trigger it by making a POST request to the generated URL.

**Warning: Webhook endpoints and process versions**
When you deploy a new process version that uses the same webhook endpoint as an existing version, the new version won’t become active until no process instances are running on the older version. Webhook endpoints can’t be shared across multiple active process versions.

To activate the new version, complete all process instances on the older version or migrate them using [process instance migration](https://docs.camunda.io/docs/next/components/concepts/process-instance-migration). If you need both versions active, use a different webhook endpoint path in the new version.

For related behavior across versions, see [Cross-version deduplication](https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication#cross-version-deduplication).

URLs of the exposed HTTP Webhooks adhere to the following pattern:

`http(s)://<base URL>/inbound/<webhook ID>>`

- `<base URL>` is the URL of connectors component deployment. When using the Camunda 8 SaaS offering, this will typically contain your **region Id** and **cluster Id**, found in your client credentials under the **API** tab within your cluster.
- `<webhook ID>` is the ID (path) you configured in the properties of your HTTP Webhook connector.

If you make changes to your HTTP Webhook connector configuration, you need to redeploy the BPMN diagram for the changes to take effect.

When you click on the event with HTTP Webhook connector applied to it, a new **Webhooks** tab will appear in the properties panel.
This tab displays the URL of the HTTP Webhook connector for every cluster where you have deployed your BPMN diagram.

**Note**
The **Webhooks** tab is only supported in Camunda Hub as part of the Camunda 8 SaaS offering.
You can still use HTTP Webhook connector in Desktop Modeler, or with your Camunda 8 Self-Managed.
In that case, HTTP Webhook connector deployments and URLs will not be displayed in Desktop Modeler.

For self-managed installations, the webhook URL format is:

`http(s)://<base URL>/<contextPath>/inbound/<webhook ID>`

If no `contextPath` is specified in the Helm chart, it must be omitted from the URL.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
