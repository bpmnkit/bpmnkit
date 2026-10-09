# Kubernetes deployment overview — Architecture — Components (2)

Also included in this namespace is the component that deploys with the cluster release:

- [Connectors](https://docs.camunda.io/docs/next/components/connectors/introduction) — external system integrations

[Optimize](https://docs.camunda.io/docs/next/components/optimize/what-is-optimize) serves this cluster but is deployed as its own release, one per Physical Tenant. See [Optimize releases](#optimize-releases).

The Orchestration Cluster also depends on a **secondary storage** backend for Operate, Tasklist, and the v2 Orchestration Cluster REST API. This backend is a document store (Elasticsearch or OpenSearch) or a supported relational database management system (RDBMS). It is provisioned outside the `StatefulSet`, as a managed service or an operator-managed database. Optimize requires Elasticsearch or OpenSearch and cannot use an RDBMS. For the trade-offs and how to choose a backend, see [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture).

#### Optimize releases

Each Physical Tenant in an Orchestration Cluster is served by one Optimize release, deployed with `global.topology.mode: optimize`. That release deploys Optimize and nothing else.

One Optimize instance reads exported records from a single Elasticsearch or OpenSearch index prefix, so it can serve exactly one tenant. This applies to the default Physical Tenant too: a cluster with no additional tenants still needs one Optimize release if you want analytics.

Each Optimize release requires its own OIDC client, audience, redirect URL, and context path, and it connects to the same secondary storage the Orchestration Cluster exports to. Its reader prefix must exactly match that tenant's exporter writer prefix. Optimize requires Elasticsearch or OpenSearch and can't use an RDBMS.

Place Optimize releases in the Orchestration Cluster namespace or in their own namespace. Ingress resources are namespace-scoped, so a separate namespace needs its own Ingress and subdomain.

For configuration details, see [install an Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release) and [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants).

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
