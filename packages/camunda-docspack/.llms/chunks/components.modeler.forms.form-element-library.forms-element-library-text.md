# Text view

A form element to display simple Markdown-powered text.

A Markdown-powered text component allowing to display simple information to the user.


## Configurable properties

- **Text**: Either an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax). After evaluation, the result is processed using a Markdown renderer that supports basic HTML and [GitHub-flavored Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet). To ensure safety and prevent cross-site scripting in Camunda Forms, potentially harmful HTML elements will not be rendered.
- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the text.
- **Columns**: Space the field will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-text
