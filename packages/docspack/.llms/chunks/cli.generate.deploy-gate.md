# casen generate — Deploy gate

Every mode writes BPMN that deploys on Camunda 8, or nothing. When the definition leaves out a
value Camunda 8 needs (a job type, a message name or correlation key, a timer's time, an error
code, a condition on a gateway branch), the command writes no file, prints the
[deploy gate](/docs/guides/deploy-gate)'s lines and exits 1:

```
Not deployable on Camunda 8.10: 1 error(s)
- charge: Must have exactly one 'zeebe:taskDefinition' extension element (zeebe/service-task-definition)
Nothing written. Complete the model, pass --placeholders to fill placeholder values (listed, to replace before deploying), or --no-validate to write it as it is.
```

| Flag | Effect |
|---|---|
| `--placeholders` | Fill the documented placeholder values (`placeholder-<id>` job types and names, `="placeholder-<id>"` keys, `PT1H` timers, `=false` conditions) instead of refusing. Each fill is printed on stderr (`placeholder charge.jobType = placeholder-charge (zeebe/service-task-definition)`), so `--output -` still pipes clean XML. |
| `--no-validate` | Write the model as it is, for a draft that is not meant to deploy yet. |

With `--input`, the patched file is gated when it targets Camunda 8 (`modeler:executionPlatform="Camunda Cloud"`), as `Bpmn.export` does.

---
Source: https://bpmnkit.com/docs/cli/generate
