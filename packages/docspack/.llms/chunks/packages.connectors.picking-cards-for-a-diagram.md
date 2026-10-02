# @bpmnkit/connectors — Picking cards for a diagram

`selectConnectors({ text, tasks })` picks the cards a model should see when it connects a
diagram, per task and in code. `text` is what the person asked for; `tasks` are the diagram's
nodes. It returns only tasks with a candidate, so an empty answer means there is nothing to
connect.

A card is a candidate for a task when:
- **the task's name names the system** ("Post summary to **Slack**");
- **the request names the system,** the task is a task rather than an event, and no other
  task's name claims that system; or
- **the task's name shares a word with the connector's name,** other than a common verb.

Beyond those rules:
- **REST fallback.** The REST connector is offered for a task that asks for an HTTP call
  ("Fetch …", "Call endpoint") when nothing else fits.
- **Synonyms.** A few words requests use for what templates call something else, such as
  "notify" for sending a message, change the ranking only.
- **Caps.** At most three cards per task and eight in all. Every task keeps its best card
  before any task gets a second.

```typescript
import { formatConnectorSelection, selectConnectors } from "@bpmnkit/connectors";

const selection = selectConnectors({
  text: "Every hour, list open GitHub issues and post a summary to Slack",
  tasks: [
    { id: "list", name: "List open issues", type: "serviceTask" },
    { id: "post", name: "Post summary to Slack", type: "serviceTask" },
  ],
});
formatConnectorSelection(selection); // the prompt block, one task per paragraph
```

---
Source: https://bpmnkit.com/docs/packages/connectors
