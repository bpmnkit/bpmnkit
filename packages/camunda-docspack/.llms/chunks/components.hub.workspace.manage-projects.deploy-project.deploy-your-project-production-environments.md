# Deploy your project — Deploy your project — Production environments

Camunda Hub treats an environment as a production environment if its tags include `prod`. Your organization can require that a project snapshot is approved before anyone deploys it to a production environment. When this is enabled, and you select a production environment, the dialog shows one of the following messages:

| Message               | Meaning                                                                                                                                                                         |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Approval required** | The project snapshot must be approved by a reviewer before it can be deployed to a production environment.                                                                      |
| **Snapshot required** | Drafts can't be deployed to a production environment. Create a project snapshot, get it approved, and deploy it. Click **Show snapshots** to open the snapshots of the project. |

Organization admins configure this in the [project deployment settings](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeler-settings#project-deployment). Learn how to [request a review](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/project-versioning#request-a-review).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project
