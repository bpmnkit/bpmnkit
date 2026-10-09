# Amazon EventBridge connector — Activate the Amazon EventBridge connector by deploying your diagram

Once you click **Deploy**, your Amazon EventBridge Webhook connector will be activated and ready to receive events.

The URLs of the exposed Amazon EventBridge Webhooks adhere to the following pattern:

`http(s)://<base URL>/webhooks/<webhook ID>`

- `<base URL>` is the URL of the connectors component deployment. When using the Camunda 8 SaaS offering, this will typically contain your **region Id** and **cluster Id**, found in your client credentials under the **API** tab within your cluster.
- `<webhook ID>` is the ID (path) you configured in the properties of your Amazon EventBridge Webhook connector.

**Note**
If you make changes to your Amazon EventBridge Webhook connector configuration, redeploy the BPMN diagram for the changes to take effect.

When you click on the event with the Amazon EventBridge Webhook connector applied to it, a new **Webhooks** tab will appear in the properties panel.
This tab displays the URL of the Amazon EventBridge Webhook connector for every cluster where you have deployed your BPMN diagram.

**Note**
The **Webhooks** tab is only supported in Camunda Hub as part of the Camunda 8 SaaS offering.
You can still use the Amazon EventBridge Webhook connector in Desktop Modeler or with Camunda 8 Self-Managed.
In that case, Amazon EventBridge Webhook connector deployments and URLs will not be displayed in Desktop Modeler.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-eventbridge
