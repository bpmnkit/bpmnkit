# Extract unstructured data — Step 2: Extract data {#extract-fields} — Add extraction fields {#add-fields}

Add an extraction field for each piece of data you want to extract from your document(s):

1. **Field name**: Enter a descriptive name for the field.
   - The name format should follow [FEEL naming convention](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-variables#variable-names), for example it is case sensitive and should not include spaces.
   - The **Field name** is used as an output variable in a BPMN process.
   - Example: "invoiceId” or "invoice_id".
1. **Prompt**: Enter a clear and specific prompt to guide the LLM in accurately extracting data.
   - Try to describe the expected outcome in the prompt in clear and concise terms. For guidance and best practice when writing prompts, refer to the [documentation for your chosen LLM extraction model](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference#extraction-models).
   - Example: For an "invoiceDate" field, you might use "The date when the invoice was issued".
1. Click **Add** to add the field.
1. Repeat the process until you have added all required extraction fields.

**Note**
You can edit and delete extraction fields at any time. Click the three vertical dots next to the field to open the Options menu.

There's currently no way to reorder existing fields directly; delete and re-add them in the order you want instead. Extraction fields and prompts are stored as part of the document extraction template in Camunda Hub, not in the BPMN file, so they can't be edited outside Camunda Hub (for example, in an external source control tool).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction
