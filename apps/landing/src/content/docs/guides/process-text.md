---
title: BPMN Kit Text — the line format
description: BPMN Kit Text (bpmnkit text) is the compact line format a language model writes a BPMN process in. parseProcessText, createProcessTextStream and writeProcessText live in @bpmnkit/core.
sidebar:
  order: 0
---

## What it is

**BPMN Kit Text** (short: *bpmnkit text*) is the compact line format a language model writes a
process in. It is MIT licensed and ships in [`@bpmnkit/core`](/docs/packages/core).

- **Compact.** A path is written once as `a > b > c` and a node is declared inline the first time
  it is used. Ids, merge gateways and obvious gaps are left to the parser. It costs about a quarter
  of the tokens of minified compact JSON on the repo's own fixtures.
- **Streams line by line.** Every line is a complete fact, so a diagram can be drawn while the
  model is still writing it. JSON needs a brace scanner for that.
- **The parser never throws.** Anything it cannot use is reported as a `problem` and left out;
  what it adds to complete the diagram is listed in `fixes`. The result always expands to BPMN.

## Syntax cheat sheet

One path per line. The first line is `# Process name` (add ` | camunda=8.10` to target a Camunda
version).

```text
a > b > c                  sequence flow
id[kind Name]              declare a node the first time; afterwards write only id
gw >(Label: condition) x   conditional branch, condition in FEEL
gw >(Label: default) y     branch taken when no condition holds
```

| Part | Words |
| --- | --- |
| Kinds | `start` `end` `task` `user` `service` `rule` `send` `receive` `script` `manual` `call` `xor` `and` `or` `eventgw` `catch` `throw` `boundary` `adhoc` |
| Triggers (events) | `timer` `message` `signal` `error` `escalation` `terminate` `conditional` `compensate` `cancel`, written `start:message`, `boundary:error` |
| Attributes after `\|` | `on=<task id>` (required on a boundary), `nonint`, `job=`, `each=<list>`, `after=<ISO duration>`, `result=`, `feel=<expr>` (last) |
| Names after `\|` | `msg=` + `key=<FEEL>`, `signal=`, `error=`, `escalation=`, `at=` / `every=` (timers), `called=` (call) |
| Forms and mappings | `form=<form id>`, `in.<name>=<FEEL>`, `out.<name>=<FEEL>` |

Further lines, after the paths:

```text
lane sales[Sales team]: a, b       a and b are done by the Sales team
pool bank[Bank]                    another party, drawn as an empty pool
msg pay >(Payment) bank            a message to it; msg bank > paid is one from it
note review: Over 1000 needs a person
doc review: Documentation of the element
tool[service Look up | inside=agent]   a tool of an ad-hoc agent (adhoc kind)
```

A boundary starts its own line, `on=` a task, and leads only to the handling. Branches that meet
again are joined automatically; join parallel branches with an `and` node.

Every kind, trigger and attribute has a rendered example in the [element reference](/docs/guides/process-text-reference).

## Example

```text
# Expense approval
start[start Expense submitted] > check[xor Amount over 1000?]
check >(Yes: amount > 1000) review[user Review expense | form=expense_review] > pay[service Pay expense | job=pay-expense] > done[end Expense paid]
check >(No: default) auto[service Approve automatically] > pay
failed[boundary:error Payment failed | on=pay | error=PAYMENT_FAILED] > notify[send Notify submitter] > notice[end Payment failed]
```

This parses with no `problems` and one `fix`: `joined 2 flows into "pay" with xor gateway "pay_join"`.
The example runs as a test (`packages/core/tests/process-text-guide-page.test.ts`), including the
stream and the write-back round trip.

## API

All names come from `@bpmnkit/core`.

```typescript
import {
  Bpmn, expand, parseProcessText, createProcessTextStream, writeProcessText, PROCESS_TEXT_GUIDE,
} from "@bpmnkit/core";

const { diagram, problems, fixes, questions, connectors } = parseProcessText(modelOutput);
const xml = Bpmn.export(expand(diagram));
```

- **`parseProcessText(text)`** returns `{ diagram, problems, fixes, questions, connectors }`.
  `diagram` is a compact diagram, always valid input for `expand`. `problems` are `{ line, message }`.
  `fixes` are strings. `questions` are guesses only the reader can confirm, each with ready
  `options`. `connectors` are the `with` lines, applied separately by `applyConnectorLines` from
  `@bpmnkit/core/connectors`.
- **`createProcessTextStream()`** returns `{ push(chunk), end() }`. `push` reads finished lines and
  returns a laid-out `BpmnDefinitions` frame, or `null` when nothing new is drawable. `end()`
  returns what `parseProcessText` would. Frames are previews: no start or end events are added.

  ```typescript
  const stream = createProcessTextStream();
  for await (const chunk of tokens) {
    const defs = stream.push(chunk);
    if (defs) render(defs);
  }
  const result = stream.end();
  ```
- **`writeProcessText(definitions, options?)`** is the other direction: it writes an existing
  diagram (the executable process) as text a model can read, and returns `{ text, aliases }`.
  Ids are shortened to readable aliases, and `aliases` maps them back to the real ids.
- **`PROCESS_TEXT_GUIDE`** is the string that teaches the format. Put it in a system prompt.

## Where it is used

- **Drop AI generate** (`apps/drop`): the generate prompt is built from `PROCESS_TEXT_GUIDE`, and
  the reply streams into the canvas.
- **CLI `bpmnkit build`** (`apps/cli`): its text spec is the guide plus pool sections, each read by
  `parseProcessText`. See [build](/docs/cli/build).
- **Editor process delta** (`packages/editor`): `writeProcessText` shows a model the open diagram;
  it answers with a change script.

## Text vs Fluent

Use **BPMN Kit Text** when a language model writes the process, or when you want it to stream.
Use [BPMN Kit Fluent](/docs/guides/fluent-builder) when you write the model in TypeScript and
want types and refactoring. Both end in the same model.

## Next

[Element reference](/docs/guides/process-text-reference) · [BPMN Kit Fluent](/docs/guides/fluent-builder) · [Building Processes](/docs/guides/building-processes) · [`@bpmnkit/core`](/docs/packages/core)
