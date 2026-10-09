# SaaS orchestration architecture

Learn about the new streamlined SaaS orchestration architecture in Camunda 8.9.


## About

Camunda 8.9 introduces a streamlined SaaS orchestration architecture. The runtime for Operate, Tasklist, Identity (Admin), and the Zeebe REST API is unified into a single orchestration service. Zeebe brokers continue to run separately and execute workflows as before.

This is a topology change in SaaS only and does not affect Self-Managed deployments.

What's new:

- [Unified API domain for Orchestration Clusters](#unified-api-domain-for-orchestration-clusters). Legacy hostnames are deprecated but will remain available throughout 8.9 and are scheduled for removal in 8.10.
- [Web app URLs require an explicit application path.](#web-app-urls-require-an-explicit-application-path) The cluster base URL no longer redirects to Operate, Tasklist, or Admin automatically.
- [Client credentials for new clusters use unified API URLs.](#client-credentials-and-legacy-hostnames)
- [Cluster Metrics endpoint: `service` labels have changed on Orchestration Cluster metrics.](#service-label-changes)

What didn't change:

- The same UIs for Operate, Tasklist, and Admin/Identity and the REST API remain available, although web app URLs now [require an explicit application path](#web-app-urls-require-an-explicit-application-path).
- The Zeebe gRPC endpoint is unchanged.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/saas-orchestration-architecture
