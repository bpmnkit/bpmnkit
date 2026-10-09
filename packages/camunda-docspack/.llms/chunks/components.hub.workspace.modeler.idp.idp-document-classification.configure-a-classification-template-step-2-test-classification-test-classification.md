# Document classification — Configure a classification template — Step 2: Test classification {#test-classification}

On the **Test template** tab, upload sample documents and evaluate the classification results using different LLM models.

#### Upload test documents

Upload sample documents that represent the types of documents you expect to classify.

1. Click **Upload documents** to browse for and upload your sample documents. Batch upload is supported.
2. For each upload batch, assign an **expected document type** to enable validation of classification results. The available document types are those you defined in [Step 1](#define-document-types).

#### Run classification tests {#run-tests}

Select an extraction engine and LLM model, then run classification tests against your uploaded documents.

1. **Extraction engine**: Select the [text extraction engine](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-key-concepts#extraction-engines) to use for text extraction before classification.
2. **Extraction model**: Select the LLM model to use for classification.
3. Click **Classify documents** to run the classification.

#### Review classification results {#review-results}

After running a classification test, the results are displayed for each document:

- **Classified document type**: The document type assigned by the LLM.
- **Reasoning**: The LLM's explanation for why it chose this document type.
- **Tokens used**: The number of tokens consumed during classification.
- **Latency**: The time taken for classification.

Validation indicators show whether the classification matches the expected type.

A **summary** of the classification results is shown, allowing you to quickly compare the success rate across different models.

**Note**
Test different combinations of extraction engines and LLM models to find the combination that best suits your document types, budget, and accuracy requirements.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-classification
