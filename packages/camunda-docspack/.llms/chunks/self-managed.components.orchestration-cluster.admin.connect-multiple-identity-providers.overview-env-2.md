# Connect to multiple identity providers — Overview — env

```
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_CLIENTIDCLAIM=
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_GROUPSCLAIM=
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_USERNAMECLAIM=
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ORGANIZATIONID=
```

These define:

- Which claim to use as the client ID and username
- The claim containing group information (if applicable)
- The claim for organization or tenant assignment

All IdPs must use the same claims for these purposes.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-multiple-identity-providers
