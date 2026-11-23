# BPMN Kit Text — the line format — API

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

---
Source: https://bpmnkit.com/docs/guides/process-text
