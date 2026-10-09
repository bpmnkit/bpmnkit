# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — kubernetes-ingress

```bash
yq '. *+ load("generic/kubernetes/operator-based/keycloak/camunda-keycloak-domain-values.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

Review the Keycloak domain Helm overlay

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/camunda-keycloak-domain-values.yml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
