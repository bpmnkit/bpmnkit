# REST connector — Response

The following variables are available in the context of the response expression:

- **status**: Response status.
- **body**: Response body of your request. Populated when the **Response format** is **As text** or **As JSON**.
- **headers**: Response headers.
- **document**: Populated when the **Response format** is **Document reference**; represents the stored document:
  - **documentId**: The ID of the stored document.
  - **contentHash**: The hash of the stored document.
  - **storeId**: The store ID.
  - **metadata**: Metadata of the stored document (if available).
    - **size**: Size of the stored document (in bytes).
    - **expiresAt**: Expiration date of the stored document.
    - **fileName**: Name of the stored document.
    - **customProperties**: Custom properties of the stored document.
    - **contentType**: Content type of the stored document.

### Response format

Choose how the response body is returned with the **Response format** dropdown, a [return format](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#return-formats):

- **As JSON** (default): the body is parsed as JSON and returned in `body`.
- **As text**: the body is decoded as a string (with an optional encoding, default UTF-8) and returned in `body`.
- **Document reference**: the body is streamed to the Camunda document store and a reference is returned in `document`.

**Note**
The **As JSON** default fails the job when the response body is not valid JSON. Use **As text** for non-JSON responses.

**As text** and **As JSON** are subject to a size guard (approximately 1.5 MiB); use **Document reference** for large responses.

To store part of the response as a document, use the [`createDocument` FEEL function](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#function-createdocument) in the **Result expression** field.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
