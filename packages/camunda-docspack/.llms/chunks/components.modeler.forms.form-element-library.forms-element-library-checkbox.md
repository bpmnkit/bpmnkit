# Checkbox

A form element to read and edit boolean data

A checkbox allowing the user to read and edit boolean data.

### Configurable properties

- **Field label**: Label displayed besides the checkbox. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Field description**: Description provided below the checkbox. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Key**: Binds the field to a form variable, refer to [data binding docs](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-data-binding).
- **Default value**: Provides a default state for the checkbox in case no input data exists for the given key.
- **Read only**: Makes the checkbox read-only, meaning the user can't change but only read its state. Can be dynamically set using an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).
- **Disabled**: Disables the checkbox, for use during development.
- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the checkbox.
- **Validation**: Given that one of the following properties is set, the form will only submit when the respective condition is fulfilled. Otherwise, a validation error will be displayed.
  - **Required**: Checkbox must contain a value.
- **Columns**: Space the field will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).

### Datatypes

Checkboxes can be bound to data of the `boolean` type. Any other datatype will be treated as a `false` by default.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-checkbox
