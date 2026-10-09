# GraphQL connector — Response mapping

The HTTP response will be available in a temporary local `response` variable. This variable can be mapped to the process by specifying the **Result Variable**.

The following fields are available in the `response` variable:

- **status**: Response status
- **body**: Response body of your request. Populated when the **Response format** is **As text** or **As JSON**.
- **headers**: Response headers
- **document**: Populated when the **Response format** is **Document reference**; a reference to the response stored in the Camunda document store.

### Response format

Choose how the response body is returned with the **Response format** dropdown, a [return format](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#return-formats):

- **As JSON** (default): the body is parsed as JSON and returned in `body`.
- **As text**: the body is decoded as a string (with an optional encoding, default UTF-8) and returned in `body`.
- **Document reference**: the body is streamed to the Camunda document store and a reference is returned in `document`.

**Note**
The **As JSON** default fails the job when the response body is not valid JSON. Use **As text** for non-JSON responses. **As text** and **As JSON** are subject to a size guard (approximately 1.5 MiB); use **Document reference** for large responses.

Additionally, you can choose to unpack the content of your `response` into multiple process variables using the **Result Expression**, which is a [FEEL Context Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-context-expressions).

```text
= {
    person: response.body.data.person
}
```

The next steps in your process will have access to the `graphqlQueryResponse` variable that contain the full response and the mapped variable from the result expression: `person`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/graphql
