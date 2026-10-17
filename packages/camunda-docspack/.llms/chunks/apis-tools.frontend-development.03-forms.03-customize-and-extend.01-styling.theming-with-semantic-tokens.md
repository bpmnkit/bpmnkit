# Styling — Theming with semantic tokens

form-js declares the tokens on the `bio-theme-parent` class, which it adds to every root it renders — the form container and any popup it attaches to `document.body`.

Override them from an ancestor, and apply your theme class at the **application root** rather than around the form. Popups and tooltips are appended to the end of `<body>`, outside the element that opened them, and a theme only reaches what it contains.

```css
.my-theme .bio-theme-parent,
.my-theme.bio-theme-parent {
  --bio-primary: #0f62fe;
  --bio-surface: #ffffff;
  --bio-border: #8d8d8d;
  --bio-text: #161616;
}
```

Both selectors are required. A custom property declared on an element always beats one inherited from an ancestor, so a theme has to match the element form-js declared its tokens on — sitting above it is not enough.

The complete, always-current list of tokens and the component variables derived from them lives in the stylesheets themselves:

- [`form-js-base.css`](https://github.com/bpmn-io/form-js/blob/develop/packages/form-js-viewer/assets/form-js-base.css)  — viewer
- [`form-js-editor-base.css`](https://github.com/bpmn-io/form-js/blob/develop/packages/form-js-editor/assets/form-js-editor-base.css)  — editor

In both files the `.bio-theme-parent` block declares the tokens, and the `.fjs-container` block below it maps them onto component variables.

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/01-styling
