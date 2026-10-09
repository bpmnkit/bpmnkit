# Document extraction — Create document extraction template

To create a new document extraction template:

1. In your [IDP project](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-projects), click **Create new** and select **Extraction template** to open the Create new project modal.
   
1. Select the **Extraction method** depending on whether your documents contain structured or unstructured data.
   - **Unstructured data extraction**: Extract data from unstructured documents.
   - **Structured form extraction**: Extract data from structured documents.
1. **Template Name**: Enter a descriptive name for the type of document, such as “Invoice type A” for example.
1. **Description**: Enter a description to provide more detailed information about the document type.
1. **Provider**: Select the cloud provider you want to use for document extraction. The available providers depend on the connector secrets configured for your environment's cluster.

   

   The four supported providers are:
   - **AWS**: Amazon Web Services with Bedrock and Textract (supports both structured and unstructured extraction)
   - **Azure**: Microsoft Azure with AI Document Intelligence and AI Foundry (unstructured extraction only)
   - **GCP**: Google Cloud Platform with Vertex AI and Document AI (supports both structured and unstructured extraction)
   - **OpenAI compatible**: Any provider that implements the OpenAI `/chat/completions` API (unstructured extraction only)

**Note**
   If the connector secrets for a specific provider are missing from your environment's cluster configuration, that provider will be unavailable for selection. To enable additional providers, configure the required connector secrets as described in the [IDP configuration guide](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration).

1. Click **Create** to create and open the new document extraction template.
1. Configure and publish the template:
   - [Extract unstructured data](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction): Configure and publish an unstructured data extraction template.
   - [Extract structured data](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-structured-extraction): Configure and publish a structured data extraction template.

**Tip**
Not sure which extraction method to use? See [structured and unstructured documents](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-key-concepts#structured-and-unstructured-documents) to help determine what type of document(s) you will be processing.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-extraction
