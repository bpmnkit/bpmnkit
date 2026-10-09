# Connect Camunda to Ping Identity (PingFederate or PingOne)

Learn how to configure Camunda 8 Self-Managed to authenticate with PingFederate or PingOne Advanced Identity Cloud.

This guide covers connecting Camunda 8 Self-Managed to PingFederate or PingOne Advanced Identity Cloud. Where the two products differ, both variants are noted.

**Note**
This page covers only what's specific to Ping. For the shared setup steps, including creating secrets, configuring each Camunda component through Helm, and identifying token claims, see [Generic OIDC provider](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider). Complete that guide's steps alongside the Ping-specific steps on this page.


## Prerequisites

In addition to the [prerequisites for any OIDC provider](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#prerequisites), you'll need:

- Administrator access to your Ping environment with permission to create OAuth/OIDC applications.
- Your authorization server's discovery document URL:
  - **PingFederate:** `https://<pingfederate-host>/.well-known/openid-configuration`
  - **PingOne:** `https://auth.pingone.com/<environment-id>/as/.well-known/openid-configuration`

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/ping-identity
