# Databricks connector — Handle common workflows

### Run a long SQL statement

For SQL statements that take longer than 50 seconds, set **Execute statement**'s `wait_timeout` to `0s` (or `CONTINUE` on timeout). This returns a `statement_id` while the statement is still running.

Poll **Get statement status and result** with a BPMN timer until `status.state` reaches a terminal state. If the response contains `result.next_chunk_index`, retrieve the remaining results with **Get result chunk**.

### Trigger a job and wait for completion

**Run job now** returns a `run_id`. Poll **Get run** until `state.life_cycle_state` reaches one of these terminal values:

- `TERMINATED`
- `SKIPPED`
- `INTERNAL_ERROR`

Do not check only for `TERMINATED`, as this causes the loop to continue indefinitely if a run is skipped or fails internally.

When the run reaches a terminal state, use `state.result_state` to determine the result:

- `SUCCESS`
- `FAILED`
- `TIMEDOUT`
- `CANCELED`

Use **Cancel run** to handle BPMN-side cancellation or a boundary timer.

**Note**
For a multi-task job, **Get run output** requires an individual task's `run_id` from `tasks[].run_id` in the terminal **Get run** response. Do not use the top-level `run_id` returned by **Run job now**, as Databricks accepts only a single task's run ID.

### Avoid duplicate writes on retry

**Execute statement** and **Run job now** are non-idempotent, so the **Retries** field defaults to `0`. A retry would otherwise resend the identical request. The SQL Statement Execution API has no idempotency key, so keep **Retries** at `0` for **Execute statement**.

**Run job now** accepts an idempotency token. Set **Idempotency token** to a value that remains stable for each process instance. Databricks then returns the existing run instead of starting a new one.

You can safely increase **Retries** for read-only operations, such as **Get run**, **Get warehouse**, or **Get statement status and result**.

### Start a warehouse before execution

When you use **Execute statement** with a stopped warehouse, Databricks waits for the warehouse to start.

To control this explicitly, call **Start warehouse** and poll **Get warehouse** until `state` is `RUNNING`.

**Start warehouse** and **Stop warehouse** return immediately and do not wait for the state transition to finish.

### Raise the job timeout for slow calls

Model Serving allows up to 597 seconds of model execution — well beyond SQL's own `wait_timeout`, which is capped at 50 seconds.

If **Job timeout** stays at its default while you increase **Read timeout in seconds** for a slow Model Serving call, Zeebe can time out the job and reactivate it on another worker while the first HTTP request is still in flight. This can result in a duplicate non-idempotent call that **Retries** = `0` does not prevent because the retry happens outside the connector. Increase both settings together.

### Provide the required vector search inputs

**Query index** always needs **Columns**, plus exactly one of **Query text** or **Query vector** — which one depends on the index type. Supplying columns alone passes template validation, but the API rejects the request.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks
