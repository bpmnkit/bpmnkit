# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Connect several existing Orchestration Clusters — Identity provider

Every Orchestration Cluster release the Hub release manages must trust the identity provider that Management Identity and Camunda Hub use. Decide the shared provider before you convert anything:

| Existing setup                                                       | What to do                                                                                                                                                                                                                                                                                                                         |
| :------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All Orchestration Cluster releases already use one external provider | Use the same issuer in the Hub release                                                                                                                                                                                                                                                                                             |
| Each Orchestration Cluster release runs its own bundled Keycloak     | Choose one external Keycloak or external OIDC provider for the Hub release. See [external Keycloak](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak) or [external OIDC provider](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-oidc-provider) |
| Orchestration Cluster releases use different external providers      | Choose one of them for the Hub release, and move the others to it                                                                                                                                                                                                                                                                  |

If the Orchestration Cluster releases already share one external provider, the issuer doesn't change, and users keep signing in as before. An Orchestration Cluster release that moves to a different provider changes its token issuer in step 5 of the conversion:

- Signed-in users must sign in again.
- Tokens from the old provider are rejected. Register the new clients before step 5, and switch job workers and API clients to them right after step 5. Until step 5, the Orchestration Cluster release still trusts only the old provider, so clients that switch early get `401 Unauthorized`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
