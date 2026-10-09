# Amazon S3 connector — Region — Download Document

Download the document from AWS S3.

#### Parameters

| Parameter       | Description                                                                                                                                                                                                                                         |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AWS bucket`    | The targeted AWS S3 bucket that the document should be downloaded from.                                                                                                                                                                             |
| `AWS key`       | The key of the document that uniquely identifies the object in an Amazon S3 bucket.                                                                                                                                                                 |
| `Return format` | How the downloaded content is returned. Select a [return format](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#return-formats): **Document reference**, **As text** (with an optional encoding, default UTF-8), or **As JSON**. |

**Info**
To learn more about Friendly Enough Expression Language (FEEL) expressions,
see [what is FEEL?](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).

#### Response Structure

The following JSON response is returned after a successful document download operation:

- `bucket`: Echoes back the bucket of the downloaded document.
- `key`: Echoes back the unique key of the downloaded document.
- `element`: Represents the downloaded content. Its value depends on the selected **Return format**:
  - **Document reference**: `element` contains a reference to the document created in the Camunda document store.
  - **As text**: `element` contains the content decoded as a string.
  - **As JSON**: `element` contains the content parsed as JSON.

**Note**
**As text** and **As JSON** return the content directly in a process variable and are subject to a size guard (approximately 1.5 MiB). A larger object fails the job with an incident. Use **Document reference** for large files. **As JSON** fails the job when the content is not valid JSON.

#### Example Response

The following examples show a successful download operation response.

With **Document reference**:

```json
{
  "bucket": "Example Subject",
  "key": "report.json",
  "element": {
    "storeId": "in-memory",
    "documentId": "20f1fd6a-d8ea-403b-813c-e281c1193495",
    "metadata": {
      "contentType": "image/webp; name=305a4816-b3df-4724-acd3-010478a54add.webp",
      "size": 311032,
      "fileName": "305a4816-b3df-4724-acd3-010478a54add.webp"
    },
    "camunda.document.type": "camunda"
  }
}
```

With **As JSON**:

```json
{
  "bucket": "Example Subject",
  "key": "report.json",
  "element": {
    "testKey": "testValue"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-s3
