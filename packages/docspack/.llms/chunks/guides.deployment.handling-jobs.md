# Camunda 8 Deployment — Handling Jobs

Service tasks wait for a job worker. [`@bpmnkit/worker-client`](https://www.npmjs.com/package/@bpmnkit/worker-client)
long-polls for jobs. Set `ZEEBE_ADDRESS` to the cluster's REST address (`ZEEBE_REST_ADDRESS`
from the credentials file, without `/v2`), plus `ZEEBE_CLIENT_ID` and `ZEEBE_CLIENT_SECRET`.
`ZEEBE_TOKEN_URL` defaults to the SaaS token endpoint.

```typescript
import { createWorkerClient } from "@bpmnkit/worker-client";

const worker = createWorkerClient({ workerName: "email-service" });

for await (const job of worker.poll("send-email")) {
  try {
    await sendEmail(job.variables);
    await job.complete({ sent: true, sentAt: new Date().toISOString() });
  } catch (err) {
    await job.fail(err instanceof Error ? err.message : String(err), job.retries - 1);
  }
}
```

---
Source: https://bpmnkit.com/docs/guides/deployment
