# Install the Camunda 8.10 deployment topology — Before you begin

Prepare the following resources:

- An OpenID Connect (OIDC) provider that every namespace can reach, with a pinned issuer. The examples use an external Keycloak instance with Management Identity-managed client registration.
- Separate public hostnames and TLS certificates for the Hub and orchestration namespaces.
- External PostgreSQL databases for Management Identity and Camunda Hub.
- A supported secondary storage backend for the Orchestration Cluster, and Elasticsearch or OpenSearch for Optimize.
- Network policies that permit Domain Name System (DNS) traffic and the required cross-namespace service traffic.

Camunda 8.10 bundles no Elasticsearch, PostgreSQL, or Keycloak subcharts, so these must exist before you install. See [deploy required dependencies](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure).

The examples use `camunda` as the release name in every namespace, `hub` as the Hub namespace, and `orchestration` as the orchestration namespace. If you change a release name or namespace, update every Kubernetes service name that references it.

Select supported chart versions from the [Helm chart version matrix](https://helm.camunda.io/camunda-platform/version-matrix/), then set them before installation. The Hub and Optimize releases always use the 8.10 (15.x) chart. Each Orchestration Cluster release uses the chart for its own Camunda version:

```sh
export HUB_CHART_VERSION=<15.x-chart-version>
export ORCHESTRATION_CHART_VERSION=<chart-version-for-this-cluster>
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index
