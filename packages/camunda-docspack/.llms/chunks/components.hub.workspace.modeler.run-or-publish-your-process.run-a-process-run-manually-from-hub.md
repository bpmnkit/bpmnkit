# Run or publish your process — Run a process — Run manually from Hub

You can also test your process thoroughly on a development cluster to observe how it behaves in Operate and Tasklist, in order to run your job workers, and to access your running process instances [programmatically](#deploy-to-run-programmatically). To start a process instance manually, take the following steps:

1. From your Camunda Hub workspace, open a project.
2. Open a process file.
3. In the top right corner of the modeling interface, click **Deploy & run**.
4. Select a stage, optional tenant ID, and the resources to deploy.
5. **(Optional)** Specify variables written to the process context at startup. The variables must be formatted in valid JSON. As an example, you can use the following JSON:

```json
{
  "hello": "world"
}
```

6. Click **Deploy & run** to confirm. This (re-)deploys the process and starts a process instance on the selected cluster.

After the process instance has been started, you will receive a notification with a link to the process instance view in [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction). Follow this link to observe the progress of the process instance and interact with it if required. If the target cluster has [authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) enabled, make sure you have the following permissions to be able to view the process instance in Operate:

- `READ_PROCESS_DEFINITION` and `READ_PROCESS_INSTANCE` permissions on the `PROCESS_DEFINITION` resource type
- `operate` permission to the `COMPONENT` resource type

Starting an instance from Camunda Hub [deploys](#deploy-a-process) recent changes to the target cluster, which changes future runs of this process definition in case it has already been deployed and used. Existing process instances are not affected.

**Tip**
By [linking a Camunda Form to a start event](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/advanced-modeling/form-linking), process instances can be started with the form's input [via a public form](#publish-via-a-public-form) (SaaS only) or directly [in Tasklist](#publish-to-tasklist).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process
