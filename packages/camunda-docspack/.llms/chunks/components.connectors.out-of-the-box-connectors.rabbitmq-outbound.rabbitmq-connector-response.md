# RabbitMQ connector — RabbitMQ connector response

The **RabbitMQ connector** returns the `Success` result.
The response contains a `messageId` variable.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map specific fields from the response into process variables using [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel). For example:

```
= {
  "myResultVariable": response.statusResult
}
```


## Appendix & FAQ

### How do I store secrets for my connector?

Use secrets to avoid exposing your credentials. Follow our documentation on [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.

The **RabbitMQ connector** is an inbound connector that allows you to connect your BPMN process with [RabbitMQ](https://www.rabbitmq.com/) to receive messages from RabbitMQ.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/rabbitmq-outbound
