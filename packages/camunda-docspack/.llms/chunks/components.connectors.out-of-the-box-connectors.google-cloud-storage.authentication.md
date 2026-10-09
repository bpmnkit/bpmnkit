# Google Cloud storage connector — Authentication

### Create a new connector secret

To keep your **JSON key** secure, avoid including it directly in the BPMN XML. Instead, create a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets).
2. Name your secret (e.g., `GOOGLE_SERVICE_ACCOUNT_KEY`) for reference in the connector configuration.


## Operation

Select the desired operation from the **Operation** dropdown.

### Upload document

1. Enter the **project ID**.
2. Enter the **bucket name**.
3. (Optional) Enter the **File name**. If left blank, the filename from the document metadata will be used.
4. Select a [document source](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#document-sources) for the **Document to upload**: a **Camunda document** reference, **inline content** built from process data, or an **external document** URL.

**Note**
Use **inline content** to build a file (for example, a `.json` file) directly from process variables without first storing it in the Camunda document store. See [inline documents](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#inline-documents).

If a document with the same name already exists in the bucket, it will be overwritten. If object versioning is enabled, previous versions can be restored.

### Download document

1. Enter the **project ID**.
2. Enter the **bucket name**.
3. Enter the **File name** to download.
4. Select a [return format](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#return-formats) for the downloaded content:
   - **Document reference**: a reference to a document created in the Camunda document store is returned in `document`.
   - **As text**: the content is decoded to a string (with an optional encoding, default UTF-8) and returned in `content`.
   - **As JSON**: the content is parsed as JSON and returned in `content`.

**Note**
**As text** and **As JSON** return the content directly in a process variable and are subject to a size guard (approximately 1.5 MiB); use **Document reference** for large files. **As JSON** fails the job when the content is not valid JSON.

If the specified file is not found, the operation will fail and return an error message.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-cloud-storage
