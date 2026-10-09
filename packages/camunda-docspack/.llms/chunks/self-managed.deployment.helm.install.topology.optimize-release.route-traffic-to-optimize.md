# Install an Optimize release — Route traffic to Optimize

The example above renders an Optimize Service and Deployment, but no Ingress or HTTPRoute. Sharing a namespace with the Orchestration Cluster release doesn't help: that release's Ingress routes only to its own services.

Before users sign in, route the host and path of `redirectUrl`, here `https://production-a.example.com/optimize-tenanta`, to this release's Optimize Service. Either manage the Ingress, HTTPRoute, or load balancer rule outside the chart, or let this release render its own Ingress:

```yaml
global:
  host: production-a.example.com
  ingress:
    enabled: true
    className: nginx
    tls:
      enabled: true
      secretName: production-a-tls
```

The chart then renders an Ingress rule for `optimize.contextPath` on `global.host`. The host must match `redirectUrl`, and the TLS Secret must exist in this release's namespace. If another Ingress already serves that host, confirm your Ingress controller merges rules from several Ingress resources for one host.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release
