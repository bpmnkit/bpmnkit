# Button

A form element to trigger form actions

A button allowing the user to trigger form actions.

### Configurable properties

- **Field label**: Label to be displayed on top of the button. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Action**: The button can either trigger a **Submit** or a **Reset** action.
  - **Submit**: Submit the form (given there are no validation errors).
  - **Reset**: Reset the form, all user inputs will be lost.
- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the button.
- **Columns**: Space the button will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-button
