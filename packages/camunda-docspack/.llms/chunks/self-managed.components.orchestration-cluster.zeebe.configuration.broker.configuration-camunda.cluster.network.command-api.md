# Broker configuration — Configuration — camunda.cluster.network.command-api

| Field          | Description                                                                                                                                                                                                                                                  | Example Value |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| host           | Overrides the host used for gateway-to-broker communication. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_COMMANDAPI_HOST`.                                                                                   | 0.0.0.0       |
| port           | Sets the port used for gateway-to-broker communication. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_COMMANDAPI_PORT`.                                                                                        | 26501         |
| advertisedHost | Controls the advertised host. If omitted, it defaults to the host. This is particularly useful if your broker stands behind a proxy. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_COMMANDAPI_ADVERTISEDHOST`. | 0.0.0.0       |
| advertisedPort | Controls the advertised port. If omitted, it defaults to the port. This is particularly useful if your broker stands behind a proxy. This setting can also be overridden using the environment variable `CAMUNDA_CLUSTER_NETWORK_COMMANDAPI_ADVERTISEDPORT`. | 25601         |

#### YAML snippet

```yaml
camunda:
  cluster:
    network:
      command-api:
        host: 0.0.0.0
        port: 26501
        advertisedHost: 0.0.0.0
        advertisedPort: 25601
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
