# Install Camunda 8 on an AKS cluster — Deploy Camunda 8 via Helm charts — rdbms

The RDBMS values file disables Elasticsearch and Optimize, and configures PostgreSQL as the secondary storage for the orchestration cluster:

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region-rdbms/helm-values/values-no-domain.yml
```

**Warning: No-domain deployment**
When running without a domain, you access the platform via `kubectl port-forward`. The IdP issuer URL must be aligned with your port-forward setup. Most external OIDC providers don't allow `localhost` as a redirect URI, so a no-domain deployment generally requires Keycloak deployed in the cluster. If you're using Keycloak via the Keycloak Operator, refer to the [operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) for the no-domain Helm values overlay and host mapping instructions.

#### Reference the credentials in secrets

Before installing the Helm chart, create Kubernetes secrets to store the database authentication credentials.

To create the secrets, run the following command for your selected variant:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
