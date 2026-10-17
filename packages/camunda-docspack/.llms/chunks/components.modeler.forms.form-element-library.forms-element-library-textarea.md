# Text area

Learn about the text area form element to read and edit multiline textual data.

A text area allowing the user to read and edit multiline textual data.


## Configurable properties

- **Field label**: Label displayed on top of the text area. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Field description**: Description provided below the text area. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Key**: Binds the field to a form variable, refer to [data binding docs](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-data-binding).
- **Default value**: Provides a default value for the text area in case no input data exists for the given key.
- **Read only**: Makes the text area read-only, meaning the user can't change but only read its state. Can be dynamically set using an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).
- **Disabled**: Disables the text area; for use during development.
- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the text area.
- **Columns**: Space the field will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).
- **Validation**: Given that one of the following properties is set, the form will only submit when the respective condition is fulfilled. Otherwise, a validation error will be displayed.
  - **Required**: Text area must contain a value.
  - **Minimum length**: Text area must have at least `n` characters.
  - **Maximum length**: Text area must not have more than `n` characters.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-textarea
