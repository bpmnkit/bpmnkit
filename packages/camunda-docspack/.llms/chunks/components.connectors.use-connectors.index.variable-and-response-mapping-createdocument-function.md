# How to use connectors — Variable and response mapping — `createDocument` function

Starting with 8.10.0, you can use `createDocument` in the **Result expression** and **Error expression** fields.

The function converts part of a Connector response into a [document reference](https://docs.camunda.io/docs/next/components/document-handling/getting-started), so you can store the relevant content without storing the entire response.

| Item    | Type              | Description                                                          |
| ------- | ----------------- | -------------------------------------------------------------------- |
| `value` | String or context | Content and optional metadata used to create the document reference. |
| Result  | Context           | The generated document reference.                                    |

If `value` is a string, `createDocument` treats it as base64-encoded content without metadata:

```feel
createDocument(response.body.file[1].document.data)
```

If `value` is a context, it can contain the following fields:

| Field                | Required | Description                                                                                                                                                                                                                       |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content` or `data`  | Yes      | The base64-encoded document content. Either key name is accepted.                                                                                                                                                                 |
| `name` or `fileName` | No       | The filename. If you omit this field, `createDocument` automatically generates a UUID.                                                                                                                                            |
| `contentType`        | No       | The MIME type of the content. If you omit this field, `createDocument` infers the type from the file extension in `name` or `fileName`. If neither field contains an extension, the value defaults to `application/octet-stream`. |

```feel
createDocument({
  data: response.body.file[1].document.data,
  name: response.body.file[1].filename
})
```

The Connector runtime does not provide a `createDocuments` function. To extract multiple documents, use a FEEL iteration:

```feel
= { documents: for f in response.body.file return createDocument(f.document) }
```

Before using `createDocument`, configure a document store for the Connector runtime. For configuration details, see [Document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
