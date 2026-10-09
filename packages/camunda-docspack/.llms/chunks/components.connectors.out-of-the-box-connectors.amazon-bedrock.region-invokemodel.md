# Amazon Bedrock connector — Region — InvokeModel

This action is meant to invoke a model with a raw payload.

A model ID must be specified. Find all the available options for Amazon
Bedrock [in the model ID documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html).

**Note**
Ensure the model is available in your region, that your model can invoke the `Invoke Model` action, and you are a user with adequate rights.

The payload is dependent on the model used, and you can find the different
payloads [in the model parameters documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html).

1. Use **Result Variable** to store the response in a process variable. For example, `myResultVariable`.
2. Use **Result Expression** to map fields from the response into process variables.

The response is dependent on the model used, and you can find the different
responses [in the model parameters documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html).

#### Example

If using the model `Jamba-instruct` with model ID `ai21.jamba-instruct-v1:0`, and looking at the [model parameters Jamba documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-jamba.html), the payload could be as follows:

```json
{
  "messages": [{ "role": "user", "content": "Hello" }],
  "max_tokens": 256,
  "top_p": 0.8,
  "temperature": 0.7
}
```

The FEEL mapping could be as follows:

```
{ response : body.choices.message.content[1] }
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-bedrock
