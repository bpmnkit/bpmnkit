---
title: AI setup — for agents
description: Terse, self-sufficient instructions for an AI agent that builds BPMN with casen build — exact commands, where the spec syntax lives, success and failure signals, do and don't.
sidebar:
  order: 25
---

For an agent. Humans: [AI setup — for humans](/docs/guides/ai-setup-for-humans).

## Procedure

```sh
casen agent-card bpmn          # 1. read once: templates, options, traps. Add --text for the full line format
# 2. Write <name>.txt with the Write tool (not a heredoc), from the card's template
casen build <name>.txt --deploy    # 3. run once; omit --deploy to only build and lint
```

Other cards: `casen agent-card dmn`, `casen agent-card form`. No `casen` on PATH:
`npm i -D @bpmnkit/cli`, then `npx casen …`. Camunda questions: `npx bpmnkit-docs ask "<q>" --pack @bpmnkit/camunda-docspack`.

## Commands

| Task | Command |
| --- | --- |
| Build, lint | `casen build spec.txt` |
| Build, lint, deploy | `casen build spec.txt --deploy` |
| Edit a file, layout kept | `casen build edit.mjs --edit order.bpmn` (module: `export default (kit, model) => …`) |
| Target Camunda version | `--camunda 8.10` |
| Output path | `-o out.bpmn` (default: spec name, or the `--edit` file) |
| Extra resources | `casen build spec.txt --deploy rules.dmn custom.form` |
| Deploy target | `--target auto\|local\|camunda8` (default `auto`: `ZEEBE_REST_ADDRESS` env, else profile, else local Reebe) |
| Skip lint / forms | `--no-lint` / `--no-forms` |
| See what the reader completed | `--verbose` |

Spec syntax: `casen agent-card bpmn --text`. Do not guess it.

## Signals

- **Success**: one line starting `✓ <file>.bpmn … · lint clean · … [· deployed N to <target> (key …)]`. Done. Do not read the XML, move shapes or render images.
- **Warnings**: `lint` count in the `✓` line, with `⚠` lines above. The file is valid; fix them if cheap.
- **Failure**: one `✖ <file> <element>: <message> [<rule>]` line per problem, and a non-zero exit. Spec problems write nothing; lint errors leave the file written. Fix the spec, run again.
- **Deploy failure**: no cluster reachable. Set `ZEEBE_REST_ADDRESS` (+ `CAMUNDA_CLIENT_ID`, `CAMUNDA_CLIENT_SECRET`, `CAMUNDA_OAUTH_URL`, or `CAMUNDA_BASIC_AUTH_USERNAME`/`PASSWORD`), run `casen profile create`, or `casen reebe start`. Ask the user for credentials; never invent them.

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

`casen build expense.txt --deploy` → `✓ expense.bpmn + 1 form (…) · lint clean · … · deployed 2 to camunda8 (key …)`
