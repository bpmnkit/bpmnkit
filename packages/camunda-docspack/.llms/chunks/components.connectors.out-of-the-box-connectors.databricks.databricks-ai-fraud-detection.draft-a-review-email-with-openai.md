# Trigger a process from Databricks with a webhook — Draft a review email with OpenAI

On the high-risk path, add a service task after the gateway named `Generate Email Inquiry`, and change its type to the [OpenAI connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/openai).

| Setting        | Value                                                 |
| :------------- | :---------------------------------------------------- |
| OpenAI API key | `{{secrets.OpenAI}}`                                  |
| Operation      | Chat                                                  |
| Model          | Select a chat model available to your OpenAI account. |

Set the prompt as a FEEL expression so the process variables are substituted at runtime:

```feel
="Review this transaction for possible fraud and draft a short customer email if follow-up is needed. Amount: " + string(transactionAmount) + ", customer ID: " + customerId + ", ML risk score: " + string(riskScore) + "."
```

Map the response to a variable with a result expression:

```feel
= {emailBody: response.body.choices[1].message.content}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks-ai-fraud-detection
