---
title: AI setup — for agents
description: Terse, self-sufficient instructions for an AI agent that builds BPMN with bpmnkit build — exact commands, where the spec syntax lives, success and failure signals, do and don't.
sidebar:
  order: 25
---

For an agent. Humans: [AI setup — for humans](/docs/guides/ai-setup-for-humans).

## Procedure

```sh
bpmnkit agent-card bpmn          # 1. read once: templates, options, traps. Add --text for the full line format
# 2. Write <name>.txt with the Write tool (not a heredoc), from the card's template
bpmnkit build <name>.txt --deploy    # 3. run once; omit --deploy to only build and lint
```

Other cards: `bpmnkit agent-card dmn`, `bpmnkit agent-card form`. No `bpmnkit` on PATH:
`npm i -D @bpmnkit/cli`, then `npx bpmnkit …`. Camunda questions: `npx bpmnkit-docs ask "<q>" --pack @bpmnkit/camunda-docspack`.

## Commands

| Task | Command |
| --- | --- |
| Build, lint | `bpmnkit build spec.txt` |
| Build, lint, deploy | `bpmnkit build spec.txt --deploy` |
| Edit a file, layout kept | `bpmnkit build edit.mjs --edit order.bpmn` (module: `export default (kit, model) => …`) |
| Target Camunda version | `--camunda 8.10` |
| Output path | `-o out.bpmn` (default: spec name, or the `--edit` file) |
| Extra resources | `bpmnkit build spec.txt --deploy rules.dmn custom.form` |
| Deploy target | `--target auto\|local\|camunda8` (default `auto`: `ZEEBE_REST_ADDRESS` env, else profile, else local Reebe) |
| Skip lint / forms | `--no-lint` / `--no-forms` |
| See what the reader completed | `--verbose` |

Spec syntax: `bpmnkit agent-card bpmn --text`. Do not guess it.

## Signals

- **Success**: one line starting `✓ <file>.bpmn … · lint clean · … [· deployed N to <target> (key …)]`. Done. Do not read the XML, move shapes or render images.
- **Warnings**: `N warning(s)` in place of `lint clean`, with `⚠` lines above. The file is valid; fix them if cheap.
- **Failure**: non-zero exit. A spec problem prints an error naming the line and writes nothing; lint errors print one `✖ <file> <element>: <message> [<rule>]` line each and leave the file written. Fix the spec, run again.
- **Deploy failure**: no cluster reachable. Set `ZEEBE_REST_ADDRESS` (+ `CAMUNDA_CLIENT_ID`, `CAMUNDA_CLIENT_SECRET`, `CAMUNDA_OAUTH_URL`, or `CAMUNDA_BASIC_AUTH_USERNAME`/`PASSWORD`), run `bpmnkit profile create`, or `bpmnkit reebe start`. Ask the user for credentials; never invent them.

## Do / don't

- Do write the spec directly; do not plan in prose first.
- Do deploy the `.bpmn` with the `.form` files the `✓` line lists (`--deploy` does it).
- Do use `--edit` to change an existing file; do not rewrite it from scratch (layout is lost).
- Don't write BPMN XML or diagram coordinates by hand.
- Don't print or commit credentials.
- Don't claim the process is deployed unless the line says `deployed`.

## Example

```text
# Expense approval | id=expense
[start Expense submitted] > [service Check budget | job=check-budget] > [xor Within budget?]
Within budget? >(Yes: within = true) [end Paid]
Within budget? >(No: default) [user Review expense | fields=amount:number,reason] > Paid
```

`bpmnkit build expense.txt --deploy` → `✓ expense.bpmn + 1 form (expense-reviewExpense.form) · lint clean · process expense, tasks 2, gateways 2, forms 1 · Camunda 8.10.0 · deployed 2 to camunda8 (key …)`
