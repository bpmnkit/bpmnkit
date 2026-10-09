# HTTP Webhook connector — Make your HTTP Webhook connector executable — Correlation

The **Correlation** section allows you to configure the message correlation parameters.

**Note**
The **Correlation** section is not applicable for the plain **start event** element template of the Webhook connector. Plain **start events** are triggered by process instance creation and do not rely on message correlation.

#### Correlation key

- **Correlation key (process)** is a FEEL expression that defines the correlation key for the subscription. This corresponds to the **Correlation key** property of a regular **Message Intermediate Catch Event**.
- **Correlation key (payload)** is a FEEL expression used to extract the correlation key from the incoming message. This expression is evaluated in the connector Runtime and the result is used to correlate the message.

For example, given that your correlation key is defined with `orderId` process variable, and the request body contains `{"orderId": "123"}`, your correlation key settings will look like this:

- **Correlation key (process)**: `=orderId`
- **Correlation key (payload)**: `=request.body.orderId`

Learn more about correlation keys in the [messages guide](https://docs.camunda.io/docs/next/components/concepts/messages).

#### Message ID expression

The **Message ID expression** is an optional field that allows you to extract the message ID from the incoming request. The message ID serves as a unique identifier for the message and is used for message correlation.
This expression is evaluated in the connector Runtime and the result is used to correlate the message.

In most cases, it is not necessary to configure the **Message ID expression**. However, it is useful if you want to ensure message deduplication or achieve a certain message correlation behavior.
Learn more about how message IDs influence message correlation in the [messages guide](https://docs.camunda.io/docs/next/components/concepts/messages#message-correlation-overview).

For example, if you want to set the message ID to the value of the `transactionId` field in the incoming message, you can configure the **Message ID expression** as follows:

```
= request.body.transactionId
```

#### Message TTL

The **Message TTL** is an optional field that allows you to set the time-to-live (TTL) for the correlated messages. TTL defines the time for which the message is buffered in Zeebe before being correlated to the process instance (if it can't be correlated immediately).
The value is specified as an ISO 8601 duration. For example, `PT1H` sets the TTL to one hour. Learn more about the TTL concept in Zeebe in the [message correlation guide](https://docs.camunda.io/docs/next/components/concepts/messages#message-buffering).

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
