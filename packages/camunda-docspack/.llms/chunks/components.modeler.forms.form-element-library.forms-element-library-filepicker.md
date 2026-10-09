# Filepicker

A form element to select files

A form element to select files.


## Configurable properties

#### General

- **Field label**: Label displayed on top of the Filepicker.
  - It can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Supported file formats**: [Comma-separated list of supported file formats.](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers)
  - It can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) or plain text.
- **Upload multiple files**: Allows the user to upload multiple files at once.
  - It can be dynamically set using an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).
- **Key**: Binds the field to a form variable, refer to the [data binding documentation](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-data-binding).
- **Read only**: Makes the Filepicker read-only, meaning the user can't change but only read its state.
  - It can be dynamically set using an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).
- **Disabled**: Disables the Filepicker, for use during development.

#### Condition

- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the element.

#### Layout

- **Columns**: Space the field will use inside its row.
  - **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).

#### Validation

Given that one of the following properties is set, the form will only submit when the respective condition is fulfilled. Otherwise, a validation error will be displayed.

- **Required**: Filepicker must have a selected file.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-filepicker
