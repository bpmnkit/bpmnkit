# Deploy required dependencies with Kubernetes operators — Keycloak deployment — no-domain

Basic Keycloak instance for local development.

**Save as** `keycloak-instance-no-domain.yml`:

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/keycloak-instance-no-domain.yml
```

**Use case**: Local development and testing without external domain.

**Note: Local hostname configuration**
In certain setups, Keycloak is configured to use its service name as the hostname, which may result in redirections. For local deployments, you need to add the Keycloak service name to your local hosts file (`/etc/hosts` on Linux and macOS) by adding the entry `127.0.0.1 keycloak-service` and use this hostname to access Keycloak.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
