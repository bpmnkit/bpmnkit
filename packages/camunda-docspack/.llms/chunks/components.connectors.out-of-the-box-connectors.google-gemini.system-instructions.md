# Google Gemini connector — System instructions

Enter system instructions as a string, to determine how the model should respond.

To learn more about system instructions, refer to [Google system instructions](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/system-instructions?hl=en).


## Grounding

Grounding connects the model output to the verifiable sources of information.

- This is useful in situations where accuracy and reliability are important.
- To use grounding, select the _Grounding_ checkbox and input the path to the data store.

To learn more about grounding, refer to [Google grounding overview](https://cloud.google.com/vertex-ai/generative-ai/docs/grounding/overview?hl=en).


## Safety Filter Settings

You can adjust the likelihood of receiving a model response which might contain harmful content.

- Content is blocked based on the probability that it is harmful.
- To use safety filter settings, select the _Safety Filter Settings_ checkbox and select the desired level from dropdown.
- By default, all filters are set to OFF.

To learn more about safety filters, refer to [Google responsible AI safety filters and settings](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai?hl=en#safety_filters_and_attributes).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-gemini
