# Connect an external agent — Step 5: Report the conversation history

The conversation history is the decision trail Operate displays for the agent: the prompts it received, the messages the model returned, the tools it selected, and the results those tools produced. Group the items by `loopIteration` so each pass through the agent loop is legible on its own.

Report history items as a batch in the `history` field of the [create agent instance](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-agent-instance.api) or [update agent instance](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/update-agent-instance.api) call. Send every item for a loop iteration in a single request.

```bash
curl -L -X PATCH 'http://localhost:8080/v2/agent-instances/4503599627370496' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{
  "elementInstanceKey": "2251799813685254",
  "jobKey": "2251799813685260",
  "jobLeaseToken": "eyJhY3RpdmF0aW9uIjoxfQ",
  "status": "TOOL_CALLING",
  "history": [
    {
      "historyItemId": "run-7f3a-iter-1-user",
      "loopIteration": 1,
      "role": "USER",
      "content": [
        {
          "contentType": "TEXT",
          "text": "Summarize the current research on retrieval-augmented generation."
        }
      ],
      "producedAt": "2026-08-18T09:14:02.120Z"
    },
    {
      "historyItemId": "run-7f3a-iter-1-assistant",
      "loopIteration": 1,
      "role": "ASSISTANT",
      "content": [
        {
          "contentType": "TEXT",
          "text": "I need recent sources before answering. Searching the paper index."
        }
      ],
      "toolCalls": [
        {
          "toolCallId": "call_01",
          "toolName": "search_papers",
          "elementId": null,
          "arguments": { "topic": "retrieval-augmented generation", "since": 2024 }
        }
      ],
      "metrics": { "inputTokens": 1840, "outputTokens": 260, "durationMs": 2310 },
      "producedAt": "2026-08-18T09:14:05.480Z"
    }
  ]
}'
```

| Field           | Required | Description                                                                                                                                                                                                                                                                                        |
| :-------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `historyItemId` | Yes      | An identifier you assign to the item. Camunda uses it to recognize a resubmitted item as a duplicate rather than rejecting it, so reuse the same ID when a retried activation resends an item.                                                                                                     |
| `loopIteration` | Yes      | The loop iteration the item belongs to, starting at `1`.                                                                                                                                                                                                                                           |
| `role`          | Yes      | `USER`, `ASSISTANT`, `TOOL_RESULT`, or `CONFIGURATION`.                                                                                                                                                                                                                                            |
| `content`       | Yes      | The content blocks of the item, each typed as `TEXT`, `DOCUMENT`, or `OBJECT`. Use `TEXT` for natural language and `OBJECT` for structured data. An empty array is valid for a `CONFIGURATION` item, whose data lives in the fields below instead.                                                 |
| `toolCalls`     | No       | For an `ASSISTANT` item, the tool calls the model dispatched. For a `TOOL_RESULT` item, a single entry referencing the originating tool call through its `toolCallId`. Omit for a `USER` item.                                                                                                     |
| `metrics`       | No       | The `inputTokens`, `outputTokens`, and `durationMs` of a single model call. Report these on `ASSISTANT` items only. Camunda aggregates them into the agent instance's running totals, so there's no separate counter to increment.                                                                 |
| `model`         | No       | The LLM model identifier. `CONFIGURATION` items only.                                                                                                                                                                                                                                              |
| `provider`      | No       | The LLM provider. `CONFIGURATION` items only.                                                                                                                                                                                                                                                      |
| `systemPrompt`  | No       | The system prompt, as content blocks. `CONFIGURATION` items only. Together with `model` and `provider`, at least one of the `CONFIGURATION` items you send must establish all three. See [step 3](#step-3-create-the-agent-instance). Omit any of the three on a later item to leave it unchanged. |
| `limits`        | No       | The agent's operational limits. `CONFIGURATION` items only; omit to leave the previously reported limits unchanged.                                                                                                                                                                                |
| `tools`         | No       | The complete list of tools available to the agent, replacing any previously reported list. `CONFIGURATION` items only; omit to leave the list unchanged, or send an empty array to clear it.                                                                                                       |
| `producedAt`    | Yes      | The timestamp from your runtime for when the message was produced.                                                                                                                                                                                                                                 |

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent
