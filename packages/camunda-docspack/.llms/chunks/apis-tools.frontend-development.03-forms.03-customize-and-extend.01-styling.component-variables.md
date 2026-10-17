# Styling — Component variables

Where a token does not express what you need, override the component variable directly on the form container:

```css
.fjs-container {
  --color-background-disabled: #f4f4f4;
  --font-family: "IBM Plex Sans", sans-serif;
  --font-size-base: 14px;
  --form-field-height: 36px;
}
```

Fonts, sizes, spacing, and field geometry are only available as component variables — they have no token equivalent.

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/01-styling
