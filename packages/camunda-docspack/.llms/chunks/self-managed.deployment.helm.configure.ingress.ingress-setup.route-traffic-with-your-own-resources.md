# Configure the Helm chart with Ingress — Route traffic with your own resources

Set `global.ingress.external: true` when a service mesh or routing resources you manage send traffic to Camunda instead of the chart's Ingress objects.

```yaml
global:
  host: "camunda.example.com"
  ingress:
    enabled: true
    external: true

orchestration:
  ingress:
    grpc:
      enabled: true
      external: true
      host: "zeebe.camunda.example.com"
```

With `global.ingress.external: true`, the chart doesn't render any web application Ingress object. The setting has no effect if `global.ingress.enabled` is `false`.

The chart still derives external URLs from `global.host`, the component context paths, `global.ingress.protocol`, and `global.ingress.publicPorts`. The chart uses these URLs for:

- Links in the installation notes and release information.
- The Identity URL and its login callback, if `identity.fullURL` is empty.
- The WebSocket host, port, and path browsers use to connect to Web Modeler, if Web Modeler has a context path.

Configure your routing resources to serve each component on these URLs. If clients reach Camunda over HTTPS, set `global.ingress.protocol: https`.

`global.ingress.external` doesn't affect the Zeebe gRPC Ingress. To skip the gRPC Ingress, set `orchestration.ingress.grpc.external: true`. The chart still derives the gRPC URL from `orchestration.ingress.grpc.host`.

If a service mesh or your own routing resources send traffic to Camunda, use `global.ingress.external: true` instead of `global.ingress.enabled: false`:

| Values                                                             | Chart renders Ingress objects | URL source           | Use when                                                                                 |
| ------------------------------------------------------------------ | ----------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `global.ingress.enabled: true`                                     | Yes                           | `global.host`        | The chart's Ingress objects route traffic.                                               |
| `global.ingress.enabled: true` and `global.ingress.external: true` | No                            | `global.host`        | A service mesh or your own routing resources route traffic.                              |
| `global.ingress.enabled: false`                                    | No                            | `localhost` defaults | You access components with [port forwarding](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/accessing-components-without-ingress). |

If you manage Gateway API resources yourself, use `global.gateway.external` instead. See [manage all resources yourself](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup#scenario-d-manage-all-resources-yourself).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup
