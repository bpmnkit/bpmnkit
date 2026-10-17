# Element templates with dependencies

Learn what you need to consider when handling template dependencies.

When creating element templates, you may want to link to a resource like a [form](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference), or pre-populate a [secret](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#using-secrets) expression. Your template might require a specific [job worker](https://docs.camunda.io/docs/next/components/concepts/job-workers) to execute an action. These are all examples of dependencies.

<!-- source: https://www.figma.com/design/VyyoV0hNbazXV8DKcMMEU9/Camunda-Documentation-Assets?node-id=2092-171&t=iLUDOvmj8m6yUQ5U-1 -->

![Element template dependencies](./img/element-template-dependencies.png)

Element templates can depend on:

- [Camunda forms](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference): used in user tasks.
- [RPA scripts](https://docs.camunda.io/docs/next/components/rpa/overview): used in service tasks.
- [BPMN process](https://docs.camunda.io/docs/next/components/modeler/bpmn/bpmn): used in a call activity. This may introduce nested dependencies (e.g., a called process may depend on other processes and/or resources).
- [DMN decisions](https://docs.camunda.io/docs/next/components/modeler/dmn/dmn): used in business rule tasks.
- [Job workers](https://docs.camunda.io/docs/next/components/concepts/job-workers): provide behavior for service tasks such as message send events, send tasks, service tasks, business rule tasks, or custom connector runtime.
- Secrets: used in connector elements to access sensitive values (see [secrets in self-managed](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#secrets) and [secrets in SaaS](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets)).

To make a template available for use, complete two key steps:

1. **Provision dependencies at runtime**: Make dependencies available in the clusters that need them.
   - For job workers, ensure the runtime is started and connected to the cluster (see [hosting custom connectors](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/host-custom-connector)).
   - Secrets must be configured beforehand.
   - Other dependency types (e.g., Camunda forms, RPA scripts, DMN decisions) need to be deployed to the cluster.

2. **Make the template available at design time**: Ensure Camunda Hub or Desktop Modeler can access the template for use in your projects.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/element-template-with-dependencies
