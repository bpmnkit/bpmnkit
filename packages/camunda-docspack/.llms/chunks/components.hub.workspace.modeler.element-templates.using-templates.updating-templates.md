# Using templates in Camunda Hub — Updating templates

If a template is applied and a new version of the template is found, you can _update_ the template:

1. Open a BPMN diagram.
2. Make sure you're in [**Implementation** mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/collaboration/implement-your-process#switch-to-implement-mode).
3. Select an element in the diagram that is linked to an element template.
4. On the right side of the modeling interface, under **Details > Properties > Template**, click **Update available**.

Templates are updated according to the following rules:

- If the property is set in the new template, it will override the existing value — unless the value was originally set by the old template and has been manually changed since.
- If the property is not defined in the new template, it will unset.
- Sub-properties of complex properties (for example, `zeebe:input`, `zeebe:output`) are handled
  according to these rules if they can be identified.

### Replacing templates

If a template is deprecated with a new element template and you want to keep the same input values as in the
deprecated template, you can:

1. [**Unlink**](#removing-templates): Remove the current template that is deprecated from the `modelerTemplate` property, but keep the properties which were set.
2. Click **Select** and apply the new element template.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/using-templates
