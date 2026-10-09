# Dual-region setup (EKS) — 3. Deploy Camunda 8 via Helm charts — Camunda 8 Helm chart prerequisites

Within the cloned repository, navigate to `aws/kubernetes/eks-dual-region/helm-values`. This contains a dual-region example setup.

The approach is to work with layered Helm values files:

- Have a base `camunda-values.yml` that is generally applicable for both Camunda installations
- Two overlays that are for region 0 and region 1 installations

##### camunda-values.yml

This forms the base layer that contains the basic required setup, which applies to both regions.

Key changes of the dual-region setup:

- `global.security.authentication.method: basic`
  - Uses Basic authentication for inter-component communication since Management Identity (Keycloak) is not deployed in dual-region.
- `global.identity.auth.enabled: false`
  - Management Identity is not currently supported. For more details, see the [limitations section](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region#limitations) on the dual-region concept page.
- `identity.enabled: false`
  - Management Identity is currently not supported.
- `optimize.enabled: false`
  - Optimize is not currently supported and depends on Management Identity.
- `orchestration.exporters.zeebe.enabled: false`
  - Disables the automatic Elasticsearch Exporter configuration in the Helm chart. This exporter was previously used with Optimize and earlier setups.
- `orchestration.exporters.camunda.enabled: false`
  - Disables the automatic Camunda Exporter configuration in the Helm chart. Values are supplied manually through environment variables.
- `orchestration.env`
  - `CAMUNDA_CLUSTER_INITIALCONTACTPOINTS`
    - These are the contact points for the brokers to know how to form the cluster. Find more information on what the variable means in [setting up a cluster](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/setting-up-a-cluster).
  - `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION0_ARGS_CONNECT_URL`
    - The Elasticsearch endpoint for region 0 (the ECK-managed **headless** service, for example: `elasticsearch-es-masters` for a cluster named `elasticsearch`). The headless service is required because VPN/peering routes pod IPs, not ClusterIPs — so DNS must return individual pod addresses that are routable cross-cluster. You can discover the exact service name with `kubectl get svc -n <elasticsearch-namespace>`.
  - `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION1_ARGS_CONNECT_URL`
    - The Elasticsearch endpoint for region 1 (the ECK-managed **headless** service, for example: `elasticsearch-es-masters` for a cluster named `elasticsearch`).
  - `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION0_CLASSNAME`
    - `io.camunda.exporter.CamundaExporter` explicitly creates the new Camunda Exporter.
  - `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION1_CLASSNAME`
    - `io.camunda.exporter.CamundaExporter` explicitly creates the new Camunda Exporter.
  - `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION0_ARGS_CONNECT_USERNAME` / `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION0_ARGS_CONNECT_PASSWORD`
    - Elasticsearch authentication credentials for region 0. The password is sourced from the `elasticsearch-es-password-region-0` secret created by the [password synchronization step](#synchronize-elasticsearch-passwords-across-regions).
  - `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION1_ARGS_CONNECT_USERNAME` / `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION1_ARGS_CONNECT_PASSWORD`
    - Elasticsearch authentication credentials for region 1. The password is sourced from the `elasticsearch-es-password-region-1` secret.
- A cluster of eight Zeebe brokers (four in each of the regions) is recommended for the dual-region setup
  - `orchestration.clusterSize: 8`
  - `orchestration.partitionCount: 8`
  - `orchestration.replicationFactor: 4`
- Elasticsearch is managed via the ECK operator and configured through a separate manifest (`elasticsearch-cluster-dual-region.yml`), not via the Helm chart's built-in Elasticsearch subchart. The Elasticsearch overlay (`camunda-elastic-values.yml`) disables the built-in Bitnami subchart and configures the **local** Elasticsearch connection (URL and authentication) for components that **read** data (orchestration secondary storage, Optimize). This is distinct from the cross-cluster Elasticsearch exporter URLs configured via environment variables above, which handle **writing** data across regions.

##### region0/camunda-values.yml

This overlay contains the multi-region identification for the cluster in region 0. It sets `orchestration.partitioning.numberOfZones: 2` and `orchestration.partitioning.zoneIndex: 0`. These two keys replace the deprecated `global.multiregion.regions` and `global.multiregion.regionId`.

##### region1/camunda-values.yml

This overlay contains the multi-region identification for the cluster in region 1. It sets `orchestration.partitioning.numberOfZones: 2` and `orchestration.partitioning.zoneIndex: 1`. These two keys replace the deprecated `global.multiregion.regions` and `global.multiregion.regionId`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
