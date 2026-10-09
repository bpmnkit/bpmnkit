# Add tools to an AI agent — Return the result as `toolCallResult` — script-task

A script task can add fields one at a time. Use the [`context put()`](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-context#context-putcontext-key-value) FEEL function to add a single key to the existing `toolCallResult` context without replacing it.

Write the call directly in the script task's FEEL expression in the **Script** section:

```feel
context put(toolCallResult, "status", response.body.status)
```

**Note**
The `toolCallResult` value can be a primitive string, a number, or a complex FEEL context object. Complex objects are serialized to JSON before being passed to the LLM. Prefer returning a structured FEEL context over a raw string when the result has multiple fields, as this gives the LLM more to work with when summarizing the outcome. If `toolCallResult` is not set or is empty after the tool executes, the AI Agent connector returns a constant success string to the LLM.

#### Example

The following ad-hoc sub-process asks a human to approve sending an email, then sends the email or records the decline depending on the response:

<img src={MultipleToolCallResult} alt="Combine multiple outputs into a single `toolCallResult`" width="50%"/>

All BPMN elements belong to the same tool flow. Only **Ask human to send email** is exposed to the LLM as the tool, as described in [add an element inside the ad-hoc sub-process](#add-an-element-inside-the-ad-hoc-sub-process).

Each element in the flow updates `toolCallResult` as the process instance evolves:

1. **Ask human to send email** is a user task and the first element in the flow, so it assigns `toolCallResult` directly through an output mapping:

   | Variable assignment value | Process variable name |
   | :------------------------ | :-------------------- |
   | `= { approved: true }`    | `toolCallResult`      |

   The gateway then routes the process instance based on the `approved` field.

1. **Send email** is a regular task. It adds a `sent` field to the existing `toolCallResult` with an output mapping, instead of overwriting it:

   | Variable assignment value                    | Process variable name |
   | :------------------------------------------- | :-------------------- |
   | `=context put(toolCallResult, "sent", true)` | `toolCallResult`      |

1. **Record decline** is a script task. It adds `sent: false` directly in its FEEL expression:

   ```feel
   context put(toolCallResult, "sent", false)
   ```

The following table shows how `toolCallResult` accumulates fields as the process instance progresses through each branch:

| Step                                      | If approved                      | If declined                        |
| :---------------------------------------- | :------------------------------- | :--------------------------------- |
| After **Ask human to send email**         | `{ approved: true }`             | `{ approved: false }`              |
| After **Send email** / **Record decline** | `{ approved: true, sent: true }` | `{ approved: false, sent: false }` |

By the time the ad-hoc sub-process completes, `toolCallResult` is a single structured object with the full history of the tool call, which the AI Agent connector passes back to the LLM.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
