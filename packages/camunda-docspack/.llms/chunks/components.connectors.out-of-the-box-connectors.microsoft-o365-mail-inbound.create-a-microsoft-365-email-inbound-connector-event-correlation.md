# Microsoft 365 email inbound connector — Create a Microsoft 365 email inbound connector event — Correlation

The **Correlation** section allows you to configure message correlation parameters.

**Note**
The **Correlation** section is not applicable for the plain **start event** element template of the Microsoft 365 Email Inbound connector. Plain **start events** are triggered by process instance creation and do not rely on message correlation.

#### Correlation key

- **Correlation key (process)** is a FEEL expression that defines the correlation key for the subscription. This corresponds to the **Correlation key** property of a regular **message intermediate catch event**.
- **Correlation key (payload)** is a FEEL expression used to extract the correlation key from the incoming email. This expression is evaluated in the connector runtime and the result is used to correlate the message.

For example, if your correlation key is defined with the `orderId` process variable, and the incoming email subject contains `Order #12345`, you could extract the order ID from the subject:

- **Correlation key (process)**: `=orderId`
- **Correlation key (payload)**: `=substring(subject, 7)` (extracts "12345" from "Order #12345")

**Note**
To learn more about correlation keys, see [messages](https://docs.camunda.io/docs/next/components/concepts/messages).

#### Message ID expression

The **Message ID expression** is an optional field that allows you to extract the message ID from the incoming email. The message ID serves as a unique identifier and is used for message deduplication.

By default, the connector uses the email's unique identifier from Microsoft Graph. However, you can customize this if needed:

```feel
= id
```

**Note**
To learn more about how message IDs influence message correlation, see [messages](https://docs.camunda.io/docs/next/components/concepts/messages#message-correlation-overview).

#### Message TTL

The **Message TTL** is an optional field that allows you to set the time-to-live (TTL) for correlated messages. TTL defines the time for which the message is buffered in Zeebe before being correlated to the process instance.

The value is specified as an ISO 8601 duration. For example, `PT1H` sets the TTL to one hour. Learn more about the TTL concept in Zeebe in the [message correlation guide](https://docs.camunda.io/docs/next/components/concepts/messages#message-buffering).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
