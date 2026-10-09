# Broker configuration — Configuration — server.servlet

| Field        | Description                                                                                                                                                                                                                                                        | Example value |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| context-path | The context path prefix for all REST API requests. For example, if you configure `/zeebe`, then the client's REST address would be `http://localhost:8080/zeebe`. This setting can also be overridden using the environment variable `SERVER_SERVLET_CONTEXTPATH`. | `/`           |

#### YAML snippet

```yaml
server.servlet:
  context-path: /
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
