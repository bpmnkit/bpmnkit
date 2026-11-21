# bpmnkit CLI — Worker commands

```sh
# Run a simple auto-complete worker (for testing)
bpmnkit worker payment-service

# Start scaffolded workers from ./workers/
bpmnkit worker start

# Start a specific scaffolded worker
bpmnkit worker start send-invoice
```


## Agent workforce

Hire coding-agent CLIs as durable job workers. They serve the `.agent()` steps of
[`@bpmnkit/flow`](/docs/packages/flow) flows — any service task with job type `agent:<role>` or
`agent:<rank>:<role>` and a `prompt` task header. See
[Durable Agent Flows](/docs/guides/durable-agent-flows).

```sh
# Hire: everything after -- is the command; the prompt goes on stdin unless an argument has {prompt}
bpmnkit agent hire claude --roles plan,pr-review --rank senior -- claude -p
bpmnkit agent hire copilot --roles feature --instances 3 -- copilot -p "{prompt}"

bpmnkit agent list            # hired agents and the job types they serve
bpmnkit agent fire copilot    # remove one
bpmnkit agent work            # run the workforce against the active profile until Ctrl+C
```

---
Source: https://bpmnkit.com/docs/cli/casen
