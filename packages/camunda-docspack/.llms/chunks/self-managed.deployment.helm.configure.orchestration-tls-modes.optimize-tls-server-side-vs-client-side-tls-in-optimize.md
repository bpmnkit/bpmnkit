# Configure Orchestration REST and gRPC TLS modes — Optimize TLS — Server-side vs client-side TLS in Optimize

The two surfaces are deliberately orthogonal:

| Direction                     | Values key                                                                                  | Volume name           | Purpose                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| Inbound (clients → Optimize)  | `global.tls.optimize.cert.secret.existingSecret`                                            | `optimize-server-tls` | Server identity cert + key for the Optimize HTTP listener (this guide).               |
| Outbound (Optimize → ES / OS) | `optimize.database.elasticsearch.tls.secret.existingSecret` (or `…opensearch.tls.secret.…`) | `keystore`            | Truststore so Optimize trusts the ES / OS server cert when calling secondary storage. |

Operators commonly need TLS for both inbound and outbound connections. These are independent one-way TLS connections; neither side requires a client certificate. The chart supports both simultaneously, and the `optimize-server-tls` and `keystore` volumes can coexist with their respective mounts on the Optimize main container.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
