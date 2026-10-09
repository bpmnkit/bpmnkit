# Broker configuration — Configuration — management.server

The `management.server` configuration allows you to configure the management server.

| Field     | Description                                                                                                                                                                                                                                                                           | Example value |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| address   | Sets the address the management server binds to. This setting can also be overridden using the environment variable `MANAGEMENT_SERVER_ADDRESS`.                                                                                                                                      | 0.0.0.0       |
| port      | Sets the port the management server binds to. This setting can also be overridden using the environment variable `MANAGEMENT_SERVER_PORT`.                                                                                                                                            | 9600          |
| base-path | The context path prefix for all management endpoints. For example, if you configure `/zeebe`, your actuator endpoints will be at `http://localhost:9600/zeebe/actuator/configprops`. This setting can also be overridden using the environment variable `MANAGEMENT_SERVER_BASEPATH`. | `/`           |

#### YAML snippet

```yaml
management.server:
  host: 0.0.0.0
  port: 9600
  base-path: /
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
