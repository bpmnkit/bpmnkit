# RabbitMQ connector

Send messages to RabbitMQ from your BPMN process using the RabbitMQ connector.

The **RabbitMQ connector** is an outbound connector that allows you to connect your BPMN process with [RabbitMQ](https://www.rabbitmq.com/) to send messages to RabbitMQ.


## Prerequisites

To use the **RabbitMQ connector**, you need to have installed a RabbitMQ server and create the relevant [credentials](https://www.rabbitmq.com/passwords.html).
Use secrets to store credentials, so that you don't expose sensitive information directly from the process. See [this appendix entry](#how-do-i-store-secrets-for-my-connector) to learn more.

**Note**
Ensure you enter the correct exchange name and routing key, as the **RabbitMQ connector** can't throw an exception if they are incorrect.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/rabbitmq-outbound
