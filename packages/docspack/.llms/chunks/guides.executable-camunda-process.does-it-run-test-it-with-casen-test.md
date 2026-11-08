# Build an Executable Camunda Process — Does it run? Test it with casen test

Run the Camunda process test (CPT) JSON file with `casen test test`. It runs the file on
Reebe compiled to WebAssembly, so you need no Java, Maven or Docker.

```sh
casen test test process.bpmn
casen test test process.bpmn --scenarios cases/happy-path.json --case "approves the order"
```

`casen test test` reads the tests from `--scenarios <file>` (short form `-s`). Without it, it looks
for `process.bpmn.tests.json` and then `process.test.json` beside the BPMN file. `--case <name>`
runs only that test case; repeat it to run several. A file whose `$schema` contains
`cpt-test-cases` runs as CPT JSON. Any other file runs as the older scenario format, unchanged.

The command exits 0 when every case passes and non-zero otherwise. A failure prints
`instruction <index> (<type>): <message>`.

These instruction types run:

- `CREATE_PROCESS_INSTANCE`
- `COMPLETE_JOB`
- `COMPLETE_JOB_AD_HOC_SUB_PROCESS`
- `COMPLETE_USER_TASK`
- `ASSERT_ELEMENT_INSTANCES` with `IS_ACTIVE`, `IS_COMPLETED` or `IS_COMPLETED_IN_ORDER`
- `ASSERT_PROCESS_INSTANCE` with `IS_ACTIVE` or `IS_COMPLETED`

Any other instruction fails by name with "not supported by casen test yet".

Two gaps remain. `casen test test` does not deploy or check forms, so a missing form passes here
and fails on Camunda. `COMPLETE_USER_TASK` does not complete a job-worker user task (one without
`zeebe:userTask`), which matches Camunda. On the AI agent tutorial's six cases and eight BPMN
files, `casen test test` agrees with real CPT on 42 of 48 results; the other six are the forms gap.
See the [parity record](https://github.com/bpmnkit/bpmnkit/blob/main/doc/cpt-on-reebe-parity.md).

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
