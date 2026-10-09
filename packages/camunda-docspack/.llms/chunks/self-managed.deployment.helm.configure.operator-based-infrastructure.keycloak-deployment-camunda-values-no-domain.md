# Deploy required dependencies with Kubernetes operators — Keycloak deployment — camunda-values-no-domain

Configure Camunda to use Keycloak for local development.
**Save as** `camunda-keycloak-no-domain-values.yml`:

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/camunda-keycloak-no-domain-values.yml
```

**Use case**: Local development setup with port-forwarding access.

**Installation**: Add `-f camunda-keycloak-no-domain-values.yml` to your Helm install command.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
