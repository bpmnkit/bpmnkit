# Google Drive connector — Make your Google Drive connector executable — Upload file

To upload a file, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select Operation** section, set the field value **Operation Type** to **Upload File**.
3. _(optional)_ In the **Operation Details** section, set the field **Parent folder ID** to the desired parent, inside which a new file will be created. If not specified, a new folder is created in the Google Drive root folder of the user who owns the OAuth token.
4. In the **Document** section, select a [document source](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#document-sources): a **Camunda document** reference, **inline content** built from process data, or an **external document** URL.

**Note**
Use **inline content** to build a file directly from process variables without first storing it in the Camunda document store. See [inline documents](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#inline-documents).

To upload a **Camunda document**, it must exist first — [using the Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-document.api) for example. The result of the endpoint must then be assigned to a variable in **Start Process instance** so you can use the variable in the **Document** field.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/googledrive
