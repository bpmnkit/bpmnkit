# Understand Helm and application configuration responsibilities — Example: configure Orchestration Cluster authorizations

`orchestration.security.authorizations.enabled` is an application setting. In chart 15.x it still works, and setting it to a non-default value (`false`) logs a deprecation warning. Set the application property instead.

```yaml
# Deprecated in chart 15.x
orchestration:
  security:
    authorizations:
      enabled: false
```

```yaml
# Recommended
orchestration:
  extraConfiguration:
    - file: authorizations.yaml
      content: |
        camunda:
          security:
            authorizations:
              enabled: false
```

The same release still sets its connectivity and infrastructure in `values.yaml`, because those aren't application concerns:

```yaml
orchestration:
  resources:
    requests:
      cpu: "2"
      memory: 4Gi
  extraConfiguration:
    - file: authorizations.yaml
      content: |
        camunda:
          security:
            authorizations:
              enabled: true

global:
  identity:
    service:
      url: http://camunda-identity.hub.svc.cluster.local:80/identity
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities
