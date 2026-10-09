# Helm chart dual-region operational procedure — Procedure — OpenShift

##### Deploy prerequisite services

Before installing Camunda via Helm, you must redeploy the ECK-managed Elasticsearch cluster and synchronize cross-region passwords. Without this, the Helm install will fail because there is no Elasticsearch to connect to.

1. From the `generic/kubernetes/operator-based/elasticsearch` folder, deploy the ECK operator and Elasticsearch cluster in the recreated region:

   ```bash
   cd generic/kubernetes/operator-based/elasticsearch
   export ELASTICSEARCH_CLUSTER_FILE="elasticsearch-cluster-dual-region.yml"
   CAMUNDA_NAMESPACE=$CAMUNDA_NAMESPACE_RECREATED KUBE_CONTEXT=$CLUSTER_RECREATED ./deploy.sh
   cd -
   ```

2. Wait for Elasticsearch to become ready. Verify the cluster health is `green` before proceeding:

   ```bash
   kubectl get elasticsearch --context $CLUSTER_RECREATED --namespace $CAMUNDA_NAMESPACE_RECREATED
   ```

3. From the `generic/openshift/dual-region/procedure` folder, re-synchronize the Elasticsearch passwords across regions:

   ```bash
   cd generic/openshift/dual-region/procedure
   ./sync-elasticsearch-passwords.sh
   cd -
   ```

   This recreates the cross-region password secrets (`elasticsearch-es-password-region-0` and `elasticsearch-es-password-region-1`) required by the Zeebe exporter configuration.

For more details on these steps, see [Deploy the ECK operator and Elasticsearch clusters](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region#deploy-the-eck-operator-and-elasticsearch-clusters) and [Synchronize Elasticsearch passwords across regions](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region#synchronize-elasticsearch-passwords-across-regions).

##### Install Camunda using Helm

Follow the installation steps for the **recreated region**:

- [Setting up the Camunda 8 Dual-Region Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region#configure-your-deployment-for-each-region) _Optional if you already have your pre-configured `generated-values-file.yml`_
- Once your values file is generated from the installation step, install **Camunda 8 only in the recreated region**. Adjust the installation command to disable Operate and Tasklist:

  ```bash
  --set orchestration.profiles.operate=false \
  --set orchestration.profiles.tasklist=false
  ```

**Important**
  The standalone Schema Manager must be disabled; otherwise, it will prevent a successful restore of the Elasticsearch backup later on. If you forget to disable it, you must manually remove all created indices in Elasticsearch in the restored region before restoring the backup.

  There is no Helm chart option for this setting. Because `orchestration.env` is an array, it cannot be overwritten through an overlay and must be added manually on a temporary basis.

  Edit the `generated-values-region-0|1.yaml` to include the following under `orchestration.env`:

  ```yaml
  orchestration:
    env:
      - name: CAMUNDA_DATABASE_SCHEMAMANAGER_CREATESCHEMA
        value: "false"
    # ...
  ```

  Example command adapted from the installation step:

  ```bash
  helm upgrade --install \
  "$CAMUNDA_RELEASE_NAME" camunda/camunda-platform \
  --version "$HELM_CHART_VERSION" \
  --kube-context "$CLUSTER_RECREATED" \
  --namespace "$CAMUNDA_NAMESPACE_RECREATED" \
  -f "<generated-values-region-0|1.yaml>" \
  --set orchestration.profiles.operate=false \
  --set orchestration.profiles.tasklist=false
  ```

  After successfully applying the recreated region, remove the temporary `CAMUNDA_DATABASE_SCHEMAMANAGER_CREATESCHEMA` environment variable again.

- [Follow the installation step for the **recreated region only**](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region#install-camunda-8-using-helm).

#### Verification

The following command will show the pods deployed in the newly created region.

```bash
kubectl --context $CLUSTER_RECREATED get pods -n $CAMUNDA_NAMESPACE_RECREATED
```

Half of the amount of your set `clusterSize` is used to spawn Zeebe brokers.

For example, in the case of `clusterSize: 8`, four Zeebe brokers are provisioned in the newly created region.

**Danger**
It is expected that the Zeebe Broker pods will not reach the "Ready" state since they are not yet part of a Zeebe cluster and, therefore, not considered healthy by the readiness probe.

Port-forwarding the Zeebe Gateway via `kubectl` and printing the topology should reveal that the new Zeebe brokers are recognized but yet a full member of the Zeebe cluster.

```bash
kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 8080:8080 -n $CAMUNDA_NAMESPACE_SURVIVING

curl -L -X GET 'http://localhost:8080/v2/topology' \
  -H 'Accept: application/json'
```

  Example output
  

```bash
{
  "brokers": [
    {
      "nodeId": 0,
      "host": "camunda-zeebe-0.camunda-zeebe.camunda-london",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 1,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 6,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 7,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 8,
          "role": "follower",
          "health": "healthy"
        }
      ],
      "version": "8.8.0"
    },
    {
      "nodeId": 1,
      "host": "camunda-zeebe-0.camunda-zeebe.camunda-paris",
      "port": 26501,
      "partitions": [],
      "version": "8.8.0"
    },
    {
      "nodeId": 2,
      "host": "camunda-zeebe-1.camunda-zeebe.camunda-london",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 1,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 2,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 3,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 8,
          "role": "leader",
          "health": "healthy"
        }
      ],
      "version": "8.8.0"
    },
    {
      "nodeId": 3,
      "host": "camunda-zeebe-1.camunda-zeebe.camunda-paris",
      "port": 26501,
      "partitions": [],
      "version": "8.8.0"
    },
    {
      "nodeId": 4,
      "host": "camunda-zeebe-2.camunda-zeebe.camunda-london",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 2,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 3,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 4,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 5,
          "role": "follower",
          "health": "healthy"
        }
      ],
      "version": "8.8.0"
    },
    {
      "nodeId": 5,
      "host": "camunda-zeebe-2.camunda-zeebe.camunda-paris",
      "port": 26501,
      "partitions": [],
      "version": "8.8.0"
    },
    {
      "nodeId": 6,
      "host": "camunda-zeebe-3.camunda-zeebe.camunda-london",
      "port": 26501,
      "partitions": [
        {
          "partitionId": 4,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 5,
          "role": "leader",
          "health": "healthy"
        },
        {
          "partitionId": 6,
          "role": "follower",
          "health": "healthy"
        },
        {
          "partitionId": 7,
          "role": "leader",
          "health": "healthy"
        }
      ],
      "version": "8.8.0"
    },
    {
      "nodeId": 7,
      "host": "camunda-zeebe-3.camunda-zeebe.camunda-paris",
      "port": 26501,
      "partitions": [],
      "version": "8.8.0"
    },
  ],
  "clusterSize": 4,
  "partitionsCount": 8,
  "replicationFactor": 2,
  "gatewayVersion": "8.8.0"
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
