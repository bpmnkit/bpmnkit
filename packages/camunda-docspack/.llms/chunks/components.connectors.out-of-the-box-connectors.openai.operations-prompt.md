# OpenAI connector — Operations — Prompt

While **System message** and **Chat history** fields are optional and provide the model with additional context, **Prompt** is the actual input.
This is the query that is used to trigger the model output.

To use the **System message**, **Chat history**, and **Prompt** together, you would follow this format:

The example below illustrates how you can use **System message**, **Chat history**, and **Prompt** together.

**System message**

```text
You are a helpful assistant.
```

**Chat history**

```
= [
{"role": "user", "content": "Who won the world series in 2020?"},
{"role": "assistant", "content": "The Los Angeles Dodgers the World series in 2020."}
]
```

**Prompt**

```text
Where was it played?
```

In this example, the chat history provides the context of a user asking who won the World Series in 2020, and the assistant providing the correct answer that the Los Angeles Dodgers won. The prompt, "Where was it played?" is the follow-up question that seeks additional information about the location where the World Series took place in 2020.

**Note**
Find more complex examples of prompt engineering and sample real-life use cases of ChatGPT on the OpenAI [examples](https://platform.openai.com/examples) page.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/openai
