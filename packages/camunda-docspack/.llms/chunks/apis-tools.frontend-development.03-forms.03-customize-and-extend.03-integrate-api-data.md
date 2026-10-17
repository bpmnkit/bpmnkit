# Integrate API data

Integrate external business data into your forms via APIs.

Read this page to learn how to integrate external business data into your forms via APIs.


## Load data on form initation

Before you initiate your form with data, make sure to fetch external business data and merge it with the process variables first. Data that is not bound to a form field using a key will not be submitted, keeping process instance data clean.

As an example, use a `valuesExpression` in your form to populate the options of a select field.

```js
//...

const schema = {
  components: [
    {
      label: "Opportunities",
      type: "select",
      key: "opportunity",
      valuesExpression: "=external.salesforce.opportunities",
    },
  ],
  type: "default",
  id: "TestForm",
  schemaVersion: 12,
};

const response = await fetch(url, fetchOptions);
const opportunities = await response.json(); //...

// form context/input data
const data = {
  ...processVariables,
  external: {
    salesforce: {
      opportunities,
    },
    // ...
  },
};

await form.importSchema(schema, data);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/03-integrate-api-data
