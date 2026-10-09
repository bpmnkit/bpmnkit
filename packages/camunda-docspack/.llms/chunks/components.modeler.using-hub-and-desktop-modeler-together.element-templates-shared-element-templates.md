# Using Camunda Hub and Desktop Modeler together — Element templates — Shared element templates

| Desktop Modeler                                                                                                                                    | Camunda Hub                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Templates can be installed as [global templates](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/configuring-templates#global-templates). | Templates are published to the [organization](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates) or the [catalog](https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started) for reuse across workspaces. |

Camunda recommends storing shared templates in a separate repository:

- **Desktop Modeler**: Copy templates manually into your global directory.
- **Camunda Hub**: Use a [CI/CD pipeline](https://docs.camunda.io/docs/next/components/best-practices/cicd-guidelines/element-templates-at-scale) to sync templates with your repository via the [Camunda Hub API](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/overview).

---
Source: https://docs.camunda.io/docs/next/components/modeler/using-hub-and-desktop-modeler-together
