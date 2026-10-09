# Cluster inspection and process management — Messages

### Publish a message

```bash
c8 publish msg order-placed
c8 publish msg order-placed --correlationKey=order-12345
c8 publish msg order-placed --correlationKey=order-12345 --variables='{"orderId":"12345","total":250.00}'
c8 publish msg order-placed --correlationKey=order-12345 --timeToLive=3600000
```

### Correlate a message

Use `correlate` to correlate a message to waiting process instances. It is a separate command from `publish` and, like `publish`, accepts a `--correlationKey` and optional `--variables`:

```bash
c8 correlate msg payment-received --correlationKey=order-12345 --variables='{"amount":250.00}'
```


## Forms

Retrieve the form linked to a user task or process definition:

```bash
# Search both user tasks and process definitions
c8 get form 2251799813685251

# User task form only
c8 get form 2251799813685251 --ut

# Start form for a process definition only
c8 get form 2251799813685252 --pd

# Using a specific profile
c8 get form 2251799813685251 --profile=prod
```

When no flag is specified, `c8ctl` searches both types and reports where the form was found.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
