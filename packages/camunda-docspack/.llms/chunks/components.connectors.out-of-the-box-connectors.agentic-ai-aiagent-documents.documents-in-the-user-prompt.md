# AI Agent document support — Documents in the user prompt

Use the [user prompt](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess#user-prompt) **Documents** field to add a list of document
references the agent can interact with. The list is internally resolved and passed to the LLM if the document type is
supported.

LLM APIs allow the user prompt to be specified as a list of content blocks. Each supported document reference is
resolved to a corresponding content block and passed as part of the user message. For examples of how LLM providers
accept document content blocks, refer to the
[Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/vision#base64-encoded-image-example) and
[OpenAI](https://platform.openai.com/docs/guides/images-vision#giving-a-model-images-as-input) documentation.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-documents
