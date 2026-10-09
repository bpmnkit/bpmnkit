# Google Drive connector — Make your Google Drive connector executable — Create a new file from a template

To create a new file from a template, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select Operation** section, set the field value **Operation Type** as **Create File from template**.
3. In the **Operation Details** section, set the field **File name** as the desired name of a folder you wish to create. You can use FEEL expressions here.
4. In the **Operation Details** section, set the field **Template ID** of the desired template.
5. _(optional)_ In the **Operation Details** section, set the field **Parent folder ID** to the desired parent, inside which a new file will be created. Keep in mind that if not specified, a new folder will be created in the Google Drive root folder of a user who owns the OAuth token.
6. In the **Operation Details** section, set the field **Template variables** as desired variables that will be applied to the template. The template variables are compatible with the Google Docs [Requests API](https://developers.google.com/docs/api/reference/rest/v1/documents/request). This property requires FEEL input.
7. _(optional)_ In the **Operation Details** section, you can set the **Additional properties or metadata** field to Google Drive compatible properties. This property requires FEEL input. Check [the appendix](#what-are-the-limitations-of-the-additional-properties-or-metadata) for known values and limitations.

**Note**
Starting from version 8.7.0, the Google Drive connector supports uploading documents from (or downloading documents to) the Camunda document store. Review the **Document** field in the properties panel where the document reference can be provided. See additional details and limitations in [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/googledrive
