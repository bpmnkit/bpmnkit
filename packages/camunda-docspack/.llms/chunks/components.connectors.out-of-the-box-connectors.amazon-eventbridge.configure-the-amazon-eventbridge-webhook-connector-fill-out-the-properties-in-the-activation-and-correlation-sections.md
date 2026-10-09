# Amazon EventBridge connector — Configure the Amazon EventBridge Webhook connector — Fill out the properties in the **Activation** and **Correlation** sections

1. (Optional) Configure the **Activation Condition**. This condition will be used to filter the events from the specified event source. For example, if an incoming Amazon EventBridge event has the following body:

```
  {
    "version": "0",
    "id": "6d3d35b7-5bf2-43ec-9e55-5cfb27ad31b4",
    "detail-type": "MyEvent",
    "source": "custom.application",
    "account": "123456789012",
    "time": "2023-07-25T12:34:56Z",
    "region": "us-west-2",
    "resources": [],
    "detail": {
      "shipment": "123456789",
      "status": "received"
    }
  }
```

the Activation Condition value might look like this:

```
=(get value(request.body, "detail-type")="MyEvent" and request.body.detail.status="received")
```

This condition will trigger the Amazon EventBridge Webhook connector only when the detail-type is "MyEvent" and the status is "received".

2. When using the **Amazon EventBridge Webhook connector** with an **Intermediate Catch Event**, fill in the **Correlation key (process)** and **Correlation key (payload)**.

- **Correlation key (process)** is a FEEL expression that defines the correlation key for the subscription. This corresponds to the **Correlation key** property of a regular **Message Intermediate Catch Event**.

- **Correlation key (payload)** is a FEEL expression used to extract the correlation key from the incoming message. This expression is evaluated in the connector Runtime, and the result is used to correlate the message.

- **Message ID expression** and **Message TTL** are optional properties that can be used to set the message ID and time-to-live for the incoming message. Refer to the [message ID expression](#message-id-expression) and [message TTL](#message-ttl) sections for more information.

For example, if your correlation key is defined with a process variable named `myCorrelationKey`, and you want to correlate by the `shipment` property in the request detail, which contains:

```json
{
  "version": "0",
  "id": "6d3d35b7-5bf2-43ec-9e55-5cfb27ad31b4",
  "detail-type": "MyEvent",
  "source": "custom.application",
  "account": "123456789012",
  "time": "2023-07-25T12:34:56Z",
  "region": "us-west-2",
  "resources": [],
  "detail": {
    "shipment": "123456789",
    "status": "received"
  }
}
```

your correlation key settings will look like this:

- **Correlation key (process)**: `=myCorrelationKey`
- **Correlation key (payload)**: `=request.body.detail.shipment`

#### Message ID expression

The **Message ID expression** is an optional field that allows you to extract the message ID from the incoming message. The message ID serves as a unique identifier for the message and is used for message correlation.
This expression is evaluated in the connector Runtime and the result is used to correlate the message.

In most cases, it is not necessary to configure the **Message ID expression**. However, it is useful if you want to ensure message deduplication or achieve a certain message correlation behavior. Learn more about how message IDs influence message correlation in the [messages guide](https://docs.camunda.io/docs/next/components/concepts/messages#message-correlation-overview).

For example, if you want to set the message ID to the value of the `detail.transactionId` field in the incoming event, configure the **Message ID expression** as follows:

```
= request.body.detail.transactionId
```

#### Message TTL

The **Message TTL** is an optional field that allows you to set the time-to-live (TTL) for the correlated messages. TTL defines the time for which the message is buffered in Zeebe before being correlated to the process instance (if it can't be correlated immediately).
The value is specified as an ISO 8601 duration. For example, `PT1H` sets the TTL to one hour. Learn more about the TTL concept in Zeebe in the [message correlation guide](https://docs.camunda.io/docs/next/components/concepts/messages#message-buffering).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-eventbridge
