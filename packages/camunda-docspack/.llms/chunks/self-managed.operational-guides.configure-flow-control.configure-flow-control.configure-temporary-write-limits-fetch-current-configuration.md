# Camunda components flow control configuration — Configure temporary write limits — Fetch current configuration

The backup API can be reached via the `/actuator` management port, which is 9600 by default. The configured context path does not apply to the management port.

The following endpoint can be used to fetch the flow control configuration:

```
GET actuator/flowControl
```

With multiple [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index), add the `physicalTenant=<tenant-id>` query parameter to fetch the configuration of one tenant. Without it, the response lists every tenant, keyed by tenant ID.

#### Response

| Code             | Description                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| 200 Accepted     | The flow configuration was retrieved successfully.                      |
| 400 Bad Request  | Indicates issues with the request.                                      |
| 500 Server Error | All other errors. Refer to the returned error message for more details. |

#### Example request

```
curl -X GET 'localhost:9600/actuator/flowControl'
```

#### Example response

```json
{
  "1": {
    "requestLimiter": {
      "delegate": {
        "limit": 100,
        "minLimit": 1,
        "maxLimit": 1000,
        "backoffRatio": 0.9,
        "expectedRTT": 200000000
      }
    },
    "writeRateLimit": {
      "enabled": true,
      "limit": 4000,
      "rampUp": 0.0,
      "throttling": {
        "enabled": true,
        "acceptableBacklog": 100000,
        "minRate": 100,
        "resolution": 15.0
      }
    }
  }
}
```

**Note**
The `writeRateLimit` value can be null if it has not been defined yet.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control
