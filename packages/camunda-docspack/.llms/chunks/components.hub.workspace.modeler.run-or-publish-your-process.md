# Run or publish your process

Run or publish a process in any environment and for any audience.

When you design a process in Camunda Hub, you have multiple flexible options to either run or publish it on Camunda 8. This page explains the differences between running and publishing a process, and outlines the various options to publish a process into any environment and to any audience.


## Deploy a process

Camunda Hub autosaves all your changes on a diagram. If you change a diagram and it is autosaved, this has no effect on deployed or running processes in your environments.

To make any change live in an environment, you need to deploy it. If you deploy a process, it becomes available in the selected [environment](https://docs.camunda.io/docs/next/components/concepts/environments) and you can run or publish it.

**Info**
You can deploy to any environment assigned to your workspace if you have deployment permissions in the cluster. Your organization can require an approved project snapshot for environments tagged `prod`. See [production environments](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/deploy-project#production-environments).

To deploy:

1. From your Camunda Hub workspace, open a project.
2. Open a process file.
3. In the top right corner of the modeling interface, click the dropdown next to **Deploy & run**.
4. Click **Deploy**.
5. Select the environment, the Logical Tenant if the environment has more than one, and the resources to deploy. You can either deploy **All resources** or **Only this resource**.
6. Click **Deploy**.

**Tip**
In Self-Managed, you can deploy your diagram to the environments of the clusters defined in your Camunda Hub [configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#clusters).

### Before deploying a process

- If the target environment has [authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) enabled, make sure that the deploying users have `CREATE` permission to the `RESOURCE` resource type.
- Make sure your process is free of errors, otherwise it can't be deployed. Use the [problems panel to detect and fix errors](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/fix-problems-in-your-diagram).
- Make sure all dependent files are deployed first, such as DMN diagrams, forms, or called processes. You can use the [link tool](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/advanced-modeling/call-activity-linking) to drill-down into linked resources and deploy them.
  If you are using [`versionTag` binding](https://docs.camunda.io/docs/next/components/best-practices/modeling/choosing-the-resource-binding-type) for a linked resource, make sure it is deployed with the correct version tag.
- Implement and run your [job workers](https://docs.camunda.io/docs/next/components/concepts/job-workers) if you use tasks such as service or send tasks.
- Ensure there are no missing secrets or misconfigured clients required for the process to run.
  - When missing secrets or no client credentials with access to the Orchestration Cluster API are detected, a warning is shown in the deployment dialog. Each warning offers a link to manage the missing secrets or misconfigured clients.

**Note**
To perform any of these actions, make sure to be in [**Implement** mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/collaboration/implement-your-process).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process
