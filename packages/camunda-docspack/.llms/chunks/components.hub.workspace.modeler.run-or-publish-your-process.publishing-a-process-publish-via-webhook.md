# Run or publish your process — Publishing a process — Publish via webhook

You can publish a process via [webhook](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook), which allows you to integrate it easily with any system or service that can make an HTTP request. When a webhook is triggered in another system, it sends a HTTP request to a specified URL, which starts a process instance with the payload of the request.

Follow these steps to publish a process via a webhook:

1. In the process file, click the start event.
2. Select the **Change element** menu icon.
3. Select **Webhook Start Event Connector**.
4. Open the **Details** panel on the right side of the modeling interface.
5. Under **Properties > Webhook configuration**, [configure](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook) the webhook. You have multiple options to ensure that the webhook connection is safe for use by your target audience only.
6. [Deploy](#deploy-a-process) the process.

When the process is deployed, the webhook URL can be found in the **Webhook** tab of the **properties panel**, and called from any outside system.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process
