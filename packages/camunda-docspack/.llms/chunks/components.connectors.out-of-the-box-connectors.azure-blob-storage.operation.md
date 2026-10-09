# Azure blob storage connector — Operation

Select the desired operation from the **Operation** dropdown.

### Upload document

1. Enter the **Container name** — it must match the container the **SAS token** was created for.
2. (Optional) Enter the **File name**. If left blank, the filename from the document metadata will be used.
3. Select a [document source](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#document-sources) for the **Document to upload**: a **Camunda document** reference, **inline content** built from process data, or an **external document** URL.

**Note**
Use **inline content** to build a file (for example, a `.json` file) directly from process variables without first storing it in the Camunda document store. See [inline documents](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#inline-documents).

If an uploaded document already exists in the container with the same name, it will be overwritten. Depending on the settings made on the Azure Storage Account, the previous version of the document may still be accessible in the file version history.

### Download document

1. Enter the **Container name** — it must match the container the **SAS token** was created for.
2. Enter the **File name** to download.
3. Select a [return format](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#return-formats) for the downloaded content:
   - **Document reference**: a reference to a document created in the Camunda document store is returned in `document`.
   - **As text**: the content is decoded to a string (with an optional encoding, default UTF-8) and returned in `content`.
   - **As JSON**: the content is parsed as JSON and returned in `content`.

**Note**
**As text** and **As JSON** return the content directly in a process variable and are subject to a size guard (approximately 1.5 MiB); use **Document reference** for large files. **As JSON** fails the job when the content is not valid JSON.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/azure-blob-storage
