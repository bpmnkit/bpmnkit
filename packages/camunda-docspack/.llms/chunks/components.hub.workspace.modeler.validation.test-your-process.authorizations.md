# Test your process — Authorizations

If [authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) are enabled on the cluster where you will run a test, the following permissions are required for each action:

| Resource Type       | Permission                                       | Allowed action                                                                                                  |
| ------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Resource            | CREATE                                           | Deploy a process                                                                                                |
| Process definition  | CREATE_PROCESS_INSTANCE                          | Start a process instance                                                                                        |
| Process definition  | READ_PROCESS_INSTANCE                            | View process instance(s)                                                                                        |
| Process definition  | READ_USER_TASK                                   | Get information about a user task                                                                               |
| Process definition  | UPDATE_USER_TASK                                 | Complete a user task                                                                                            |
| Process definition  | UPDATE_PROCESS_INSTANCE                          | Complete a service task, Throw error from a service task, Apply modifications, Set variables, Resolve incidents |
| Decision definition | READ_DECISION_DEFINITION, READ_DECISION_INSTANCE | View decision instance in Operate (SaaS only)                                                                   |
| Message             | CREATE                                           | Publish a message                                                                                               |

### Limitations {#authorizations-limitations}

- Fine-grained authorizations are not supported. If the **Resource ID** is not \* when defining authorizations, the user will not have access to any resources.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
