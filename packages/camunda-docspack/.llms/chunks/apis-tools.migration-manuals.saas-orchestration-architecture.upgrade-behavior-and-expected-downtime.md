# SaaS orchestration architecture — Upgrade behavior and expected downtime

When a Camunda 8 SaaS Orchestration Cluster is upgraded from 8.8 to 8.9:

1. The existing Operate and Tasklist components are shut down.
2. The unified orchestration service starts in their place.
3. Endpoint routing is updated so legacy hostnames continue to resolve while the new `*.api.*` endpoints become active.

### Impact during upgrade

- **Web UIs and REST API:** You should expect a short interruption while the old services are removed and the unified service becomes ready. This affects all services, but not the Zeebe brokers.
- **Workflow execution (Zeebe brokers):** Designed to remain running throughout the upgrade. The primary impact is limited to UI and API availability, not to engine execution state.

To upgrade, initiate the cluster upgrade to 8.9 from Camunda Console. No additional steps are required beyond the URL and credential recommendations above.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/saas-orchestration-architecture
