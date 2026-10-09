# Dynamic list

Learn about the dynamic list form element to dynamically manage a list of form elements.

The **dynamic list** element is designed to dynamically manage a list of form elements. It enables users to add or remove items from the list and is particularly useful in scenarios where the number of items in a list is not fixed.


## Configurable properties

- **Group label**: Label displayed on top of the dynamic list. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Path**: Assigns a path that maps its children into a data object, defined as a variable name or a dot separated variable accessor. See the [data binding docs](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-data-binding) for more details.
- **Default number of items**: Specifies the default number of items rendered when no input data is provided.
- **Allow add/delete items**: Enables users to add new items to or delete existing items from the list.
- **Disable collapse**: Prevents items in the list from being collapsed.
- **Number of non-collapsing items**: Defines the number of items in the list that will not collapse.
- **Vertical alignment**: Determines the alignment of items in the list.
- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the dynamic list.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-dynamiclist
