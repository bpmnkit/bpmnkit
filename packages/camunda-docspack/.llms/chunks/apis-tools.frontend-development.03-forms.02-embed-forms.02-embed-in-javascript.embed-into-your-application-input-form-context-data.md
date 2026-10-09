# Embed forms in JavaScript — Embed into your application — Input form context data

To provide data to your form, such as process variables or business objects, pass a JSON object containing this data to the `importSchema` function.

```js
...

const schema = {
  ...
};

// form context/input data
const data = {
  name: 'ACME Corp'
};

await form.importSchema(schema, data);
```

This results in:

You can use context data not just to populate field values, but also to control form behavior, to provide options for select fields, or even to provide localization to your forms. You can fetch business data via an API first, and inject it via the data object. The following example demonstrates how to provide select options via context data, by using a `valuesExpression`.

```js
...

const schema = {
  components: [
    {
      label: "Business domain",
      type: "select",
      key: "domain",
      valuesExpression: "=businessDomains"
    }
  ],
  type: "default",
  id: "TestForm",
  schemaVersion: 12
};

// form context/input data
const data = {
  businessDomains: ["Software development", "Consulting"]
};

await form.importSchema(schema, data);
```

This results in:

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/02-embed-forms/02-embed-in-javascript
