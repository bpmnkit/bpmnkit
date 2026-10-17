# Datetime

Learn about the datetime form element to read and edit date and time data.

A component allowing the user to read and edit date and time data.


## Configurable properties

- **Date label**: Label displayed beside the date input field. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Time label**: Label displayed beside the time input field. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Field description**: Description provided below the datetime component. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Key**: Binds the field to a form variable, refer to [data binding docs](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-data-binding).
- **Subtype**: Selects the type of the datetime component. This can either be **Date**, **Time**, or **Date & Time**.
- **Use 24h**: Enables 24-hour time format.
- **Read only**: Makes the datetime component read-only, meaning the user can't change but only read its state. Can be dynamically set using an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).
- **Disabled**: Disables the datetime component, for use during development.
- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the datetime component.
- **Columns**: Space the field will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).
- **Time format**: Defines the time data format. This can either be **UTC offset**, **UTC normalized**, or **No timezone**.
- **Time interval**: Defines the steps of time that can be selected in the time input field.
- **Disallow past dates**: Enables the restriction to not allow past dates.
- **Validation**: Given that one of the following properties is set, the form will only submit when the respective condition is fulfilled. Otherwise, a validation error will be displayed.
  - **Required**: Datetime component must contain a value.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-datetime
