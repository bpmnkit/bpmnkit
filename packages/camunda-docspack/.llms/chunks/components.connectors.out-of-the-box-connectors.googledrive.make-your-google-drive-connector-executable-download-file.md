# Google Drive connector — Make your Google Drive connector executable — Download file

To download a file, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select Operation** section, set the field value **Operation Type** to **Download File**.
3. In the **Operation Details** section, set the field _File ID_ to the google drive file that will be downloaded. For more information, refer to the [file id appendix](#Where-do-I-get-File-ID).
4. Select a [return format](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#return-formats) for the downloaded content: **Document reference** (default), **As text** (with an optional encoding, default UTF-8), or **As JSON**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/googledrive
