# Camunda components flow control configuration — Configure temporary write limits — Example response

```js
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
The first value in the response (`1` in the example) refers to the partition before the flow configuration is defined.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control
