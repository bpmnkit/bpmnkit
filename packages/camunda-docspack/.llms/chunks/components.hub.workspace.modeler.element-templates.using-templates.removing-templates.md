# Using templates in Camunda Hub — Removing templates

To remove an applied template from an element, either the _Unlink_ or _Remove_ function can be used:

1. Open a BPMN diagram.
2. Make sure you're in [**Implementation** mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/collaboration/implement-your-process#switch-to-implement-mode).
3. Select an element in the diagram that is linked to an element template.
4. On the right side of the modeling interface, under **Details > Properties > Template**, click **Applied**.
5. Select either:
   - **Unlink**: Remove the element template from the `modelerTemplate` property but keep the properties which were set.
   - **Remove**: Remove the element template from the `modelerTemplate` property and reset all properties of the respective element.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/using-templates
