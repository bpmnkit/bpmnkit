# AI Agent Task connector — Response (2)

- **OpenAI**: Selecting the JSON response format is equivalent to using the [JSON mode](https://platform.openai.com/docs/guides/structured-outputs?api-mode=chat#json-mode). Providing a JSON Schema instructs the model to return [structured outputs](https://platform.openai.com/docs/guides/structured-outputs?api-mode=chat#structured-outputs-vs-json-mode).
- **Anthropic**: JSON response format requires a JSON Schema. See [Anthropic's structured outputs documentation](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).
- **AWS Bedrock**: JSON response format requires a JSON Schema. See [AWS Bedrock structured output documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/structured-output.html).
- **Other providers**: Consult the provider's documentation to check if JSON response format is supported. If not, use the text response format with the **Parse text as JSON** option instead.

| Field                     | Required | Description                                                                                                                                                                                                                                         |
| :------------------------ | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Response JSON schema      | No       | Describes the desired response format as [JSON Schema](https://json-schema.org/).See [OpenAI's structured outputs documentation](https://platform.openai.com/docs/guides/structured-outputs?api-mode=chat#introduction) for examples. |
| Response JSON schema name | No       | Depending on the provider, the schema must be configured with a name for the schema (such as `Person`).Ideally this name describes the purpose of the schema to make the model aware of the expected data.                            |

For example, the following shows an example JSON Schema describing the expected response format for a user profile:

```feel
={
  "type": "object",
  "properties": {
    "userId": {
      "type": "number"
    },
    "firstname": {
      "type": "string"
    },
    "lastname": {
      "type": "string"
    }
  },
  "required": [
    "userId",
    "firstname",
    "lastname"
  ]
}
```

#### Assistant message

If the **Include assistant message** option is selected, the response from the AI Agent connector contains a
`responseMessage` object that includes the assistant message, including all content blocks and metadata. For example:

```json
{
  "responseMessage": {
    "role": "assistant",
    "content": [
      {
        "type": "text",
        "text": "Based on the result from the GetDateAndTime function, the current date and time is:\n\nJune 2, 2025, 09:15:38 AM (Central European Summer Time)."
      }
    ],
    "metadata": {
      "framework": {
        "tokenUsage": {
          "inputTokenCount": 1563,
          "outputTokenCount": 95,
          "totalTokenCount": 1658
        },
        "finishReason": "STOP"
      }
    }
  }
}
```

To retrieve the response text from the `responseMessage` object, use the following FEEL expression (assuming the response variable is named `agent`):

```feel
agent.responseMessage.content[type = "text"][1].text
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task
