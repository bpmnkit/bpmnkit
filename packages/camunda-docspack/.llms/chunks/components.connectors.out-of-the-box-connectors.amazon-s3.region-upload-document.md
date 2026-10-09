# Amazon S3 connector — Region — Upload Document

Upload a document to S3.

#### Parameters

| Parameter    | Description                                                                                                                                                                                                                                            |
| :----------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AWS bucket` | The targeted AWS S3 bucket where the document should be uploaded.                                                                                                                                                                                      |
| `AWS key`    | (Optional) The key of the document that uniquely identifies the object in an Amazon S3 bucket. Will fallback to the document filename if not set                                                                                                       |
| `Document`   | The document to upload. Select a [document source](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#document-sources): a **Camunda document** reference, **inline content** built from process data, or an **external document** URL. |

**Note**
Use **inline content** to build a file (for example, a `.json` error report) directly from process variables without first storing it in the Camunda document store. See [inline documents](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#inline-documents).

**Info**
To learn more about Friendly Enough Expression Language (FEEL) expressions,
see [what is FEEL?](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).

#### Response Structure

The following JSON response is returned after a successful document upload operation:

- `bucket`: Echoes back the bucket of the uploaded document.
- `key`: Echoes back the unique key of the uploaded document.
- `link`: The document link.

**Note**
Starting from version 8.7.0, the Amazon S3 connector supports uploading documents from (or downloading documents to) the Camunda document store. Review the **Document** field in the properties panel where the document reference can be provided. See additional details and limitations in [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

#### Example Response

The following example shows a successful send upload operation response:

```json
{
  "bucket": "Example Subject",
  "key": true,
  "link": "https://mybucket.s3.amazonaws.com/test"
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-s3
