# casen CLI — BPMN generation pipeline

Every BPMN process is authored as a `ProcessPlan` JSON file — never hand-written XML — and
compiled deterministically:

```sh
# Print the ProcessPlan JSON format reference (schema + field notes)
casen plan schema

# Compile a plan to laid-out, deployable BPMN
casen synth synth order-process.plan.json --output order-process.bpmn

# Extend an existing process: lift it back to plan form, then merge a delta plan into it
casen plan extract order-process.bpmn
casen synth synth delta.plan.json --merge order-process.bpmn --output order-process.bpmn

# Find and inspect a Camunda connector template
casen connector search slack
casen connector show io.camunda.connectors.Slack.v1
casen connector show io.camunda.connectors.HttpJson.v2 --filter timeout --condensed
casen connector apply order-process.bpmn Call http --values call.json   # --set k=v overrides the file

# Deploy-readiness gate, then deploy
# (a .bpmnlintrc in the diagram's folder or above is honoured; --no-bpmnlintrc ignores it)
casen lint lint order-process.bpmn --profile deploy
casen deploy deploy order-process.bpmn                   # local Reebe
casen deploy deploy order-process.bpmn --target camunda8 # active Camunda 8 profile
```

`casen synth` reports any problems keyed by JSON path in the plan (e.g. `steps[2].connector.values.token`) — fix the plan, never the XML, and re-run. If the plan has a `tests` array, `casen synth` also writes a `<file>.bpmn.tests.json` sidecar, runnable with `casen test test <file>.bpmn`.

### Run process tests

```sh
casen test test order-process.bpmn
casen test test order-process.bpmn --scenarios cases.json --case "approves the order"
```

`casen test test` runs a test file on Reebe compiled to WebAssembly. It needs no Java or Docker.

| Option | Description |
|--------|-------------|
| `--scenarios <file>`, `-s` | The test file. Default: `<file>.bpmn.tests.json`, then `<name>.test.json` beside the BPMN file |
| `--case <name>` | Run only this test case. Repeat it to run several |

It accepts two file formats. A file whose `$schema` contains `cpt-test-cases` is Camunda process
test (CPT) JSON. Any other file is the older scenario array that `casen synth` writes. Both run on
the same engine. The command exits 0 when every case passes. A CPT failure prints
`instruction <index> (<type>): <message>`. See
[Does it run? Test it with casen test](/docs/guides/executable-camunda-process#does-it-run-test-it-with-casen-test)
for the supported instructions and the known gaps.

`--check` also proves the result runs:
- It [dry-runs](/docs/guides/testing-processes#dry-run) each process once, with every
  connector and job mocked.
- It lists the secrets the diagram reads, to create in the cluster before deploying.

A run that cannot reach its end fails the command:

```
$ casen synth synth order-process.plan.json --check
✓ Wrote order-process.plan.bpmn
✓ Dry run of order-validation-failed reaches "Ops notified" · 1 connector(s) mocked
Secrets to create in the cluster before deploying:
  SLACK_OAUTH_TOKEN — "Slack Outbound Connector"
```

With `--json`, the findings are in the output's `check` field.

See [Building Processes with AI](/docs/guides/ai-implement) and [AI Agents](/docs/guides/ai-agents) for full walkthroughs.

`casen lint` reads a `.bpmnlintrc` if your project has one. See
[bpmnlint Compatibility](/docs/guides/bpmnlint) for how the rules map and how to run your
own `bpmnlint-plugin-*` rules.

---
Source: https://bpmnkit.com/docs/cli/casen
