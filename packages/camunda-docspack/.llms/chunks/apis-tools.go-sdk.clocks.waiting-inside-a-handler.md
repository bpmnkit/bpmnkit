# Clocks — Waiting inside a handler

A `Job` carries its worker's clock, so a handler that needs to wait can do it on the
same clock as everything else:

```go
worker := client.NewJobWorker("payment", func(ctx context.Context, job *camunda.Job) (map[string]any, error) {
	// Short coordination only -- a business wait belongs in the process as a
	// BPMN timer event.
	if err := job.Clock().Sleep(ctx, 500*time.Millisecond); err != nil {
		return nil, err
	}
	return map[string]any{"paid": true}, nil
})
```

Keep those waits short — spacing a retry, letting a resource settle. **A long or
business wait belongs in the process as a BPMN timer event, not in a handler.** A
handler that sleeps for minutes holds a worker slot for the duration, risks the job
timeout expiring underneath it, and hides the delay from the process model, where it
would otherwise be visible and changeable without a redeploy.

---
Source: https://docs.camunda.io/docs/next/apis-tools/go-sdk/clocks
