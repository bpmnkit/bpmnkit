# Embed forms in JavaScript — Embed into your application — Retrieve schema variables

Use the `getSchemaVariables` util to retrieve the [variables defined in a form schema](https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/02-embed-forms/01-concepts#schema-variables). This is useful to gather what data is consumed and produced by a form.

```javascript
import { getSchemaVariables } from "@bpmn-io/form-js";

const variables = getSchemaVariables(schema);

console.log("Schema variables", variables);
```

It is also possible to distinct between input and output variables:

```javascript
import { getSchemaVariables } from "@bpmn-io/form-js";

const outputVariables = getSchemaVariables(schema, { inputs: false });
const inputVariables = getSchemaVariables(schema, { outputs: false });
```

**Note**
form-js does not enforce typing. Retrieving schema variables returns the variable names, but not the type or whether the variable is optional (i.e. whether the field is required or not). To retrieve the expected type of the variable, parse the form schema manually. To enforce the typing of input variables, use validation libraries such as [joi](https://github.com/hapijs/joi) .

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/02-embed-forms/02-embed-in-javascript
