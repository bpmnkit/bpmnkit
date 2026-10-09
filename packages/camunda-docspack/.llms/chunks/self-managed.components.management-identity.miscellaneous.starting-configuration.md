# Starting configuration for Identity

Understand the set of base configurations to operate Identity correctly.

Identity requires a set of base configurations to operate correctly. When Identity is started, it will create or update the following entities in Keycloak.


## Clients

| Name                             | Client ID                        | Service accounts | Created/updated with component |
| :------------------------------- | :------------------------------- | :--------------- | :----------------------------- |
| Identity                         | camunda-identity                 | enabled          | All                            |
| Camunda Identity Resource Server | camunda-identity-resource-server | enabled          | All                            |
| Operate                          | operate                          | enabled          | Operate                        |
| Operate API                      | operate-api                      | enabled          | Operate                        |
| Optimize                         | optimize                         | enabled          | Optimize                       |
| Optimize API                     | optimize-api                     | enabled          | Optimize                       |
| Tasklist                         | tasklist                         | enabled          | Tasklist                       |
| Tasklist API                     | tasklist-api                     | enabled          | Tasklist                       |
| Hub                              | web-modeler                      | disabled         | Hub                            |
| Hub API                          | web-modeler-api                  | enabled          | Hub                            |

The Hub client IDs (`web-modeler`, `web-modeler-api`) are retained for backward compatibility with existing Web Modeler installations.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/starting-configuration
