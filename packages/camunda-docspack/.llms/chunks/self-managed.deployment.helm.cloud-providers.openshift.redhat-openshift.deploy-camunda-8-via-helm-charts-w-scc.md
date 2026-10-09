# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — w-scc

The `global.compatibility.openshift.adaptSecurityContext` variable in your values.yaml can be used to set the following possible values:

- `force`: The `runAsUser` and `fsGroup` values will be null in all components.
- `disabled`: The `runAsUser` and `fsGroup` values will not be modified (default).

```bash
yq '. *+ load("generic/openshift/single-region/helm-values/scc.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

Review the restrictive SCC configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/helm-values/scc.yml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
