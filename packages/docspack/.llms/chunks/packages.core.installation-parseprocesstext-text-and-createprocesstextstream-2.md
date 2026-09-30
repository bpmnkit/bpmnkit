# @bpmnkit/core — Installation — `parseProcessText(text)` and `createProcessTextStream()` (2)

Some of those fixes are guesses only the reader can confirm, and `questions` puts them as
questions, in the order of the text. Each has the element it is about, the question, ready
answers where there are any, and a `draft` for the reader to finish. An answer is written as a
change request, for a model to apply to the diagram:

- a condition made up on a variable named for the question: what data decides it?
- a default branch picked because none was marked, or none reads as "otherwise": is it the
  right fallback? The other branches are the answers
- unlabelled branches split in parallel: do they really run at the same time? "Only one of them"
  or "One after the other"
- a question answered one way only, and removed: what happens otherwise?
- a task left out because nothing leads to it: where does it belong?
- a loop given an exit: when does it end?
- an event written without a trigger, made a message event: is it a timer, a signal, or nothing?

```typescript
const { questions } = parseProcessText(modelOutput);
// [{ elementId: "ok", text: '"Status approved?" decides on "statusApproved", a variable the
//    diagram made up. What data decides it?', options: [], draft: 'At "Status approved?", decide on ' }]
```

`createProcessTextStream()` reads the same format while it arrives. It reads each finished line
as it arrives, so every frame is built from whole facts. `push(chunk)` returns a laid-out frame,
or `null` when nothing new is drawable. `end()` returns what `parseProcessText` would.

---
Source: https://bpmnkit.com/docs/packages/core
