# Broker configuration — Configuration — camunda.cluster.network.internal-api

| Field          | Description                                                                                                                                                                                                                                                   | Example Value |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| host           | Overrides the host used for internal broker-to-broker communication. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_INTERNALAPI_HOST`.                                                                           | 0.0.0.0       |
| port           | Sets the port used for internal broker-to-broker communication. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_INTERNALAPI_PORT`.                                                                                | 26502         |
| advertisedHost | Controls the advertised host. If omitted, it defaults to the host. This is particularly useful if your broker stands behind a proxy. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_INTERNALAPI_ADVERTISEDHOST`. | 0.0.0.0       |
| advertisedPort | Controls the advertised port. If omitted, it defaults to the port. This is particularly useful if your broker stands behind a proxy. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_INTERNALAPI_ADVERTISEDPORT`. | 25602         |

#### YAML snippet

```yaml
camunda:
  cluster:
    network:
      internal-api:
        host: 0.0.0.0
        port: 26502
        advertisedHost: 0.0.0.0
        advertisedPort: 25602
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
