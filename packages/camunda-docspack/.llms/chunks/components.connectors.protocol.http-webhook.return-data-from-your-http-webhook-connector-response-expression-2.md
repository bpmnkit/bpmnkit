# HTTP Webhook connector — Return data from your HTTP Webhook connector — Response expression (2)

```json
{
  "processInstanceKey": 6755399441144562,
  "tenantId": "<default>"
}
```

If the `synchronous` response mode is selected, the response also contains the result `variables` from the execution.

```json
{
  "processInstanceKey": 6755399441144562,
  "tenantId": "<default>",
  "variables": {...}
}
```

#### Use the `documents` object

You can access created documents in both the response expression and the result expression.

The `documents` object contains the references for created documents. See additional details and limitations in [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

**Example response expression**

```json
{
  "body": {
      "message": "Document created",
      "documents": documents
  }
}
```

If the `documents` list is not empty, document items are returned in the following format (example values provided):

```json
{
  "storeId": "in-memory",
  "documentId": "2b7215da-12b1-4374-8743-85d6854fcba5",
  "metadata": {
    "size": 405551,
    "expiresAt": null,
    "fileName": "my-image.jpg",
    "customProperties": null,
    "contentType": "image/jpeg"
  }
}
```

**Note**
Request parts are automatically stored in the configured document store when sending a multipart request.

To extract a document from a base64-encoded field in a non-multipart request body, use the [`createDocument` FEEL function](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#function-createdocument) in the **Result expression** field.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
