# Connect an external agent — Step 4: Report state transitions

Update the agent instance whenever the agent moves between phases of its loop. Send the update to `PATCH /agent-instances/{agentInstanceKey}`.

```bash
curl -L -X PATCH 'http://localhost:8080/v2/agent-instances/4503599627370496' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{
  "elementInstanceKey": "2251799813685254",
  "status": "TOOL_CALLING"
}'
```

| Field                | Required | Description                                                                                                                                                                                                   |
| :------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `elementInstanceKey` | Yes      | The key of the currently active element instance. Camunda validates it against the stored agent instance.                                                                                                     |
| `status`             | No       | The agent's current state: `TOOL_DISCOVERY`, `THINKING`, `TOOL_CALLING`, or `IDLE`. See [agent states](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-states-and-metrics#agent-states) for what each state means. |
| `history`            | No       | A batch of conversation history items to append. Usage metrics, tool updates, and the conversation itself all flow through this field. See [step 5](#step-5-report-the-conversation-history).                 |

Camunda sets the `Initializing` and `Completed` states itself, so your runtime can't set them.

Report the tools once the agent has resolved them, typically while the agent is in `TOOL_DISCOVERY`, through a `CONFIGURATION` history item rather than a dedicated field:

```bash
curl -L -X PATCH 'http://localhost:8080/v2/agent-instances/4503599627370496' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{
  "elementInstanceKey": "2251799813685254",
  "jobKey": "2251799813685260",
  "jobLeaseToken": "eyJhY3RpdmF0aW9uIjoxfQ",
  "status": "THINKING",
  "history": [
    {
      "historyItemId": "run-7f3a-tools",
      "loopIteration": 1,
      "role": "CONFIGURATION",
      "content": [],
      "tools": [
        {
          "name": "search_papers",
          "description": "Search an academic paper index by topic.",
          "elementId": null
        },
        {
          "name": "summarize_source",
          "description": "Summarize a single source into three bullet points.",
          "elementId": null
        }
      ],
      "producedAt": "2026-08-18T09:14:01.000Z"
    }
  ]
}'
```

Set `elementId` only for a tool that a BPMN element in your process handles. For a tool that lives entirely in your external runtime, leave it `null` so Operate doesn't try to link it to the diagram. Omit `tools` from a later `CONFIGURATION` item to leave the stored list unchanged, or send an empty array to clear it.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent
