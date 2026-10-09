# REST connector — Request — Request body

When you are making a PUT, POST, or PATCH request, you might need to provide a body.
You can provide a body for your request under the **Payload** section in the **Request body** field.

```
= {
     "temp": 25,
     "pressure": 1013,
     "humidity": 44,
     "temp_min": 16,
     "temp_max": 30
}
```

#### File upload

To upload a file, you can take advantage of [Camunda document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

Depending on the `Content-Type`, the file will be uploaded as a binary or a JSON object (base64 encoded).

- **Binary**: The file will be uploaded as a binary object. The `Content-Type` header **must** be set to `multipart/form-data`. The body must a map, where the key is the name of the file field and the value is a document reference.
  ![connectors-rest-upload](../../../images/connectors/connectors-rest-upload.png)
- **JSON**: The file will be uploaded as a JSON object. The `Content-Type` header **must** be set to `application/json` (this is the default). The body must be a map, where the key is the name of the file field and the value is a document reference, similar to the binary upload. The file will be **base64 encoded** and included in the JSON object.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
