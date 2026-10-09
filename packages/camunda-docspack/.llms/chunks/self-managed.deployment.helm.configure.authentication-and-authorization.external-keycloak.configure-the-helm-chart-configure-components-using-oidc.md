# Set up the Helm chart with an external Keycloak instance — Configure the Helm chart — Configure components using OIDC

To configure the Orchestration Cluster and management plane components with OIDC, follow the steps in the [Configure components using OIDC section of the internal Keycloak setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak#configure-components-using-oidc).

Assign each component its own resource audience by default. Keycloak does not enforce this for you, and a shared value lets a token issued for one component be accepted by another. Only configure this trust for a supported integration. See [Assign a unique audience to each component](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#assign-a-unique-audience-to-each-component).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak
