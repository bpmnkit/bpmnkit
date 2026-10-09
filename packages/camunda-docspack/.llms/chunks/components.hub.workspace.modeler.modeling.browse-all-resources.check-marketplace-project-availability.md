# Find resources with Browse all — Check Marketplace project availability

The Marketplace connector details show which connector elements are already available in the current project.

| Status                                     | Meaning and next action                                                                                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Not added to this project**              | None of the connector's elements are in the project. Review **Included elements**, then select **Add to project**.                                                           |
| **N of M elements added to this project**  | Some elements are already available. You can use those elements immediately or select **Add remaining elements**.                                                            |
| **Added to this project**                  | The connector's applicable elements appear under **Available elements** with direct **Create**, **Append**, or **Change** actions.                                           |
| **Not available for this modeling action** | The connector is in the project, but none of its elements apply to the action you started. The details identify compatible element types when that information is available. |

![Marketplace connector details showing elements available in the project with direct Create actions](./img/browse-all-marketplace-available-elements.png)

Adding a connector can open an import review when files need your attention, for example because of a conflict or target-version compatibility warning. After a successful add, the details refresh and show the newly available elements.

The Marketplace serves the latest connector template version. Review [connector template version compatibility](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/camunda-marketplace#connector-template-versions) if the latest version doesn't support your target Camunda version.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/browse-all-resources
