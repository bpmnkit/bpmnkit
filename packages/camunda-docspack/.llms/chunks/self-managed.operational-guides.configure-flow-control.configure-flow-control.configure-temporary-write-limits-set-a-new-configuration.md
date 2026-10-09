# Camunda components flow control configuration — Configure temporary write limits — Set a new configuration

To set a new flow control configuration, make a `POST` request to the `actuator/flowControl` endpoint.

This request will attempt to configure all partitions. With multiple [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index), add the `physicalTenant=<tenant-id>` query parameter to configure only that tenant. Without it, the change applies to every tenant. Partitions might differ in configuration if, for example, a broker restarts and the leader partition reverts to the configuration defined in the environment variables.

```
POST actuator/flowControl
```

```json
{
  "write": {
    "rampUp": <rampUp>,
    "enabled": <enabled>,
    "limit": <limit>,
    "throttling": {
      "enabled": <enabled>,
      "acceptableBacklog": <acceptableBacklog>,
      "minimumLimit": <minimumLimit>,
      "resolution": <resolution>
    }
  }
}
```

#### Response

| Code             | Description                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 200 Accepted     | The flow configuration request was processed correctly.                                                                                                                                                |
| 400 Bad Request  | Indicates issues with the request, for example, one of the fields contains an invalid type.                                                                                                            |
| 500 Server Error | All other errors. For example, when the values set do not conform to the imposed restriction (such as `minimumLimit` being higher than `limit`). Refer to the returned error message for more details. |

#### Example request

```bash
curl -X POST 'localhost:9600/actuator/flowControl' -H "Content-Type: application/json" --data
'{
  "write": {
    "rampUp": 0,
    "enabled": true,
    "limit": 2000,
    "throttling": {
      "enabled": true,
      "acceptableBacklog": 100000,
      "minimumLimit": 200,
      "resolution": 15
    }
  }
}'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control
