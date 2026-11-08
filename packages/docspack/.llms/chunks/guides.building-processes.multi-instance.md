# Building Processes — Multi-Instance

Run a task or sub-process once per item in a collection:

```typescript
.serviceTask("notify-all", {
  name: "Notify Each Customer",
  taskType: "send-email",
  multiInstance: {
    parallel: true,                          // false = sequential
    inputCollection: "= customers",
    inputElement: "customer",
    outputCollection: "results",
    outputElement: "= { sent: true, email: customer.email }",
  },
})
```


## Deployable by default

A model that targets Camunda 8 (every new one does: the builder writes
`modeler:executionPlatform="Camunda Cloud"`) must deploy. `build()` first applies the builder's
own rules, which name the call or option that fixes the model, and then runs
[`assertDeployable`](/docs/guides/executable-camunda-process), which throws a
`DeployabilityError` listing everything Zeebe would still reject.

| Rule | Error (example) |
|---|---|
| Every branch of an exclusive or inclusive gateway with several outgoing flows has `.condition("= …")` or `.defaultFlow()` | `Flow "Flow_g_e2" leaves exclusive gateway "g" without a condition: …` |
| A send task, message throw event or message end event has a `taskType` (Camunda 8 runs it as a job) | `Send task "send" needs a taskType: …` |
| An AI-agent ad-hoc sub-process (`taskDefinition`) sets no `activeElementsCollection`, `completionCondition` or `cancelRemainingInstances: false`; `outputCollection` and `outputElement` come together | `Ad-hoc sub-process "agent" has a taskDefinition (an AI agent) and activeElementsCollection; …` |
| A correlation key, multi-instance collection or `activeElementsCollection` is a FEEL expression (`=…`); a condition without `=` is converted for you | `correlationKey "orderId" of "recv" is a static value; … e.g. "=orderId"` |
| Nothing is chained after an end event (refused at the call) | `Cannot chain "t" after end event "e": …` |

`build()` options:

- `validate: false` skips the Camunda 8 rules and the deploy check, for a model that is not meant
  for Camunda 8 (a complex gateway, a transaction) or not finished. Chaining after an end event is
  refused either way.
- `placeholders: true` fills the documented placeholder values (job types, `=false` conditions,
  message names, …) instead of refusing, and returns the filled model. To see what was filled,
  build with `validate: false` and call `assertDeployable(defs, { placeholders: true })`, whose
  `placeholders` lists every value written.
- `camundaVersion: "8.7"` checks for that version instead of the model's
  `executionPlatformVersion`.

`Bpmn.createDiagram(...).build(options)` takes the same three options and checks the whole
document. A document continued with `Bpmn.continueProcess` is checked when it targets Camunda 8.

---
Source: https://bpmnkit.com/docs/guides/building-processes
