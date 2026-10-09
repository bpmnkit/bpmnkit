# Access control

Grant users access to work with Operate.

If authorization control is enabled for your Orchestration Cluster, users require the following authorizations to work with Operate.

**Note**
You can assign these [in the Admin UI](https://docs.camunda.io/docs/next/components/admin/authorization#create-an-authorization-in-admin). See [the introduction to authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#available-resources) for a list of all available authorizations.


## Mandatory authorizations

The following mandatory authorizations are required to work with Operate:

| Authorization type                             | Resource type        | Resource ID                                                                        | Permission                                         |
| :--------------------------------------------- | :------------------- | :--------------------------------------------------------------------------------- | :------------------------------------------------- |
| Component access for Operate                   | `Component`          | `operate` or `*` (for access to all web components).                               | `ACCESS`                                           |
| View process definitions and process instances | `Process Definition` | ID of the respective BPMN process definition or `*` (for all process definitions). | `READ_PROCESS_DEFINITION`, `READ_PROCESS_INSTANCE` |

---
Source: https://docs.camunda.io/docs/next/components/operate/overview/access-control
