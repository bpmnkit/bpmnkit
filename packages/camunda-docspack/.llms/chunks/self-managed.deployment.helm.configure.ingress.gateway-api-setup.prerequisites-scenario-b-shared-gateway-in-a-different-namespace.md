# Configure the Helm chart with Gateway API — Prerequisites — Scenario B: Shared Gateway in a different namespace

Use this scenario when a shared Gateway already exists in a separate namespace (for example, `shared-infra`) and multiple teams or Camunda releases attach their routes to it. This is common in platform-as-a-service setups where a central networking team manages all Gateways.

```yaml
global:
  host: "camunda.example.com"
  gateway:
    enabled: true
    createGatewayResource: false
    name: shared-gateway
    namespace: shared-infra
    className: nginx
```

`global.gateway.name` sets the Gateway name in the `parentRefs` of every Route. `global.gateway.namespace` adds the cross-namespace reference so Kubernetes can locate the Gateway in `shared-infra`. Both are required when the shared Gateway has a different name or namespace than the Camunda release.

The chart creates:

- `HTTPRoute` and `GRPCRoute` resources in the release namespace, with `parentRefs[].namespace: shared-infra`
- A `ReferenceGrant` in the release namespace

The chart does **not** create or modify the Gateway in `shared-infra`. Before deploying, ask your cluster administrator to configure the Gateway to accept routes from your release namespace by setting `spec.listeners[].allowedRoutes.namespaces` on the Gateway in `shared-infra`.

The simplest option is `from: All`, which accepts routes from any namespace:

```yaml
spec:
  listeners:
    - name: http
      port: 80
      protocol: HTTP
      allowedRoutes:
        namespaces:
          from: All
```

For tighter control, use `from: Selector` with a namespace label. Kubernetes automatically applies the `kubernetes.io/metadata.name` label to all namespaces (Kubernetes 1.21 and later):

```yaml
allowedRoutes:
  namespaces:
    from: Selector
    selector:
      matchLabels:
        kubernetes.io/metadata.name: <your-camunda-namespace>
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup
