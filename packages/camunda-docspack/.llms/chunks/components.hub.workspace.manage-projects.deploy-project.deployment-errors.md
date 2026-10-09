# Deploy your project — Deployment errors

If the deployment of a project fails (for example, because one or more of the contained resources has invalid implementation properties), a modal is shown containing the error message thrown by the Zeebe engine.

The message typically provides the name of the affected resource, the ID of the invalid diagram element, and the error details.

### Deployment of external resources

You can link BPMN processes, DMN decisions, or forms that are not part of the project itself (external resources) from any process inside a project.
When you deploy the project, linked resources located outside the project are _not_ deployed with the project, so you must deploy them separately.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project
