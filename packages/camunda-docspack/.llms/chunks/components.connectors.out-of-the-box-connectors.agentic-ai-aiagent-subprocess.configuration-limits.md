# AI Agent Sub-process connector — Configuration — Limits

Set limits for the agent interaction to prevent unexpected behavior or unexpected cost due to infinite loops.

| Field               | Required | Description                                                                                                                           |
| :------------------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| Maximum model calls | No       | Specify the maximum number of model calls. As a safeguard, this limit defaults to a value of `10` if you do not configure this value. |

**Caution**
Despite these limits, you must closely monitor your LLM API usage and cost, and set appropriate limits on the provider side.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess
