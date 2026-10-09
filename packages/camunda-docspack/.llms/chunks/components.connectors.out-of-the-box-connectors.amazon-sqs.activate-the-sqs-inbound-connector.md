# Amazon Simple Queue Service connector — Activate the SQS inbound connector

Once you click the **Deploy** button, your SQS inbound connector will be activated and publicly available. Whenever the SQS inbound connector receives a new message, a new BPMN process will be created.


## Amazon SQS connector response

The **Amazon SQS connector** provides the SQS message as a response. Utilize output mapping to align this response with process variables:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`. This approach stores the entire SQS message as a process variable named `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. This approach allows for more granularity. Instead of storing the entire response in one variable, you can extract specific fields from the SQS message and assign them to different process variables. This is particularly useful when you are only interested in certain parts of the message, or when different parts of the message need to be used separately in your process.
   Example:

SQS message :

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
    "SenderId": "33333333333",
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

To store the entire body in a process variable `resultBody`, ID from body to `bodyId`, and messageId to `messageId`, use:

```
= `{resultBody:body, bodyId:body.id, messageId: messageId}`
```

Learn more about **Variable mapping** [here](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sqs
