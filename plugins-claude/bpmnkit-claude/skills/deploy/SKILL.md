---
name: deploy
description: Gate a BPMN process on deploy-readiness, then deploy it to local Reebe or Camunda 8. Usage: /bpmnkit:deploy [file.bpmn] [--local|--camunda]
---

Deploy the BPMN process: $ARGUMENTS

## 1. Determine target file and destination

Extract the `.bpmn` filename from $ARGUMENTS (find the single `.bpmn` in cwd, or ask, if not given). Extract `--local` or `--camunda`; default `--local`.

## 2. Gate on deploy-readiness

```sh
casen check <file>.bpmn [<forms and decisions>...] --deploy
```

This runs the deploy gate (Zeebe's own rules, on the file's bytes) plus the deploy-profile lint. If it reports any errors, **stop and fix them first** (or hand off to `/bpmnkit:review`). Each gate line names the element and the rule: `- <id>: <message> (zeebe/<rule>)`. A missing job type, message name, correlation key, timer time or error code is something to fill in, not to work around.

## 3. Deploy

```sh
casen deploy deploy <file>.bpmn                     # local Reebe
casen deploy deploy <file>.bpmn --target camunda8   # active Camunda 8 profile
```

`casen deploy` runs the same gate before it sends anything and exits 1 with the gate's lines if the file would not deploy. Never pass `--no-validate` to get past it: that only sends a file Zeebe rejects.

If local deploy fails to connect: tell the user to start Reebe first — `casen reebe start --port 26500` (matches the default `ZEEBE_ADDRESS` this command targets) — then retry.

If Camunda 8 deploy fails with "No active Camunda 8 profile": tell the user to run `casen profile create <name> --base-url <url> --auth-type bearer --token <token>` (or `casen profile import` from a Camunda Console credentials file), then `casen profile use <name>`, then retry.

## 4. Verify

```sh
casen process-definition list --output json
```

Show the row matching the deployed process id/version.

## 5. Summarize and remind

```
Deployed: <process-id>  version: <N>  target: <local|camunda8>
```

Remind the user: scaffolded workers still need to be started (`casen worker start`) and any secrets the process references (`{{secrets.NAME}}`) must be provisioned in the target engine's secret store before instances that reach them will succeed.
