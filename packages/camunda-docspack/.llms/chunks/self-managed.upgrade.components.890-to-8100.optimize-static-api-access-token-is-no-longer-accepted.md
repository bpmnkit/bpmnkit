# Upgrade Camunda components from 8.9 to 8.10 — Optimize — Static API access token is no longer accepted

In 8.10, Optimize accepts only OIDC bearer tokens on its API. Directly after the upgrade, Optimize rejects each request that carries the static token from `api.accessToken` (environment variable `OPTIMIZE_API_ACCESS_TOKEN`) with a `401` response. This applies to the [Optimize API](https://docs.camunda.io/docs/next/apis-tools/optimize-api/overview) and to the [external variable ingestion](https://docs.camunda.io/docs/next/apis-tools/optimize-api/external-variable-ingestion) endpoint. The Camunda Helm chart and Camunda 8 SaaS do not set `api.accessToken`. They configure OIDC for the Optimize API. You are affected only if you set the property or the `OPTIMIZE_API_ACCESS_TOKEN` environment variable yourself, for example as an Optimize property override or an extra environment variable in your Helm values, or in a manual or Docker Compose installation.

Optimize logs an obsolete-property warning for the environment variable, but not for the YAML key. Check your YAML configuration for `api.accessToken` too.

**Action:** Change the API clients that send the static token to [OIDC bearer tokens](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) before you upgrade. Then remove `api.accessToken` and `OPTIMIZE_API_ACCESS_TOKEN` from your configuration. If you need more time, set `optimize.security.csl.enabled=false`. This opts into the 8.9 component-specific configuration fallback, and the static token works again. Camunda plans to remove this fallback and the component-specific configuration keys in a future release.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
