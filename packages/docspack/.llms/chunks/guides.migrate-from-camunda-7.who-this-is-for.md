# Migrate from Camunda 7 — Who this is for

- Teams that have a folder of Camunda 7 `.bpmn` files and want to know how much work the
  models are, before they plan the migration.
- Teams that work in TypeScript or JavaScript and do not want a Java toolchain to convert
  models.
- CI pipelines: `casen migrate c7 --check` fails while manual work remains.


## Run it

```sh
casen migrate c7 models/*.bpmn            # writes models/*.c8.bpmn
casen migrate c7 models/*.bpmn --out c8   # writes c8/*.bpmn
casen migrate c7 models/*.bpmn --check    # report only, exit 1 on manual work
casen migrate c7 order.bpmn --placeholders # fill values only a person knows with placeholders
```

[`casen migrate`](/docs/cli/migrate) has the flags and the JSON format. From code:

```typescript
import { Bpmn, convertCamunda7 } from "@bpmnkit/core"

const { definitions, report } = convertCamunda7(Bpmn.parse(xml))
for (const f of report.findings) console.log(f.severity, f.elementId, f.construct, f.message)
const c8Xml = Bpmn.export(definitions)
```

The result must deploy on Camunda 8. `convertCamunda7` checks it with `assertDeployable` and
throws a `DeployabilityError` that lists every reason Zeebe would reject it, one line per error:

```
Not deployable on Camunda 8.10: 2 error(s)
- Message_PaymentConfirmed: Must have exactly one zeebe:subscription extension element (zeebe/message-subscription)
- Task_summary: Must have either one 'zeebe:script' or one 'zeebe:taskDefinition' extension element (zeebe/script-task-implementation)
```

A Camunda 7 model usually leaves values that only a person knows: the job type of a Groovy
script task, the correlation key of a message. The converter does not invent them. You can:

- Pass `{ placeholders: true }` to fill each missing value with a documented placeholder
  (`placeholder-<elementId>`, `="placeholder-<elementId>"` for a key, see `PLACEHOLDERS`). Each
  fill is a `manual` finding in the report (construct `placeholder <field>`) and is in
  `result.placeholders`. Replace them before going live.
- Pass `{ validate: false }` to get the conversion as it is, deployable or not.
- Pass `{ camundaVersion: "8.6" }` to check another version than `executionPlatformVersion`.

`analyzeCamunda7(definitions)` returns the same report and does not change the model. It never
runs the check, so it also gives the report of a model the conversion refuses. The
`sourceXml` option of earlier versions is still accepted, but it has no effect. The parser now
keeps `camunda:` attributes on multi-instance loops and on event definitions, where Camunda 7
stores `camunda:collection` and the implementation of message throw events.

---
Source: https://bpmnkit.com/docs/guides/migrate-from-camunda-7
