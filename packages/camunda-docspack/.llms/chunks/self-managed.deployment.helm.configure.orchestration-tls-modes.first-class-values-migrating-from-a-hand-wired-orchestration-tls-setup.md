# Configure Orchestration REST and gRPC TLS modes — First-class values — Migrating from a hand-wired Orchestration TLS setup

Before this guide existed, customers enabled Orchestration TLS by hand-wiring everything in `orchestration.env` plus `extraVolumes`/`extraVolumeMounts`. The legacy shape still works (the helpers OR-merge the new flag with the env vars), so an upgrade is non-breaking by default. To migrate to the first-class surface:

**Before** (legacy):

```yaml
orchestration:
  env:
    - name: CAMUNDA_API_GRPC_SSL_ENABLED
      value: "true"
    - name: CAMUNDA_API_GRPC_SSL_CERTIFICATE
      value: /usr/local/camunda/certificates/orchestration/tls.crt
    - name: CAMUNDA_API_GRPC_SSL_CERTIFICATEPRIVATEKEY
      value: /usr/local/camunda/certificates/orchestration/tls.key
  extraVolumes:
    - name: orchestration-tls
      secret:
        secretName: orchestration-grpc-cert
  extraVolumeMounts:
    - name: orchestration-tls
      mountPath: /usr/local/camunda/certificates/orchestration
      readOnly: true
```

**After** (first-class):

```yaml
global:
  tls:
    orchestration:
      grpc:
        enabled: true
        cert:
          secret:
            existingSecret: orchestration-grpc-cert
```

The `helm upgrade` will roll the Orchestration StatefulSet because the rendered env vars and volume names change. Expect a brief outage during the rolling restart (no data loss — PVCs are unchanged). Existing hand-written `webModeler.restapi.clusters` or `connectors.configuration` blocks remain authoritative; if their `grpc-address` / `rest-address` matches what the chart would derive (visible via `helm template`), you can delete them too.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
