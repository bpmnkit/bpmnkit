# Legacy cluster configurations — applicationYaml

```yaml
camunda.hub.clusters:
  - # ...common configuration from above
    url:
      grpc: "grpc://camunda:26500" # or grpcs://camunda.example.com:26500
      rest: "http://camunda:8080" # or https://camunda.example.com
      webapp: "https://camunda.example.com"
    authorizations:
      enabled: true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/legacy-cluster-config
