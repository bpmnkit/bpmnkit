# AI Agent Sub-process connector — Configuration — Retries

Specify connector execution retry behavior if execution fails.

| Field         | Required | Description                                                                                                                                     |
| :------------ | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| Retries       | No       | Specify the number of [retries](https://docs.camunda.io/docs/next/components/connectors/use-connectors/outbound#retries) (times) the connector repeats execution if it fails. |
| Retry backoff | No       | Specify a custom Retry backoff interval between retries instead of the default behavior of retrying immediately.                                |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess
