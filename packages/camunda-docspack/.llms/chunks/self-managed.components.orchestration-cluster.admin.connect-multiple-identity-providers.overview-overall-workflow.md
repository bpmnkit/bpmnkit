# Connect to multiple identity providers — Overview — Overall workflow

1. Prepare and register applications/clients in each IdP. Obtain the client ID, client secret, and issuer URI.
2. Configure each IdP using environment variables or `application.yaml` (or Helm values).
3. Configure global OIDC claims that work across all providers.
4. Restart Camunda 8 Orchestration Cluster to apply the changes.
5. Test login with accounts from each IdP.
6. Assign roles and authorizations as needed. For details, see [Authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-multiple-identity-providers
