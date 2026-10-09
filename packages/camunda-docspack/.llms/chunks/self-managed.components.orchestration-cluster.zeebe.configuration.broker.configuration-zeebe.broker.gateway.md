# Broker configuration — Configuration — zeebe.broker.gateway

Use `zeebe.broker.gateway.*` properties to configure the embedded gateway. For a standalone gateway, use `zeebe.gateway.*` properties.

Where a specific embedded gateway property has a unified `camunda.*` equivalent, use the `camunda.*` property documented on this page instead.

To configure the embedded gateway, see [Gateway configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway).

| Field  | Description                                                                                                                                                           | Example value |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| enable | Enables the embedded gateway on broker startup. Enabled by default. This setting can also be overridden using the environment variable `ZEEBE_BROKER_GATEWAY_ENABLE`. | true          |

#### YAML snippet

```yaml
zeebe:
  broker:
    gateway:
      enable: true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
