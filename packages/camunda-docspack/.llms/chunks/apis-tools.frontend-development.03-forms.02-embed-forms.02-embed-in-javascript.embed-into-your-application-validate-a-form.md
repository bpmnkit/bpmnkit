# Embed forms in JavaScript — Embed into your application — Validate a form

Before you allow a user to submit a form, you can use the `validate` function to ensure that all validation rules of your form are met and that all required fields are completed. Learn more in the [form API documentation](https://github.com/bpmn-io/form-js/tree/develop/packages/form-js-viewer#formvalidate--errors) .

```js
const errors = form.validate();

if (Object.keys(errors).length) {
  console.error("Form has errors", errors);
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/02-embed-forms/02-embed-in-javascript
