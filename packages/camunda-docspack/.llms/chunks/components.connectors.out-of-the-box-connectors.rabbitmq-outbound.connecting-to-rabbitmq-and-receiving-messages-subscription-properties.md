# RabbitMQ connector — Connecting to RabbitMQ and receiving messages — Subscription properties

The **Subscription** section allows you to configure the subscription to the RabbitMQ queue.

- **Queue name** is a mandatory field that specifies the name of the queue to subscribe to.
- **Consumer tag** is an optional field that specifies the consumer tag to use for the consumer. If not set, the server will generate one.
- **Exclusive consumer** is an optional dropdown field that specifies whether the consumer is exclusive. Exclusivity allows you to ensure only one consumer at a time consumes from the queue.
- **Arguments** is an optional FEEL expression field that specifies the arguments for the queue. The expression must be a [FEEL context expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-context-expressions). For example, `={x-message-ttl: 60000}`. See more at the [RabbitMQ queue arguments specification](https://www.rabbitmq.com/queues.html#optional-arguments).

**Note**
When configuring the **Arguments** field, remember that inbound connectors are executed outside the BPMN process context and are not tied to a specific process instance.
Therefore, you cannot use process variables in the **Arguments** context expression.
However, you can refer to connector secrets using placeholder syntax. For example, `= {x-consumer-timeout: "{{secrets.CONSUMER_TIMEOUT}}"}`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/rabbitmq-outbound
