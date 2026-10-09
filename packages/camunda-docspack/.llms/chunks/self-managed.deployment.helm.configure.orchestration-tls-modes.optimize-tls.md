# Configure Orchestration REST and gRPC TLS modes — Optimize TLS

Optimize in 8.10 runs its own Spring Boot HTTP server. The chart can expose it through an NGINX Ingress or a Gateway API `HTTPRoute`. `global.tls.optimize` mirrors the Orchestration REST configuration and enables TLS at the Optimize pod.

This server-side TLS is independent of the existing client-side `optimize.database.elasticsearch.tls` / `optimize.database.opensearch.tls` configuration. Both directions can use TLS together. The chart mounts the server certificate from a regular Secret volume named `optimize-server-tls`, alongside the client-side `keystore` truststore mount when configured.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
