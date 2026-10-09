# Use an inbound connector — Example: Configuring an HTTP webhook

Different connector types have different configuration options, but parts like **Result expression**, or **Correlation key** are common for all of them. Let's take a look at an example of configuring an HTTP webhook.

To deploy and use the webhook, you need to fill in several fields:

1. **Webhook method** - HTTP method for your inbound webhook. You can either set a specific one or choose `Any` if all methods need to be supported.
2. **Webhook ID** - Context path for your inbound webhook. This is used to build a URL endpoint for your webhook. For example, given the `Webhook ID` value is `myWebhookPath`, the complete webhook URL endpoint will be `http(s)://<base URL>/inbound/myWebhookPath`.
3. **HMAC authentication** - If an external caller uses HMAC as a means of request validation and authentication, you can `enable` this property. In that case, you'll need to specify additional field values. Read more about the [generic HTTP webhook configuration](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook).
4. **Authorization** - Authorization method of the webhook.
5. **Activation condition** - FEEL expression that assesses trigger conditions. Note: Unlike other properties, in the activation condition, you cannot use the process variables. For example, given external caller triggers a webhook endpoint with body `{"id": 1, "status": "OK"}`, the **Activation Condition** value might look like `=(request.body.status = "OK")`. Leave this field empty to trigger your webhook every time.
6. **Result variable** - Name of the process variable that will be created or updated with the result of the webhook. For example, if you want to save the result of the webhook in a variable called `myDocumentId`, you would specify `myDocumentId` as the **Result variable** value.
7. **Result expression** - FEEL expression that transforms incoming body into BPMN process variables. For example, given external caller triggers a webhook endpoint with body `{"id": 1, "status": "OK"}` and you would like to extract `id` as a process variable `myDocumentId`. In that case, the **Variable mapping** might look as `={myDocumentId: request.body.id}`.
8. **Response body expression** - FEEL expression that forces a webhook to return a specific response.
   This might be useful for one-time challenge verification, or acknowledgement response.
   Given your webhook triggered with body `{"id": 1, "status": "OK"}`, if you wish to return acknowledgement, you can specify the following expression `={message: "received document ID " + string(request.body.id)}` which will produce `{"message":"received document ID 123"}` as a response.
   Another example, when you wish to return a one-time subscription challenge. Given your webhook triggered with body `{"event": "subscribe", "challenge":"myRandomChallenge"}`. You can return challenge back with the following expression `=if request.body.event = "subscribe" then request.body.challenge else null` which will produce a plain string `"myRandomChallenge"` as a response.

If the Webhook connector is applied to an **intermediate catch event**, you also need to specify the following fields:

9. **Correlation key (process)** - a FEEL expression that defines the correlation key for the subscription. This corresponds to the **Correlation key** property of a regular **message intermediate catch event**.
10. **Correlation key (payload)** is a FEEL expression used to extract the correlation key from the incoming message. This expression is evaluated in the connector Runtime and the result is used to correlate the message.

For example, given that your correlation key is defined with `requestIdValue` process variable, and the request body contains `{"request": {"id": 123}}`, your correlation key settings will look like this:

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/inbound
