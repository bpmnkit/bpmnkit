# AI Agent Sub-process connector — Configuration — Response

Configure the response format by specifying how the model should return its output (text or JSON) and how the connector should process and handle the returned response.

The outcome of an LLM call is stored as an **assistant message** designed to contain multiple content blocks.

- This message always contains a single text content block for the currently supported providers/models.
- The connector returns the **first content block** when handling the response, either as a text string or as a parsed JSON object.

| Field                     | Required | Description                                                                                                                                                                                                    |
| :------------------------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Response format           | Yes      | Instructs the model which response format to return.This can be either text or JSON.JSON format support varies by provider and model.                                 |
| Include assistant message | No       | Returns the entire message returned by the LLM as `responseMessage`, including any additional content blocks and metadata.Select this option if you need more than just the first response text. |

As the agent context is only needed outside the ad-hoc sub-process when modeling a response follow-up or external processing, there is an additional field to configure whether the context should be returned as part of the response:

| Field                 | Required | Description                                                                                                                                                                                                                                                                                                           |
| :-------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Include agent context | No       | Returns the agent context variable as part of the response object.Necessary when modeling a response follow-up in combination with an AI agent process as otherwise the context will only be kept in the process' internal state.Only applicable to the **AI Agent Sub-process** implementation. |

#### Text response format

If not configured otherwise, this format is used by default and returns a `responseText` string as part of the
connector response.

| Field              | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :----------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parse text as JSON | No       | If this option is selected, the connector will attempt to parse the response text as JSON and return the parsed object as `responseJson` in the connector response.Use this option for models that do not support the JSON response format in combination with a prompt instructing the model to return a JSON response.If parsing fails, the connector does not return an `responseJson` object, but only returns the original response text as `responseText`. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess
