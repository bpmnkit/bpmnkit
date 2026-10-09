# Configure the Helm chart with Ingress — Ingress controllers — Configure the gRPC upstream

Configure your Ingress controller to send HTTP/2 to the Orchestration Cluster, because the Zeebe Gateway serves gRPC. Each controller declares the gRPC upstream differently, and not on the same object:

| Ingress controller | Annotation                                           | Object                                    |
| ------------------ | ---------------------------------------------------- | ----------------------------------------- |
| Contour            | `projectcontour.io/upstream-protocol.h2c: "26500"`   | Orchestration Cluster `Service`           |
| Ingress-nginx      | `nginx.ingress.kubernetes.io/backend-protocol: GRPC` | Zeebe `Ingress` (added by the Helm chart) |

When the upstream itself uses TLS, use `projectcontour.io/upstream-protocol.h2` with Contour, and `nginx.ingress.kubernetes.io/backend-protocol: GRPCS` with Ingress-nginx. For other controllers, check their documentation for the equivalent.

With Contour, set the annotation on the Orchestration Cluster service:

```yaml
orchestration:
  service:
    annotations:
      projectcontour.io/upstream-protocol.h2c: "26500"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup
