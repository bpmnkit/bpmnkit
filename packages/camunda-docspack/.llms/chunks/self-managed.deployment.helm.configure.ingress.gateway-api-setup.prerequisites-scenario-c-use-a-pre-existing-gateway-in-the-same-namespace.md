# Configure the Helm chart with Gateway API — Prerequisites — Scenario C: Use a pre-existing Gateway in the same namespace

Use this scenario when a Gateway already exists in your release namespace (for example, managed by a separate Helm release or your platform team) and you don't want the chart to create or overwrite it.

```yaml
global:
  host: "camunda.example.com"
  gateway:
    enabled: true
    createGatewayResource: false
    className: nginx
```

The chart creates:

- `HTTPRoute` and `GRPCRoute` resources referencing the Gateway by name within the same namespace
- A `ReferenceGrant` in the release namespace

The Gateway resource name the chart looks for matches the Helm release name (for example, `camunda-platform` for a release named `camunda-platform`).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup
