# Data handling — How the modeler discovers variables

The modeler scans the process diagram and collects variables from the definitions it finds, such as:

- Input and output mappings defined on elements (the `target` expressions create variables).
- Result variables and result expressions on [service tasks](https://docs.camunda.io/docs/next/components/modeler/bpmn/service-tasks/service-tasks), [business rule tasks](https://docs.camunda.io/docs/next/components/modeler/bpmn/business-rule-tasks/business-rule-tasks), and [script tasks](https://docs.camunda.io/docs/next/components/modeler/bpmn/script-tasks/script-tasks).
- Form field bindings on [user tasks](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks) linked to [Camunda Forms](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference).
- Example data added to elements (see [Defining example data](#defining-example-data) below).

The discovered variables are used in the following places:

- FEEL editor suggestions — when writing [expressions](https://docs.camunda.io/docs/next/components/concepts/expressions), the FEEL editor suggests variables in scope for the current element.
- The **Variables** panel — an overview of all variables found in the diagram (see [Inspecting variables](#inspecting-variables)).

**Note**
The modeler can only discover variables that are explicitly defined in the diagram. Variables created at runtime — for example, by [job workers](https://docs.camunda.io/docs/next/components/concepts/job-workers), passed as process start variables, or set through the API — are **not** visible in the modeler unless you define them explicitly using [example data](#defining-example-data).

---
Source: https://docs.camunda.io/docs/next/components/modeler/data-handling
