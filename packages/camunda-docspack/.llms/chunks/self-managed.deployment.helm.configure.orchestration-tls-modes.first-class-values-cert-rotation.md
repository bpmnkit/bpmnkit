# Configure Orchestration REST and gRPC TLS modes — First-class values — Cert rotation

`global.tls.orchestration.autoRollout` mirrors `global.tls.caBundle.autoRollout`. When `true`, the chart stamps `checksum/orchestration-tls-{rest,grpc}` pod annotations derived from the configured Secret. For PEM REST and gRPC certificates, the hash covers both the certificate and private key. For PKCS12, it covers the keystore. A `helm upgrade` then rolls the Orchestration pods when this material changes.

The hash deliberately excludes the keystore password. Rotate the password with the keystore material or restart the StatefulSet manually after a password-only change.

This uses Helm's `lookup`, which requires the upgrading identity to have `get` on Secrets in the release namespace. It is inert under GitOps tools that render with `helm template`. Leave `autoRollout` off in those environments and rotate manually with `kubectl rollout restart statefulset/<release>-orchestration`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
