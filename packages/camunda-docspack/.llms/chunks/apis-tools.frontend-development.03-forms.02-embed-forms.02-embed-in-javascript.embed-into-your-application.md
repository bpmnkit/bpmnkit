# Embed forms in JavaScript — Embed into your application

Embedding a form with the form viewer requires only a few steps.

1. Import the library
2. Specify the render target div and render the form
3. Import the [form schema](https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/02-embed-forms/01-concepts#the-form-schema)

```js
import { Form } from "@bpmn-io/form-js-viewer";

const form = new Form({
  container: document.querySelector("#form"),
});

// schema of the form to embed
const schema = {
  type: "default",
  id: "TestForm",
  components: [
    {
      key: "name",
      label: "Name",
      type: "textfield",
      validate: {
        required: true,
      },
    },
  ],
};

await form.importSchema(schema);
```

This results in:

You can also detach a form from a container and attach to another during form runtime. Learn more about that in the [API documentation](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-viewer#formattachtoparentnode-htmlelement--void) .

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/02-embed-forms/02-embed-in-javascript
