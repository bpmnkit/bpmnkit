# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Multi-tenancy with an unprotected API

You can't combine `camunda.security.multi-tenancy.checks-enabled: true` with `camunda.security.authentication.unprotected-api: true`. If you do, the Orchestration Cluster pod fails with `Multi-tenancy is enabled ... but the API is unprotected`. Protect the API when you enable multi-tenancy.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
