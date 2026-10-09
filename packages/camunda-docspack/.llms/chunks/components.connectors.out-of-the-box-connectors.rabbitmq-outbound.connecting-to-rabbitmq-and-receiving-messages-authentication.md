# RabbitMQ connector — Connecting to RabbitMQ and receiving messages — Authentication

You can choose among the available authentication types according to your requirements.
First, you must have a user in your RabbitMQ instance with the necessary permissions. See more at the [RabbitMQ access control specification](https://www.rabbitmq.com/access-control.html).

Next, we will choose the type of connection.

#### URI type connection

For a URI connection, take the following steps:

1. Click the **URI** connection type in the **Authentication** section.
2. Set **URI** to `URI`. It must contain RabbitMQ username, password, host name, port number, and virtual host. For example, `amqp://userName:password@serverHost:port/virtualHost`; follow the [RabbitMQ URI specification](https://www.rabbitmq.com/uri-spec.html) to learn more.

#### Credentials type connection

To connect with credentials, take the following steps:

1. Click the **Username/Password** connection type in the **Authentication** section
2. Set the **Password** to `Password`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/rabbitmq-outbound
