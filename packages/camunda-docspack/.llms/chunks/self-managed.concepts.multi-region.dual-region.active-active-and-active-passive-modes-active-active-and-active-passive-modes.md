# Dual-Region — Active-active and active-passive modes {#active-active-and-active-passive-modes}

Starting in Camunda 8.9, **active-active** is the default user traffic routing for dual-region deployments:

- **Active-active**: Both regions serve user traffic simultaneously. All writes flow through the Camunda Exporter, which maintains data consistency regardless of which region handles the request. This is the default with v2 REST API and Tasklist V2 (8.9+).
- **Active-passive**: One region handles all user traffic; the other is operational but doesn't serve user requests. Required for deployments using v1 APIs, because v1 stores some state locally per region (batch operations, task assignments).

In both modes, both regions participate in data processing and replication at all times. "Passive" refers only to the user traffic layer.

**Info: Active-active <a id="active-active"></a>**

Starting in Camunda 8.8, the **v2 REST API** removed previous region-specific limitations. In current releases, Tasklist also uses only the Orchestration Cluster REST API, so user task operations are no longer tied to the legacy Tasklist V1 behavior. These improvements make a user-facing **active-active** setup possible. Starting with version 8.9, **active-active** routing is the default for dual-region deployments.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
