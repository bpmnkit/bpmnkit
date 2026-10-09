# Property reference — Configuration of the `restapi` component — application.yaml

```yaml
camunda:
  hub:
    clusters:
      - id: camunda-platform
        # other fields...
        components:
          - name: "Orchestration Cluster"
            type: "orchestration"
            version: "8.10-SNAPSHOT"
            urls:
              grpc: "grpcs://camunda.example.com:26500"
              rest: "https://camunda.example.com"
              readiness: "https://camunda.example.com:9600/core/actuator/health/readiness"
          - name: "Orchestration Admin"
            type: "admin"
            version: "8.10-SNAPSHOT"
            urls:
              webapp: "https://camunda.example.com"
              readiness: "https://camunda.example.com:9600/core/actuator/health/readiness"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
