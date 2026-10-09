# Introduction to forms — Camunda Forms

In Camunda 8, you can design forms using a drag'n'drop editor. The form editor is available in both Desktop and Camunda Hub. Learn more about Camunda Forms and available components in the [Camunda Forms reference documentation](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference), and learn how to design a human workflow with forms in the [getting started guide](https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks).


## form-js

Camunda Forms present a flexible, open solution to form creation. Camunda Forms are based on the [form-js library](https://github.com/bpmn-io/form-js) , maintained by Camunda. As a result, the form editor and renderer are non-proprietary, open-source technology, and can be used everywhere, also outside the context of Camunda 8. This unlocks a world of use cases, and eliminates any doubt around vendor lock-in or technical barriers.

Form-js is a vanilla JavaScript library with [Preact](https://preactjs.com/) in the background, and can be used in any framework, from Angular to React.

The resulting forms are serialized as a JSON document. The JSON document conforms to an open form schema that allows you to render the form using both the built-in form render, or even with a custom render. The form schema is extensible, allowing you to build your own extensions or custom components.

<!-- TODO link to dedicated form.js page -->

**Tip: Want to Contribute?**
We welcome your contributions to form-js! Whether it's fixing a bug, adding a feature or a new component, your input is valuable. You can also provide your ideas by opening issues for us or the community.

**How to Contribute:**

1. 🌐 Visit our [GitHub Repository](https://github.com/bpmn-io/form-js).
2. 🛠️ Check out the issues or open a new one.
3. 💻 Fork the repository and submit a pull request.

Let's make form-js better together! 👩‍💻👨‍💻

Continue reading to learn how to setup, embed, and extend form-js to build form-based task applications for any use case.

<!-- TODO cards -->

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/01-introduction-to-forms
