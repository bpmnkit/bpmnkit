# Taglist

A form element to select multiple values from set options

A complex and searchable tag based component providing multi-selection for large datasets.

### Configurable properties

- **Field label**: Label displayed on top of the taglist. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Field description**: Description provided below the taglist. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Key**: Binds the field to a form variable, refer to [data binding docs](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-data-binding).
- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the taglist.
- **Columns**: Space the field will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).
- **Validation**: Given that one of the following properties is set, the form will only submit when the respective condition is fulfilled. Otherwise, a validation error will be displayed.
  - **Required**: Taglist must contain a value.
- **Options source**: Taglists can be configured with an options source defining the individual choices your user can make, refer to [options source docs](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-options).
- **Read only**: Makes the taglist read-only, meaning the user can't change but only read its state. Can be dynamically set using an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).
- **Disabled**: Disables the taglist, for use during development.

### Datatypes

Taglists can be bound to data of the `any[]` type, although for most practical cases we recommend `string[]` instead. The Taglist component will correlate the bound data with the values of the different options defined for the component.

The data representation of this taglist:

![Checklist Selection Image](../assets/taglist-example.png)

Would look like this:

```
{
  "cc_empl": [
    "john_doe",
    "anna_belle"
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-taglist
