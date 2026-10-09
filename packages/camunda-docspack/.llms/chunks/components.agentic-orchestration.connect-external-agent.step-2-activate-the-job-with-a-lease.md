# Connect an external agent — Step 2: Activate the job with a lease

Activate the job for the agent element with `withLease` set to `true`. The activation response returns a `jobLeaseToken` alongside the `jobKey` and `elementInstanceKey` you need for every later call.

```bash
curl -L 'http://localhost:8080/v2/jobs/activation' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{
  "type": "research-agent",
  "worker": "research-agent-worker",
  "timeout": 300000,
  "maxJobsToActivate": 1,
  "withLease": true
}'
```

A lease is required because the conversation history you report is fenced to a single job activation. Items reported under a superseded lease are discarded instead of committed, so a retried activation can't interleave its history with the previous attempt.

See [activate jobs](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/activate-jobs.api) for the full activation response, and [job leasing](https://docs.camunda.io/docs/next/components/concepts/job-workers#job-leasing) for how the lease is enforced, the permanent lease-only caveat, and fleet guidance.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent
