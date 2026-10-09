# Debugging the authentication flow — Inspect the JWT

Most "insufficient permissions" or "empty results" issues at step 2 or 3 of the flow trace back to a mismatch between what's in the access token and what Camunda expects.

Decode the token presented to the Orchestration Cluster and check:

- Confirm the claim configured as `usernameClaim` or `clientIdClaim` is present and has the value you expect.
- Compare any claims your mapping rules match against with the claim name and value configured on each [mapping rule](https://docs.camunda.io/docs/next/components/admin/mapping-rules). A wrong claim name, unexpected casing, or incorrect operator for an array claim can prevent a mapping rule from granting the expected role, group, or tenant.
- Confirm the `aud` claim matches the `audience` configured for that client.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/debugging-authentication
