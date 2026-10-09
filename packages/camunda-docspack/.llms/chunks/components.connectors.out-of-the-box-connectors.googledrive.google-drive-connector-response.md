# Google Drive connector — Google Drive connector response

The following response types can be returned by the _Google Drive connector response_, depending on the **Operation Type** selected.

### Response type for list of operations

- **Create Folder**
- **Create File from template**
- **Upload File**

The **Google Drive connector response** exposes the Google Drive API response as a local variable named "response".

The following fields are available in the response variable:

- `googleDriveResourceId`: The ID of the newly created resource.
- `googleDriveResourceUrl`: Human-readable URL of the newly created resource.

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables. For example:

```
= {
  "myNewReportFolderId": response.googleDriveResourceId,
  "myNewReportFolderUrl": response.googleDriveResourceUrl
}
```

### Response type for _Download file_ operation only

The response depends on the selected [return format](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#return-formats):

- **Document reference** (default) returns a document created in the Camunda document store, identical to the [REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-document.api). For example:

```
{
    "camunda.document.type": "camunda",
    "storeId": "in-memory",
    "documentId": "c3c8e499-321d-421c-afa2-4632d2f5ce48",
    "metadata": {
        "contentType": "image/png",
        "fileName": "file name",
        "size": 66497,
        "customProperties": {}
    }
}
```

- **As text** returns the content decoded as a string, and **As JSON** returns it parsed as JSON. Both are subject to a size guard (approximately 1.5 MiB); use **Document reference** for large files.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/googledrive
