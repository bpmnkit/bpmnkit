# REST connector — Request — HTTP Headers

Similarly to the Query Parameters, the **HTTP headers** can be specified using the [FEEL Map](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-data-types#context) data type.

```
= {
    Origin: "https://modeler.camunda.io/"
}
```

#### Content-Type

If you do not set the `Content-Type` header in your HTTP headers, the connector will automatically set the `Content-Type` to `application/json`.

If you set the `Content-Type` header to `multipart/form-data`, only body fields that are documents or plain strings will be sent as multipart form data. All other fields, such as JSON objects, will be ignored.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
