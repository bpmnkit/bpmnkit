# Configure Orchestration REST and gRPC TLS modes — Optimize TLS — Combined server + client TLS example

```yaml
global:
  tls:
    optimize:
      enabled: true
      cert:
        secret:
          existingSecret: optimize-tls-keystore
    caBundle:
      secret:
        existingSecret: camunda-internal-ca
        existingSecretKey: ca.crt
optimize:
  enabled: true
  database:
    elasticsearch:
      url:
        protocol: https
```

The chart wires the inbound `optimize-server-tls` keystore for the Optimize HTTP listener. For the outbound connection, `url.protocol: https` enables HTTPS and `global.tls.caBundle` supplies the PEM CA that Optimize uses to trust Elasticsearch. Both paths are independent and may be enabled together.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
