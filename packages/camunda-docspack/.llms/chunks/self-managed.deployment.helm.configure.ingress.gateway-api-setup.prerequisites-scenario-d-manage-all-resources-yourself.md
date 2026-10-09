# Configure the Helm chart with Gateway API — Prerequisites — Scenario D: Manage all resources yourself

Use this scenario when you want to manage all Gateway API resources outside the chart. No Gateway, HTTPRoute, GRPCRoute, or ReferenceGrant objects are created.

```yaml
global:
  gateway:
    enabled: true
    external: true
```

You are responsible for creating all resources that expose Camunda's services.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup
