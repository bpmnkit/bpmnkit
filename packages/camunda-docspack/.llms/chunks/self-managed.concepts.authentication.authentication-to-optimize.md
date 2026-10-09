# Optimize authentication in Self-Managed

Learn how Optimize authenticates users and API requests in Self-Managed, and what changes when upgrading from Camunda 8.9 to 8.10.


## About Optimize authentication

[Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview) authenticates against an external OIDC identity provider (IdP). Optimize doesn't offer Basic authentication as a login method.

Starting with Camunda 8.10, authentication is unified across the Camunda components: Optimize is configured with the same `camunda.security.*` settings as the [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster).

**Tip: Recommendation**
If you've already configured [OIDC for the Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster#oidc), use the same identity provider for Optimize. This gives your users a single login experience across both components.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-optimize
