# Data handling — Defining example data

To help with editor support, you can add example data to an element:

1. In a BPMN diagram, on the right side of the modeling interface, open the **Details** panel.
2. On the **Properties** tab, under **Example data**, provide a JSON return value.

This is used to derive variable names and types in the FEEL editor. For example, keys and types from your example data are suggested under **Output mapping > Variable assignment value**. Nested objects are also supported.

Providing this data is optional, but it's recommended if you want to take full advantage of the FEEL editor's suggestions. It is especially useful for variables that the modeler cannot discover automatically, such as variables created by [job workers](https://docs.camunda.io/docs/next/components/concepts/job-workers) or passed as process start variables.

This data will also be used while [testing your process](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process) to set variables from the respective elements when performing the following actions:

- Starting a new instance
- Completing a job
- Publishing a message with variables

**Note**
The provided example data is only used by the FEEL editor to provide variable suggestions while modeling, and by Test mode to prefill variables. It is not used during process execution.

Data provided this way is added to the scope of the element. To use the data in other parts of your process, you can use [output mappings](https://docs.camunda.io/docs/next/components/concepts/variables#output-mappings) to make the variables available in the parent scope.

---
Source: https://docs.camunda.io/docs/next/components/modeler/data-handling
