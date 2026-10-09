# AI Agent Task connector — Error handling

If an error occurs, the AI Agent connector throws an error and includes the error response in the error variable in Operate.

| Field            | Required | Description                                                                                                                                                        |
| :--------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Error expression | No       | You can handle an AI Agent connector error using an Error Boundary Event and [error expressions](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#error-expression). |

In the error expression, you can handle the following error codes emitted by the AI Agent connector to respond to specific situations. For example, you can map a specific error code to a BPMN error and model
your process accordingly.

| Error code                                   | Description                                                                                                                                                                                                                                                     |
| :------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FAILED_MODEL_CALL`                          | The call to the LLM API failed, for example, due to misconfiguration or invalid credentials. The error message contains additional details.                                                                                                                     |
| `MODEL_RESPONSE_CONTENT_FILTERED`            | The LLM provider blocked the model response with content filtering. This can happen when the provider's safety filters stop the model from returning response content.                                                                                          |
| `FAILED_TO_PARSE_RESPONSE_CONTENT`           | The AI Agent was configured to parse the LLM response as JSON, but parsing failed.                                                                                                                                                                              |
| `MAXIMUM_NUMBER_OF_MODEL_CALLS_REACHED`      | The AI Agent reached the configured maximum number of model calls.                                                                                                                                                                                              |
| `MIGRATION_MISSING_TOOLS`                    | Tools referenced by the AI Agent were removed after a process instance migration. Removing or renaming tools is not supported. See [process instance migrations](https://docs.camunda.io/docs/next/agentic-ai-aiagent#process-instance-migrations) for more details.                  |
| `MIGRATION_GATEWAY_TOOL_DEFINITIONS_CHANGED` | Gateway tool definitions have changed after a process instance migration. Adding or removing gateway tools to a running agent is not supported. See [process instance migrations](https://docs.camunda.io/docs/next/agentic-ai-aiagent#process-instance-migrations) for more details. |
| `NO_USER_MESSAGE_CONTENT`                    | No user message content, either from a user prompt or a document, was provided to the agent.                                                                                                                                                                    |
| `TOOL_CALL_RESULTS_ON_EMPTY_CONTEXT`         | Tool call results were passed to the AI Agent despite an empty context, which typically indicates a misconfiguration of the agent context.                                                                                                                      |

The AI Agent Task generates the following error codes when creating the tool schema from the process definition XML:

| Error code                           | Description                                                                                              |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `AD_HOC_SUB_PROCESS_XML_FETCH_ERROR` | The process definition XML could not be fetched.                                                         |
| `AD_HOC_SUB_PROCESS_NOT_FOUND`       | The ad-hoc sub-process with the configured ID could not be found in the process definition XML.          |
| `AD_HOC_TOOL_DEFINITION_INVALID`     | The ad-hoc sub-process contains invalid tool definitions which can't be transformed into a tool schema. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task
