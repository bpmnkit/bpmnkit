# Kubernetes deployment overview — Architecture — Components (2)

#### Optimize releases

Each Physical Tenant in an Orchestration Cluster is served by one Optimize release, deployed with `global.topology.mode: optimize`. That release deploys Optimize and nothing else.

One Optimize instance reads exported records from a single Elasticsearch or OpenSearch index prefix, so it can serve exactly one tenant. This applies to the default Physical Tenant too: a cluster with no additional tenants still needs one Optimize release if you want analytics.

Each Optimize release requires its own OIDC client, audience, redirect URL, and context path, and it connects to the same secondary storage the Orchestration Cluster exports to. Its reader prefix must exactly match that tenant's exporter writer prefix. Optimize requires Elasticsearch or OpenSearch and can't use an RDBMS.

Place Optimize releases in the Orchestration Cluster namespace or in their own namespace. Ingress resources are namespace-scoped, so a separate namespace needs its own Ingress and subdomain.

For configuration details, see [install an Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release) and [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants).

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
