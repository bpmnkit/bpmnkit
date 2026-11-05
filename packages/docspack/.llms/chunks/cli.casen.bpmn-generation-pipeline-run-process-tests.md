# casen CLI — BPMN generation pipeline — Run process tests

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

`casen lint lint --profile sketch` skips every Camunda 8 deployability rule, for a process
that does not target an engine yet. A user task without a form is reported only under
`--profile deploy` or with `--user-task-forms require`. To check DMN and form files too, use
[`casen check`](/docs/cli/check).

`casen lint` reads a `.bpmnlintrc` if your project has one. See
[bpmnlint Compatibility](/docs/guides/bpmnlint) for how the rules map and how to run your
own `bpmnlint-plugin-*` rules.

---
Source: https://bpmnkit.com/docs/cli/casen
