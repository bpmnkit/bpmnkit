---
title: AI setup — for humans
description: Set up Claude Code (or any coding agent) to build, lint and deploy BPMN with one command — install, plugin, AGENTS.md, docs pack and Camunda credentials, then the usual use cases.
sidebar:
  order: 24
---

Goal: your coding agent writes a short text spec, runs `casen build`, and gets a laid-out,
linted, deployable `.bpmn` (plus a form per user task). Setup is five copy-paste steps.
Writing for the agent itself? See [AI setup — for agents](/docs/guides/ai-setup-for-agents).

## Set up

```sh
# 1. The CLI
npm install -g @bpmnkit/cli          # or: npm i -D @bpmnkit/cli, then npx casen …

# 2. Claude Code plugin (skills such as /bpmnkit:bpmn-script, /bpmnkit:deploy)
#    run inside Claude Code:
/plugin marketplace add bpmnkit/bpmnkit
/plugin install bpmnkit@bpmnkit

# 3. No plugin? Install the lightweight slash commands into .claude/commands/ instead
casen skills install

# 4. Offline docs for the agent (BPMN Kit + Camunda 8), no network, no server
npm i -D @bpmnkit/docspack @bpmnkit/camunda-docspack
```

- **AGENTS.md** — add a line telling any agent where to look. Copy this:

  ```md
  BPMN/DMN/forms: run `casen agent-card bpmn` once, write a spec, run `casen build <spec> --deploy`.
  Docs: `npx bpmnkit-docs ask "<question>"` (add `--pack @bpmnkit/camunda-docspack` for Camunda).
  ```

- **Camunda credentials (only for `--deploy` to a cluster)** — export them in the shell that
  starts the agent. Without them `--deploy` goes to a local Reebe engine (`casen reebe start`).

  ```sh
  export ZEEBE_REST_ADDRESS=https://<region>.zeebe.camunda.io/<cluster-id>
  export CAMUNDA_CLIENT_ID=… CAMUNDA_CLIENT_SECRET=… CAMUNDA_OAUTH_URL=…
  # self-managed with basic auth: CAMUNDA_BASIC_AUTH_USERNAME / CAMUNDA_BASIC_AUTH_PASSWORD
  ```

  Or save a profile once with `casen profile create`; `--target auto` (the default) tries the
  environment, then the profile, then local Reebe. Never commit these values.

Check it works: `casen agent-card bpmn | head` prints the cheat sheet.

## Use cases

### Generate a process inside a bigger agent flow (recommended)

Ask Claude Code for the whole job — "build an expense approval process and deploy it, then
write a worker for the `check-budget` job". The agent does the BPMN step like this:

1. Reads the card once: `casen agent-card bpmn` (add `--text` for the full line format).
2. Writes a spec file with its Write tool, for example `expense.txt`:

   ```text
   # Expense approval | id=expense
   [start Expense submitted] > [service Check budget | job=check-budget] > [xor Within budget?]
   Within budget? >(Yes: within = true) [end Paid]
   Within budget? >(No: default) [user Review expense | fields=amount:number,reason] > Paid
   ```

3. Runs `casen build expense.txt --deploy` once.
4. Reads the output. One line starting with `✓` means built, lint clean and deployed (it
   also names the forms it wrote). Any `✖` line is a problem to fix in the spec, then run
   again. On `✓` the agent continues with the next step of its flow (the worker, tests, a summary).

The one-line output is the proof — the agent does not need to open the XML or render an image.

### Edit an existing diagram, keeping its layout

Ask: "add a fraud check after *Request payment* in `order.bpmn`". The agent writes a module and
runs `casen build edit.mjs --edit order.bpmn`; shapes keep their place, only new tasks get forms.

```js
export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "order")
		.insertAfter("ask")
		.serviceTask("fraud", { name: "Check fraud", taskType: "check-fraud" })
```

### Generate forms for user tasks

Every user task without a form gets one by default (fields from `fields=` or from the variables
the next conditions read). Write your own with `casen agent-card form`, put the `.form` next to
the spec, and it is deployed as it is. `--no-forms` turns generation off.

### Retarget the Camunda version

`casen build edit.mjs --edit order.bpmn --camunda 8.10` sets the file's
`executionPlatformVersion`. For a text spec, `--camunda 8.10` overrides a `camunda=` in the spec.

## Next

[`casen build` reference](/docs/cli/build) · [Agent cards](/agent-cards/bpmn/) ·
[Claude Code plugin](/docs/guides/claude-code-plugin) · [Using BPMN Kit with AI](/docs/guides/using-bpmnkit-with-ai)
