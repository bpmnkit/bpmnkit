# Configure Orchestration REST and gRPC TLS modes — First-class values

```yaml
global:
  tls:
    orchestration:
      autoRollout: false # opt-in: roll Orchestration pods on Secret rotation (requires Secret read RBAC)
      rest:
        enabled: false # REST TLS — sets SERVER_SSL_ENABLED on Orchestration
        type: pkcs12 # one of: pkcs12, pem
        keyAlias: "" # pkcs12 only — optional cert alias inside the keystore
        cert:
          secret:
            existingSecret: "" # Kubernetes Secret holding the REST server cert (or PKCS12 keystore)
            existingSecretKey: "" # pkcs12: keystore file key (default keystore.p12); pem: cert key (default tls.crt)
        privateKey:
          secret:
            existingSecretKey: tls.key # pem only — private-key key inside the Secret
        keystorePassword:
          secret:
            existingSecretKey: keystore-password # pkcs12 only — keystore password key inside the Secret
        proxyVerify:
          enabled: false
          caSecret:
            secret:
              existingSecret: "" # Secret holding the CA bundle for NGINX upstream verification
              existingSecretKey: ca.crt
            namespace: "" # optional: CA Secret namespace (defaults to release namespace)
      grpc:
        enabled: false # gRPC TLS — sets CAMUNDA_API_GRPC_SSL_ENABLED on Orchestration
        cert:
          secret:
            existingSecret: "" # Kubernetes Secret with PEM cert for the gRPC server
            existingSecretKey: "" # defaults to tls.crt
        privateKey:
          secret:
            existingSecretKey: tls.key
```

Both flags default to `false`. Set either independently to enable that protocol's TLS. Explicit `orchestration.env` entries with the same name override these flags (Kubernetes last-wins on duplicate env names).

When `enabled: true`, the chart fails template rendering unless the cert material is configured either via the `secret` sub-block (recommended) or via explicit env vars (`SERVER_SSL_KEY_STORE` / `SERVER_SSL_CERTIFICATE` for REST, `CAMUNDA_API_GRPC_SSL_CERTIFICATE` for gRPC). This prevents the silent Spring Boot / gRPC startup crash that would otherwise occur.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
