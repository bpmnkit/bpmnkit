# Styling — Styleable classes

The simplest way to find the right styleable elements to override is inspecting form-js using your browser's developer tools. Scope rules with the `.fjs-container` class to prevent CSS conflicts.

For example, to override field borders for single-line fields:

```css
.fjs-container .fjs-input-group {
  border-width: 0 0 1px 0;
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/01-styling
