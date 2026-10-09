# Data handling

Understand how the modeler discovers and displays process variables, and how to define example data for editor support.

Process data in Camunda is represented by [variables](https://docs.camunda.io/docs/next/components/concepts/variables). A variable has a name and a JSON value, and its visibility is determined by its [variable scope](https://docs.camunda.io/docs/next/components/concepts/variables#variable-scopes).

BPMN processes do not have an explicit data model or schema. Instead, variables are created implicitly during process execution — for example, when a process instance is started with variables, when a [job worker](https://docs.camunda.io/docs/next/components/concepts/job-workers) completes a job, when a message is correlated, or when [input/output variable mappings](https://docs.camunda.io/docs/next/components/concepts/variables#inputoutput-variable-mappings) are applied.

Because there is no formal schema, the modeler infers the available variables by analyzing what is defined in the process diagram itself. This page explains how that works, and how you can help the modeler provide better editor support.

---
Source: https://docs.camunda.io/docs/next/components/modeler/data-handling
