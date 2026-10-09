# Message Send connector — Publish message (buffered) parameters

| Parameter       | Type   | Description                                                                                                                         | Default / Optional |
| --------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Message name    | string | Name of the message. Must match a receiving message event.                                                                          | Required           |
| Correlation key | string | Value for correlating with a process instance. Can be empty to start a new instance.                                                | Optional           |
| Payload         | JSON   | Variables to transfer to the receiving process instance. Example: `{"customerName": cust_name}`. Multiple variables can be defined. | Required           |
| Time to live    | int    | Time in milliseconds to buffer the message.                                                                                         | No buffer          |
| Message ID      | string | Unique message ID for idempotency. Ensures the message is delivered only once until correlated.                                     | Optional           |
| Tenant ID       | string | Tenant ID of the receiving instance.                                                                                                | `<default>`        |
| Request timeout | int    | Timeout for the publish message command.                                                                                            | Connector default  |

### Response

| Field      | Type   | Description                        |
| ---------- | ------ | ---------------------------------- |
| messageKey | int64  | Unique ID of the published message |
| tenantId   | string | Tenant ID of the message           |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/message-send
