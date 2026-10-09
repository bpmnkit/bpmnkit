# Document classification — Configure a classification template — Step 1: Define document types {#define-document-types}

On the **Define classifications** tab, configure the document types that the LLM uses to classify incoming documents.

#### Add document types

You must define at least two document types before you can publish a classification template.

You can add document types from preconfigured types or create custom types:

**Add preconfigured document types**

IDP provides a set of preconfigured document types (such as invoice, contract, identity document) to help you get started quickly.

1. Click **Add document type**.
2. Browse or search the list of available preconfigured document types.
3. Select the document types you want to add.

**Create custom document types**

Create your own document types for document categories specific to your business.

1. Click **Add document type** and select **Create custom type**.
2. **Name**: Enter a descriptive name for the document type (for example, "Purchase Order" or "Medical Claim").
3. **Description**: Enter a description to help the LLM understand the characteristics of this document type.
4. **Classification instructions**: Provide specific instructions to guide the LLM in recognizing this document type. For example, describe key features, typical content, or distinguishing characteristics.

#### Edit document types

You can edit all aspects of a document type at any time, including:

- **Name**: The display name of the document type.
- **Description**: A description of the document type's characteristics.
- **Classification instructions**: Instructions that guide the LLM in classifying documents of this type.
- **Output value**: The value returned in the process when a document is classified as this type. For example, the document type "ID Document" might have an output value of `id-document`. This allows you to align classification output with your business process definitions.

To edit a document type, select it from the list and modify the fields as needed.

#### Remove document types

To remove a document type, select the document type and use the actions menu to delete it.

**Note**
You must have at least two document types defined to publish a classification template.

#### Configure fallback behavior {#fallback}

You can configure the **fallback output value**, which is the value returned when a document cannot be classified as any of the defined types. By default, this value is `unclassified-document`.

You can customize this value to align with your process routing logic.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-classification
