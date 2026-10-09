# RabbitMQ connector — Connecting to RabbitMQ and receiving messages — Output mapping

The **Output mapping** section allows you to configure the mapping of the RabbitMQ message to the process variables.

- Use **Result variable** to store the response in a process variable. For example, `myResultVariable`.
- Use **Result expression** to map specific fields from the response into process variables using [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel). For example, given the RabbitMQ connector is triggered with the message body `{"role": "USER", "action": "LOGIN""}` and you would like to extract the pull request `role` as a process variable `messageRole`, the **Result Expression** might look like this:

```
= {
  "messageRole": message.body.role
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/rabbitmq-outbound
