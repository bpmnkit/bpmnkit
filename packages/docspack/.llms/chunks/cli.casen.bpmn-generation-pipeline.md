# bpmnkit CLI — BPMN generation pipeline

Every BPMN process is authored as a `ProcessPlan` JSON file — never hand-written XML — and
compiled deterministically:

```sh
# Print the ProcessPlan JSON format reference (schema + field notes)
bpmnkit plan schema

# Compile a plan to laid-out, deployable BPMN
bpmnkit synth synth order-process.plan.json --output order-process.bpmn

# Extend an existing process: lift it back to plan form, then merge a delta plan into it
bpmnkit plan extract order-process.bpmn
bpmnkit synth synth delta.plan.json --merge order-process.bpmn --output order-process.bpmn

# Find and inspect a Camunda connector template
bpmnkit connector search slack
bpmnkit connector show io.camunda.connectors.Slack.v1
bpmnkit connector show io.camunda.connectors.HttpJson.v2 --filter timeout --condensed
bpmnkit connector apply order-process.bpmn Call http --values call.json   # --set k=v overrides the file

# Deploy-readiness gate, then deploy
# (a .bpmnlintrc in the diagram's folder or above is honoured; --no-bpmnlintrc ignores it)
bpmnkit lint lint order-process.bpmn --profile deploy
bpmnkit check order-process.bpmn review.form discount.dmn --deploy   # BPMN, DMN and forms together
bpmnkit deploy deploy order-process.bpmn                   # local Reebe
bpmnkit deploy deploy order-process.bpmn --target camunda8 # active Camunda 8 profile
# `bpmnkit deploy` runs the deploy gate before it sends a .bpmn file and exits 1 with its
# lines when Camunda 8 would refuse it; --no-validate sends the file anyway.
```

`bpmnkit synth` reports any problems keyed by JSON path in the plan (e.g. `steps[2].connector.values.token`) — fix the plan, never the XML, and re-run. A model Camunda 8 would refuse on deploy is not written: each reason is a problem keyed `element:<id>`, worded `Not deployable on Camunda <version>: <message> (zeebe/<rule>)`. `--placeholders` fills the values the plan leaves out (a job type, a correlation key) with documented placeholders and lists each one to replace. From code, `compilePlan` and `mergePlan` take `validate` (default `true`), `placeholders` and `camundaVersion`; a refused model returns no `xml`, and the fills are in `result.placeholders`. If the plan has a `tests` array, `bpmnkit synth` also writes a `<file>.bpmn.tests.json` sidecar, runnable with `bpmnkit test test <file>.bpmn`.

---
Source: https://bpmnkit.com/docs/cli/casen
