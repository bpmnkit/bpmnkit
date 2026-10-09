# Find resources with Browse all — Use a resource

Each result card identifies the resource, its source, and the action you can take.

- Select **Create**, **Append**, or **Change** to use a resource directly.
- Select **View options** when a connector or category contains operations, then choose the operation you need.
- An unavailable card explains why it can't be used for the current element and doesn't offer an action.


## Browse Marketplace connectors

Marketplace is the final section and contains the complete collection that matches the current search and modeling context.

Browsing, filtering, searching, or scrolling Marketplace cards doesn't check which connectors are already in your project. Select **View details** on a connector to check only that connector and review its project availability.

Marketplace applies BPMN type filtering based on the modeling action:

- **Create** and **Append**: Results aren't filtered by BPMN type.
- **Change**: For a supported change-element action, results are filtered by Marketplace's supported BPMN type. User tasks and service tasks use the broader task type.

Showing a connector doesn't guarantee it is compatible with your configuration or runtime.

A self-hosted connector card opens **View setup instructions** instead of connector details. Follow the linked setup guide to make the connector available in your environment.

If Marketplace can't load after automatically retrying a temporary problem, your local choices remain available and you can select **Try again**. If a refresh fails after Marketplace has loaded, the previously loaded cards remain visible while you retry.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/browse-all-resources
