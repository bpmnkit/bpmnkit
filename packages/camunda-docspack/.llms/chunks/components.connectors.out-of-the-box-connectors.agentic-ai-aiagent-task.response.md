# AI Agent Task connector — Response

Configure the response format by specifying how the model should return its output (text or JSON) and how the connector should process and handle the returned response.

The outcome of an LLM call is stored as an **assistant message** designed to contain multiple content blocks.

- This message always contains a single text content block for the currently supported providers/models.
- The connector returns the **first content block** when handling the response, either as a text string or as a parsed JSON object.

| Field                     | Required | Description                                                                                                                                                                                                    |
| :------------------------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Response format           | Yes      | Instructs the model which response format to return.This can be either text or JSON.JSON format support varies by provider and model.                                 |
| Include assistant message | No       | Returns the entire message returned by the LLM as `responseMessage`, including any additional content blocks and metadata.Select this option if you need more than just the first response text. |

#### Text response format

If not configured otherwise, this format is used by default and returns a `responseText` string as part of the
connector response.

| Field              | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :----------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parse text as JSON | No       | If this option is selected, the connector will attempt to parse the response text as JSON and return the parsed object as `responseJson` in the connector response.Use this option for models that do not support the JSON response format in combination with a prompt instructing the model to return a JSON response.If parsing fails, the connector does not return an `responseJson` object, but only returns the original response text as `responseText`. |

For an example prompt that instructs the model to return a JSON response,
(see [Anthropic documenation](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency#example-enhancing-it-support-consistency)):

```
Output in JSON format with keys: "sentiment" (positive/negative/neutral), "key_issues" (list), and "action_items" (list of dicts with "team" and "task").
```

#### JSON response format

If the model supports it, selecting JSON as response format instructs the model to always return a JSON response. If the model does not return a valid JSON response, the connector throws an error.

To ensure the model generates data according to a specific JSON structure, you can optionally provide a
[JSON Schema](https://json-schema.org/). Alternatively, you can instruct the model to return JSON following a specific
structure as shown in the text example above.

Support for JSON responses varies by provider and model:

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task
