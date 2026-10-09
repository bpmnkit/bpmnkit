# Save activity and event properties as reusable element templates — Understand template property bindings

When you save an element as a template, Camunda Hub automatically converts the element's properties into template bindings:

- Input/output mappings
- Task headers
- Zeebe properties
- Element-specific properties (for example, `calledDecision`, `calledElement`)
- Message references (for message-related elements)

Only properties supported by element templates are included. Unsupported properties remain visible in the properties panel after you apply the template.

For a list of supported properties, see the [element templates reference](https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates#defining-template-properties).


## When template creation is unavailable

The **Save as template** button is disabled in the following scenarios:

- You are not in Camunda Hub's implementation mode.
- The element has validation issues.
- The element type is not supported (blank tasks, error events, subprocesses, etc.).
- You don't have permissions to create templates.

Fixing validation issues will enable the button if the element type is supported.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/save-as-element-templates
