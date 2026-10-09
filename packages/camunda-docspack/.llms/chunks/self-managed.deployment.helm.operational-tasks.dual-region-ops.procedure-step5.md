# Helm chart dual-region operational procedure — Procedure — step5

#### Initialize new Camunda exporter to the recreated region

| **Details**              | **Current state**                                               | **Desired state**                                                                                                                                                                                                                            |
| ------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Camunda 8**            | Remains unreachable by end-users while restoring functionality. | Start a new exporter to the recreated region. Ensure that both Elasticsearch instances are populated for data redundancy.  Separate the initialization step (asynchronous) and confirm completion before resuming the exporters. |
| **Elasticsearch Backup** | Backup has been created and restored to the recreated region.   | N/A                                                                                                                                                                                                                                          |

**Info**

If you have upgraded from a previously migrated 8.7 system, you may still have the legacy `elasticsearchregion0` and `elasticsearchregion1` exporters configured.

- If **both exporters are disabled**, you can safely ignore them.
- If the old exporter is **enabled** in the survived region (for example, because you’re using **Optimize**), apply the same logic to these exporters as described for the new ones in this guide.

#### How to get there

1. Initialize the new exporter for the recreated region by sending an API request via the Zeebe Gateway:

   ```bash
   kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 9600:9600 -n $CAMUNDA_NAMESPACE_SURVIVING
   curl -XPOST 'http://localhost:9600/actuator/exporters/camundaregion1/enable' -H 'Content-Type: application/json' -d '{"initializeFrom" : "camundaregion0"}'
   ```

#### Verification

Port-forwarding the Zeebe Gateway via `kubectl` for the REST API and listing all exporters will reveal their current status.

```bash
kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 9600:9600 -n $CAMUNDA_NAMESPACE_SURVIVING
curl -XGET 'http://localhost:9600/actuator/exporters'
```

  Example output
  

```bash
[{"exporterId":"camundaregion0","status":"ENABLED"},{"exporterId":"camundaregion1","status":"ENABLED"}]
```

  

You can also check the status of the change using the Cluster API via the already port-forwarded Zeebe Gateway.

**Ensure the status is "COMPLETED" before proceeding with the next step.**

```bash
curl -XGET 'http://localhost:9600/actuator/cluster' | jq .lastChange
```

  Example output
  

```bash
{
  "id": 6,
  "status": "COMPLETED",
  "startedAt": "2024-08-23T12:54:07.968549269Z",
  "completedAt": "2024-08-23T12:54:09.282558853Z"
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
