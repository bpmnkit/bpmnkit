# Find resources with Browse all — Search and filter resources

The search field and **Show** control narrow the cards available for the current modeling action.

- Search matches resource names, descriptions, groups, and connector operations. A matching operation appears directly in the results.
- The summary, **Show** choices, and section badges report how many cards are currently visible. Counts update with your search and source selection.
- Browse all orders results automatically and doesn't include a manual sort control. Reusable asset groups appear before standard BPMN elements, and Marketplace appears last. Choices you can use appear before unavailable choices in each section.
- Marketplace name matches appear before description matches. Connectors with the same search relevance are ordered by name.

The **Show** control contains **All** and the sources available in your environment:

| Source                | Contents                                                                                                                                                                                    | Availability                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Catalog**           | Governed assets published through the [Camunda catalog](https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started).                                                                    | Appears when the catalog is enabled and matching assets are available.                                                                                                                |
| **Shared**            | Element templates published directly to your organization's shared resources. This source is separate from the catalog.                                                                     | Appears when matching shared templates are available.                                                                                                                                 |
| **Project assets**    | Templates and connectors published or added to the current project, plus linked project resources such as forms, called processes, decisions, and robotic process automation (RPA) scripts. | Appears when matching project resources are available.                                                                                                                                |
| **Built-in**          | Camunda's built-in connectors.                                                                                                                                                              | Appears when built-in connectors are available. This source isn't available in Self-Managed.                                                                                          |
| **Standard elements** | The untemplated BPMN vocabulary valid for the current action, including tasks, gateways, events, and other native modeling choices.                                                         | Appears when matching standard BPMN elements are available.                                                                                                                           |
| **Marketplace**       | Connectors from Camunda Marketplace.                                                                                                                                                        | Appears when Marketplace supports the current action. A Self-Managed administrator can [disable Marketplace](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#feature-flags). |

Resource cards identify catalog and shared provenance with the **Catalog assets** and **Shared assets** badges.

A source with no matches is hidden. If a search reduces the active source to zero matches, the source remains selected with a count of zero so your filter doesn't change unexpectedly.

![Browse all results grouped into processes, shared services, and project services](./img/browse-all-resources.png)

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/browse-all-resources
