# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — kubernetes-ingress

Deploy Keycloak with nginx-ingress:

```bash
# Deploy the PostgreSQL database for Keycloak
CLUSTER_FILTER=pg-keycloak (cd generic/kubernetes/operator-based/postgresql && ./deploy.sh)

# Deploy Keycloak
export KEYCLOAK_CONFIG_FILE="keycloak-instance-domain-nginx.yml"
(cd generic/kubernetes/operator-based/keycloak && ./deploy.sh)
```

Review the nginx Keycloak instance configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/keycloak-instance-domain-nginx.yml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
