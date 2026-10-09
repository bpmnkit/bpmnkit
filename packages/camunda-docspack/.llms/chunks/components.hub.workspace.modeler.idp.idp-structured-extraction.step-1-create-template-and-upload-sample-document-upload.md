# Extract structured data — Step 1: Create template and upload sample document {#upload}

In your [IDP project](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-projects), click **Create new**, select **Extraction template**, then select **Structured form extraction**, and enter a name, description, and select the provider.

**Note**
After publishing, the template name and description is shown in the element selector when used in a process diagram. Use a clear name and concise description to help other users find and understand when to use the template.

![Create form extraction template](img/idp-create-extraction-project.png)

You can edit the description and provider later via the vertical ellipses menu button next to the template name, but changes to the template are only applied after republishing.

After creating the template, the new template screen opens. You can upload a sample document that represents the type of document you want to extract data from.

![Upload a sample document](img/idp-structured-instructions-upload.png)

To upload your sample document:

1. Drag your sample document into the box or click **Drag and drop a PDF file here or click to upload a file** to browse and upload your sample document.
2. Once you have finished uploading your sample document, the extraction process starts automatically.
   - The extraction process retrieves the fields and tables from the document.
   - The extracted fields and tables are displayed in the **Fields** and **Tables** tabs.

![Extracted fields and tables](img/extracted-fields-and-tables.png)

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-structured-extraction
