# Helm chart dual-region operational procedure — Procedure — step6

#### Reactivate Camunda exporter

| **Details**   | **Current state**                                                                                                                                          | **Desired state**                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Camunda 8** | Not reachable yet by end-users and currently not exporting any data. Exporters are enabled for both regions, with the operation confirmed to be completed. | Reactivate existing exporters that will allow Zeebe to export data to Elasticsearch again. |

#### How to get there

1. Reactivate the exporters by sending the [exporting API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#exporting-api) activation request via the Zeebe Gateway:

   ```bash
   kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 9600:9600 -n $CAMUNDA_NAMESPACE_SURVIVING
   curl -i localhost:9600/actuator/exporting/resume -XPOST
   # The successful response should be:
   # HTTP/1.1 204 No Content
   ```

#### Verification

There is currently no API available to confirm the reactivation of the exporters. Only the response code `204` indicates a successful resumption. This is a synchronous operation.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
