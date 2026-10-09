# Manage roles — Default roles

Management Identity includes a set of default roles that are available out-of-the-box. These roles are designed to cover common use cases and can be assigned to users and groups to grant them access to different management and modeling components.

The following table lists the default roles and their descriptions. `Web Modeler`/`Web Modeler Admin` and `Hub`/`Hub Admin` grant identical permissions, as do `Console` and `DevOps`. See [Management Identity roles and permissions](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#management-identity-roles-and-permissions) in the 8.9 to 8.10 upgrade guide for why both names exist:

| Name                | Description                                                                                                                                                                                                                                    |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default user role   | The role does not grant any permissions by default. It is applied to all users, including service accounts.                                                                                                                                    |
| Management Identity | Provides full access to [Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview).                                                                                                                                                                                 |
| Console             | Grants management access to Hub's cluster pages, without modeler-admin or people/org management access.                                                                                                                                        |
| DevOps              | Grants management access to Hub's cluster pages, without modeler-admin or people/org management access.                                                                                                                                        |
| Analyst             | Grants access to Hub for creating and collaborating on projects, management access to the catalog's usage and adoption data, and full access to [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview), without modeler-admin or people/org management access. |
| Optimize            | Grants full access to [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview).                                                                                                                                                                                  |
| Web Modeler         | Grants access to Hub for creating and collaborating on projects.                                                                                                                                                                               |
| Web Modeler Admin   | Grants full access to Hub, including all projects and the ability to manage workspace members.                                                                                                                                                 |
| Hub                 | Grants access to Hub for creating and collaborating on projects.                                                                                                                                                                               |
| Hub Admin           | Grants full access to Hub, including all projects and the ability to manage workspace members.                                                                                                                                                 |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/application-user-group-role-management/manage-roles
