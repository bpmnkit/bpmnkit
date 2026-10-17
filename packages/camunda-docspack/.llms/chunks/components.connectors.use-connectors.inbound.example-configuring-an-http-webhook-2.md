# Use an inbound connector — Example: Configuring an HTTP webhook (2)

- **Correlation key (process)**: `=requestIdValue`
- **Correlation key (payload)**: `=request.body.request.id`

**Tip**
For all inbound connectors, the **Activation condition** is evaluated before the **Correlation key (payload)** expression. Use the activation condition as a fail-safe filter to confirm the incoming message has the expected shape before correlation runs.

If an unexpected payload reaches the **Correlation key (payload)** expression instead, FEEL evaluation fails, and the outcome depends on the specific connector. For example, the [Kafka connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka#activation-condition) treats this as an unexpected error and does not commit the message offset, which can stop the subscription until the issue is resolved.

See the [webhook documentation](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook) or the documentation of [other connector types](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) for more details.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/inbound
