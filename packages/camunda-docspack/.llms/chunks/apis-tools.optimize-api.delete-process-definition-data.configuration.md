# Delete process definition data — Configuration

In Self-Managed, enable the job registry dispatcher so queued deletion requests get processed. See [Process definition data deletion](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/process-definition-deletion) for the required configuration.


## Usage notes

Deleting a process definition's data does not automatically update reports, dashboards, or alerts that reference it.
Aside from clearing any cached process definition BPMN XML on a report, these entities are left as-is.
Manually update or remove any reports, dashboards, or alerts that reference a deleted process definition.


## Method & HTTP target resource

DELETE `/api/public/process-definition/{processDefinitionKey}`

Where `processDefinitionKey` is the numeric key of the process definition whose Optimize data you want to delete.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/delete-process-definition-data
