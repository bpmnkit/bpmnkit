---
title: casen build
description: One command from a short spec to a deployed process — writes the laid-out .bpmn and a form per user task, lints it like c8ctl and deploys it with its forms.
sidebar:
  order: 2
---

`casen build` takes a short spec and does everything after it: lay out, write the `.bpmn`,
generate a Camunda form for every user task without one, lint (deploy gate plus the warnings
bpmnlint and camunda-compat report), and with `--deploy` send the model and its forms in one
deployment. It prints one line when all is well and one line per problem otherwise.

```sh
casen build expense.txt --deploy
```

```
✓ expense.bpmn + 2 forms · lint clean · deployed 3 to camunda8 (key 2251799813685249)
```

## Spec formats

| Spec | What it is |
|------|------------|
| `.txt` (any other extension) | The process [line format](/agent-cards/bpmn/) plus `## Pool \| id=…` sections (`\| blackbox` for a partner pool), `### Lane` headers, `a ~> b: label` message flows, `d[object Name] ..> task` / `task ..> d[store Name]` data, and `fields=` on user tasks |
| `.json` | A `CompactDiagram` |
| `.mjs` / `.js` / `.ts` | A module whose default export is a model, a builder, or `(kit, model) => …` returning either; `kit` is `@bpmnkit/core` |

```text
# Order fulfilment
## Shop | id=shop
### Sales
placed[start:message Order placed | msg=order-placed] > ask[send Request payment | job=request-payment]
ask > paid[catch Payment received | msg=payment-received key=orderId] > ship[user Ship order | fields=carrier,tracking]
### Warehouse
ship > done[end Order shipped]
ship ..> slip[object Packing slip]
## Bank | blackbox
ask ~> bank: Payment request
bank ~> paid: Payment confirmed
```

## Editing an existing file

`--edit order.bpmn` passes the parsed file to a module spec and writes the result over it.
Existing shapes keep their place; shapes right of an insertion move right to make room
(`makeRoom`), new elements are drawn next to what they connect to (`placeNewShapes`), and the
file's formatting is kept (`exportPreserving`).

```js
export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "order")
		.insertAfter("ask")
		.serviceTask("fraud", { name: "Check fraud", taskType: "check-fraud" })
```

## Findings

Each finding names the element, the BPMN Kit rule id and the key the rule has in
`.bpmnlintrc` (what c8ctl and Camunda Modeler lint print):

```
✖ order.bpmn review: User task "Review" has no form. [compat/user-task-definition, .bpmnlintrc "camunda-compat/user-task-definition"]
```

## Options

| Option | Description |
|--------|-------------|
| `-o, --out <file>` | Output `.bpmn` (default: the spec's name, or the `--edit` file) |
| `--edit <file.bpmn>` | Edit this file with a module spec, keeping its layout |
| `--deploy` | Deploy the `.bpmn`, its forms and any extra `.dmn`/`.form` files given after the spec |
| `--target auto\|local\|camunda8` | `auto`: `ZEEBE_REST_ADDRESS` (with `CAMUNDA_CLIENT_ID`, `CAMUNDA_CLIENT_SECRET`, `CAMUNDA_OAUTH_URL`, or `CAMUNDA_BASIC_AUTH_USERNAME`/`PASSWORD`), else the active profile, else local Reebe |
| `--no-lint` | Skip the lint |
| `--no-forms` | Do not generate forms for form-less user tasks |
| `--verbose` | Also list what the text reader completed (ends, joins, renamed ids) |

casen silences Node's process warnings (such as the proxy agent notice); `NODE_NO_WARNINGS=0` keeps them.
