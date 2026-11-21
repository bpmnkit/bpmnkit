# Durable Agent Flows — 2. Start an engine and deploy

```sh
bpmnkit reebe start --port 26500 --grpc-port 26501   # local engine, SQLite-backed
bpmnkit profile create local --base-url http://localhost:26500/v2 --auth-type none
bpmnkit profile use local
bpmnkit deploy deploy pr-review.bpmn
```

REST goes on 26500 because that is where `bpmnkit deploy` and the flow worker look by default
(`ZEEBE_ADDRESS`); Reebe's gRPC gateway, which also defaults to 26500, moves to 26501. Any
Camunda 8 cluster works the same way — point the profile and `ZEEBE_ADDRESS` at it instead.


## 3. Hire the workforce

A hire saves a profile: the CLI to run, the roles it takes on, and how many jobs it works on at
once. Everything after `--` is the command.

```sh
bpmnkit agent hire claude --roles pr-review,plan --rank senior -- claude -p
bpmnkit agent hire copilot --roles feature --instances 3 -- copilot -p "{prompt}"
bpmnkit agent list
```

The prompt goes to the CLI on stdin, unless an argument contains `{prompt}` — then it goes
there. Profiles are saved in `workforce.json`, next to bpmnkit's profile config.

| Flag | Default | Description |
|---|---|---|
| `--roles` | — (required) | Comma-separated roles the agent takes on |
| `--rank` | — | Also serve steps that ask for this rank |
| `--instances` | `1` | How many jobs the agent works on at once |
| `--timeout` | `30` | Minutes one run may take before it is stopped and the job failed |
| `--cwd` | current directory | Directory the CLI runs in |

`bpmnkit agent hire` with an existing name updates that agent; `bpmnkit agent fire <name>` removes
it.

### Roles and ranks

An `.agent()` step names a role and, optionally, a rank:

| Step | Job type | Served by |
|---|---|---|
| `{ role: "pr-review" }` | `agent:pr-review` | any agent with the `pr-review` role |
| `{ role: "pr-review", rank: "senior" }` | `agent:senior:pr-review` | only agents hired with `--rank senior` |

Use ranks to route expensive steps to a frontier model and keep the rest on a cheaper or local
one.

---
Source: https://bpmnkit.com/docs/guides/durable-agent-flows
