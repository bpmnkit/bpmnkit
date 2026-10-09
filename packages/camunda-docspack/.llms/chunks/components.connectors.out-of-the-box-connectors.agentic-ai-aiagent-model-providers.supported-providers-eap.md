# AI Agent model providers — Supported providers — eap

Gemini models through Google Cloud's Enterprise Agent Platform (formerly Vertex AI).

| Field              | Required | Description                                                                                                                                                                                                                                                                                                                                                                      |
| :----------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project ID**     | Yes      | The Google Cloud project ID.                                                                                                                                                                                                                                                                                                                                                     |
| **Region**         | Yes      | The [region](https://cloud.google.com/vertex-ai/docs/general/locations#feature-availability) where AI inference should take place.                                                                                                                                                                                                                                               |
| **Authentication** | Yes      | **Service account credentials** (a [service account](https://cloud.google.com/iam/docs/service-account-overview) key in JSON format), or **Application default credentials** (Hybrid/Self-Managed only; uses the default credentials available in the environment; see [setting up ADC locally](https://cloud.google.com/docs/authentication/set-up-adc-local-dev-environment)). |

#### Google Gemini model and parameters

| Field                        | Required | Description                                                                                                                                                                                                          |
| :--------------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model**                    | Yes      | The model ID to use. See the [Gemini models documentation](https://ai.google.dev/gemini-api/docs/models).                                                                                                            |
| **Thinking budget (tokens)** | No       | Gemini 2.5 models: token budget for extended thinking. `-1` = dynamic, `0` = disabled. Mutually exclusive with **Thinking level**. See the [thinking documentation](https://ai.google.dev/gemini-api/docs/thinking). |
| **Thinking level**           | No       | Gemini 3.x models: qualitative thinking effort (`default`/`minimal`/`low`/`medium`/`high`). Mutually exclusive with **Thinking budget**.                                                                             |
| **Maximum tokens**           | No       | The maximum number of tokens to generate before stopping.                                                                                                                                                            |
| **Temperature**              | No       | Primary response-variation control. Lower values favor likely tokens more strongly; higher values increase variation. Supported ranges vary by model.                                                                |
| **top P**                    | No       | Advanced nucleus-sampling control from 0 to 1. Limits selection to likely tokens whose cumulative probability reaches this value.                                                                                    |
| **top K**                    | No       | Advanced sampling control configured as a positive integer. Limits selection to this number of the most likely tokens.                                                                                               |
| **Timeout**                  | No       | Maximum time to wait for a model API call. See [model call timeout](#model-call-timeout).                                                                                                                            |

**Note**
Prompt caching is automatic when the request meets Gemini's caching requirements and isn't user-configurable.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers
