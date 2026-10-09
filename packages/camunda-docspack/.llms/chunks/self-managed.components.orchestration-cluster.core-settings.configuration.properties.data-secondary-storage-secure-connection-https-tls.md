# Property reference — Data - secondary storage — Secure connection (HTTPS / TLS)

To connect to a secured (`https`) Elasticsearch or OpenSearch cluster for secondary storage:

- Change the URL protocol from `http` to `https`.
- Provide `username` and `password` if the cluster requires authentication.
- Use additional security properties to handle custom certificates or strict hostname verification:
  - Set `security.enabled=true` (or simply use an `https` URL if auto-detection applies) to activate SSL/TLS handling.
  - Use `security.certificatePath` when the server certificate is signed by a custom CA or is self-signed so the JVM can trust it.
  - Set `security.selfSigned=true` if the certificate is self-signed and the client logic requires this hint.
  - Keep `security.verifyHostname=true` for production. Disable it only temporarily to diagnose hostname/certificate mismatch issues.

**Note**

- Import the certificate (or its issuing CA) into the JVM trust store if it is not already trusted.
- For Kubernetes-based deployments, mount a trust store and point `certificatePath` to it.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
