# Integrate Camunda Hub into CI/CD — Pipeline stages — Review stage

During reviews, you can:

1. Use the Camunda Hub API to [add workspace members](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/add-member.api).
2. [Create a link to a visual diff for reviews](#create-a-link-to-a-visual-diff-for-reviews)
3. Automatically paste them into your GitHub or GitLab pull or merge requests.

This provides you the freedom to let reviews happen where you want them.

After review, use the [`DELETE /api/v2/workspaces/{workspaceKey}/members/{email}` endpoint](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/remove-member.api) to remove members from the workspace.

#### Create a link to a visual diff for reviews

Use versions to indicate a state for review. Use the `POST /api/v2/versions` endpoint to create a new version, and provide a description to reflect the state of this version using the `name` property. The current content of the file is copied over on version creation.

While it is possible to do a diff of your diagrams by comparing the XML in your VCS, this is often not very convenient, and lacks insight into process flow changes. This approach is also less effective when involving business stakeholders in the review.

Instead, you can generate visual diff links for versions:

1. Get the file and version keys from the [search](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/search-versions.api) or [get](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/get-version.api) version API endpoints.
2. Insert the keys into one of the following URL patterns:

| Resource type    | Template URL                                                                     |
| :--------------- | :------------------------------------------------------------------------------- |
| BPMN             | `{baseURL}/diagrams/{fileKey}/versions/{versionKey1}...{versionKey2}`            |
| Element template | `{baseURL}/connector-templates/{fileKey}/versions/{versionKey1}...{versionKey2}` |
| Form             | `{baseURL}/forms/{fileKey}/versions/{versionKey1}...{versionKey2}`               |
| RPA              | `{baseURL}/rpa-scripts/{fileKey}/versions/{versionKey1}...{versionKey2}`         |

#### Review a running project

If deployed in a review environment, processes can be shared with peers for interactive review. For comprehensive review, full clusters inclusive of Operate and Tasklist can be used for process execution. This closely simulates the final experience. To integrate the preview environment with custom applications, leverage the Operate and Tasklist APIs and deploy them within the review environment.

In case you use an embedded Zeebe engine, or want to provide a lightweight, focused review experience, you can use [Zeebe Simple Monitor](https://github.com/camunda-community-hub/zeebe-simple-monitor), which is a community-maintained Web App similar to the [Test mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process) in Camunda Hub. Deploying Zeebe SimpleMonitor allows for thorough process testing and review.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/integrate-modeler-in-ci-cd
