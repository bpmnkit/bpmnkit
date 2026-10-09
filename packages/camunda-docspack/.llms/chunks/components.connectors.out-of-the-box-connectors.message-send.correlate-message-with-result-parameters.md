# Message Send connector — Correlate message (with result) parameters

| Parameter       | Type   | Description                                                                                                                         | Default / Optional |
| --------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Message name    | string | Name of the message. Must match a receiving message event.                                                                          | Required           |
| Correlation key | string | Value for correlating with a process instance. Can be empty to start a new instance.                                                | Optional           |
| Payload         | JSON   | Variables to transfer to the receiving process instance. Example: `{"customerName": cust_name}`. Multiple variables can be defined. | Required           |
| Tenant ID       | string | Tenant ID of the receiving instance.                                                                                                | `<default>`        |
| Request timeout | int    | Timeout for the correlate message command.                                                                                          | Connector default  |

### Response

| Field              | Type   | Description                                                   |
| ------------------ | ------ | ------------------------------------------------------------- |
| messageKey         | int64  | Unique ID of the correlated message                           |
| processInstanceKey | int64  | Key of the first process instance the message correlated with |
| tenantId           | string | Tenant ID of the message                                      |

> The connector raises an incident with a detailed error message containing the 404 status `Not found` if the message could not be correlated.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/message-send
