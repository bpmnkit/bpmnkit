# Extract unstructured data — Step 3: Validate extraction {#validate-extraction}

On the **Validate extraction** tab, test and validate the configured data extraction against your uploaded documents. This step evaluates the data extraction results produced by the selected extraction engine and LLM extraction model using your extraction fields and prompts.

### Validate extraction

To validate the data extraction:

1. Select the **Extraction engine** you want to use for validation.
1. Select the **Project extraction model** you want to use for validation.
1. Click **Test documents** to run the extraction validation against your uploaded sample documents.
1. The extraction validation results are shown in the **Test Case Results** column.
   
   - The [validation status](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference#status) is shown for each field to indicate the accuracy of the data extracted from each document. For example, if the extracted value matches the expected test case output, it is shown as a “Pass”.
   - Click on a field to expand the detailed results for each individual document.
   - A **Field extraction summary** shows a summary percentage value for the overall extraction accuracy to allow you to quickly compare extraction accuracy between different LLM extraction models.
     
1. Perform any actions required due to the validation results such as saving missing test cases or reviewing documents. If your validation results remain unsatisfactory, try the following before rerunning the validation:
   - Change the extraction engine to try a different text extraction approach (for example, switch from PDF Parser to an OCR-based engine for scanned documents).
   - Change the extraction model to try and obtain more accurate results with a different model.
   - Edit your extraction field prompts. Select the three vertical dots on a field to open the actions menu, and select **Edit**.
   - Go back to a previous step and edit your data extraction configuration, or upload more sample documents.
1. Once you are satisfied with the extraction accuracy, extraction engine, and extraction model, publish the document extraction template.

### Publish document extraction template {#publish-template}

Publish the document extraction template to make it available for [integration into your processes](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-integrate)<!-- and [document automation](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-automation) projects -->.

1. Click **Publish** and select either:
   - **Publish to workspace**: The document extraction template is made available to all projects within the workspace.
   - **Publish to organization**: The document extraction template is made available to all workspaces within the organization. This option is only available for Organization Owners or Organization Admins.

1. On the **Publish Extraction Project** dialog, configure the publish settings.
   - **Extraction engine**: Select the text extraction engine to use for the published document extraction template.
   - **Version name**: Enter a version for the published document extraction template.
   - **Version description**: Enter a description for the published document extraction template version.
   - **Extraction model**: Select the extraction model you want to use for the published document extraction template.

1. Click **Publish** to make the document extraction template available for [integration into your processes](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-integrate)<!--  and [document automation](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-automation) projects -->.

**Note**

- The most recent **Field extraction summary** results are shown for your chosen **Extraction engine** and **Extraction model** combination.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction
