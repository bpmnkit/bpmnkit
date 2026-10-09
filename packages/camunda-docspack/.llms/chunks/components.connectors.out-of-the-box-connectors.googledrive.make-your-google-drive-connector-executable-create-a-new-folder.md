# Google Drive connector — Make your Google Drive connector executable — Create a new folder

To create a new folder, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select Operation** section, set the field value **Operation Type** as **Create Folder**.
3. In the **Operation Details** section, set the field **Folder name** as the desired name of a folder you wish to create. For example, `MyNewFolder`. Alternatively, you could use a FEEL expression.
4. _(optional)_ In the **Operation Details** section, set the field **Parent folder ID** to the desired parent, inside which a new folder will be created. Keep in mind that if not specified, a new folder will be created in the Google Drive root folder of a user who owns the OAuth token.
5. _(optional)_ In the **Operation Details** section, you can set the **Additional properties or metadata** field to Google Drive compatible properties. For example, _description_ of the folder. This property requires FEEL input. Check [the appendix](#what-are-the-limitations-of-the-additional-properties-or-metadata) for known values and limitations.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/googledrive
