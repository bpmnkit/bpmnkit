# Debugging the authentication flow

Learn how to troubleshoot unexpected authentication and authorization failures in the Orchestration Cluster.

This guide explains how to debug issues in the **authentication and authorization flow** of the Orchestration Cluster.  
These techniques help identify where and why access may be denied or restricted.

Common questions you can answer with these steps:

- Why can’t I log into the web applications?
- Why does my search request return empty results?

The flow consists of three key steps:

1. **Request authentication**
   - **Input:** HTTP request
   - **Output:** Spring `Authentication` object with user identity
   - **Layer:** Spring Security

2. **Establish Orchestration Cluster user context**
   - **Input:** Spring `Authentication`
   - **Output:** `CamundaAuthentication` object with roles, groups, and tenant memberships
   - **Layer:** Orchestration Cluster authentication

3. **Apply authorizations**
   - **Input:** `CamundaAuthentication`
   - **Output:** Application data, filtered by authorizations
   - **Layer:** Orchestration Cluster search and workflow engine

Typical failure points:

- Step 1: Invalid credentials (for example, failed Basic authentication).
- Step 2: Missing role or group memberships.
- Step 3: Authorizations not yet configured or missing.

To isolate the issue, use:

- [Review logs](#review-logs)
- [Review the startup warnings](#review-the-startup-warnings)
- [Requests fail when an identity provider is unreachable](#requests-fail-when-an-identity-provider-is-unreachable)
- [Review data](#review-data)
- [Review configuration](#review-configuration)
- [Inspect the JWT](#inspect-the-jwt)
- [Test the IdP directly](#test-the-idp-directly)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/debugging-authentication
