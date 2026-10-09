# Gateway configuration — Configuration — zeebe.gateway.cluster.security.authentication

| Field | Description                                                                                                                                                                                                                                                                                                                                                                                                   | Example value |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| mode  | Controls which authentication mode is active; supported modes are `none` and `identity`. If `identity` is set, authentication will be done using [camunda-identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview), which needs to be configured in the corresponding subsection. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_SECURITY_AUTHENTICATION_MODE`. | none          |

#### YAML snippet

```yaml
security:
  authentication:
    mode: none
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
