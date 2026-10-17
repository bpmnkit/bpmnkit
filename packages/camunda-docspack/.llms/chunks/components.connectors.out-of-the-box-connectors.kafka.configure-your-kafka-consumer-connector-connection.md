# Kafka connector — Configure your Kafka Consumer connector — Connection

In the **Connection** section, select a **Connection credential** or configure the connection inline:

1. Set **Bootstrap servers** to the URL of the bootstrap server(s). If more than one server is required, use comma-separated values.
2. Select the **Authentication type**. If you selected **Credentials**, set **Username** and **Password**.

**Note**

- Use secrets to avoid exposing your sensitive data as plain text. To learn more, see [managing secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
- To learn more about Kafka authentication, see [Kafka secure authentication](#what-mechanism-is-used-to-authenticate-against-kafka-1).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
