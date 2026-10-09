# Best practices for custom-built element templates — Properties panel UI — Field types

The following guidelines ensure templates are intuitive and designed to minimize errors. This helps to create a good user experience.

#### Hidden vs. visible fields

If certain values are static and do not require user input, prefill them. Hidden fields offer no additional benefit by being visible.

**Hidden fields example:**

- HTTP method
- Static URL endpoint
- Static header

#### Required vs. optional

- **Required:** Properties essential for the template to function. Without these, the template cannot operate.
- **Optional:** Properties that are not mandatory but provide additional functionality.

There are two mechanisms to define property behavior depending on whether a field is required or optional:

- [**“Not empty” constraint**](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties#validating-user-input-constraints): Displays an error if the field is left empty.
- [**Optional bindings**](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties#preventing-persisting-empty-values-optional): Does not persist empty properties in the BPMN XML.

  Use **optional bindings** when a property is not required and you want to avoid storing empty values in the BPMN XML. In most cases, required fields should use the "Not empty" constraint for validation.

#### Mandatory FEEL vs. optional FEEL

FEEL expressions should only be required when necessary. For straightforward inputs, expressions can be optional.  
More details: [FEEL editor support](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties#adding-feel-editor-support-feel).

#### Free input vs. dropdown vs. constraints

- Use a dropdown when selection options are predefined.
- Use free input with constraints when there is a wide range of input possibilities.

**Example:**

```json
{
  "label": "Priority",
  "id": "priority",
  "group": "input",
  "description": "The priority to apply to the queue item.",
  "value": "Low",
  "type": "Dropdown",
  "choices": [
    { "name": "Low", "value": "Low" },
    { "name": "Normal", "value": "Normal" },
    { "name": "High", "value": "High" }
  ],
  "binding": { "type": "zeebe:input", "name": "priority0" },
  "condition": { "property": "operationType", "oneOf": ["addQueueItem"] }
}
```

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/best-practices
