# Delete process definition data

The REST API to delete a process definition's analytics data from Optimize.

With the process definition data deletion API, you can delete all Optimize analytics data associated with a specific process definition, identified by its numeric process definition key.


## Functionality

This endpoint deletes Optimize's own data (process instances and the process definition) for the given process definition key. If this is the last remaining version of the process for its tenant, it also clears any cached process definition BPMN XML from reports that reference it.
It does not delete the process definition from the cluster. To remove a process definition from the cluster, use the [Delete resource](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/delete-resource.api) endpoint.
It also does not delete the underlying Elasticsearch or OpenSearch indices.
The request is processed asynchronously. The deletion is queued until a background job performs the actual data deletion.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/delete-process-definition-data
