# Styling — Example

To theme a form after another design system, bind the tokens to its palette. This is how the **Custom style (Material-like)** preview below is built:

```css
.materialized .bio-theme-parent,
.materialized.bio-theme-parent {
  --bio-surface: rgba(0, 0, 0, 0.06);
  --bio-text: rgba(0, 0, 0, 0.87);
  --bio-text-subtle: rgba(0, 0, 0, 0.6);
  --bio-border: rgba(0, 0, 0, 0.42);
  --bio-border-subtle: rgba(0, 0, 0, 0.12);
  --bio-primary: #5453d3;
  --bio-focus: #5453d3;
  --bio-danger: #d32f2f;
}
```

That covers color. Anything the tokens don't express is defined by a component variable or a plain rule. This includes typography and Material's underlined field, which uses a border shape rather than a color:

```css
.materialized .fjs-container {
  --font-family: Roboto, Helvetica, Arial, sans-serif;
  --line-height-input: 24px;
}

.materialized .fjs-container .fjs-input-group {
  border: none;
  border-bottom: 1px solid var(--bio-border);
  border-radius: 4px 4px 0 0;
}
```

<h4>Basic style</h4>

<h4>Custom style (Material-like)</h4>

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/01-styling
