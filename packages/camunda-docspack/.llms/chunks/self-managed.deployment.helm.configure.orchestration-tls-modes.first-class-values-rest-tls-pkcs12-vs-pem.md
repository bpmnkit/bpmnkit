# Configure Orchestration REST and gRPC TLS modes — First-class values — REST TLS: PKCS12 vs PEM

The REST `type` field selects which Spring Boot SSL property family the chart emits:

- **`pkcs12` (default)** — emits `SERVER_SSL_KEY_STORE`, `SERVER_SSL_KEY_STORE_TYPE=PKCS12`, `SERVER_SSL_KEY_STORE_PASSWORD` (via `secretKeyRef`), and optionally `SERVER_SSL_KEY_ALIAS`.
- **`pem`** — emits `SERVER_SSL_CERTIFICATE` and `SERVER_SSL_CERTIFICATE_PRIVATE_KEY` (Spring Boot 2.7+). Use this for cert-manager `kubernetes.io/tls` Secrets (`tls.crt` + `tls.key`) and Let's Encrypt-issued certificates — no manual PKCS12 conversion needed.

The gRPC server only accepts PEM, so the gRPC `secret` block has no `type` field.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
