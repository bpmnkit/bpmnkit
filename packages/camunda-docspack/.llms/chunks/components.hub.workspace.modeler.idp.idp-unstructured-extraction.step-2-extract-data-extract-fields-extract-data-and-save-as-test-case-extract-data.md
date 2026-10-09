# Extract unstructured data — Step 2: Extract data {#extract-fields} — Extract data and save as test case {#extract-data}

Once you have added your extraction fields, select a text extraction engine and LLM model, and test the data extraction.

#### Extraction engine selection

With the **Extraction engine** dropdown, you can choose how text is extracted from your documents before the LLM processes the content. Select the engine that best matches your document type and processing needs:

- **Fast Extract**: A lightweight, built-in PDF text parser for digitally generated PDFs. This option is faster and lower cost, but does not support scanned or image-based documents.
- **Multimodal**: Sends the document directly to the LLM for native interpretation, bypassing a separate text extraction step. Useful when the LLM supports vision/multimodal capabilities.
- **AWS Textract**: Uses Amazon Textract OCR for high-accuracy text extraction from scanned or image-based documents.
- **Azure Document Intelligence**: Uses Azure AI Document Intelligence for OCR-based text extraction from scanned or image-based documents.
- **GCP Document AI**: Uses Google Cloud Document AI for OCR-based text extraction from scanned or image-based documents.
- **ABBYY Vantage**: Uses [ABBYY Vantage](https://www.abbyy.com/vantage/) OCR for text extraction. Unlike provider-specific engines, ABBYY Vantage is available across all cloud providers once its [connector secrets](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration#abbyy-secrets) are configured for your environment's cluster.

**Note**
The available extraction engines depend on your environment's cluster configuration and the cloud provider you select for your document extraction template. AWS Textract, Azure Document Intelligence, and GCP Document AI are only available when using their respective provider, while ABBYY Vantage is available across all providers when its connector secrets are configured.

#### Model selection

The **Extraction model** field is both a dropdown and an input field, giving you flexibility in model selection:

- **Dropdown selection**: Choose from a list of pre-configured models available in the dropdown.
- **Custom model input**: If you want to use a model ID that is not part of the dropdown, you can type it directly into the field. This is useful for custom models or specific model versions that may not be listed in the default options.

#### Extract and test

1. **Extraction engine**: Select the text extraction engine you want to use.
1. **Extraction model**: Select the LLM model you want to use.
1. Select the document you want to test the data extraction against.
1. Click **Extract document**.
1. The **Extraction fields** are populated with the extracted document data.
   - Check the extracted data is accurate and matches what you require from the document.
   - For incorrect field results, edit the field **Prompt** and retry the data extraction until the results are accurate.
   - Add additional fields as required during testing.
1. Click **Save as test case** to save the results as a test case.
   - The **Expected output** for each field is now shown below the actual extracted value.
   - Any unexpected extraction results for the field are highlighted.
1. (Optional) Test different LLM models with this test case to compare results and determine which model produces the most accurate extraction.
1. Repeat the process of creating and evaluating a test case for your other uploaded sample documents.
1. Once you are ready to validate your data extraction configuration, select the **Validate extraction** tab.

**Note**

- Running an extraction creates a "test" process instance. You can view this in [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction).
- You will achieve different results using different [extraction models](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference#extraction-models) and extraction engines. Test different combinations until you find the one that best suits your document type, budget, and accuracy requirements.
- You can save and overwrite a test case at any time with your latest results.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction
