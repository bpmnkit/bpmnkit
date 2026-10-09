# RabbitMQ connector — Prerequisites

To use the **RabbitMQ connector**, you need to have installed a RabbitMQ server and create the relevant [credentials](https://www.rabbitmq.com/passwords.html).
Using secrets to store credentials is recommended so you do not expose sensitive information directly from the process. See [this appendix entry](#how-do-i-store-secrets-for-my-connector) to learn more.


## Create a RabbitMQ connector event

See [create a RabbitMQ connector task](#create-a-rabbitmq-connector-task) for additional details.

1. Add a **Start Event** or an **Intermediate Event** to your BPMN diagram to get started.
2. Change its template to a RabbitMQ connector.
3. Fill in all required properties.
4. Complete your BPMN diagram.
5. Deploy the diagram to activate the RabbitMQ consumer.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/rabbitmq-outbound
