# @bpmnkit/api — Resource Namespaces

Methods are grouped by resource, one property per tag of the API spec. The most used:

| Namespace | Methods (selection) |
|---|---|
| `client.resource` | createDeployment, getResource, deleteResource |
| `client.processInstance` | createProcessInstance, searchProcessInstances, getProcessInstance, cancelProcessInstance |
| `client.processDefinition` | searchProcessDefinitions, getProcessDefinition |
| `client.job` | activateJobs, completeJob, failJob, throwJobError |
| `client.incident` | searchIncidents, getIncident, resolveIncident |
| `client.variable` | searchVariables, getVariable |
| `client.message` | publishMessage, correlateMessage |
| `client.signal` | broadcastSignal |
| `client.decisionDefinition` | evaluateDecision, searchDecisionDefinitions |
| `client.userTask` | searchUserTasks, getUserTask, assignUserTask, completeUserTask |

Users, groups, roles, tenants, authorizations, documents, batch operations and the rest have
their own namespaces (`client.user`, `client.group`, …).

---
Source: https://bpmnkit.com/docs/packages/api
