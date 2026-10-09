# RabbitMQ connector — Appendix & FAQ

### How do I store secrets for my connector?

Use secrets to avoid exposing your credentials. Follow our documentation on [managing secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) to learn more.

### What is the output format of the RabbitMQ connector?

The RabbitMQ connector returns the following output that can be used in the next steps of your process, including result expressions:

```
{
   "message": {
      "consumerTag": "myConsumerTag",
      "body": {
         {{ the message body }}
      },
      "properties": {
            "contentType": "application/json",
            "contentEncoding": "UTF-8",
            "headers": {
                "x-first": "1",
                "x-second": "2"
            },
            "deliveryMode": 2,
            "priority": 0,
            "correlationId": "myCorrelationId",
            "replyTo": "myReplyTo",
            "expiration": "myExpiration",
            "messageId": "myMessageId",
            "timestamp": "myTimestamp",
            "type": "myType",
            "userId": "myUserId",
            "appId": "myAppId",
            "clusterId": "myClusterId"
      }
   }
}
```

**Note**
The output payload contains a top-level `message` object that contains `consumerTag`, `body`, and `properties` fields.

### How is message body deserialized?

The RabbitMQ Consumer connector always tries to deserialize the message body as JSON. If the deserialization fails, the connector will return the message body as a string.
However, if the body only contains a primitive value, such as a string, a number, or a boolean, the connector will return the primitive value itself.

### When is the message acknowledged? What happens if the connector execution fails?

The following outcomes are possible:

- If connector execution is successful and **Activation condition** was met, the message is acknowledged and removed from the queue.
- If **Activation condition** was not met, the message is rejected and removed from the queue.
- If connector execution fails due to an unexpected error (e.g. Zeebe is unavailable), the message is rejected and re-queued.

### What lifecycle does the RabbitMQ Consumer connector have?

The RabbitMQ Subscription connector is a long-running connector that is activated when the process is deployed and deactivated when the process is un-deployed or overwritten by a new version.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/rabbitmq-outbound
