# OpenAI connector — Operations — Sample chat output

You can use an output mapping to map the response:

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables.

```
{
    "status": 200,
    "headers": {
        # response headers
    },
    "body": {
        "id": "chatcmpl-6ws27w7nADFLWp7KD3dhjiUmP0kfu",
        "object": "chat.completion",
        "created": 1679488747,
        "model": "gpt-3.5-turbo-0301",
        "usage": {
            "prompt_tokens": 16,
            "completion_tokens": 79,
            "total_tokens": 95
        },
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "ChatGPT has gained significant attention in recent years, especially with the development and advancement of Natural Language Processing (NLP) tools used in chatbots and virtual assistants."
                },
                "finish_reason": "stop",
                "index": 0
            }
        ]
    }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/openai
