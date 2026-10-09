# Kubernetes deployment overview — Architecture — Components

Camunda 8 deployments separate workloads into three logical groups, each installed as its own Helm release with a `global.topology.mode` role:

- **Hub plane:** Camunda Hub and Management Identity (`hub`)
- **Execution plane:** Orchestration Cluster and Connectors (`orchestration`)
- **Optimize**, one release per Physical Tenant (`optimize`)

Deploy these groups into separate [Kubernetes namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/). This separation gives each group an independent lifecycle, improves isolation, and allows flexible scaling. Deploying all components in a single `combined` release remains supported, and suits evaluation and smaller environments.

Separate releases enable:

- Independent scaling, upgrade, and removal of each Orchestration Cluster
- Shared access to centralized components such as Management Identity
- A separate Optimize instance per Physical Tenant, each reading its own index prefix

For the release roles and the reasoning behind the split, see [Camunda 8.10 deployment topology](https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology). To implement it with the Helm chart, see [install the deployment topology](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index).

#### Orchestration Cluster namespace

As shown in the [architecture diagram](#orchestration-cluster), the Orchestration Cluster is deployed as a StatefulSet and packaged as a single container image. It includes the following components:

- [Zeebe](https://docs.camunda.io/docs/next/components/zeebe/zeebe-overview) — workflow engine and broker
- [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction) — visibility and troubleshooting UI
- [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist) — UI for human tasks
- [Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview) — authentication and access control

Also included in this namespace is the component that deploys with the cluster release:

- [Connectors](https://docs.camunda.io/docs/next/components/connectors/introduction) — external system integrations

[Optimize](https://docs.camunda.io/docs/next/components/optimize/what-is-optimize) serves this cluster but is deployed as its own release, one per Physical Tenant. See [Optimize releases](#optimize-releases).

The Orchestration Cluster also depends on a **secondary storage** backend for Operate, Tasklist, and the v2 Orchestration Cluster REST API. This backend is a document store (Elasticsearch or OpenSearch) or a supported relational database management system (RDBMS). It is provisioned outside the `StatefulSet`, as a managed service or an operator-managed database. Optimize requires Elasticsearch or OpenSearch and cannot use an RDBMS. For the trade-offs and how to choose a backend, see [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture).

#### Camunda Hub namespace

As shown in the [architecture diagram](#camunda-hub), this namespace contains:

- [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/index) — modeling and administrative capabilities
- [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview) — centralized access control for Camunda Hub and Optimize

This namespace also requires an OIDC-compatible Identity Provider (IdP) for Management Identity. You can use any compatible provider (for example, Keycloak deployed via the [Keycloak Operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) or Microsoft Entra ID).

**Tip: Why isn't an IdP included by default?**
The choice of identity provider is highly specific to each organization's security requirements, existing infrastructure, and compliance needs. Rather than bundling a default IdP that may not match your setup, the reference architecture leaves this choice to you. This approach gives you full control over your authentication stack and avoids unnecessary complexity for teams that already have an IdP in place.

**Warning: Identity separation**
Optimize and Camunda Hub rely on Management Identity (formerly Identity). This service is separate from the embedded Admin in the Orchestration Cluster and incompatible with it. To share the same user base and API clients across both, you must use OIDC.

For configuration details, see:

- [Connect Orchestration Cluster to an OIDC provider](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster#oidc)
- [Connect Management Identity to an OIDC provider](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider)

The Orchestration Cluster can be configured to authenticate with OIDC by connecting to the Management Identity service deployed in this namespace.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
