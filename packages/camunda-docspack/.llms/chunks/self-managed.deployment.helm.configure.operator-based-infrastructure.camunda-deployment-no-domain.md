# Deploy required dependencies with Kubernetes operators — Camunda deployment — no-domain

Deploy Camunda for local development:

```bash
helm install "$CAMUNDA_RELEASE_NAME" camunda/camunda-platform \
  --version $HELM_CHART_VERSION \
  -f camunda-elastic-values.yml \
  -f camunda-identity-values.yml \
  -f camunda-hub-values.yml \
  -f camunda-keycloak-no-domain-values.yml \
  -n "$CAMUNDA_NAMESPACE"
```

**Tip: Helm value files**
Order & precedence: The order of `-f` flags matters—later files override earlier ones, so place the most specific/override files (e.g. secrets, domain-specific settings) last.

File origin: Every `-f` file corresponds to a configuration you saved in previous sections (Elasticsearch integration, PostgreSQL clusters, Keycloak, Identity secrets). Make sure they're present locally and reflect any custom adjustments before running the command.

Component flexibility: Drop files for components you don't deploy (for example, remove `camunda-hub-values.yml` if you're not using Camunda Hub) to reduce footprint.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
