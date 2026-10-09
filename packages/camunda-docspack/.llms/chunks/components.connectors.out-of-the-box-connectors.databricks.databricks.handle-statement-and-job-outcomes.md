# Databricks connector — Handle statement and job outcomes

The Databricks SQL Statement Execution API returns HTTP 200 with `status.state = FAILED` when a statement fails at the warehouse, so a plain HTTP success check is not enough. The terminal states are:

| State       | Meaning                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------- |
| `SUCCEEDED` | Execution successful, result available for fetch.                                             |
| `FAILED`    | Execution failed; the reason is in `status.error.message`.                                    |
| `CANCELED`  | Canceled explicitly, or by `on_wait_timeout=CANCEL`.                                          |
| `CLOSED`    | Execution succeeded and the statement is closed; the result is no longer available for fetch. |

`PENDING` and `RUNNING` are not terminal — they mean the statement is still executing, and you must poll the result with **Get statement status and result**.

Branch on the state with a gateway rather than an error expression. Map the state into a variable with the **Result expression**, then route on it with an exclusive gateway:

```
Result expression:
=response.body.status.state

Gateway conditions:
=result = "FAILED"                        -> error handling path
=result = "CANCELED"                      -> cancellation path
=result = "PENDING" or result = "RUNNING" -> poll loop (Get statement status and result)
(default, i.e. SUCCEEDED or CLOSED)       -> continue
```

Routing everything except `FAILED` or `CANCELED` to `(default)` treats a still-running statement as complete. The `PENDING` or `RUNNING` branch is therefore required when `wait_timeout` is `0s` or the statement continues after a timeout.

**Note**
This template ships with no default error expression. An error expression is evaluated against the mapped output, not the raw response. When you set **Result variable** or **Result expression**, an expression that uses `response.body.status.state` sees `response.body` as `null` and never fires.A failed statement would then complete as a success. Use the gateway pattern above instead.

Use the same gateway pattern for job run outcomes. **Get run** reports a failed run in `state.result_state` after `state.life_cycle_state` reaches a terminal state. Map `state.result_state` to a variable and branch on it with the gateway.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks
