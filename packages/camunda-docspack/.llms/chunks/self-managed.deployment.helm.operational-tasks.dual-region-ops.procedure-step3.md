# Helm chart dual-region operational procedure — Procedure — step3

#### Pause Camunda exporters to Elasticsearch

| **Details**   | **Current state**                                                                                                                                                                                                                                                                                                                                                      | **Desired state**                                                                                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Camunda 8** | The Orchestration Cluster is operating in a single region: Isolated to a [Zeebe cluster](https://docs.camunda.io/docs/next/reference/glossary#zeebe-cluster) in the surviving region.Non-participating [Zeebe Brokers](https://docs.camunda.io/docs/next/reference/glossary#zeebe-broker) in the recreated region.Data is currently being exported to Elasticsearch from the surviving region. | Preparing the newly created region to take over and restore the dual-region setup. Stop Camunda exporters to prevent new data from being exported to Elasticsearch, allowing an Elasticsearch backup to be created. |

**Note**

This step **does not** affect process instances. Process information may not be visible in Operate and Tasklist running in the affected instance.

#### Procedure

1. Disable the Camunda Exporter exporters in Zeebe using kubectl and the [exporting API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#exporting-api):

   ```bash
   kubectl --context $CLUSTER_SURVIVING port-forward services/$CAMUNDA_RELEASE_NAME-zeebe-gateway 9600:9600 -n $CAMUNDA_NAMESPACE_SURVIVING
   curl -i localhost:9600/actuator/exporting/pause -XPOST
   # The successful response should be:
   # HTTP/1.1 204 No Content
   ```

#### Verification

There is no API available to confirm the status of the Camunda exporters. A response code of `204` indicates that the disabling was successful. This is a synchronous operation.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
