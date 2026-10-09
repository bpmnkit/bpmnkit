# Access control

Grant users access to work with Tasklist.

If authorization control is enabled for your Orchestration Cluster, users require the following authorizations to work with Tasklist.

**Note**
You can assign these [in the Admin UI](https://docs.camunda.io/docs/next/components/admin/authorization#create-an-authorization-in-admin). See [the introduction to authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#available-resources) for a list of all available authorizations.


## Mandatory authorizations

The following mandatory authorizations are required to work with Tasklist:

| Authorization type             | Resource type        | Resource ID                                                                        | Permission       |
| :----------------------------- | :------------------- | :--------------------------------------------------------------------------------- | :--------------- |
| Component access for Tasklist. | `Component`          | `tasklist` or `*` (for access to all web components).                              | `ACCESS`         |
| Read user tasks.               | `Process Definition` | ID of the respective BPMN process definition or `*` (for all process definitions). | `READ_USER_TASK` |

---
Source: https://docs.camunda.io/docs/next/components/tasklist/userguide/access-control
