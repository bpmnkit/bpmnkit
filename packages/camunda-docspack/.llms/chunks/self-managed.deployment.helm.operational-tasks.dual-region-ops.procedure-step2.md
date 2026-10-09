# Helm chart dual-region operational procedure — Procedure — step2

#### Configure Zeebe to disable the Elastic exporter to the lost region

| **Details**             | **Current state**                                                                                                                                           | **Desired state**                                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Zeebe configuration** | Zeebe brokers in the surviving region are still configured to point to the Elasticsearch instance of the lost region. Zeebe cannot continue exporting data. | Elasticsearch exporter to the failed region has been disabled in the Zeebe cluster. Zeebe can export data to Elasticsearch again. |
| **User interaction**    | Regular interaction with Camunda 8 is not restored.                                                                                                         | Regular interaction with Camunda 8 is restored, marking the conclusion of the temporary recovery.                                 |

**Info**

If you have upgraded from a previously migrated 8.7 system, you may still have the legacy `elasticsearchregion0` and `elasticsearchregion1` exporters configured.

- If **both exporters are disabled**, you can safely ignore them.
- If they are **enabled** (for example, because you’re using **Optimize**), apply the same logic to these exporters as described for the new ones in this guide.

#### Procedure

1. Port-forward the service of the Zeebe Gateway for the [management REST API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway#managementserver)

   ```bash
   kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 9600:9600 -n $CAMUNDA_NAMESPACE_SURVIVING
   ```

2. List all exporters to find the corresponding ID. Alternatively, you can check your Helm chart `camunda-values.yml` file, which lists the exporters as those that had to be configured explicitly.

   ```bash
   curl -XGET 'http://localhost:9600/actuator/exporters'
   ```

   
   Example output
   

   ```bash
   [{"exporterId":"camundaregion0","status":"ENABLED"},{"exporterId":"camundaregion1","status":"ENABLED"}]
   ```

   
   

3. Based on the Exporter APIs you will send a request to the Zeebe Gateway to disable the Elasticsearch exporter connected with the lost region.

   ```bash
   curl -XPOST 'http://localhost:9600/actuator/exporters/camundaregion1/disable'
   ```

#### Verification

Port-forwarding the Zeebe Gateway via `kubectl` for the REST API and listing all exporters will reveal their current status.

```bash
kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 9600:9600 -n $CAMUNDA_NAMESPACE_SURVIVING
curl -XGET 'http://localhost:9600/actuator/exporters'
```

  Example output
  

```bash
[{"exporterId":"camundaregion0","status":"ENABLED"},{"exporterId":"camundaregion1","status":"DISABLED"}]
```

  

Via the already port-forwarded Zeebe Gateway, you can also check the status of the change by using the Cluster API.

```bash
curl -XGET 'http://localhost:9600/actuator/cluster' | jq .lastChange
```

  Example output
  

```bash
{
  "id": 4,
  "status": "COMPLETED",
  "startedAt": "2024-08-23T11:36:14.127510679Z",
  "completedAt": "2024-08-23T11:36:14.379980715Z"
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
