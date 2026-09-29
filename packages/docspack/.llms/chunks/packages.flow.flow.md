# @bpmnkit/flow — `Flow`

| Member | Description |
|---|---|
| `toXml()` | The laid-out BPMN XML to deploy |
| `definitions()` | The same process as a `BpmnDefinitions` object |
| `jobTypes` | Job types of the `.run()` steps |
| `agentJobTypes` | Job types the agent workforce must serve |
| `steps` | The steps, in order |
| `worker(options?)` | Starts polling the `.run()` job types |

### `flow.worker(options?)`

Returns `{ done, stop() }` at once. `done` settles when every poll has ended: it resolves after
`stop()` and rejects with the first error polling cannot recover from, such as rejected
credentials. `stop()` resolves once the jobs in progress are settled.

| Option | Default | Description |
|---|---|---|
| `address`, `clientId`, … | environment | [`@bpmnkit/worker-client`](/docs/packages/worker-client) connection options |
| `maxJobs` | `1` | Jobs activated per poll. A step's jobs run one after another |
| `timeout` | `300_000` | Job lock timeout, in ms |
| `onError` | warning on stderr | Transient poll errors, and jobs the engine would not settle |
| `signal` | — | Stops the worker when it aborts |
| `client` | — | A `WorkerClient` to use instead of creating one |

---
Source: https://bpmnkit.com/docs/packages/flow
