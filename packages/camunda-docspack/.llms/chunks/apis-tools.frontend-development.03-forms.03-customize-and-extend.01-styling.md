# Styling

Style your forms using easy-to-maintain CSS variables.

Forms can be easily styled by combining defining own CSS rules and overriding a set of CSS variables. If you want to go beyond CSS, you can fork the [form viewer](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-viewer)  and change the HTML returned by the individual form component renderers.


## Styling via CSS

Form styling is built on two layers of CSS variables:

| Layer                   | Variables                                | Purpose                                                                                                                         |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Semantic tokens**     | `--bio-*`                                | Name a role rather than a component — surface, text, border, accent, radius. Rebinding one restyles every element in that role. |
| **Component variables** | `--color-*`, `--font-*`, `--border-*`, … | What the form actually reads. Each color variable derives from a token; fonts, sizes, and geometry stand on their own.          |

Rebinding the tokens restyles the whole form, including the properties panel embedded in the form editor. Reach for a component variable only where you want to deviate from the shared semantics.

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/01-styling
