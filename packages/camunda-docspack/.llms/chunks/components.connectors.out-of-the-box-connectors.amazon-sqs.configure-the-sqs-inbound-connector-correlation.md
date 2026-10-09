# Amazon Simple Queue Service connector — Configure the SQS inbound connector — Correlation

The **Correlation** section allows you to configure the message correlation parameters.

**Note**
The **Correlation** section is not applicable for the plain **start event** element template of the Amazon SQS connector. Plain **start events** are triggered by process instance creation and do not rely on message correlation.

#### Correlation key

- **Correlation key (process)** is a FEEL expression that defines the correlation key for the subscription. This corresponds to the **Correlation key** property of a regular **Message Intermediate Catch Event**.
- **Correlation key (payload)** is a FEEL expression used to extract the correlation key from the incoming message. This expression is evaluated in the connector Runtime and the result is used to correlate the message.

Example for correlation and activation condition properties (correlation by ID in the body and activation condition by message attribute):

SQS message:

```json
{
  "messageId": "12345",
  "receiptHandle": "ABCDE",
  "mD5OfBody": "1c6bb59997376e5182a88a6f582cd92a",
  "body": {
    "id": 4567,
    "value": "Hello world"
  },
  "attributes": {
    "ApproximateReceiveCount": "1",
    "SentTimestamp": "1703062074171",
    "SenderId": "333293239507",
    "ApproximateFirstReceiveTimestamp": "1703062074185"
  },
  "messageAttributes": {
    "messageName": {
      "stringValue": "myProcess",
      "binaryValue": null,
      "stringListValues": [],
      "binaryListValues": [],
      "dataType": "String"
    }
  },
  "md5OfMessageAttributes": "9de691a346c79e4fda4af06248aa9dfc"
}
```

- **Correlation key (process)**: `=4567`
- **Correlation key (payload)**: `=body.id`
- **Activation condition**: `=messageAttributes.key.stringValue="myProcess"`

Learn more about correlation keys in the [messages guide](https://docs.camunda.io/docs/next/components/concepts/messages).

#### Message ID expression

The **Message ID expression** is an optional field that allows you to extract the message ID from the incoming message. The message ID serves as a unique identifier for the message and is used for message correlation.
This expression is evaluated in the connector Runtime and the result is used to correlate the message.

In most cases, it is not necessary to configure the **Message ID expression**. However, it is useful if you want to ensure message deduplication or achieve certain message correlation behavior.
Learn more about how message IDs influence message correlation in the [messages guide](https://docs.camunda.io/docs/next/components/concepts/messages#message-correlation-overview).

For example, if you want to set the message ID to the value of the `transactionId` field in the incoming message, you can configure the **Message ID expression** as follows:

```
= body.transactionId
```

#### Message TTL

The **Message TTL** is an optional field that allows you to set the time-to-live (TTL) for the correlated messages. TTL defines the time for which the message is buffered in Zeebe before being correlated to the process instance (if it can't be correlated immediately).
The value is specified as an ISO 8601 duration. For example, `PT1H` sets the TTL to one hour. Learn more about the TTL concept in Zeebe in the [message correlation guide](https://docs.camunda.io/docs/next/components/concepts/messages#message-buffering).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sqs
