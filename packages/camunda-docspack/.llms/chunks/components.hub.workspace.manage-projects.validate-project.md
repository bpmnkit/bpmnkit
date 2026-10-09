# Validate your project

Validate your project in development before deploying it to your target environment.

Validate your project in development before deploying it to your target environment.


## Prerequisites

Before you begin:

- Make sure you've [set up a project](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/create-a-project) in a workspace that has at least one [environment assigned](https://docs.camunda.io/docs/next/components/hub/organization/manage-environments/assign-environments).
- If the target environment has [authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) enabled, ensure deploying users have [`CREATE` permission to the `RESOURCE` resource type](https://docs.camunda.io/docs/next/components/admin/authorization#create-an-authorization-in-admin).


## Validate your project

Use [Test mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process) to validate your project in development.

1. In your workspace, open the project you want to validate.
1. Open a BPMN diagram.
1. At the top left of the modeler canvas, click **Test**.
1. Under **Choose where to run**, select an environment, and click **Deploy**.
1. Validate your process as required. For example, debug your process logic and test the project.

**Info**
To learn more about using Test mode for validation, see [Test your process](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process)

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/validate-project
