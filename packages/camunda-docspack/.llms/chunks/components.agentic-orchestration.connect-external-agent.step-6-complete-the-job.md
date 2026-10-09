# Connect an external agent — Step 6: Complete the job

Complete the job with the same lease token you activated it with. Completing the job commits the conversation history and moves the process instance on to the next element.

```bash
curl -L 'http://localhost:8080/v2/jobs/2251799813685260/completion' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{
  "jobLeaseToken": "eyJhY3RpdmF0aW9uIjoxfQ",
  "variables": {
    "response": "Retrieval-augmented generation research since 2024 focuses on..."
  }
}'
```

If your agent can't finish, [fail the job](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/fail-job.api) or [throw a BPMN error](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/throw-job-error.api) so the process can react to the failure. Both are governed the same way as any other job, so a failing external agent raises an [incident](https://docs.camunda.io/docs/next/components/concepts/incidents) you can act on in Operate.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent
