# Deploy required dependencies with Kubernetes operators — Keycloak deployment — Ingress management

Due to subpath management constraints, the Keycloak operator's built-in Ingress configuration is disabled in favor of dedicated Ingress manifests. This approach provides better control over path routing and TLS certificate management when serving Keycloak under the `/auth` path prefix.

The dedicated Ingress configuration is integrated directly within the operator manifest to ensure proper deployment coordination and resource management.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
