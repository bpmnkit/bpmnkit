# Intrinsic functions

Learn how to use intrinsic functions to preprocess connector input data before invoking a connector.

Outbound

Intrinsic functions are transformations you can use to preprocess connector input data before invoking a connector.

- Intrinsic functions are JSON structures you can define in element template input fields.
- Intrinsic functions are executed in the connector runtime.

**Note**
You can only use intrinsic functions with [outbound connectors](https://docs.camunda.io/docs/next/components/connectors/connector-types#outbound-connectors) as they transform data obtained from process variables.


## Use cases

A common use case is to transform a [Camunda document](https://docs.camunda.io/docs/next/components/document-handling/getting-started) to a specific format when using a REST connector.

For example:

- You have a Camunda document containing some data in JSON format.
- You want to send this data in the HTTP request body to a REST API using a connector.

The [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) is capable of handling documents, but the data format in which the document is sent by default may not match the format expected by the REST API.

In this example, the document in the Camunda document store is structured as follows, with the document reference stored in the `document` process variable:

```json
{
  "name": "John Doe",
  "age": 30
}
```

The REST API expects the data in the following format:

```json
{
  "user": {
    "name": "John Doe",
    "age": 30
  }
}
```

In this example, you can use the `getText` intrinsic function to extract the text content from the document and insert it into the request body. The resulting JSON structure of your connector's input would be as follows:

```json
{
  "user": {
    "camunda.function.type": "getText",
    "params": [ document ]
  }
}
```

- `document` is the process variable that contains the document reference.
- The [`getText`](#gettext) function extracts the text content from the document and inserts it into the request body as a string.

**Note**

- You can use intrinsic functions with any outbound connector to execute an operation with a connector input.
- Intrinsic functions are executed in the connector runtime.

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/intrinsic-functions
