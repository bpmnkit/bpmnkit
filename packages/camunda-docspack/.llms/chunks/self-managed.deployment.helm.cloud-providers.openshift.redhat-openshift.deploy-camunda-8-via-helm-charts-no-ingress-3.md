# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — no-ingress

```bash
yq '. *+ load("generic/kubernetes/operator-based/keycloak/camunda-keycloak-no-domain-values.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

Review the Keycloak no-domain Helm overlay

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/camunda-keycloak-no-domain-values.yml
```

#### Fill your deployment with actual values

If **Web Modeler** is enabled, create the SMTP secret:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/procedure/create-webmodeler-secret.sh
```

**Note**
Database and authentication secrets are automatically managed by the operators:

- **PostgreSQL credentials**: Created by CloudNativePG via `set-secrets.sh`
- **Keycloak admin credentials** _(optional)_: Created by the Keycloak Operator
- **Elasticsearch credentials**: Created by ECK
- **Identity secrets**: Created by the operator-based deployment scripts

Only the SMTP password for Web Modeler needs to be created manually.

Once you've prepared the `values.yml` file with all overlays merged, run the following `envsubst` command to substitute the environment variables with their actual values:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/procedure/assemble-envsubst-values.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
