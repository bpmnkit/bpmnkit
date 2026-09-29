# Durable Agent Flows — Durable waits

`.waitFor()` parks the instance on a message, for as long as it takes:

```typescript
  .waitFor("ci-green", { correlationKey: "prKey", message: "ci-passed" })
```

Publish the message when the outside event happens — from a CI webhook, for example:

```sh
casen message publish --data '{"name":"ci-passed","correlationKey":"42"}'
```

Nothing holds a worker, an agent slot or a context window while the instance waits.


## Security

The workforce runs the command you hired with the arguments you gave it. If those arguments let
the agent run tools or skip permission prompts, it can do that on this machine, in `--cwd`.

The prompt it gets is the step's template filled with process variables, and variables come from
whoever can start instances or publish messages on the engine. Only run a workforce against an
engine you trust, give each agent the narrowest tool permissions its role needs, and prefer a
dedicated working directory or container for agents that can write.

---
Source: https://bpmnkit.com/docs/guides/durable-agent-flows
