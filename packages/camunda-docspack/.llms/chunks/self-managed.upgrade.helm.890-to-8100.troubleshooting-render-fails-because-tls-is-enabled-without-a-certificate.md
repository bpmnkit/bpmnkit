# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Render fails because TLS is enabled without a certificate

If `helm upgrade` fails with `[camunda][error] Orchestration REST TLS is enabled but no server cert is configured.`, chart 15.x detected TLS for the Orchestration Cluster REST API but found no certificate. In order of precedence, the chart detects REST TLS from `SERVER_SSL_ENABLED` in `orchestration.env`, `global.tls.orchestration.rest.enabled`, and a nested `server.ssl.enabled` key in `orchestration.extraConfiguration` or `orchestration.configuration`. Set `global.tls.orchestration.rest.cert.secret.existingSecret`. Alternatively, configure `SERVER_SSL_KEY_STORE` or `SERVER_SSL_CERTIFICATE` manually in `orchestration.env`, together with the matching volumes. Another option is to remove the TLS setting.

The chart runs separate checks for the gRPC API and for Connectors:

- The gRPC check fails with `[camunda][error] Orchestration gRPC TLS is enabled but no server cert is configured.` when `CAMUNDA_API_GRPC_SSL_ENABLED`, `global.tls.orchestration.grpc.enabled`, or a nested `camunda.api.grpc.ssl.enabled` key enables TLS and you don't set `global.tls.orchestration.grpc.cert.secret.existingSecret`.
- The Connectors check fails with `[camunda][error] Connectors TLS is enabled but no server cert is configured.` when `SERVER_SSL_ENABLED` in `connectors.env`, `global.tls.connectors.enabled`, or a nested `server.ssl.enabled` key enables TLS. To fix the failure, set `global.tls.connectors.enabled: true` together with `global.tls.connectors.cert.secret.existingSecret`.

See [Orchestration Cluster TLS modes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
