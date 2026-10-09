# GitHub connector — Handle connector response

The **GitHub connector** is a protocol connector, meaning it is built on top of the **HTTP REST connector**, therefore
handling response is still applicable [as described](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#response).

The **GitHub Webhook connector** is an inbound connector that allows you to start a BPMN process instance triggered by a [GitHub event](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks).


## Create a GitHub Webhook connector task

1. Start building your BPMN diagram. You can use GitHub Webhook connector with either **Start Event** or **Intermediate Catch Event** building blocks.
2. Select the applicable element and change its template to a GitHub Webhook.
3. Fill in all required properties.
4. Complete your BPMN diagram.
5. Deploy the diagram to activate the webhook.
6. Navigate to the **Webhooks** tab in the properties panel on the right side of the screen to observe the webhook URL.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/github
