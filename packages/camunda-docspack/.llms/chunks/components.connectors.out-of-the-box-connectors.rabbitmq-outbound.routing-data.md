# RabbitMQ connector — Routing data

In the **Routing** section, you must set the routing data attributes:

- For a **URI** type connection, the required fields are `exchange` and `routingKey`.
- For a **Credentials** type connection, the required fields are `exchange`, `routingKey`, `virtualHost`, `hostName`, and `port`.

Refer to the RabbitMQ documentation to learn about routing attributes:

- [Exchanges, routing keys, and bindings](https://www.cloudamqp.com/blog/part4-rabbitmq-for-beginners-exchanges-routing-keys-bindings.html)
- [Virtual hosts](https://www.rabbitmq.com/vhosts.html)
- [Networking, host, and port configuration](https://www.rabbitmq.com/networking.html)


## Message

1. In the **Message** section, insert the message payload. The message can be Text or JSON format.
2. (Optional) In the **Properties** section, insert the message properties in JSON or as a [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) expression. Go to [RabbitMQ documentation](https://www.rabbitmq.com/publishers.html#message-properties) for learn more about RabbitMQ message properties.
   example of message :

```
= {"myMessageKey":"Hello Camunda Team"}
```

example of properties:

```
= {
  "contentEncoding":"UTF-8",
  "contentType":"text/plain"
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/rabbitmq-outbound
