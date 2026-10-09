# IDP reference

Technical reference information for intelligent document processing (IDP), such as technical architecture, supported document file formats, and document storage.

Technical reference information for IDP, including technical architecture, supported documents, and known limitations.


## Technical architecture {#architecture}

IDP offers a composable architecture that allows you to customize and extend IDP capabilities as needed. This flexibility enables you to adapt quickly to evolving business needs while maintaining a streamlined and manageable system.

IDP allows you to create, configure, and publish **document extraction templates** and **document classification templates**. These are types of [connector templates](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-templates).

- **Document extraction templates** extract specific data fields from documents. See [document extraction](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-extraction).
- **Document classification templates** classify documents by type using LLMs. See [document classification](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-classification).

The document extraction template integrates with Camunda document handling connectors and APIs such as [Amazon S3](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-s3), [Amazon Textract](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-textract), [Amazon Comprehend](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-comprehend), and [Amazon Bedrock](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock) to retrieve, analyze, and process documents.

1. **Document upload**: The template accepts uploaded documents as input. These documents can be uploaded to a local document store, and their references used in the extraction process. For example, the connector uploads the document to an Amazon S3 bucket for extraction.

1. **Amazon Textract**: Uploaded documents are analyzed by Amazon Textract, which extracts text data and returns the results. The template configuration includes specifying the document, the S3 bucket name for temporary storage during Amazon Textract analysis, and other required parameters such as extraction fields and Amazon Bedrock Converse parameters.

1. **Amazon Bedrock**: Your [extraction field](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-key-concepts#fields) prompts are used by Amazon Bedrock to extract data from the document. The extracted content is mapped to process variables, and the results stored in a specified result variable.

**Note**

- You may encounter errors during extraction and validation if you have not added your Amazon AWS IAM account `access key` and `secret key` as a [connector secret](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to your environment's cluster. See [configuring IDP](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration).

### Document storage {#storage}

IDP stores documents as follows during the different extraction stages:

<!-- image source: https://miro.com/app/board/uXjVIfhgnNg=/?moveToWidget=3458764620329398964&cot=14  -->

1. Camunda Hub: [Uploaded sample documents](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction#upload-documents) are stored within Camunda Hub itself (SaaS) or the database (Self-Managed).
1. Environment: During [extraction testing](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction#extract-fields) (for example, when you click **Extract document**) the document is stored in the environment's cluster using the [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started) API.
1. Extraction: Finally, when you extract content using a document extraction template, it is stored in an [Amazon AWS S3 bucket](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration#prerequisites), where it can be accessed by AWS Textract.

**Info**
To learn more about storing, tracking, and managing documents in Camunda 8, see [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference
