# Migrate from Web Modeler to the Camunda Hub API — General changes — Base URLs

The base URL has changed for both SaaS and Self-Managed deployments. Update any hardcoded URLs or environment variables in your integration.

| Environment  | Web Modeler API v1                        | Camunda Hub API v2                    |
| ------------ | ----------------------------------------- | ------------------------------------- |
| SaaS         | `https://modeler.cloud.camunda.io/api/v1` | `https://hub.cloud.camunda.io/api/v2` |
| Self-Managed | `http://localhost:8070/api/v1`            | `http://localhost:8088/api/v2`        |

In Camunda 8 Self-Managed, the URLs depend on your configuration. The URLs and ports provided in this table are examples based on a [no-domain Helm deployment to a local kind cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind#no-domain-mode-deployment).

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
