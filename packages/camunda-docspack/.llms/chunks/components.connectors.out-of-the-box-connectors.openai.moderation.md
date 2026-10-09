# OpenAI connector — Moderation

It is recommended to use the Moderation API to sanitize inputs and outputs of the language model. You will be able to prevent violation of OpenAI policies and displaying the potentially unsafe content in your system.

### Evaluation input

### Sample moderation output

Output contains the evaluation result broken down by violation categories. To learn more about Moderation output, visit the [OpenAI documentation](https://platform.openai.com/docs/guides/moderation/moderation).

```
{
    "status": 200,
    "headers": {
        # response headers
    },
    "body": {
        "id": "modr-6wtH8E1f2W533qdQAzq8dUpmKRVCV",
        "model": "text-moderation-004",
        "results": [
            {
                "flagged": false,
                "categories": {
                    "sexual": false,
                    "hate": false,
                    "violence": false,
                    "self-harm": false,
                    "sexual/minors": false,
                    "hate/threatening": false,
                    "violence/graphic": false
                },
                "category_scores": {
                    "sexual": 1.0084246241603978E-5,
                    "hate": 5.5422344303224236E-5,
                    "violence": 8.184280159184709E-5,
                    "self-harm": 1.3117542607687938E-7,
                    "sexual/minors": 4.457491709075612E-9,
                    "hate/threatening": 9.144552337581047E-10,
                    "violence/graphic": 1.770446012017146E-8
                }
            }
        ]
    }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/openai
