# Install the Camunda Hub release

Install the management plane: a Helm release with global.topology.mode set to hub, running Camunda Hub and Management Identity.

The Hub release is the [management plane](https://docs.camunda.io/docs/next/reference/glossary#management-plane). It runs Camunda Hub and Management Identity and owns the inventory of every Orchestration Cluster in the deployment.

When creating a new topology, install the Hub release before its Orchestration Cluster releases. For the prerequisites, Secrets, and network policies this page assumes, see [install the deployment topology](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index).


## What a Hub release deploys

A Hub release runs Camunda Hub and Management Identity, and nothing else. It always uses the 8.10 chart, even when it manages Orchestration Clusters on older chart versions. Upgrading from 8.9? See [upgrade Camunda 8.9 to 8.10 using Helm](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100).

After you [create `hub-values.yaml`](#create-hub-valuesyaml), the release role it sets, `global.topology.mode: hub`, suppresses the chart's Orchestration Cluster, Optimize, and Connectors workloads, so you don't configure them here. The chart checks the following:

| Requirement                                           | Reason                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| `identity.enabled: true`                              | Management Identity runs in this release, and only in this release |
| OIDC authentication                                   | Hub topology connections are represented with OIDC bearer tokens   |
| The only release declaring `global.topology.clusters` | One authoritative inventory prevents client and endpoint drift     |

The chart fails the render with a `[camunda][error]` message if any of these is missing.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release
