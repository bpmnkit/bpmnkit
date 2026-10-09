# Connect to multiple identity providers — Overview — API authentication

For machine-to-machine (M2M) API calls (REST/gRPC), Camunda accepts access tokens (bearer tokens) from any of the configured IdPs, as long as the `issuer` claim matches one of the trusted issuer URIs.

If an access token’s issuer is not configured, the request is denied.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-multiple-identity-providers
