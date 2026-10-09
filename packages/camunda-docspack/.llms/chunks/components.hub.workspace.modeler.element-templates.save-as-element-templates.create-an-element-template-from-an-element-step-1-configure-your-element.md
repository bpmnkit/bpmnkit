# Save activity and event properties as reusable element templates — Create an element template from an element — Step 1: Configure your element

First, configure your element with all the necessary properties you want to include in your template.  
The configuration depends on your element type and use case.

In this example, we'll configure a business rule task for fraud detection:

1. Select an element in your BPMN diagram.
2. Configure the element with the properties you need. For example, set up a business rule task by defining:
   - **Implementation**: Choose the implementation type (for example, DMN decision).
   - **Called decision**: Reference the decision to be invoked.
   - **Binding**: Select the [resource binding type](https://docs.camunda.io/docs/next/components/best-practices/modeling/choosing-the-resource-binding-type). We recommend using `versionTag` to ensure that the template always references a compatible resource version.
   - **Result variable**: Define where to store the decision result.
   - Add any required input/output mappings for your business logic.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/save-as-element-templates
