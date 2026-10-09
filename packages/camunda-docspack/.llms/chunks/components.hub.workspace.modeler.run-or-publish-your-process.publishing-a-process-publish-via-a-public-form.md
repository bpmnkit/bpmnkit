# Run or publish your process — Publishing a process — Publish via a public form

Camunda 8 SaaS only

Publishing a process via a public form allows you to share your process with external users who can start instances of the process without requiring access to Camunda 8. This feature is particularly useful when you want to gather data or initiate a process from users who are not part of your organization or do not have direct access to Camunda. It also allows you to rapidly test a process with your peers in a development environment.

To publish a process via a public form, you first need to [link a Camunda Form](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/advanced-modeling/form-linking#using-the-link-button) to the process' start event, then you can follow these steps:

#### Deploy process to the public

1. Open the **Publication** section in the **properties panel** (not the tab of the same name).
2. Toggle **Public access enabled**.
3. [Deploy](#deploy-a-process) the process.

Once the process is deployed, a public URL for the form is generated on the target cluster.

#### Get the public link and share it

You can access the URL in the **Publication** tab of the **properties panel** and share it with any user via email, social media, or any other communication channel.

Public form links were removed in Camunda 8.10. For current start options, use authenticated Tasklist starts or build a custom application with the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process
