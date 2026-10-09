# Google Gemini connector — Output token limit

The **Output token limit** Determines the maximum amount of text output from a single prompt. A token is approximately four characters.


## Seed

Setting a **Seed** value is useful if you make repeated requests and want the same model response.

Deterministic outcome isn’t guaranteed. Changing the model or other settings can cause variations in the response even when you use the same seed value.


## Top-K

The **Top-K** specifies the number of candidate tokens when the model is selecting an output token.

- Use a lower value for less random responses and a higher value for more random responses.
- Only the _gemini-1.0-pro-vision-001_ model supports Top-K.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-gemini
