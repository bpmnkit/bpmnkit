# GitHub connector — Activate the GitHub Webhook connector by deploying your diagram

Once you click the **Deploy** button, your GitHub Webhook will be activated and publicly available.

URLs of the exposed GitHub Webhooks adhere to the following pattern:

`http(s)://<base URL>/inbound/<webhook ID>>`

- `<base URL>` is the URL of connectors component deployment. When using the Camunda 8 SaaS offering, this will typically contain your **region Id** and **cluster Id**, found in your client credentials under the **API** tab within your cluster.
- `<webhook ID>` is the ID (path) you configured in the properties of your GitHub Webhook connector.

If you make changes to your GitHub Webhook connector configuration, you need to redeploy the BPMN diagram for the changes to take effect.

When you click on the event with GitHub Webhook connector applied to it, a new **Webhooks** tab will appear in the properties panel.
This tab displays the URL of the GitHub Webhook connector for every cluster where you have deployed your BPMN diagram.

**Note**
The **Webhooks** tab is only supported in Camunda Hub as part of the Camunda 8 SaaS offering.
You can still use GitHub Webhook connector in Desktop Modeler, or with your Camunda 8 Self-Managed.
In that case, GitHub Webhook connector deployments and URLs will not be displayed in Desktop Modeler.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/github
