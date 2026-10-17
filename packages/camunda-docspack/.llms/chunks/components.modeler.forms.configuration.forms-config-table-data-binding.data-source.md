# Table data binding — Data source

To define the data which will be displayed as table rows, define the **Data source** property. This field accepts only [expressions](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction). The [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) must return a list of objects, where each object represents a row in the table. Each object must have a property for each column defined in the **Headers source** property. For example, if you have a list of objects with a **name** and a **surname** property, your [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) must evaluate to the following JSON to define the data:

```json
[
  {
    "name": "John",
    "surname": "Doe"
  },
  {
    "name": "Jane",
    "surname": "Doe"
  }
]
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-table-data-binding
