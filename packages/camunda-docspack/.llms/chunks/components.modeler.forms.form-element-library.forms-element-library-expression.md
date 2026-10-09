# Expression field

A form element to compute form state

An expression field allowing the user to compute new data based on form state.

### Configurable properties

- **Key**: Binds the field to a form variable, refer to [data binding docs](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-data-binding).
- **Target value**: Defines an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to evaluate.
- **Compute on**: Defines when the expression should be evaluated. Either whenever the result changes, or only on form submission.
- **Deactivate if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to disable the expression.
- **Columns**: Space the field will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).

**Info**

The expression field is a simple way to create intermediary data which may be re-used within your form, or further down your process. To effectively use this component, a good understanding of [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) is required.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-expression
