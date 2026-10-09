# Starting processes — Not seeing a process

There could be multiple reasons why you are not seeing any process in the **Processes** tab:

- There is no process deployed to your environment.

- Permissions to start a process are managed via [Authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations). It is likely your user does not yet have privileges to create process instances.

For all the above scenarios, contact your administrator to understand why no processes are displayed.


## Public start forms

Public start forms were removed in Camunda 8.10 together with Tasklist V1.

To start processes with forms in the current version, use authenticated Tasklist starts, or build your own public-facing application with [Camunda Forms](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/utilize-forms) and the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

---
Source: https://docs.camunda.io/docs/next/components/tasklist/userguide/starting-processes
