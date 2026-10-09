# Amazon Simple Notification Service connector — Activate the Amazon SNS inbound connector by deploying your diagram

Once you click the **Deploy** button, your **Amazon SNS inbound connector** will be activated and publicly available.

URLs of the exposed **Amazon SNS Inbound connector** adhere to the following pattern:

`https://<base URL>/inbound/<subscription ID>`

- `<base URL>` is the URL of connectors component deployment. When using the Camunda 8 SaaS offering, this will typically contain your **region Id** and **cluster Id**, found in your client credentials under the **API** tab within your cluster.
- `<subscription ID>` is the ID (path) you configured in the properties of your **Amazon SNS inbound connector**.

If you make changes to your **Amazon SNS inbound connector** configuration, you need to redeploy the BPMN diagram for the changes to take effect.

When you click on the event with **Amazon SNS inbound connector** applied to it, a new **Webhooks** tab will appear in the properties panel.
This tab displays the URL of the **Amazon SNS inbound connector** for every cluster where you have deployed your BPMN diagram.

**Note**
The **Webhooks** tab is only supported in Camunda Hub as part of the Camunda 8 SaaS offering.
You can still use Amazon SNS inbound connectors in Desktop Modeler, or with Camunda 8 Self-Managed.
In that case, Amazon SNS inbound connector deployments and URLs will not be displayed in Desktop Modeler.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sns
