---
description: Gate a BPMN process on deploy-readiness, then deploy it to local Reebe or Camunda 8.
---

@.claude/aikit.md

Deploy the BPMN process: $ARGUMENTS

Extract the `.bpmn` filename (find the single `.bpmn` in cwd, or ask, if not given) and destination (`--local` default, or `--camunda`).

## Step 1 — Gate on deploy-readiness

```sh
bpmnkit lint lint <file>.bpmn --profile deploy
# with forms or decisions shipping alongside: one call checks them all and their references
bpmnkit check <file>.bpmn <name>.form <name>.dmn --deploy --json
```

If this reports any errors, stop and fix them first (or run `/review`) — do not deploy with deploy-profile errors.

## Step 2 — Deploy

```sh
bpmnkit deploy deploy <file>.bpmn                     # local Reebe
bpmnkit deploy deploy <file>.bpmn --target camunda8   # active Camunda 8 profile
```

Local deploy unreachable → tell the user to run `bpmnkit reebe start --port 26500` first, then retry. Camunda 8 deploy with no active profile → tell the user to run `bpmnkit profile create <name> --base-url <url> --auth-type bearer --token <token>` then `bpmnkit profile use <name>`, then retry.

## Step 3 — Verify and summarize

```sh
bpmnkit process-definition list --output json
```

Report: `Deployed: <process-id>  version: <N>  target: <local|camunda8>`.

If any scaffolded workers exist in `./workers/`, remind: `bpmnkit worker start`. Remind about any `{{secrets.NAME}}` the process references — they must be provisioned in the target engine's secret store.
