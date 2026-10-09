# Amazon Bedrock connector — Region — Converse

This action is meant to start or continue a conversation with a model.

A model ID must be specified. Find all available model IDs for Amazon
Bedrock [in the model ID documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html).

**Note**
Ensure the model is available in your region, that your model can invoke the `Converse` action, and you are a user with adequate rights.

- `New Message` is either the first message (to start a conversation) or is the next message from an already started conversation.
- `Documents` is a list of documents to include as part of your **new message**.
  - Each document uses a [document source](https://docs.camunda.io/docs/next/components/document-handling/send-document-to-external-system#document-sources): a **Camunda document** reference, **inline content** built from process data, or an **external document** URL. Use the **Single/Multiple** toggle to provide one document or a FEEL array of documents.
  - See [Amazon Bedrock supported document formats](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-ds.html) for currently supported file formats.
  - To use a **Camunda document**, upload it first — [using the Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-document.api) for example — and assign the result to a variable in **Start Process instance** so you can reference it in the **Documents** field.
- `Message History` is the history of the conversation that should always be passed. If not set, this will be a new conversation.

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables.

The **Response** is a list of consecutive messages of the user and the assistant.

**Info: important**
The current implementation supports the assistant's responses only in text format.

Ideally, the message's history must transit within the process and be the input of this `Converse` task with the new message.

**Note**
Starting from version 8.7.0, the Amazon Bedrock connector supports consuming documents as inputs for conversations. Review the **Document** field in the properties panel where the document reference can be provided. See additional details and limitations in [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock
