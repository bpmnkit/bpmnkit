# Troubleshoot OIDC authentication

Common issues and solutions when configuring OIDC authentication for Camunda 8 Self-Managed.

This page provides solutions to common issues encountered when configuring OIDC authentication for Camunda 8 Self-Managed.


## Invalid redirect_uri

**Observed behavior:** During login, your OIDC provider shows "Invalid redirect_uri".

**Why this happens:** The `redirectUrl` in Helm values doesn't match an allowed redirect URI configured in your OIDC provider.

**How to fix:**

1. Open the browser's developer tools (F12) and check the `redirect_uri` parameter sent to your OIDC provider.
2. Ensure this exact URI is configured in your OIDC provider's allowed redirect URIs.
3. Update `redirectUrl` in Helm values to match how users actually access the component.

**Info: Common misconfiguration**
A common mistake is leaving the redirect URL in Helm values at `http://localhost:8080` when users access via `https://camunda.example.com/orchestration`. Set it to the public URL instead.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc
