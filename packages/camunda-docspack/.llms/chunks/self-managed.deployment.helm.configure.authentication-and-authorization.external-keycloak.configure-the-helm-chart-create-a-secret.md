# Set up the Helm chart with an external Keycloak instance — Configure the Helm chart — Create a secret

Create a secret containing all required credentials.  
For example, the following command creates a `camunda-credentials` secret:

```bash
kubectl create secret generic camunda-credentials \
  --from-literal=identity-keycloak-admin-password=<set to admin password> \
  --from-literal=identity-firstuser-password=CHANGE_ME \
  --from-literal=identity-connectors-client-token=CHANGE_ME \
  --from-literal=identity-optimize-client-token=CHANGE_ME \
  --from-literal=identity-orchestration-client-token=CHANGE_ME
```

This secret includes the following keys:

- `identity-keycloak-admin-password`: Password for an administrative Keycloak account (`<keycloak_admin>`).
- `identity-firstuser-password`: Password for the initial Camunda user (default username: `demo`).
- `identity-connectors-client-token`: Client secret of the Keycloak OIDC client `connectors `used by Connectors.
- `identity-optimize-client-token`: Client secret of the Keycloak OIDC client `optimize` used by Optimize.
- `identity-orchestration-client-token`: Client secret of the Keycloak OIDC client `orchestration` used by the Orchestration Cluster.

The PostgreSQL credentials for Management Identity and Camunda Hub are no longer part of this secret. They are provided by the operator (or managed database) that hosts each database, such as the `pg-identity-secret` and `pg-hub-secret` created by the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment).

For additional options on how to create and reference Kubernetes secrets (for example using YAML manifests or consolidated secrets), see [External Kubernetes secrets](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management#method-2-external-kubernetes-secrets-recommended).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak
