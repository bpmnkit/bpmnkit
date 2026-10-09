# Configure the Helm chart with Gateway API — Prerequisites — Scenario A: Gateway and Camunda in the same namespace (default)

This is the simplest setup. The chart creates the Gateway resource alongside all Camunda components in the same Kubernetes namespace. No cross-namespace configuration is needed.

Use this scenario when you're deploying a single Camunda installation and have full control of the namespace.

```yaml
global:
  host: "camunda.example.com"
  gateway:
    enabled: true
    createGatewayResource: true
    className: nginx
```

The chart creates:

- A `Gateway` resource in the release namespace, referencing the `nginx` GatewayClass
- An `HTTPRoute` and optionally a `GRPCRoute` per enabled component, all referencing the Gateway by name in the same namespace
- A `ReferenceGrant` in the release namespace (permits any routes in the same namespace to reach Camunda services)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup
