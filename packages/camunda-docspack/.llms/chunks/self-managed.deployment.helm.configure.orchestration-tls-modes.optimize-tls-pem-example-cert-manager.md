# Configure Orchestration REST and gRPC TLS modes — Optimize TLS — PEM example (cert-manager)

```yaml
global:
  tls:
    optimize:
      enabled: true
      type: pem
      cert:
        secret:
          existingSecret: optimize-cert
          # existingSecretKey defaults to tls.crt when type=pem (auto-substituted)
    caBundle:
      secret:
        existingSecret: camunda-internal-ca
        existingSecretKey: ca.crt
```

With a cert-manager `Certificate` that issues into the same namespace, the resulting `kubernetes.io/tls` Secret already carries `tls.crt` and `tls.key` — the chart picks them up automatically (when `cert.secret.existingSecretKey` is left empty in PEM mode, `tls.crt` is substituted automatically).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
