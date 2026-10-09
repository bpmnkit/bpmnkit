# Amazon Textract connector — Configuration — Analyze Document

Analyze documents using Textract. Different input parameters are available depending on the **Execution type** you select.

<!-- Legacy anchor: already-distributed element templates link to #execution-types. Do not remove. -->

#### Input parameters

| Property          | Type     | Required             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Example           |
| :---------------- | :------- | :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------- |
| Execution type    | Dropdown | Yes                  | Specify the inference endpoint type:**Real-time**: For small files requiring immediate text extraction. Only single-page PDFs are supported when using S3. For multi-page PDFs, use **Polling** or **Asynchronous**.**Polling**: Starts analysis and polls every five seconds until the result is available. Best for larger documents where blocking execution is acceptable.**Asynchronous**: For large or complex documents processed in the background. | document          |
| Document location | Dropdown | Yes                  | Where the document to be analyzed is stored: **Amazon S3** or **Uploaded document**. Amazon S3 is best for most use-cases.                                                                                                                                                                                                                                                                                                                                                                                                  | Amazon S3         |
| Document bucket   | String   | Yes for Amazon S3    | Name of the S3 bucket containing the document. Ensure proper permissions for Textract access.                                                                                                                                                                                                                                                                                                                                                                                                                               | automation-test   |
| Document name     | String   | Yes for Amazon S3    | Full path from the bucket root to the document.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | my-document.pdf   |
| Document version  | String   | No                   | Specify if you need to process a specific document version. If not set, the latest version is used.                                                                                                                                                                                                                                                                                                                                                                                                                         | 5                 |
| Output S3 Bucket  | String   | Yes for Asynchronous | The S3 bucket where Textract writes the analysis result for asynchronous execution.                                                                                                                                                                                                                                                                                                                                                                                                                                         | automation-output |

When **Document location** is **Uploaded document**, use the **Document source** dropdown to select where that document comes from. Select one of the following options, then complete the field it reveals:

| Document source      | Reveals field        | Description                                                                                                                               |
| :------------------- | :------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Camunda Document** | **Camunda document** | Reference a document in the Camunda document store using a FEEL expression. Supports PNG and JPEG only, and only for real-time execution. |
| **From URL**         | **URL**              | Fetch the document from an external URL.                                                                                                  |

**Note**
Textract does not offer **Inline Content** as a document source, since it requires raw image/PDF bytes rather than the UTF-8 text bytes an inline document stores.

You must select at least one feature type. Combining multiple options can produce richer extraction results.

| Property           | Type    | Required                        | Description                                                         | Example                          |
| :----------------- | :------ | :------------------------------ | :------------------------------------------------------------------ | :------------------------------- |
| Analyze form       | Boolean | No                              | Select this to return information about detected form data.         |                                  |
| Analyze signatures | Boolean | No                              | Select this to return the locations of detected signatures.         |                                  |
| Analyze layout     | Boolean | No                              | Select this to return information about the layout of the document. |                                  |
| Analyze queries    | Boolean | No                              | Select this to return an answer to a query.                         |                                  |
| Query              | String  | Yes, if analyze queries is true | The query to be applied to the document.                            | What is the IBAN in the invoice? |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-textract
