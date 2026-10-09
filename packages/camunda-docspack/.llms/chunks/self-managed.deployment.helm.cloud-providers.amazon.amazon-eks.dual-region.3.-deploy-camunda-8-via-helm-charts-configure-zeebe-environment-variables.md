# Dual-region setup (EKS) — 3. Deploy Camunda 8 via Helm charts — Configure Zeebe environment variables

**Caution**
You must change the following environment variables for Zeebe. The default values will not work for you and are only for illustration.

The base `camunda-values.yml` in `aws/kubernetes/eks-dual-region/helm-values` requires adjustments before installing the Helm chart:

- `CAMUNDA_CLUSTER_INITIALCONTACTPOINTS`
- `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION0_ARGS_CONNECT_URL`
- `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION1_ARGS_CONNECT_URL`

1. The bash script [generate_zeebe_helm_values.sh](https://github.com/camunda/camunda-deployment-references/tree/main/aws/kubernetes/eks-dual-region/procedure/generate_zeebe_helm_values.sh) in the repository folder `aws/kubernetes/eks-dual-region/procedure/` helps generate those values. You only have to copy and replace them within the base `camunda-values.yml`. It uses the exported environment variables of the [export environment variables](#export-environment-variables) section for namespaces and regions. The script derives the number of Zeebe Brokers from your Helm values. For a dual-region setup, the default is `8` (four brokers per region).

```bash
./generate_zeebe_helm_values.sh
```

  Example output

**Danger**
For illustration purposes only. These values will not work in your environment.

```bash
./generate_zeebe_helm_values.sh

Use the following to set the environment variable CAMUNDA_CLUSTER_INITIALCONTACTPOINTS in the base Camunda Helm chart values file for Zeebe:

- name: CAMUNDA_CLUSTER_INITIALCONTACTPOINTS
  value: camunda-zeebe.camunda-london.svc.cluster.local:26502,camunda-zeebe.camunda-paris.svc.cluster.local:26502

Use the following to set the environment variable CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION0_ARGS_CONNECT_URL in the base Camunda Helm chart values file for Zeebe:

- name: CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION0_ARGS_CONNECT_URL
  value: http://elasticsearch-es-masters.camunda-london.svc.cluster.local:9200

Use the following to set the environment variable CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION1_ARGS_CONNECT_URL in the base Camunda Helm chart values file for Zeebe.

- name: CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION1_ARGS_CONNECT_URL
  value: http://elasticsearch-es-masters.camunda-paris.svc.cluster.local:9200
```

2. As the script suggests, replace the environment variables within `camunda-values.yml`.

**Note**
The script generates only the environment-specific values (initial contact points and Elasticsearch URLs). The authentication variables (`CAMUNDA_DATA_EXPORTERS_*_ARGS_CONNECT_USERNAME` / `CAMUNDA_DATA_EXPORTERS_*_ARGS_CONNECT_PASSWORD`) use the cross-region secrets created in the [password synchronization step](#synchronize-elasticsearch-passwords-across-regions) and do not require modification.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
