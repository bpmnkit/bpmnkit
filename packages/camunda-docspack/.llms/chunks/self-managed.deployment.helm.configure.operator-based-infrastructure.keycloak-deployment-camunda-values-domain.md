# Deploy required dependencies with Kubernetes operators — Keycloak deployment — camunda-values-domain

Configure Camunda to use Keycloak with external domain.

**Save as** `camunda-keycloak-domain-values.yml`:

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/camunda-keycloak-domain-values.yml
```

**Note: Domain configuration step**
This configuration file contains `${CAMUNDA_DOMAIN}` placeholder variables that must be replaced with your actual domain before deployment.

**Options for domain injection:**

- **Automatic substitution**: Use `envsubst < camunda-keycloak-domain-values.yml > camunda-keycloak-domain-values-final.yml` (requires `CAMUNDA_DOMAIN` environment variable)
- **Manual replacement**: Replace all instances of `${CAMUNDA_DOMAIN}` with your actual domain name in `camunda-keycloak-domain-values.yml`

**Use case**: Production setup with external domain and proper OIDC configuration.

**Installation**: Add `-f camunda-keycloak-domain-values.yml` to your Helm install command.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
