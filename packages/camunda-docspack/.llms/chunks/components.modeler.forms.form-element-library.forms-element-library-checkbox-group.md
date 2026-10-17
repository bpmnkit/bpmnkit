# Checkbox group

A form element to select multiple values from set options

A set of checkbox options providing data multi-selection for small datasets.

### Configurable properties

- **Field label**: Label displayed on top of the checkbox group. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Field description**: Description provided below the checkbox group. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Key**: Binds the field to a form variable, refer to [data binding docs](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-data-binding).
- **Options source**: Checkbox group components can be configured with an options source defining the individual choices your user can make, refer to [options source docs](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-options).
- **Read only**: Makes the checkbox group read-only, meaning the user can't change but only read its state. Can be dynamically set using an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).
- **Disabled**: Disables the checkbox group, for use during development.
- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the checkbox group.
- **Validation**: Given that one of the following properties is set, the form will only submit when the respective condition is fulfilled. Otherwise, a validation error will be displayed.
  - **Required**: Checkbox group must contain a value.
- **Columns**: Space the field will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).

### Datatypes

Checkbox group components can be bound to data of the `any[]` type, although for most practical cases we recommend `string[]` instead. The checkbox group component correlates the bound data with the values of the different options.

The data representation of this checkbox group:

![Checklist Selection Image](../assets/checklist-example.png)

Looks like this:

```
{
  "mailto": [
    "regional-manager",
    "approver"
  ],
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-checkbox-group
