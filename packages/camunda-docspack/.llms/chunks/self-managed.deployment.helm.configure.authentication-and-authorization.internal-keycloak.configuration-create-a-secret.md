# Set up the Helm chart with an in-cluster Keycloak instance — Configuration — Create a secret

Create a secret that contains the Camunda application credentials. For example, the following command creates a `camunda-credentials` secret:

```bash
kubectl create secret generic camunda-credentials \
  --from-literal=identity-firstuser-password=CHANGE_ME \
  --from-literal=identity-connectors-client-token=CHANGE_ME \
  --from-literal=identity-optimize-client-token=CHANGE_ME \
  --from-literal=identity-orchestration-client-token=CHANGE_ME
```

This secret includes the following keys:

- `identity-firstuser-password`: Password for the initial user account in Keycloak (default username `demo`), used to log in to the Camunda web apps.
- `identity-connectors-client-token`: Client secret for the Keycloak OIDC client `connectors` used by Connectors.
- `identity-optimize-client-token`: Client secret for the Keycloak OIDC client `optimize` used by Optimize.
- `identity-orchestration-client-token`: Client secret for the Keycloak OIDC client `orchestration` used by the Orchestration Cluster.

The Keycloak administrator credentials and the PostgreSQL credentials for Keycloak, Identity, and Web Modeler are no longer part of this secret. They are provided by the operators that deploy those services, such as the operator-generated `keycloak-initial-admin` secret and the `pg-*-secret` database secrets. See [Operator-based infrastructure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure) for how these are created.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak
