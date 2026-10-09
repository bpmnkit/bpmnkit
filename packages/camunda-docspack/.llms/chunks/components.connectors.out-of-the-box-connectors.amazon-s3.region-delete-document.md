# Amazon S3 connector — Region — Delete Document

Delete the document from AWS S3.

#### Parameters

| Parameter    | Description                                                                         |
| :----------- | :---------------------------------------------------------------------------------- |
| `AWS bucket` | The targeted AWS S3 bucket that the document should be deleted from.                |
| `AWS key`    | The key of the document that uniquely identifies the object in an Amazon S3 bucket. |

**Info**
To learn more about Friendly Enough Expression Language (FEEL) expressions,
see [what is FEEL?](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).

#### Response Structure

The following JSON response is returned after a successful document deletion operation:

- `bucket`: Echoes back the bucket of the uploaded document.
- `key`: Echoes back the unique key of the uploaded document.

#### Example Response

The following example shows a successful deletion operation response:

```json
{
  "bucket": "Example Subject",
  "key": "document.txt"
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-s3
