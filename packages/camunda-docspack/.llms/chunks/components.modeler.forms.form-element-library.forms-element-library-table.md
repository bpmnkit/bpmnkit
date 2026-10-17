# Table

Learn about the table form element to render tabular data.

This is an element allowing the user to render tabular data.


## Configurable properties

- **Table label**: Label displayed on top of the table and as the accessible label. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Data source**: Data used to render the rows of the table. This can only be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction). Review [table data binding](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-table-data-binding) for the required data source structure.
- **Pagination**: Enables pagination in the table. If enabled, it splits the rows provided by **Data source** into chunks with the size defined by the field **Number of rows per page**.
- **Number of rows per page**: The size of each page. Used only if pagination is enabled. Must be greater than zero.
- **Headers source**: Defines which headers will be used in the table. This can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) or a list of static headers. Review [table data binding](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-table-data-binding) for the required header structure.
- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the table.
- **Columns**: Space the field will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-table
