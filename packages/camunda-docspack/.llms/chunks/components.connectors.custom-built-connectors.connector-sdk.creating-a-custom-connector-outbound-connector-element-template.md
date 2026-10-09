# Connector SDK — Creating a custom connector — Outbound connector element template

[Connector templates](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-templates) act as
the modeling interface for the users of your connector.

The template can be written manually but we recommend using the [`element-template-generator`](https://github.com/camunda/connectors/tree/main/element-template-generator) which generates the element template for your connector as part of your build process.

Element templates define the data and configuration bindings to your connector on the BPMN element via properties. Properties have different types that define their visual representation. They can also be hidden
in the modeling UI but still applied to the BPMN:

```json
{
    ...
    "properties" : [ {
    "type": "Hidden",
    "value": "io.camunda:template:1",
    "binding": {
      "type": "zeebe:taskDefinition",
      "property": "type"
    }
  }
}
```

This type definition `io.camunda:template:1` is the connection configuring which version of your connector runtime behavior to use.
In technical terms, this defines the **Type** of jobs created for tasks in your process model that use this template.
Consult the [job worker](https://docs.camunda.io/docs/next/components/concepts/job-workers) guide to learn more.

Besides the type binding, connector templates also define the input variables of your connector as `zeebe:input` objects.
For example, you can create the input variable `message` of your connector in the element template as follows:

```json
{
  "label": "Message",
  "type": "Text",
  "feel": "optional",
  "binding": {
    "type": "zeebe:input",
    "name": "message"
  }
}
```

You can also define nested data structures to reflect domain objects that group attributes.
For example, you can create the domain object `authentication` that contains the properties
`user` and `token` as follows:

```json
{
  "label": "Username",
  "description": "The username for authentication.",
  "type": "String",
  "binding": {
    "type": "zeebe:input",
    "name": "authentication.user"
  }
},
{
  "label": "Token",
  "description": "The token for authentication.",
  "type": "String",
  "binding": {
    "type": "zeebe:input",
    "name": "authentication.token"
  }
}
```

You can deserialize these authentication properties into a domain object using the SDK.
Visit the [input data](#outbound-connector-input-data) section for further details.

Connectors that offer any kind of result from their invocation should allow users to configure
how to map the result into their processes. Therefore, connector templates can reuse the two
recommended objects, **Result Variable** and **Result Expression**:

```json
{
  "label": "Result Variable",
  "description": "Name of variable to store the response in",
  "type": "String",
  "binding": {
    "type": "zeebe:taskHeader",
    "key": "resultVariable"
  }
},
{
  "label": "Result Expression",
  "description": "Expression to map the response into process variables",
  "type": "Text",
  "feel": "required",
  "binding": {
    "type": "zeebe:taskHeader",
    "key": "resultExpression"
  }
}
```

These objects create custom headers for the jobs created for the tasks that use this template.
The connector runtime environments pick up those two custom headers and translate them into process variables accordingly.
You can find an example of how to use this in the [out-of-the-box REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#response).

All connectors are recommended to offer exception handling to allow users to configure how to map results and technical errors into
BPMN errors. To provide this, connector templates can provide an **Error Expression**:

```json
{
  "label": "Error Expression",
  "description": "Expression to define BPMN Errors to throw",
  "group": "errors",
  "type": "Text",
  "feel": "required",
  "binding": {
    "type": "zeebe:taskHeader",
    "key": "errorExpression"
  }
}
```

This object creates a custom header for the jobs created for the tasks that use this template.
The connector runtime environments pick up this custom header and translate it into BPMN errors accordingly.
You can observe an example of how to use this in the [BPMN errors in connectors guide](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#bpmn-errors-and-failing-jobs).

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk
