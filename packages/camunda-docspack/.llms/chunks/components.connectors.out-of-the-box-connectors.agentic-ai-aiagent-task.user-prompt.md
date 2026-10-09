# AI Agent Task connector — User Prompt

The **User Prompt** contains the actual request to the LLM model.

| Field       | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :---------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| User prompt | Yes      | This could either contain the initial request or a follow-up request as part of a response follow-up.The value provided as part of this field is added to the conversation memory and passed to the LLM call.For example, in the [example conversation](#example-conversation), this would be the messages prefixed with `User:`.You can use FEEL expressions to add dynamic values into the text. |
| Documents   | No       | Add a list of [document references](https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/overview) to allow an AI agent to interact with documents and images. The list is internally resolved and passed to the LLM as content blocks if the document type is supported.See [document support](https://docs.camunda.io/docs/next/agentic-ai-aiagent-documents) for supported file types and details.                                                                                      |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task
