# Azure OpenAI connector — Handle connector response

The **Azure OpenAI connector** is a protocol connector, meaning it is built on top of the **HTTP REST connector**. Therefore,
handling response is still applicable [as described](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#response).


## Usage example

### Chat completions

Assume you have deployed a `gpt-35-turbo` model with the following URL:
`https://myresource.openai.azure.com/openai/deployments/mydeployment/completions?api-version=2024-02-01`, and created a
Connector secret with the name `AZURE_OAI_SECRET`.

Consider the following input:

- **API key**: `{{secrets.AZURE_OAI_SECRET}}`
- **Operation**: `Chat completion`
- **Resource name**: `myresource`
- **Deployment ID**: `mydeployment`
- **API version**: `2024-02-01`
- **Message role**: `User`
- **Message content**: `What is the age of the Universe?`
- **Message context**: `=[{"role": "system", "content": "You are helpful assistant."}]`
- Leave the rest of the params blank or default
- **Result variable**: `myOpenAIResponse`

In the `myOpenAIResponse` you will find the following result:

```json
{
   "status": 200,
   "headers": {
    ...
   },
   "body": {
      "choices": [
         {
            "content_filter_results": {
               "hate": {
                  "filtered": false,
                  "severity": "safe"
               },
               "self_harm": {
                  "filtered": false,
                  "severity": "safe"
               },
               "sexual": {
                  "filtered": false,
                  "severity": "safe"
               },
               "violence": {
                  "filtered": false,
                  "severity": "safe"
               }
            },
            "finish_reason": "stop",
            "index": 0,
            "message": {
               "content": "The age of the universe is estimated to be around 13.8 billion years. This age is determined through various scientific methods, such as measuring the cosmic microwave background radiation and studying the expansion rate of the universe.",
               "role": "assistant"
            }
         }
      ],
      "created": "...",
      "id": "...",
      "model": "gpt-35-turbo",
      "object": "chat.completion",
      "prompt_filter_results": [
         {
            "prompt_index": 0,
            "content_filter_results": {
               "hate": {
                  "filtered": false,
                  "severity": "safe"
               },
               "self_harm": {
                  "filtered": false,
                  "severity": "safe"
               },
               "sexual": {
                  "filtered": false,
                  "severity": "safe"
               },
               "violence": {
                  "filtered": false,
                  "severity": "safe"
               }
            }
         }
      ],
      "usage": {
         "completion_tokens": 43,
         "prompt_tokens": 24,
         "total_tokens": 67
      }
   }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/azure-open-ai
