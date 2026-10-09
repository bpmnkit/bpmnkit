# Deploy required dependencies with Kubernetes operators — Camunda deployment — with-domain

Deploy Camunda with external domain configuration:

```bash
helm install "$CAMUNDA_RELEASE_NAME" camunda/camunda-platform \
  --version $HELM_CHART_VERSION \
  -f camunda-elastic-values.yml \
  -f camunda-identity-values.yml \
  -f camunda-hub-values.yml \
  -f camunda-keycloak-domain-values.yml \
  -n "$CAMUNDA_NAMESPACE"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
