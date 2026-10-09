# Troubleshoot OIDC authentication — Standard flow is disabled for the client

**Observed behavior:** Logging in to the Orchestration Cluster fails, and you see an error similar to:

```text
{"type":"about:blank","title":"Internal Server Error","status":500,"detail":"[unauthorized_client] Client is not allowed to initiate browser login with given response_type. Standard flow is disabled for the client.","instance":"/orchestration/sso-callback"}
```

**Why this happens:** The OIDC client configured for the Orchestration Cluster doesn't have the Authorization Code Flow enabled. Orchestration Cluster web applications require this flow for browser-based user login. This often occurs after upgrading from 8.7, where the reused `zeebe` client handled only machine-to-machine access and didn't need the flow.

**How to fix:**

1. In your identity provider, open the client used for the Orchestration Cluster OIDC configuration.
2. Enable the Authorization Code Flow for the client. In Keycloak, enable the **Standard flow** option for the client.
3. Retry the login.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc
