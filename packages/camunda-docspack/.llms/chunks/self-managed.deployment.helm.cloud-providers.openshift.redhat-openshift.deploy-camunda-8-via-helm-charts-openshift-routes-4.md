# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — openshift-routes

Deploy Keycloak with OpenShift Routes:

```bash
# Deploy the PostgreSQL database for Keycloak
CLUSTER_FILTER=pg-keycloak (cd generic/kubernetes/operator-based/postgresql && ./deploy.sh)

# Deploy Keycloak
export KEYCLOAK_CONFIG_FILE="keycloak-instance-domain-openshift.yml"
(cd generic/kubernetes/operator-based/keycloak && ./deploy.sh)
```

Review the OpenShift Keycloak instance configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/keycloak-instance-domain-openshift.yml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
