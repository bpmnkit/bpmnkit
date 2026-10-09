# Using templates — Removing templates

To remove an applied template from an element, either the _Unlink_ or _Remove_ function can be used:

- **Remove**: Remove the element template from the `modelerTemplate` property and reset all properties of the respective element.
- **Unlink**: Remove the element template from the `modelerTemplate` property but keep the properties which were set.

![Unlink or Remove](./img/unlink-remove.png)


## Updating templates

If a template is applied and a new version of the template is found you can _update_ the template.

![Update Template](./img/update-template.png)

Templates are updated according to the following rules:

- If the property is set in the new template, it will override the existing value — unless the value was originally set by the old template and has been manually changed since.
- If the property is not defined in the new template, it will unset.
- Sub-properties of complex properties (for example, `zeebe:input`, `zeebe:output`) are handled
  according to these rules if they can be identified.

### Replacing templates

If a template is deprecated with a new element template and you want to keep the same input values as in the
deprecated template, you can:

1. **Unlink**: Remove the current template that is deprecated from the `modelerTemplate` property, but keep the properties
   which
   were set.
2. **Select** and apply the new element template.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/using-templates
