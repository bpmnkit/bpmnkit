# Configure Orchestration REST and gRPC TLS modes — Optimize TLS — Modes

- **PKCS12 (default)** — `type: pkcs12`. The chart sets `SERVER_SSL_KEY_STORE`, `SERVER_SSL_KEY_STORE_TYPE=PKCS12`, and `SERVER_SSL_KEY_STORE_PASSWORD` (from a `secretKeyRef`) on the Optimize main container. Use when you manage keystores out-of-band (Java PKI, internal CA).
- **PEM (cert-manager compatible)** — `type: pem`. The chart sets `SERVER_SSL_CERTIFICATE` and `SERVER_SSL_CERTIFICATE_PRIVATE_KEY` on the Optimize main container. Compatible with cert-manager `kubernetes.io/tls` Secrets out of the box.

In both modes the chart:

- Sets `SERVER_SSL_ENABLED=true` on the Optimize main container (and only the main container — the optional `migration` init container is untouched, since it does not serve HTTP).
- Mounts the referenced Secret at `/usr/local/camunda/certificates/optimize/` as a regular Secret volume named `optimize-server-tls`.
- Uses HTTPS for `startupProbe`, `readinessProbe`, and `livenessProbe` when their `scheme` values are empty, which is the default. An explicit scheme remains authoritative, including `HTTP`.
- Stamps a `checksum/optimize-tls` pod annotation when `global.tls.optimize.autoRollout: true`, so the next `helm upgrade` rolls Optimize on cert rotation.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
