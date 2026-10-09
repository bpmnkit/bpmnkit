# Camunda components troubleshooting — Anomaly detection scripts — Handling errors

If a check fails, it indicates a deviation from the expected configuration on a normal setup. Resolving the error involves studying the failed check and applying the best practices outlined in the documentation (use the search feature to find the associated recommendation for a failed check).

For example:

```
[FAIL] None of the ingresses declare a gRPC upstream, which is required for the zeebe ingress.
With ingress-nginx, the zeebe ingress must carry nginx.ingress.kubernetes.io/backend-protocol: GRPC (GRPCS for a TLS upstream).
With Contour, the service behind it must carry projectcontour.io/upstream-protocol.h2c (.h2 for a TLS upstream) listing the gRPC port.
```

The message names the annotation each controller needs. For ingress-nginx, adjust the Ingress to include it. For Contour, set `projectcontour.io/upstream-protocol.h2c` on the Orchestration Cluster Service instead, or `projectcontour.io/upstream-protocol.h2` when the gRPC upstream uses TLS. You can also explore the source of the script to have a better understanding of the reason for the failure.

**Note**
Sometimes, some checks may not be applicable to your setup if it's custom (for example, with the previous example the Ingress you use may not be [ingress-nginx](https://kubernetes.github.io/ingress-nginx/)).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
