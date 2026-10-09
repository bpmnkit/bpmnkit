# Connect an external agent — Step 3: Create the agent instance

Create the agent instance as the first step of handling the job, before your agent makes its first model call. Establish the agent's initial configuration through a `CONFIGURATION` history item included in the same request, and pass the `jobKey` and `jobLeaseToken` from the job activation so Camunda can associate the item with this run. The response returns the `agentInstanceKey` that identifies the agent for every later call.

```bash
curl -L 'http://localhost:8080/v2/agent-instances' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{
  "elementInstanceKey": "2251799813685254",
  "jobKey": "2251799813685260",
  "jobLeaseToken": "eyJhY3RpdmF0aW9uIjoxfQ",
  "history": [
    {
      "historyItemId": "run-7f3a-config",
      "loopIteration": 1,
      "role": "CONFIGURATION",
      "content": [],
      "model": "gpt-4o",
      "provider": "openai",
      "systemPrompt": [
        {
          "contentType": "TEXT",
          "text": "You are a research assistant. Use the available tools to gather sources before answering."
        }
      ],
      "limits": {
        "maxModelCalls": 20,
        "maxToolCalls": 50,
        "maxTokens": 200000
      },
      "producedAt": "2026-08-18T09:13:58.000Z"
    }
  ]
}'
```

| Field                | Required | Description                                                                                                                                                                                                                                            |
| :------------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `elementInstanceKey` | Yes      | The key of the agent element instance, taken from the job activation response. Camunda derives the process instance, element ID, process definition, and tenant from it.                                                                               |
| `jobKey`             | Yes      | The key of the job activation from [step 2](#step-2-activate-the-job-with-a-lease). Required whenever `history` is provided.                                                                                                                           |
| `jobLeaseToken`      | Yes      | The lease token from the job activation, the same one used in [step 5](#step-5-report-the-conversation-history).                                                                                                                                       |
| `history`            | Yes      | A batch containing at least one `CONFIGURATION` item that reports `model`, `provider`, and `systemPrompt`; `limits` and `tools` on that item are optional. See [step 5](#step-5-report-the-conversation-history) for the full shape of a history item. |

Report the limits your runtime enforces even though Camunda doesn't enforce them for an external agent. Operate shows model calls against the configured limit, which is what makes limit proximity visible when you [detect off-rail agents](https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/detect-off-rail-agents).

Only one agent instance can exist per element instance. If the job is retried, the create call returns `409`. Handle a retry by finding the existing agent instance with [search agent instances](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-agent-instances.api), filtering on `elementInstanceKeys`, and continuing to report against the key it returns.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent
