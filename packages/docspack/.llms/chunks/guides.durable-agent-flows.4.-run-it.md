# Durable Agent Flows — 4. Run it

Your flow's own worker serves the `.run()` steps:

```typescript
// flows/worker.ts
import { review } from "./pr-review.js"

const worker = review.worker() // reads ZEEBE_ADDRESS, default http://localhost:26500
process.on("SIGINT", () => void worker.stop())
await worker.done
```

The workforce serves the `.agent()` steps. Start both, then an instance:

```sh
casen agent work                  # every hired agent, until Ctrl+C
npx tsx flows/worker.ts
casen process-instance create --data '{"processDefinitionId":"pr-review","variables":{"repo":"acme/api","prKey":"42"}}'
```

For each job, the workforce renders the task's prompt with the instance's variables, runs the
CLI, and completes the job with what the CLI printed, under the step's `result` variable. A
non-zero exit fails the job with the CLI's stderr, and the engine retries it until the task's
retries run out. A prompt that names a missing variable fails the job without retries, because
no retry can fix it.

Stop the workforce with Ctrl+C: jobs in progress are handed back to the engine at once, with
their retries unchanged. If the process dies instead, the engine hands the jobs out again when
their locks expire.

---
Source: https://bpmnkit.com/docs/guides/durable-agent-flows
